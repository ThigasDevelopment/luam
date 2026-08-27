import type { ClassDeclaration, ClassFieldDeclaration, ClassMethodDeclaration, EnumDeclaration, InterfaceDeclaration } from '@compiler/parser/declaration-nodes';

import type { CheckContext } from './context';
import { checkInterfaces, checkOverrides } from './class-contracts';
import { checkMetamethod, isMetamethodMember, reportRejectedMetamethod } from './metamethods';
import { expandClassDecorators } from './decorators';
import { checkExpression } from './expressions';
import type { ClassInfo, MemberInfo } from './registry';
import { buildFunctionType, checkFunctionBody } from './statements';
import { ANY_TYPE, createFunction, createNamed, isAssignable, typeToString, VOID_TYPE, widenInferred, type Type } from './types';

function fieldType(context: CheckContext, member: ClassFieldDeclaration): Type {
    const valueType = member.value === null ? null : checkExpression(context, member.value);

    if (member.annotation === null) {
        return valueType === null ? ANY_TYPE : widenInferred(valueType);
    }

    const declared = context.resolveAnnotation(member.annotation);

    if (valueType !== null && member.value !== null) {
        context.expectAssignable(valueType, declared, member.value.position, `Field "${member.name}"`);
    }

    return declared;
}

function checkFieldName(context: CheckContext, member: ClassFieldDeclaration): void {
    if (member.name !== 'constructor') {
        return;
    }

    const message = 'A "constructor" is the class constructor, not a field. Write it as "constructor = function (...) ... end" or rename the field.';

    context.report('check-invalid-constructor', message, member.position);
}

function syntheticMethodType(context: CheckContext, member: ClassMethodDeclaration, fieldTypes: ReadonlyMap<ClassFieldDeclaration, Type>): Type {
    const fieldType = [...fieldTypes].find(([field]) => field.position.offset === member.position.offset)?.[1] ?? ANY_TYPE;

    if (member.generated?.kind === 'lazy') {
        return createFunction([], fieldType);
    }

    if (member.generated === undefined) {
        return member.parameters.length === 0 ? createFunction([], fieldType) : createFunction([fieldType], VOID_TYPE);
    }

    return buildFunctionType(context, member.parameters, member.returnAnnotation);
}

function checkMemberSpaces(context: CheckContext, info: ClassInfo, statement: ClassDeclaration): void {
    for (const member of statement.members) {
        if (member.isStatic && info.members.has(member.name)) {
            context.report('check-duplicate-class-member', `Class "${info.name}" declares "${member.name}" as both a static and an instance member.`, member.position);
        }

        if (!member.isStatic || info.superClass === null) {
            continue;
        }

        const inherited = context.declarations.lookupStaticMember(info.superClass, member.name);
        const declared = info.statics.get(member.name);

        if (inherited === undefined || inherited === null || declared === undefined) {
            continue;
        }

        const options = { allowNil: context.allowNil };

        if (!isAssignable(declared.type, inherited.type, options) || !isAssignable(inherited.type, declared.type, options)) {
            const message = `Static member "${member.name}" must match "${typeToString(inherited.type)}" declared by class "${info.superClass}".`;

            context.report('check-invalid-override', message, member.position);
        }
    }
}

export function registerMembers(context: CheckContext, info: ClassInfo, statement: ClassDeclaration): ClassMethodDeclaration[] {
    const fieldTypes = new Map<ClassFieldDeclaration, Type>();

    for (const member of statement.members) {
        if (member.kind === 'class-field') {
            checkFieldName(context, member);
            fieldTypes.set(member, fieldType(context, member));
        }
    }

    const generated = expandClassDecorators(context, statement, fieldTypes);

    for (const member of [...statement.members, ...generated]) {
        const type = member.kind === 'class-field'
            ? fieldTypes.get(member) ?? ANY_TYPE
            : member.isSynthetic
               ? syntheticMethodType(context, member, fieldTypes)
               : buildFunctionType(context, member.parameters, member.returnAnnotation);

        const decorators = member.decorators.map((decorator) => decorator.name);

        if (member.kind === 'class-method' && isMetamethodMember(member)) {
            checkMetamethod(context, info.name, member, type);

            continue;
        }

        reportRejectedMetamethod(context, info.name, member);

        const space = member.isStatic ? info.statics : info.members;

        space.set(member.name, {
            name: member.name,
            type,
            isMethod: member.kind === 'class-method',
            position: member.position,
            readOnly: decorators.includes('ReadOnly'),
            deprecated: decorators.includes('Deprecated'),
        });
    }

    checkMemberSpaces(context, info, statement);

    return generated;
}

export function declareBuilder(context: CheckContext, info: ClassInfo, statement: ClassDeclaration): void {
    if (!statement.decorators.some((decorator) => decorator.name === 'Builder')) {
        return;
    }

    const name = `${statement.name}Builder`;
    const members = new Map<string, MemberInfo>();

    for (const field of statement.members) {
        if (field.kind === 'class-field') {
            const type = info.members.get(field.name)?.type ?? ANY_TYPE;
            const method = `with${field.name[0]?.toUpperCase()}${field.name.slice(1)}`;
            members.set(method, { name: method, type: { kind: 'function', parameters: [type], minimumArguments: 1, isVariadic: false, returnType: createNamed(name) }, isMethod: true, position: field.position });
        }
    }

    members.set('build', { name: 'build', type: { kind: 'function', parameters: [], minimumArguments: 0, isVariadic: false, returnType: createNamed(statement.name) }, isMethod: true, position: statement.position });
    context.declarations.declareClass({
        name,
        typeParameters: [],
        typeConstraints: [],
        superClass: null,
        superArguments: [],
        interfaces: [],
        members,
        statics: new Map(),
        position: statement.position,
    });
    context.declareModuleGlobal({ name, type: createNamed(name), isLocal: false, position: statement.position });
}

function selfType(info: ClassInfo): Type {
    return createNamed(info.name, info.typeParameters.map((parameter) => createNamed(parameter)));
}

function checkMethodBody(context: CheckContext, info: ClassInfo, member: ClassMethodDeclaration): void {
    const explicitSelf = member.parameters.find((parameter) => parameter.name === 'self');

    if (explicitSelf !== undefined) {
        context.report('check-explicit-self-parameter', 'Class methods receive "self" automatically; remove it from the parameter list.', explicitSelf.position);
    }

    const signature = (member.isStatic ? info.statics : info.members).get(member.name)?.type;

    if (signature?.kind !== 'function') {
        return;
    }

    if (member.isStatic) {
        checkFunctionBody(context, member.parameters, member.returnAnnotation, member.body, signature, null);

        return;
    }

    context.pushClassMethod({ className: info.name, methodName: member.name });
    checkFunctionBody(context, member.parameters, member.returnAnnotation, member.body, signature, selfType(info));
    context.popClassMethod();
}

export function resolveSuperClass(context: CheckContext, statement: ClassDeclaration): string | null {
    if (statement.superClass === null) {
        return null;
    }

    if (context.declarations.lookupClass(statement.superClass) !== null) {
        if (context.isAmbientClass(statement.superClass)) {
            context.noteExternalReference(statement.superClass, statement.position);
        }

        return statement.superClass;
    }

    if (context.mtaClasses !== null && context.mtaClasses.lookupClass(statement.superClass) !== null) {
        const message = `Class "${statement.name}" cannot extend native MTA class "${statement.superClass}".`;

        context.report('check-native-class-inheritance', message, statement.position);

        return null;
    }

    const message = `Class "${statement.name}" extends "${statement.superClass}", which is not defined.`;

    context.noteExternalReference(statement.superClass, statement.position);
    context.report('check-unknown-class', message, statement.position);

    return null;
}

export function resolveClassHeader(context: CheckContext, info: ClassInfo, statement: ClassDeclaration): void {
    info.superArguments = statement.superClassArguments.map((argument) => context.resolveAnnotation(argument));
    info.typeConstraints = statement.typeConstraints.map((constraint) => (constraint === null ? null : context.resolveAnnotation(constraint)));
}

export function declareClassInfo(context: CheckContext, statement: ClassDeclaration): ClassInfo | null {
    if (context.declarations.lookupClass(statement.name) !== null) {
        context.report('check-duplicate-class', `Class "${statement.name}" is already defined.`, statement.position);

        return null;
    }

    if (context.mtaClasses !== null && context.mtaClasses.lookupClass(statement.name) !== null) {
        context.report('check-duplicate-class', `Class "${statement.name}" is reserved by MTA when OOP is enabled.`, statement.position);

        return null;
    }

    const info: ClassInfo = {
        name: statement.name,
        typeParameters: statement.typeParameters,
        typeConstraints: [],
        superClass: null,
        superArguments: [],
        interfaces: statement.interfaces,
        members: new Map(),
        statics: new Map(),
        position: statement.position,
    };

    context.noteTypeParameters(statement.typeParameters);
    context.declarations.declareClass(info);
    context.declareModuleGlobal({ name: info.name, type: createNamed(info.name), isLocal: false, position: statement.position });

    return info;
}

function declareLocalClass(context: CheckContext, statement: ClassDeclaration): ClassInfo | null {
    const info = declareClassInfo(context, statement);

    if (info === null) {
        return null;
    }

    info.superClass = resolveSuperClass(context, statement);
    resolveClassHeader(context, info, statement);

    return info;
}

export function checkClassDeclaration(context: CheckContext, statement: ClassDeclaration): void {
    const info = context.takePredeclaredClass(statement.name) ?? declareLocalClass(context, statement);

    if (info === null) {
        return;
    }

    context.generatedMembers.set(statement, registerMembers(context, info, statement));
    declareBuilder(context, info, statement);
    checkInterfaces(context, info);
    checkOverrides(context, info, statement);

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

    for (const name of new Set(statement.superInterfaces)) {
        const parent = context.declarations.lookupInterface(name);

        if (name === statement.name || context.declarations.interfaceExtends(name, statement.name)) {
            context.report('check-interface-cycle', `Interface "${statement.name}" creates an inheritance cycle through "${name}".`, statement.position);
        } else if (parent === null) {
            context.noteExternalReference(name, statement.position);
            context.report('check-unknown-interface', `Interface "${statement.name}" extends "${name}", which is not defined.`, statement.position);
        } else if (context.isAmbientInterface(name)) {
            context.noteExternalReference(name, statement.position);
        }
    }

    if (new Set(statement.superInterfaces).size !== statement.superInterfaces.length) {
        context.report('check-duplicate-interface-parent', `Interface "${statement.name}" extends the same interface more than once.`, statement.position);
    }

    for (const member of statement.members) {
        const type =
            member.kind === 'interface-field'
                ? context.resolveAnnotation(member.annotation)
                : buildFunctionType(context, member.parameters, member.returnAnnotation);

        const info = { name: member.name, type, isMethod: member.kind === 'interface-method', position: member.position };

        if (members.has(member.name)) {
            context.report('check-duplicate-interface-member', `Interface "${statement.name}" declares member "${member.name}" more than once.`, member.position);
        } else {
            members.set(member.name, info);
        }
    }

    const inherited = new Map<string, MemberInfo>();

    for (const parent of statement.superInterfaces) {
        for (const member of context.declarations.collectInterfaceContract(parent)) {
            const existing = members.get(member.name) ?? inherited.get(member.name);

            if (existing !== undefined && (existing.isMethod !== member.isMethod || typeToString(existing.type) !== typeToString(member.type))) {
                context.report('check-conflicting-interface-member', `Interface "${statement.name}" inherits conflicting declarations of "${member.name}".`, statement.position);
            } else if (existing === undefined) {
                inherited.set(member.name, member);
            }
        }
    }

    context.declarations.declareInterface({
        name: statement.name,
        superInterfaces: statement.superInterfaces,
        members,
        position: statement.position,
    });
}

export function checkEnumDeclaration(context: CheckContext, statement: EnumDeclaration): void {
    const existing = context.declarations.lookupEnum(statement.name);
    const shadowsAmbient = statement.isLocal && existing?.isLocal !== true && context.isAmbientEnum(statement.name);

    if (existing !== null && !shadowsAmbient) {
        context.report('check-duplicate-enum', `Enum "${statement.name}" is already defined.`, statement.position);

        return;
    }

    const members = statement.members.map((member) => member.name);

    context.declarations.declareEnum({ name: statement.name, members, isLocal: statement.isLocal, position: statement.position });

    if (statement.isLocal) {
        context.binder.declare({ name: statement.name, type: createNamed(statement.name), isLocal: true, position: statement.position, origin: 'local' });
    } else {
        context.declareModuleGlobal({ name: statement.name, type: createNamed(statement.name), isLocal: false, position: statement.position });
    }
}
