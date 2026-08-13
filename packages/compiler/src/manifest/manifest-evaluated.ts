import { ANY_TYPE, BOOLEAN_TYPE, createStringLiteral, createUnion, NIL_TYPE, NUMBER_TYPE, type Type } from '@compiler/checker/types';

import type { ManifestValue } from './manifest-value';

export interface Evaluated {
    value: ManifestValue;
    type: Type;
    truthy: Type | null;
    falsy: Type | null;
}

export function truthyOf(type: Type): Type | null {
    if (type.kind === 'nil') {
        return null;
    }

    if (type.kind === 'optional') {
        return type.element;
    }

    if (type.kind === 'union') {
        const options = type.options.map(truthyOf).filter((option): option is Type => option !== null);

        return options.length === 0 ? null : createUnion(options);
    }

    return type;
}

export function falsyOf(type: Type): Type | null {
    if (type.kind === 'nil' || type.kind === 'boolean') {
        return type.kind === 'nil' ? NIL_TYPE : BOOLEAN_TYPE;
    }

    if (type.kind === 'optional') {
        return NIL_TYPE;
    }

    if (type.kind === 'union') {
        const options = type.options.map(falsyOf).filter((option): option is Type => option !== null);

        return options.length === 0 ? null : createUnion(options);
    }

    return null;
}

export function resolved(value: ManifestValue, type: Type): Evaluated {
    return { value, type, truthy: truthyOf(type), falsy: falsyOf(type) };
}

export function nilValue(): Evaluated {
    return { value: null, type: NIL_TYPE, truthy: null, falsy: NIL_TYPE };
}

export function errorValue(): Evaluated {
    return { value: null, type: ANY_TYPE, truthy: ANY_TYPE, falsy: null };
}

export function booleanValue(value: boolean): Evaluated {
    return { value, type: BOOLEAN_TYPE, truthy: value ? BOOLEAN_TYPE : null, falsy: value ? null : BOOLEAN_TYPE };
}

export function numberValue(value: number): Evaluated {
    return { value, type: NUMBER_TYPE, truthy: NUMBER_TYPE, falsy: null };
}

export function stringValue(value: string): Evaluated {
    const type = createStringLiteral(value);

    return { value, type, truthy: type, falsy: null };
}

export function unionOf(options: readonly (Type | null)[]): Type {
    const present = options.filter((option): option is Type => option !== null);

    return present.length === 0 ? NIL_TYPE : createUnion([...present]);
}
