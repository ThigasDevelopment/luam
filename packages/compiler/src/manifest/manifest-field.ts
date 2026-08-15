import { createOptional, createRecord, type Type } from '@compiler/checker/types';

import type { ManifestValue } from './manifest-value';

export type ManifestRuleKind =
    | 'resource-name'
    | 'dependency-name'
    | 'contained-path'
    | 'static-path'
    | 'source-pattern'
    | 'engine-version'
    | 'positive-integer';

export interface ManifestField {
    name: string;
    type: Type;
    summary: string;
    owner: string;
    required: boolean;
    defaultValue: ManifestValue | null;
    rule: ManifestRuleKind | null;
    values: readonly string[] | null;
    valueCode: string | null;
    members: readonly ManifestField[] | null;
    elements: readonly ManifestField[] | null;
    allowEmpty: boolean;
}

const RULE_TEXT: Readonly<Record<ManifestRuleKind, string>> = {
    'resource-name': 'Letters, digits, dots, dashes, and underscores, starting with a letter or a digit.',
    'dependency-name': 'The name of another MTA resource, which cannot be this resource.',
    'contained-path': 'A relative path that stays inside the project directory.',
    'static-path': 'A relative path with no wildcards that stays inside the project directory.',
    'source-pattern': 'A relative path or a "*", "**", and "?" pattern that stays inside the project directory.',
    'engine-version': 'A version such as "1.6.0", or "latest" to follow the newest published release.',
    'positive-integer': 'A positive integer.',
};

export function field(name: string, type: Type, summary: string, options: Partial<ManifestField> = {}): ManifestField {
    return {
        name,
        type,
        summary,
        owner: 'compiler',
        required: false,
        defaultValue: null,
        rule: null,
        values: null,
        valueCode: null,
        members: null,
        elements: null,
        allowEmpty: false,
        ...options,
    };
}

export function recordType(name: string, members: readonly ManifestField[]): Type {
    return createRecord(name, new Map(members.map((member) => [member.name, member.required ? member.type : createOptional(member.type)])));
}

function titleCase(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function table(name: string, summary: string, members: readonly ManifestField[], options: Partial<ManifestField> = {}): ManifestField {
    return field(name, recordType(titleCase(name), members), summary, { ...options, members });
}

export function ruleText(entry: ManifestField): string | null {
    return entry.rule === null ? null : RULE_TEXT[entry.rule];
}

function literalText(value: ManifestValue): string {
    if (typeof value === 'string') {
        return `'${value}'`;
    }

    if (Array.isArray(value)) {
        return value.length === 0 ? '{ }' : `{ ${value.map(literalText).join(', ')} }`;
    }

    return String(value);
}

export function defaultText(entry: ManifestField): string | null {
    if (entry.defaultValue === null || entry.members !== null) {
        return null;
    }

    return literalText(entry.defaultValue);
}

export function findField(fields: readonly ManifestField[], name: string): ManifestField | null {
    return fields.find((entry) => entry.name === name) ?? null;
}

export function requiredFields(fields: readonly ManifestField[]): ManifestField[] {
    return fields.filter((entry) => entry.required);
}

export function elementField(entry: ManifestField, type: Type): ManifestField {
    return { ...entry, type, members: entry.elements, elements: null, defaultValue: null, required: false };
}
