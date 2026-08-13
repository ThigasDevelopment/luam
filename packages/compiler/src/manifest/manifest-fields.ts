import {
    BOOLEAN_TYPE,
    createArray,
    createOptional,
    createRecord,
    createStringLiteral,
    createUnion,
    NUMBER_TYPE,
    STRING_TYPE,
    type Type,
} from '@compiler/checker/types';
import { RUNTIME_HELPERS } from '@runtime/helpers';

import type { ManifestValue } from './manifest-value';

export type ManifestRuleKind = 'resource-name' | 'contained-path' | 'positive-integer';

export interface ManifestField {
    name: string;
    type: Type;
    summary: string;
    required: boolean;
    defaultValue: ManifestValue | null;
    rule: ManifestRuleKind | null;
    values: readonly string[] | null;
    valueCode: string | null;
    members: readonly ManifestField[] | null;
}

export const HELPER_NAMES: readonly string[] = Object.keys(RUNTIME_HELPERS).sort();

export const TRANSPORT_KINDS: readonly string[] = ['none', 'http'];

export const MANIFEST_MODES: readonly string[] = ['development', 'production'];

const RULE_TEXT: Readonly<Record<ManifestRuleKind, string>> = {
    'resource-name': 'Letters, digits, dots, dashes, and underscores, starting with a letter or a digit.',
    'contained-path': 'A relative path that stays inside the project directory.',
    'positive-integer': 'A positive integer.',
};

function field(name: string, type: Type, summary: string, options: Partial<ManifestField> = {}): ManifestField {
    return { name, type, summary, required: false, defaultValue: null, rule: null, values: null, valueCode: null, members: null, ...options };
}

function record(name: string, members: readonly ManifestField[]): Type {
    return createRecord(name, new Map(members.map((member) => [member.name, member.required ? member.type : createOptional(member.type)])));
}

function table(name: string, summary: string, members: readonly ManifestField[], options: Partial<ManifestField> = {}): ManifestField {
    return field(name, record(name.charAt(0).toUpperCase() + name.slice(1), members), summary, { ...options, members });
}

const OPTIONAL_STRING = createOptional(STRING_TYPE);

const STRING_LIST = createArray(STRING_TYPE);

const HELPER_LIST = createArray(createUnion(HELPER_NAMES.map((name) => createStringLiteral(name))));

const TRANSPORT_KIND = createUnion(TRANSPORT_KINDS.map((kind) => createStringLiteral(kind)));

const OUTPUT_FIELDS: readonly ManifestField[] = [
    field('bundle', BOOLEAN_TYPE, 'Writes one Lua file per side instead of mirroring the source tree.', { defaultValue: true }),
    field('map', BOOLEAN_TYPE, 'Writes a resource map that traces generated lines back to their source.', { defaultValue: true }),
];

const TRANSPORT_FIELDS: readonly ManifestField[] = [
    field('kind', TRANSPORT_KIND, 'Selects how "luam ensure" reaches the running server.', {
        required: true,
        values: TRANSPORT_KINDS,
        valueCode: 'config-invalid-transport',
    }),
    field('host', STRING_TYPE, 'Host the MTA HTTP interface listens on.', { defaultValue: '127.0.0.1' }),
    field('port', NUMBER_TYPE, 'Port the MTA HTTP interface listens on.', { defaultValue: 22005, rule: 'positive-integer' }),
    field('resource', STRING_TYPE, 'Resource that exposes the refresh and restart functions.'),
    field('username', STRING_TYPE, 'Account used to call the MTA HTTP interface.'),
    field('password', STRING_TYPE, 'Password stored in plain text. Prefer "passwordEnv".'),
    field('passwordEnv', STRING_TYPE, 'Environment variable holding the password.'),
    field('refreshFunction', STRING_TYPE, 'Exported function that refreshes the resource list.', { defaultValue: 'refreshResources' }),
    field('restartFunction', STRING_TYPE, 'Exported function that restarts a resource.', { defaultValue: 'restartResource' }),
];

const LOG_FIELDS: readonly ManifestField[] = [
    field('enabled', BOOLEAN_TYPE, 'Streams server and client logs into "luam dev".', { defaultValue: false }),
    field('maxMessageLength', NUMBER_TYPE, 'Longest log message kept before it is truncated.', { defaultValue: 4096, rule: 'positive-integer' }),
    field('rateLimit', NUMBER_TYPE, 'Log messages accepted inside one window.', { defaultValue: 30, rule: 'positive-integer' }),
    field('rateWindowMs', NUMBER_TYPE, 'Length of the rate window in milliseconds.', { defaultValue: 1000, rule: 'positive-integer' }),
];

const DEVELOPMENT_FIELDS: readonly ManifestField[] = [table('logs', 'Log capture used by "luam dev".', LOG_FIELDS, { defaultValue: {} })];

export const MANIFEST_FIELDS: readonly ManifestField[] = [
    field('name', STRING_TYPE, 'The MTA resource name.', { required: true, rule: 'resource-name' }),
    field('author', OPTIONAL_STRING, 'Author written to the generated meta.xml.'),
    field('version', OPTIONAL_STRING, 'Version written to the generated meta.xml.'),
    field('description', OPTIONAL_STRING, 'Description written to the generated meta.xml.'),
    field('sourceDirs', STRING_LIST, 'Directories scanned for Luam sources.', { defaultValue: ['src'], rule: 'contained-path' }),
    field('assetDirs', STRING_LIST, 'Directories copied into the resource untouched.', { defaultValue: ['assets'], rule: 'contained-path' }),
    field('outDir', STRING_TYPE, 'Directory the built resource is written to.', { defaultValue: 'build', rule: 'contained-path' }),
    field('loadOrder', STRING_LIST, 'Files listed first in the generated meta.xml.', { defaultValue: [], rule: 'contained-path' }),
    field('oop', BOOLEAN_TYPE, 'Enables the MTA OOP API in the checker and the generated meta.xml.', { defaultValue: false }),
    field('helpers', HELPER_LIST, 'Runtime helpers bundled into the resource.', {
        defaultValue: [],
        values: HELPER_NAMES,
        valueCode: 'config-unknown-helper',
    }),
    field('serverPath', OPTIONAL_STRING, 'Path to the MTA server installation used by "luam dev".'),
    field('resourcesDir', STRING_TYPE, 'Resource directory inside the server installation.', {
        defaultValue: 'mods/deathmatch/resources',
        rule: 'contained-path',
    }),
    table('output', 'Switches for the generated output.', OUTPUT_FIELDS, { defaultValue: {} }),
    table('transport', 'How "luam ensure" reaches the running server.', TRANSPORT_FIELDS),
    table('development', 'Behaviour that only applies while developing.', DEVELOPMENT_FIELDS, { defaultValue: {} }),
];

export const MANIFEST_RECORD: Type = record('Manifest', MANIFEST_FIELDS);

export const ENV_MEMBER_TYPE: Type = OPTIONAL_STRING;

export function ruleText(field: ManifestField): string | null {
    return field.rule === null ? null : RULE_TEXT[field.rule];
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

export function defaultText(field: ManifestField): string | null {
    if (field.defaultValue === null || field.members !== null) {
        return null;
    }

    return literalText(field.defaultValue);
}

export function findField(fields: readonly ManifestField[], name: string): ManifestField | null {
    return fields.find((entry) => entry.name === name) ?? null;
}

export function findManifestField(path: readonly string[]): ManifestField | null {
    let fields: readonly ManifestField[] | null = MANIFEST_FIELDS;
    let found: ManifestField | null = null;

    for (const segment of path) {
        found = fields === null ? null : findField(fields, segment);

        if (found === null) {
            return null;
        }

        fields = found.members;
    }

    return found;
}

export function requiredFields(fields: readonly ManifestField[]): ManifestField[] {
    return fields.filter((entry) => entry.required);
}
