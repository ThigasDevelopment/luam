import { ANY_TYPE, createFunction, typeToString, type FunctionType, type Type } from './types';

function callableAlternatives(type: Type): FunctionType[] | null {
    if (type.kind === 'function') {
        return [type];
    }

    if (type.kind === 'optional') {
        return callableAlternatives(type.element);
    }

    if (type.kind !== 'union') {
        return type.kind === 'any' || type.kind === 'unknown' ? null : [];
    }

    const alternatives: FunctionType[] = [];

    for (const option of type.options) {
        const nested = callableAlternatives(option);

        if (nested === null) {
            return null;
        }

        alternatives.push(...nested);
    }

    return alternatives;
}

export function contextualFunction(type: Type | null): FunctionType | null {
    if (type === null) {
        return null;
    }

    const alternatives = callableAlternatives(type);
    const first = alternatives?.[0];

    if (alternatives === null || first === undefined) {
        return null;
    }

    if (alternatives.length === 1) {
        return first;
    }

    const count = Math.max(...alternatives.map((alternative) => alternative.parameters.length));
    const parameters = Array.from({ length: count }, (_, index) => {
        const candidates = alternatives.map((alternative) => alternative.parameters[index]);
        const candidate = candidates[0];

        if (candidate === undefined || candidates.some((value) => value === undefined || typeToString(value) !== typeToString(candidate))) {
            return ANY_TYPE;
        }

        return candidate;
    });

    return createFunction(parameters, ANY_TYPE, 0);
}
