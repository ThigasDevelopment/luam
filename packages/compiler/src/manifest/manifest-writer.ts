import { findManifestField, MANIFEST_FIELDS } from './manifest-fields';
import type { ManifestField } from './manifest-field';
import { isManifestObject, type ManifestObject, type ManifestValue } from './manifest-value';

const INDENT = '    ';

const ESCAPES: ReadonlyArray<readonly [RegExp, string]> = [
    [/\\/g, '\\\\'],
    [/'/g, "\\'"],
    [/\r/g, '\\r'],
    [/\n/g, '\\n'],
];

export function quoteManifestString(value: string): string {
    let escaped = value;

    for (const [pattern, replacement] of ESCAPES) {
        escaped = escaped.replace(pattern, replacement);
    }

    return `'${escaped}'`;
}

function fieldsAt(path: readonly string[]): readonly ManifestField[] | null {
    if (path.length === 0) {
        return MANIFEST_FIELDS;
    }

    return findManifestField(path)?.members ?? null;
}

function orderedKeys(value: ManifestObject, path: readonly string[]): string[] {
    const declared = (fieldsAt(path) ?? []).map((entry) => entry.name);
    const present = Object.keys(value);
    const known = declared.filter((name) => present.includes(name));

    return [...known, ...present.filter((name) => !known.includes(name))];
}

const INLINE_ENTRIES = 3;

function isScalar(value: ManifestValue): boolean {
    return !Array.isArray(value) && !isManifestObject(value);
}

function isInline(value: ManifestObject): boolean {
    const entries = Object.values(value);

    return entries.length > 0 && entries.length <= INLINE_ENTRIES && entries.every(isScalar);
}

function renderScalar(value: ManifestValue): string {
    return typeof value === 'string' ? quoteManifestString(value) : String(value);
}

function renderInlineRecord(value: ManifestObject, path: readonly string[]): string {
    const entries = orderedKeys(value, path).map((key) => `${key} = ${renderScalar(value[key] ?? null)}`);

    return `{ ${entries.join(', ')} }`;
}

function renderList(value: readonly ManifestValue[], path: readonly string[], depth: number): string {
    if (value.length === 0) {
        return '{ }';
    }

    const inner = INDENT.repeat(depth + 1);
    const entries = value.map((entry) => `${inner}${render(entry, [...path, '0'], depth + 1)},`);

    return ['{', ...entries, `${INDENT.repeat(depth)}}`].join('\n');
}

function renderRecord(value: ManifestObject, path: readonly string[], depth: number): string {
    const keys = orderedKeys(value, path);

    if (keys.length === 0) {
        return '{ }';
    }

    const inner = INDENT.repeat(depth + 1);
    const entries = keys.map((key) => `${inner}${key} = ${render(value[key] ?? null, [...path, key], depth + 1)},`);

    return ['{', ...entries, `${INDENT.repeat(depth)}}`].join('\n');
}

function render(value: ManifestValue, path: readonly string[], depth: number): string {
    if (Array.isArray(value)) {
        return renderList(value, path, depth);
    }

    if (isManifestObject(value)) {
        return depth > 0 && isInline(value) ? renderInlineRecord(value, path) : renderRecord(value, path, depth);
    }

    return renderScalar(value);
}

export function renderManifestTable(value: ManifestObject): string {
    const keys = orderedKeys(value, []);
    const blocks = keys.map((key) => `${INDENT}${key} = ${render(value[key] ?? null, [key], 1)},`);

    return ['{', blocks.join('\n\n'), '}', ''].join('\n');
}
