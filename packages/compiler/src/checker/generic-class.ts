import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

import type { CheckContext } from './context';
import type { ClassInfo, DeclarationRegistry, MemberInfo } from './registry';
import { substituteType } from './type-substitution';
import { ANY_TYPE, isAssignable, typeToString, widenInferred, type NamedType, type Type } from './types';

const MAX_DEPTH = 32;

export function classSubstitutions(info: ClassInfo, typeArguments: readonly Type[]): Map<string, Type> {
    return new Map(info.typeParameters.map((parameter, index) => [parameter, typeArguments[index] ?? ANY_TYPE]));
}

export function parameterSubstitutions(typeParameters: readonly string[], typeArguments: readonly Type[]): Map<string, Type> {
    return new Map(typeParameters.map((parameter, index) => [parameter, typeArguments[index] ?? ANY_TYPE]));
}

function parentSubstitutions(registry: DeclarationRegistry, info: ClassInfo, current: ReadonlyMap<string, Type>): Map<string, Type> | null {
    const parent = info.superClass === null ? null : registry.lookupClass(info.superClass);

    if (parent === null) {
        return null;
    }

    return classSubstitutions(parent, info.superArguments.map((argument) => substituteType(argument, current)));
}

export function substitutionsFor(registry: DeclarationRegistry, receiver: NamedType, owner: string): ReadonlyMap<string, Type> {
    const info = registry.lookupClass(receiver.name);

    if (info === null) {
        return new Map();
    }

    let current: ClassInfo | null = info;
    let substitutions = classSubstitutions(info, receiver.typeArguments ?? []);

    for (let depth = 0; current !== null && depth < MAX_DEPTH; depth += 1) {
        if (current.name === owner) {
            return substitutions;
        }

        const next = parentSubstitutions(registry, current, substitutions);

        if (next === null) {
            return new Map();
        }

        substitutions = next;
        current = current.superClass === null ? null : registry.lookupClass(current.superClass);
    }

    return new Map();
}

function interfaceSubstitutions(registry: DeclarationRegistry, receiver: NamedType): Map<string, Type> | null {
    const contract = registry.lookupInterface(receiver.name);

    return contract === null ? null : parameterSubstitutions(contract.typeParameters, receiver.typeArguments ?? []);
}

export function specializeMember(context: CheckContext, receiver: NamedType, member: MemberInfo, property: string): MemberInfo {
    const contract = interfaceSubstitutions(context.declarations, receiver);

    if (contract !== null) {
        return contract.size === 0 ? member : { ...member, type: substituteType(member.type, contract) };
    }

    const owner = context.declarations.lookupMemberOwner(receiver.name, property);

    if (owner === null || owner === receiver.name) {
        const own = context.declarations.lookupClass(receiver.name);

        if (own === null || own.typeParameters.length === 0 || (receiver.typeArguments ?? []).length === 0) {
            return member;
        }

        return { ...member, type: substituteType(member.type, classSubstitutions(own, receiver.typeArguments ?? [])) };
    }

    return { ...member, type: substituteType(member.type, substitutionsFor(context.declarations, receiver, owner)) };
}

export function memberOf(context: CheckContext, receiver: NamedType, property: string): MemberInfo | null {
    const member = context.declarations.lookupMember(receiver.name, property);

    return member === null ? null : specializeMember(context, receiver, member, property);
}

function unify(parameter: Type, argument: Type, names: ReadonlySet<string>, bindings: Map<string, Type>): void {
    if (parameter.kind === 'named' && names.has(parameter.name)) {
        if (!bindings.has(parameter.name) && argument.kind !== 'nil') {
            bindings.set(parameter.name, argument);
        }

        return;
    }

    if (parameter.kind === 'array' && argument.kind === 'array') {
        unify(parameter.element, argument.element, names, bindings);

        return;
    }

    if (parameter.kind === 'optional') {
        unify(parameter.element, argument.kind === 'optional' ? argument.element : argument, names, bindings);

        return;
    }

    if (parameter.kind === 'map' && argument.kind === 'map') {
        unify(parameter.key, argument.key, names, bindings);
        unify(parameter.value, argument.value, names, bindings);

        return;
    }

    if (parameter.kind === 'named' && argument.kind === 'named' && parameter.name === argument.name) {
        const parameterArguments = parameter.typeArguments ?? [];
        const argumentArguments = argument.typeArguments ?? [];

        parameterArguments.forEach((entry, index) => unify(entry, argumentArguments[index] ?? ANY_TYPE, names, bindings));

        return;
    }

    if (parameter.kind === 'function' && argument.kind === 'function') {
        parameter.parameters.forEach((entry, index) => unify(entry, argument.parameters[index] ?? ANY_TYPE, names, bindings));
        unify(parameter.returnType, argument.returnType, names, bindings);
    }
}

export function inferTypeArguments(typeParameters: readonly string[], parameters: readonly Type[], args: readonly Type[]): Type[] {
    const names = new Set(typeParameters);
    const bindings = new Map<string, Type>();

    parameters.forEach((parameter, index) => {
        const argument = args[index];

        if (argument !== undefined) {
            unify(parameter, widenInferred(argument), names, bindings);
        }
    });

    return typeParameters.map((parameter) => bindings.get(parameter) ?? ANY_TYPE);
}

function inheritsFrom(context: CheckContext, name: string, target: string): boolean {
    let current = context.declarations.lookupClass(name);

    for (let depth = 0; current !== null && depth < MAX_DEPTH; depth += 1) {
        if (current.name === target || current.interfaces.includes(target)) {
            return true;
        }

        current = current.superClass === null ? null : context.declarations.lookupClass(current.superClass);
    }

    return context.declarations.interfaceExtends(name, target);
}

function satisfies(context: CheckContext, argument: Type, constraint: Type): boolean {
    if (argument.kind === 'named' && constraint.kind === 'named') {
        return argument.name === constraint.name || inheritsFrom(context, argument.name, constraint.name);
    }

    return isAssignable(argument, constraint, { allowNil: false });
}

export function reportConstraintViolations(
    context: CheckContext,
    owner: string,
    typeParameters: readonly string[],
    typeConstraints: readonly (Type | null)[],
    typeArguments: readonly Type[],
    position: SourcePosition,
): void {
    typeConstraints.forEach((constraint, index) => {
        const argument = typeArguments[index];

        if (constraint === null || argument === undefined || argument.kind === 'any' || satisfies(context, argument, constraint)) {
            return;
        }

        const parameter = typeParameters[index] ?? 'T';
        const message = `Type argument "${typeToString(argument)}" does not satisfy "${parameter} extends ${typeToString(constraint)}" on ${owner}.`;

        context.report('check-generic-constraint', message, position);
    });
}

export function checkTypeConstraints(context: CheckContext, name: string, typeArguments: readonly Type[], position: SourcePosition): void {
    const contract = context.declarations.lookupInterface(name);

    if (contract !== null) {
        reportConstraintViolations(context, `interface "${name}"`, contract.typeParameters, contract.typeConstraints, typeArguments, position);

        return;
    }

    const info = context.declarations.lookupClass(name);

    if (info === null) {
        return;
    }

    reportConstraintViolations(context, `class "${name}"`, info.typeParameters, info.typeConstraints, typeArguments, position);
}

export function specializedMembers(registry: DeclarationRegistry, receiver: NamedType): MemberInfo[] {
    const args = receiver.typeArguments ?? [];

    if (args.length === 0) {
        return registry.collectMembers(receiver.name);
    }

    const contract = interfaceSubstitutions(registry, receiver);

    return registry.collectMembers(receiver.name).map((member) => {
        const owner = registry.lookupMemberOwner(receiver.name, member.name);
        const substitutions = contract ?? (owner === null ? new Map<string, Type>() : substitutionsFor(registry, receiver, owner));

        return { ...member, type: substituteType(member.type, substitutions) };
    });
}
