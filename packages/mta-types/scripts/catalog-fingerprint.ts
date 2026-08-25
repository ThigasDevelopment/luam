import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { ApiEnvironment } from '#mta-types/api-declaration';
import type { TypeDescriptor } from '#mta-types/type-descriptor';

import { GeneratorError, type CatalogEntry } from './generator-model.ts';

export const INDEX_PATH = fileURLToPath(new URL('../data/catalog-index.json', import.meta.url));

export const INDEX_FILE = 'packages/mta-types/data/catalog-index.json';

const SCALARS: Readonly<Record<string, string>> = {
    any: 'any',
    boolean: 'bool',
    nil: 'nil',
    number: 'num',
    string: 'str',
    table: 'table',
    thread: 'thread',
    userdata: 'userdata',
    void: 'void',
};

export type CatalogIndex = Readonly<Record<string, string>>;

export function render(descriptor: TypeDescriptor): string {
    if (descriptor.kind === 'named') {
        return descriptor.name;
    }

    if (descriptor.kind === 'literal') {
        return `'${descriptor.value}'`;
    }

    if (descriptor.kind === 'array') {
        return `${render(descriptor.element)}[]`;
    }

    if (descriptor.kind === 'optional') {
        return `${render(descriptor.element)}?`;
    }

    if (descriptor.kind === 'union') {
        return descriptor.options.map(render).join('|');
    }

    if (descriptor.kind === 'tuple') {
        return `(${descriptor.elements.map(render).join(',')})`;
    }

    if (descriptor.kind === 'record') {
        return `{${descriptor.name}}`;
    }

    if (descriptor.kind === 'function') {
        const parameters = descriptor.parameters.map((parameter, index) => (index < descriptor.minimumArguments ? render(parameter) : `${render(parameter)}?`));

        return `(${[...parameters, ...(descriptor.isVariadic ? ['...'] : [])].join(',')})->${render(descriptor.returnType)}`;
    }

    return SCALARS[descriptor.kind] ?? descriptor.kind;
}

export function fingerprint(entries: readonly CatalogEntry[]): CatalogIndex {
    const index: Record<string, string> = {};

    for (const entry of [...entries].sort((left, right) => left.name.localeCompare(right.name, 'en'))) {
        index[entry.name] = `${entry.environment} ${render(entry.type)}`;
    }

    return index;
}

export interface SignatureChange {
    name: string;
    before: string;
    after: string;
}

export interface CatalogDiff {
    added: readonly string[];
    removed: readonly string[];
    signatures: readonly SignatureChange[];
    environments: readonly SignatureChange[];
}

function environmentOf(value: string): ApiEnvironment {
    const head = value.split(' ')[0] ?? 'shared';

    return head === 'server' || head === 'client' ? head : 'shared';
}

export function diffCatalogs(before: CatalogIndex, after: CatalogIndex): CatalogDiff {
    const added: string[] = [];
    const removed: string[] = [];
    const signatures: SignatureChange[] = [];
    const environments: SignatureChange[] = [];

    for (const [name, value] of Object.entries(after)) {
        const previous = before[name];

        if (previous === undefined) {
            added.push(name);
        } else if (previous !== value) {
            const change = { name, before: previous, after: value };

            (environmentOf(previous) === environmentOf(value) ? signatures : environments).push(change);
        }
    }

    for (const name of Object.keys(before)) {
        if (after[name] === undefined) {
            removed.push(name);
        }
    }

    return { added: added.sort(), removed: removed.sort(), signatures, environments };
}

export function readIndex(): CatalogIndex {
    if (!existsSync(INDEX_PATH)) {
        return {};
    }

    const parsed: unknown = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));

    if (typeof parsed !== 'object' || parsed === null || Object.values(parsed).some((value) => typeof value !== 'string')) {
        throw new GeneratorError(INDEX_FILE, 'is not a catalog index: every entry must be a rendered signature string');
    }

    return parsed as CatalogIndex;
}

export function formatDiff(diff: CatalogDiff): string {
    return [
        `functions added: ${diff.added.length}`,
        `existing signatures changed: ${diff.signatures.length}`,
        ...diff.signatures.map((change) => `  ${change.name}: ${change.before} -> ${change.after}`),
        `environments changed: ${diff.environments.length}`,
        ...diff.environments.map((change) => `  ${change.name}: ${change.before} -> ${change.after}`),
        `functions the wiki no longer lists: ${diff.removed.length}${diff.removed.length === 0 ? '' : ` (${diff.removed.join(', ')})`}`,
    ].join('\n');
}
