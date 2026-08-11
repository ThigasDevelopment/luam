import {
    createArray,
    createFunction,
    createOptional,
    createRecord,
    createTuple,
    createUnion,
    type Type,
} from './types';

export function substituteType(type: Type, substitutions: ReadonlyMap<string, Type>): Type {
    if (type.kind === 'named') {
        return substitutions.get(type.name) ?? type;
    }

    if (type.kind === 'array') {
        return createArray(substituteType(type.element, substitutions));
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

        return createFunction(parameters, returnType, type.minimumArguments, type.isVariadic);
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
