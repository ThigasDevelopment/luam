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
        const parameters = type.parameters.map((parameter) => substituteType(parameter, substitutions));
        const returnType = substituteType(type.returnType, substitutions);

        const variadicType = type.variadicType === undefined ? undefined : substituteType(type.variadicType, substitutions);

        return createFunction(parameters, returnType, type.minimumArguments, type.isVariadic, type.parameterNames, variadicType);
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
