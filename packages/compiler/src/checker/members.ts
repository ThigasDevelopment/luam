import type { CallExpression, MemberExpression } from '@compiler/parser/ast';
import type { NewExpression } from '@compiler/parser/declaration-nodes';
import { findLibraryMember, isLibrary } from '@mta-types/library-members';

import { descriptorToType } from './api-types';
import type { CheckContext } from './context';
import { isMtaElement, resolveMtaMember } from './oop-members';
import type { MemberInfo } from './registry';
import { checkExpression, checkSignature } from './expressions';
import { ANY_TYPE, createNamed, NUMBER_TYPE, type FunctionType, type RecordType, type Type } from './types';

function checkEnumMember(context: CheckContext, name: string, members: readonly string[], expression: MemberExpression): Type {
    if (members.includes(expression.property)) {
        return NUMBER_TYPE;
    }

    context.report('check-unknown-enum-member', `Enum "${name}" has no member "${expression.property}".`, expression.position);

    return ANY_TYPE;
}

export function resolveLibraryMember(context: CheckContext, expression: MemberExpression): Type | null {
    const object = expression.object;

    if (object.kind !== 'identifier' || !isLibrary(object.name) || context.binder.lookup(object.name)?.isLocal === true) {
        return null;
    }

    const member = findLibraryMember(object.name, expression.property);

    return member === null ? null : descriptorToType(member);
}

function declaredIn(record: RecordType): string {
    return record.origin === null ? `"${record.name}"` : `"${record.name}", declared in "${record.origin}"`;
}

export function resolveRecordMember(context: CheckContext, record: RecordType, expression: MemberExpression): Type {
    const member = record.members.get(expression.property);

    if (member !== undefined) {
        return member;
    }

    const keys = [...record.members.keys()].map((key) => `"${key}"`).join(', ');
    const known = keys.length === 0 ? 'It declares no keys.' : `Declared keys: ${keys}.`;
    const message = `"${expression.property}" is not a key of ${declaredIn(record)}. ${known}`;

    context.report('check-unknown-record-key', message, expression.position);

    return ANY_TYPE;
}

function checkInterfaceMember(context: CheckContext, name: string, members: ReadonlyMap<string, MemberInfo>, expression: MemberExpression): Type {
    const member = members.get(expression.property);

    if (member !== undefined) {
        return member.type;
    }

    const keys = [...members.keys()].map((key) => `"${key}"`).join(', ');

    context.report('check-unknown-member', `Interface "${name}" has no member "${expression.property}". Declared members: ${keys}.`, expression.position);

    return ANY_TYPE;
}

export function resolveNamedMember(context: CheckContext, name: string, expression: MemberExpression): Type | null {
    const enumeration = context.declarations.lookupEnum(name);

    if (enumeration !== null) {
        return checkEnumMember(context, name, enumeration.members, expression);
    }

    const member = context.declarations.lookupMember(name, expression.property);

    if (member !== null) {
        if (member.deprecated === true) {
            context.warn('check-deprecated-use', `Member "${expression.property}" is deprecated.`, expression.position);
        }

        return member.type;
    }

    if (isMtaElement(context, name)) {
        return resolveMtaMember(context, name, expression.property, expression.position)?.type ?? ANY_TYPE;
    }

    if (context.awaitsDeclaration(name)) {
        return ANY_TYPE;
    }

    const contract = context.declarations.lookupClass(name) === null ? context.declarations.lookupInterface(name) : null;

    if (contract === null) {
        return null;
    }

    const members = new Map(context.declarations.collectMembers(name).map((member) => [member.name, member]));

    return checkInterfaceMember(context, name, members, expression);
}

export const NATIVE_CONSTRUCTOR = 'new';

export function nativeConstructor(context: CheckContext, name: string): FunctionType | null {
    const symbol = context.binder.lookup(name);

    if (symbol === null || symbol.isLocal || symbol.type.kind !== 'record') {
        return null;
    }

    const constructor = symbol.type.members.get(NATIVE_CONSTRUCTOR);

    return constructor === undefined || constructor.kind !== 'function' ? null : constructor;
}

export function checkNewExpression(context: CheckContext, expression: NewExpression): Type {
    if (context.declarations.lookupClass(expression.className) === null) {
        const constructor = nativeConstructor(context, expression.className);

        if (constructor !== null) {
            context.references.add(expression.className);
            checkSignature(context, expression.args, constructor, expression.position);

            return constructor.returnType;
        }

        expression.args.forEach((argument) => checkExpression(context, argument));

        context.noteExternalReference(expression.className, expression.position);
        context.report('check-unknown-class', `Class "${expression.className}" is not defined.`, expression.position);

        return ANY_TYPE;
    }

    if (context.isPredeclaredClass(expression.className) && !context.insideFunction()) {
        const message = `Class "${expression.className}" is declared further down this file, so it does not exist yet at this point.`;

        context.report('check-class-before-declaration', message, expression.position);
    }

    const constructor = context.declarations.lookupMember(expression.className, 'constructor');

    if (constructor !== null && constructor.type.kind === 'function') {
        checkSignature(context, expression.args, constructor.type, expression.position);
    } else {
        expression.args.forEach((argument) => checkExpression(context, argument));
    }

    return createNamed(expression.className);
}

function resolveSuperMethod(context: CheckContext, expression: CallExpression): Type | null {
    const frame = context.currentClassMethod();

    if (frame === null) {
        context.report('check-invalid-super', 'A "super(...)" call is only valid inside a class method.', expression.position);

        return null;
    }

    const info = context.declarations.lookupClass(frame.className);
    const parent = info === null ? null : info.superClass;

    if (parent === null) {
        const message = `Class "${frame.className}" does not extend a class, so "super(...)" has no parent method.`;

        context.report('check-invalid-super', message, expression.position);

        return null;
    }

    const member = context.declarations.lookupMember(parent, frame.methodName);

    if (member === null) {
        const message = `Class "${parent}" does not define "${frame.methodName}", so "super(...)" cannot resolve it.`;

        context.report('check-unknown-super-method', message, expression.position);

        return null;
    }

    return member.type;
}

export function checkSuperCall(context: CheckContext, expression: CallExpression): Type {
    const method = resolveSuperMethod(context, expression);

    if (method === null || method.kind !== 'function') {
        expression.args.forEach((argument) => checkExpression(context, argument));

        return ANY_TYPE;
    }

    return checkSignature(context, expression.args, method, expression.position);
}
