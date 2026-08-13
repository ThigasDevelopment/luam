import { typeToString, type Type } from '@compiler/checker/types';

export interface ManifestObject {
    [key: string]: ManifestValue;
}

export type ManifestValue = string | number | boolean | null | ManifestValue[] | ManifestObject;

const NAMES: Readonly<Record<string, string>> = {
    string: 'a string',
    number: 'a number',
    boolean: 'a boolean',
    nil: 'nil',
    table: 'a table',
};

const PLURALS: Readonly<Record<string, string>> = {
    'a string': 'strings',
    'a number': 'numbers',
    'a boolean': 'booleans',
    'a table': 'tables',
};

export function isManifestObject(value: unknown): value is ManifestObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isTruthy(value: ManifestValue): boolean {
    return value !== null && value !== false;
}

export function quoteList(values: readonly string[]): string {
    return values.map((value) => `"${value}"`).join(', ');
}

export function describeType(type: Type): string {
    if (type.kind === 'optional') {
        return describeType(type.element);
    }

    if (type.kind === 'array') {
        const element = describeType(type.element);

        return `a list of ${PLURALS[element] ?? `${element} values`}`;
    }

    if (type.kind === 'union') {
        const literals = type.options.filter((option) => option.kind === 'string-literal');

        if (literals.length === type.options.length) {
            return `one of ${quoteList(literals.map((option) => (option.kind === 'string-literal' ? option.value : '')))}`;
        }

        return type.options.map(describeType).join(' or ');
    }

    if (type.kind === 'record') {
        return 'a table';
    }

    if (type.kind === 'string-literal') {
        return `"${type.value}"`;
    }

    return NAMES[type.kind] ?? typeToString(type);
}

export function describeReceived(type: Type): string {
    if (type.kind === 'optional') {
        return `${describeReceived(type.element)} that may be nil`;
    }

    if (type.kind === 'union') {
        return [...new Set(type.options.map(describeReceived))].join(' or ');
    }

    if (type.kind === 'array') {
        return 'a list';
    }

    if (type.kind === 'record') {
        return 'a table';
    }

    if (type.kind === 'string-literal') {
        return 'a string';
    }

    return NAMES[type.kind] ?? typeToString(type);
}
