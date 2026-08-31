import {
    createArray,
    createFunction,
    createMap,
    createNamed,
    createOptional,
    createRecord,
    createTuple,
    createUnion,
    type Type,
} from './types';

function shadowed(substitutions: ReadonlyMap<string, Type>, names: readonly string[]): ReadonlyMap<string, Type> {
    const remaining = new Map(substitutions);

    for (const name of names) {
        remaining.delete(name);
    }

    return remaining;
}

export function substituteType(type: Type, substitutions: ReadonlyMap<string, Type>): Type {
    if (type.kind === 'named') {
        const args = type.typeArguments ?? [];

        if (args.length > 0) {
            return createNamed(type.name, args.map((argument) => substituteType(argument, substitutions)));
        }

        return substitutions.get(type.name) ?? type;
    }

    if (type.kind === 'array') {
        return createArray(substituteType(type.element, substitutions));
    }

    if (type.kind === 'map') {
        return createMap(substituteType(type.key, substitutions), substituteType(type.value, substitutions));
    }

    if (type.kind === 'optional') {
        return createOptional(substituteType(type.element, substitutions));
    }

    if (type.kind === 'union') {
        return createUnion(type.options.map((option) => substituteType(option, substitutions)));
    }

    if (type.kind === 'function') {
        const own = type.typeParameters ?? [];
        const outer = own.length === 0 ? substitutions : shadowed(substitutions, own);
        const parameters = type.parameters.map((parameter) => substituteType(parameter, outer));
        const returnType = substituteType(type.returnType, outer);

        const variadicType = type.variadicType === undefined ? undefined : substituteType(type.variadicType, outer);
        const substituted = createFunction(parameters, returnType, type.minimumArguments, type.isVariadic, type.parameterNames, variadicType);

        if (own.length > 0) {
            substituted.typeParameters = [...own];
            substituted.typeConstraints = (type.typeConstraints ?? []).map((constraint) => (constraint === null ? null : substituteType(constraint, outer)));
        }

        return substituted;
    }

    if (type.kind === 'tuple') {
        return createTuple(type.elements.map((element) => substituteType(element, substitutions)));
    }

    if (type.kind === 'record') {
        const members = new Map([...type.members].map(([name, member]) => [name, substituteType(member, substitutions)]));

        return createRecord(type.name, members, type.origin);
    }

    return type;
}
