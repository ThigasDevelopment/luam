import { createPosition, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';

import { ESCAPING_PATH, INVALID_NAME, INVALID_TYPE, manifestError } from './manifest-diagnostics';
import { MANIFEST_FIELDS, type ManifestField } from './manifest-fields';
import { isManifestObject, type ManifestObject, type ManifestValue } from './manifest-value';

export type PositionLookup = ReadonlyMap<string, SourcePosition>;

const START = createPosition(1, 1, 0);

const RESOURCE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isValidResourceName(name: string): boolean {
    return RESOURCE_NAME.test(name);
}

export function isContainedPath(value: string): boolean {
    const normalized = value.replace(/\\/g, '/');

    return !normalized.startsWith('/') && !/^[A-Za-z]:/.test(normalized) && !normalized.split('/').includes('..');
}

function normalizePath(value: string): string {
    return value.replace(/\\/g, '/').replace(/\/+$/, '');
}

export function positionAt(positions: PositionLookup, key: string): SourcePosition {
    let current = key;

    while (current.length > 0) {
        const found = positions.get(current);

        if (found !== undefined) {
            return found;
        }

        current = current.slice(0, Math.max(current.lastIndexOf('.'), 0));
    }

    return START;
}

class RuleWalk {
    readonly diagnostics: Diagnostic[] = [];

    private readonly positions: PositionLookup;

    constructor(positions: PositionLookup) {
        this.positions = positions;
    }

    report(code: string, message: string, key: string): void {
        this.diagnostics.push(manifestError(code, message, positionAt(this.positions, key)));
    }

    fields(fields: readonly ManifestField[], source: ManifestObject | null, path: string, key: string): ManifestObject {
        const result: ManifestObject = {};

        for (const field of fields) {
            const raw = source?.[field.name];
            const nextPath = path.length === 0 ? field.name : `${path}.${field.name}`;
            const nextKey = key.length === 0 ? field.name : `${key}.${field.name}`;
            const value = this.value(field, raw, nextPath, nextKey);

            if (value !== undefined) {
                result[field.name] = value;
            }
        }

        return result;
    }

    private value(field: ManifestField, raw: ManifestValue | undefined, path: string, key: string): ManifestValue | undefined {
        if (field.members !== null) {
            if (raw === undefined || raw === null) {
                return field.defaultValue === null ? undefined : this.fields(field.members, null, path, key);
            }

            return this.fields(field.members, isManifestObject(raw) ? raw : null, path, key);
        }

        if (raw === undefined || raw === null) {
            return field.defaultValue === null ? undefined : structuredClone(field.defaultValue);
        }

        if (Array.isArray(raw)) {
            return this.list(field, raw, path, key);
        }

        return this.scalar(field, raw, path, key);
    }

    private list(field: ManifestField, raw: ManifestValue[], path: string, key: string): ManifestValue[] {
        if (raw.length === 0) {
            this.report(INVALID_TYPE, `"${path}" must be a non-empty list but received an empty list.`, key);
        }

        return raw.map((entry, index) => this.scalar(field, entry, path, `${key}.${index}`));
    }

    private scalar(field: ManifestField, raw: ManifestValue, path: string, key: string): ManifestValue {
        if (typeof raw === 'number' && field.rule === 'positive-integer' && (!Number.isInteger(raw) || raw <= 0)) {
            this.report(INVALID_TYPE, `"${path}" must be a positive integer but received ${raw}.`, key);
        }

        return typeof raw === 'string' ? this.text(field, raw, path, key) : raw;
    }

    private text(field: ManifestField, raw: string, path: string, key: string): string {
        const value = raw.trim();

        if (value.length === 0) {
            this.report(INVALID_TYPE, `"${path}" must be a non-empty string but received an empty string.`, key);

            return value;
        }

        if (field.rule === 'resource-name' && !isValidResourceName(value)) {
            this.report(INVALID_NAME, `"${path}" must be a valid MTA resource name but received "${value}".`, key);
        }

        if (field.rule !== 'contained-path') {
            return value;
        }

        if (!isContainedPath(value)) {
            this.report(ESCAPING_PATH, `"${path}" must stay inside the project directory but received "${value}".`, key);
        }

        return normalizePath(value);
    }
}

export interface NormalizedManifest {
    value: ManifestObject;
    diagnostics: Diagnostic[];
}

export function normalizeManifest(value: ManifestObject, positions: PositionLookup): NormalizedManifest {
    const walk = new RuleWalk(positions);

    return { value: walk.fields(MANIFEST_FIELDS, value, '', ''), diagnostics: walk.diagnostics };
}
