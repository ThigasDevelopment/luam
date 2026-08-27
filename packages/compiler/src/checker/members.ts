import type { CallExpression, MemberExpression } from '@compiler/parser/ast';
import type { NewExpression } from '@compiler/parser/declaration-nodes';
import { findLibraryMember, isLibrary } from '@mta-types/library-members';

import { descriptorToType } from './api-types';
import type { CheckContext } from './context';
import { checkTypeConstraints, classSubstitutions, inferTypeArguments, memberOf } from './generic-class';
import { isMtaElement, resolveMtaMember } from './oop-members';
import type { MemberInfo } from './registry';
import { checkExpression, checkSignature } from './expressions';
import { substituteType } from './type-substitution';
import { ANY_TYPE, createNamed, NUMBER_TYPE, type FunctionType, type NamedType, type RecordType, type Type } from './types';

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

export function isUserClassReference(context: CheckContext, name: string): boolean {
    const symbol = context.binder.lookup(name);

    return symbol !== null && !symbol.isLocal && context.declarations.lookupClass(name) !== null;
}

export function resolveStaticMember(context: CheckContext, className: string, expression: MemberExpression): Type {
    const member = context.declarations.lookupStaticMember(className, expression.property);

    if (member !== null) {
        if (member.deprecated === true) {
            context.warn('check-deprecated-use', `Member "${expression.property}" is deprecated.`, expression.position);
        }

        context.staticAccess.add(expression);

        return member.type;
    }

    if (context.awaitsDeclaration(className)) {
        context.staticAccess.add(expression);

        return ANY_TYPE;
    }

    const instance = context.declarations.lookupMember(className, expression.property);
    const hint = instance === null ? '' : ` It is an instance member, so read it from a value of "${className}".`;

    context.report('check-unknown-member', `Class "${className}" has no static member "${expression.property}".${hint}`, expression.position);

    return ANY_TYPE;
}

export function resolveNamedMember(context: CheckContext, receiver: NamedType, expression: MemberExpression): Type | null {
    const name = receiver.name;
    const enumeration = context.declarations.lookupEnum(name);

    if (enumeration !== null) {
        return checkEnumMember(context, name, enumeration.members, expression);
    }

    const member = memberOf(context, receiver, expression.property);

    if (member !== null) {
        if (member.deprecated === true) {
            context.warn('check-deprecated-use', `Member "${expression.property}" is deprecated.`, expression.position);
        }

        return member.type;
    }

    if (isMtaElement(context, name)) {
        return resolveMtaMember(context, name, expression.property, expression.position)?.type ?? ANY_TYPE;
    }

    const staticMember = context.declarations.lookupStaticMember(name, expression.property);

    if (staticMember !== null) {
        const message = `"${expression.property}" is a static member of class "${name}". Read it as "${name}.${expression.property}".`;

        context.report('check-static-receiver', message, expression.position);

        return staticMember.type;
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

function constructorParameters(context: CheckContext, className: string): readonly Type[] {
    const constructor = context.declarations.lookupMember(className, 'constructor');

    return constructor?.type.kind === 'function' ? constructor.type.parameters : [];
}

function resolveConstructorArguments(context: CheckContext, expression: NewExpression, typeParameters: readonly string[]): Type[] {
    const explicit = expression.typeArguments.map((argument) => context.resolveAnnotation(argument));

    if (typeParameters.length === 0) {
        if (explicit.length > 0) {
            context.report('check-generic-arity', `Class "${expression.className}" does not accept type arguments.`, expression.position);
        }

        return [];
    }

    if (explicit.length === typeParameters.length) {
        return explicit;
    }

    if (explicit.length > 0) {
        const expected = typeParameters.length === 1 ? '1 type argument' : `${typeParameters.length} type arguments`;

        context.report('check-generic-arity', `Class "${expression.className}" expects ${expected} but received ${explicit.length}.`, expression.position);

        return typeParameters.map((unused, index) => explicit[index] ?? ANY_TYPE);
    }

    const argumentTypes = expression.args.map((argument) => checkExpression(context, argument));

    return inferTypeArguments(typeParameters, constructorParameters(context, expression.className), argumentTypes);
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

    const pending = context.insideFunction() ? null : context.pendingDeclarationOf(expression.className);

    if (pending !== null) {
        const subject = pending === expression.className ? `Class "${pending}"` : `Class "${expression.className}" extends "${pending}", which`;

        context.report('check-class-before-declaration', `${subject} is declared further down this file, so it does not exist yet at this point.`, expression.position);
    }

    const info = context.declarations.lookupClass(expression.className);
    const typeArguments = resolveConstructorArguments(context, expression, info?.typeParameters ?? []);

    checkTypeConstraints(context, expression.className, typeArguments, expression.position);
    const constructor = context.declarations.lookupMember(expression.className, 'constructor');

    if (constructor !== null && constructor.type.kind === 'function') {
        const substitutions = info === null ? new Map<string, Type>() : classSubstitutions(info, typeArguments);
        const signature = substituteType(constructor.type, substitutions);

        if (signature.kind === 'function') {
            checkSignature(context, expression.args, signature, expression.position);
        }
    } else {
        expression.args.forEach((argument) => checkExpression(context, argument));
    }

    return createNamed(expression.className, typeArguments);
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
