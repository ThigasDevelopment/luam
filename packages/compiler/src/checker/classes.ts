import type {
    ClassDeclaration,
    ClassFieldDeclaration,
    ClassMethodDeclaration,
    EnumDeclaration,
    InterfaceDeclaration,
} from '@compiler/parser/declaration-nodes';

import type { CheckContext } from './context';
import { expandClassDecorators } from './decorators';
import { checkExpression } from './expressions';
import type { ClassInfo, MemberInfo } from './registry';
import { buildFunctionType, checkFunctionBody } from './statements';
import { ANY_TYPE, createFunction, createNamed, isAssignable, typeToString, VOID_TYPE, type Type } from './types';

function fieldType(context: CheckContext, member: ClassFieldDeclaration): Type {
    const valueType = member.value === null ? null : checkExpression(context, member.value);

    if (member.annotation === null) {
        return valueType ?? ANY_TYPE;
    }

    const declared = context.resolveAnnotation(member.annotation);

    if (valueType !== null && member.value !== null) {
        context.expectAssignable(valueType, declared, member.value.position, `Field "${member.name}"`);
    }

    return declared;
}

function generatedMethodType(member: ClassMethodDeclaration, fieldTypes: ReadonlyMap<ClassFieldDeclaration, Type>): Type {
    const fieldType = [...fieldTypes].find(([field]) => field.position.offset === member.position.offset)?.[1] ?? ANY_TYPE;

    return member.parameters.length === 0 ? createFunction([], fieldType) : createFunction([fieldType], VOID_TYPE);
}

function registerMembers(context: CheckContext, info: ClassInfo, statement: ClassDeclaration): ClassMethodDeclaration[] {
    const fieldTypes = new Map<ClassFieldDeclaration, Type>();

    for (const member of statement.members) {
        if (member.kind === 'class-field') {
            fieldTypes.set(member, fieldType(context, member));
        }
    }

    const generated = expandClassDecorators(context, statement, fieldTypes);

    for (const member of [...statement.members, ...generated]) {
        const type = member.kind === 'class-field'
            ? fieldTypes.get(member) ?? ANY_TYPE
            : member.isSynthetic
              ? generatedMethodType(member, fieldTypes)
              : buildFunctionType(context, member.parameters, member.returnAnnotation);

        info.members.set(member.name, { name: member.name, type, isMethod: member.kind === 'class-method', position: member.position });
    }

    return generated;
}

function checkMethodBody(context: CheckContext, info: ClassInfo, member: ClassMethodDeclaration): void {
    context.pushClassMethod({ className: info.name, methodName: member.name });
    checkFunctionBody(context, member.parameters, member.returnAnnotation, member.body, createNamed(info.name));
    context.popClassMethod();
}

function checkContract(context: CheckContext, info: ClassInfo, contract: string, member: MemberInfo): void {
    const actual = context.declarations.lookupMember(info.name, member.name);

    if (actual === null) {
        const message = `Class "${info.name}" does not implement "${member.name}" required by interface "${contract}".`;

        context.report('check-unimplemented-interface', message, info.position);

        return;
    }

    if (isAssignable(actual.type, member.type, { allowNil: context.allowNil })) {
        return;
    }

    const subject = `Member "${member.name}" of class "${info.name}"`;
    const message = `${subject} expects "${typeToString(member.type)}" from interface "${contract}" but is "${typeToString(actual.type)}".`;

    context.report('check-unimplemented-interface', message, actual.position);
}

function checkInterfaces(context: CheckContext, info: ClassInfo): void {
    for (const name of info.interfaces) {
        const contract = context.declarations.lookupInterface(name);

        if (contract === null) {
            context.noteExternalReference(name, info.position);
            context.report('check-unknown-interface', `Class "${info.name}" implements "${name}", which is not defined.`, info.position);

            continue;
        }

        for (const member of contract.members.values()) {
            checkContract(context, info, name, member);
        }
    }
}

function resolveSuperClass(context: CheckContext, statement: ClassDeclaration): string | null {
    if (statement.superClass === null) {
        return null;
    }

    if (context.declarations.lookupClass(statement.superClass) !== null) {
        if (context.isAmbientClass(statement.superClass)) {
            context.noteExternalReference(statement.superClass, statement.position);
        }

        return statement.superClass;
    }

    const message = `Class "${statement.name}" extends "${statement.superClass}", which is not defined.`;

    context.noteExternalReference(statement.superClass, statement.position);
    context.report('check-unknown-class', message, statement.position);

    return null;
}

export function checkClassDeclaration(context: CheckContext, statement: ClassDeclaration): void {
    if (context.declarations.lookupClass(statement.name) !== null) {
        context.report('check-duplicate-class', `Class "${statement.name}" is already defined.`, statement.position);

        return;
    }

    const info: ClassInfo = {
        name: statement.name,
        superClass: resolveSuperClass(context, statement),
        interfaces: statement.interfaces,
        members: new Map(),
        position: statement.position,
    };

    const generated = registerMembers(context, info, statement);

    context.generatedMembers.set(statement, generated);
    context.declarations.declareClass(info);
    context.declareModuleGlobal({ name: info.name, type: createNamed(info.name), isLocal: false, position: statement.position });
    checkInterfaces(context, info);

    for (const member of statement.members) {
        if (member.kind === 'class-method') {
            checkMethodBody(context, info, member);
        }
    }

}

export function checkInterfaceDeclaration(context: CheckContext, statement: InterfaceDeclaration): void {
    if (context.declarations.lookupInterface(statement.name) !== null) {
        context.report('check-duplicate-interface', `Interface "${statement.name}" is already defined.`, statement.position);

        return;
    }

    const members = new Map<string, MemberInfo>();

    for (const member of statement.members) {
        const type =
            member.kind === 'interface-field'
                ? context.resolveAnnotation(member.annotation)
                : buildFunctionType(context, member.parameters, member.returnAnnotation);

        members.set(member.name, { name: member.name, type, isMethod: member.kind === 'interface-method', position: member.position });
    }

    context.declarations.declareInterface({ name: statement.name, members, position: statement.position });
}

export function checkEnumDeclaration(context: CheckContext, statement: EnumDeclaration): void {
    if (context.declarations.lookupEnum(statement.name) !== null) {
        context.report('check-duplicate-enum', `Enum "${statement.name}" is already defined.`, statement.position);

        return;
    }

    const members = statement.members.map((member) => member.name);

    context.declarations.declareEnum({ name: statement.name, members, position: statement.position });
    context.declareModuleGlobal({ name: statement.name, type: createNamed(statement.name), isLocal: false, position: statement.position });
}
