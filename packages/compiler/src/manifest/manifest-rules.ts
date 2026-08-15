import { createPosition, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { isLiteralPattern, normalizePattern, patternProblem, patternProblemText } from '@compiler/project/path-pattern';

import {
    ESCAPING_PATH,
    INVALID_DEPENDENCY,
    INVALID_ENGINE_VERSION,
    INVALID_NAME,
    INVALID_PATTERN,
    INVALID_TYPE,
    manifestError,
} from './manifest-diagnostics';
import { LATEST_ENGINE_VERSION } from './manifest-defaults';
import type { ManifestField } from './manifest-field';
import { MANIFEST_FIELDS } from './manifest-fields';
import { isManifestObject, type ManifestObject, type ManifestValue } from './manifest-value';

export type PositionLookup = ReadonlyMap<string, SourcePosition>;

const START = createPosition(1, 1, 0);

const RESOURCE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const ENGINE_VERSION = /^[0-9]+(?:\.[0-9]+)*(?:-[0-9A-Za-z.]+)?$/;

export function isValidResourceName(name: string): boolean {
    return RESOURCE_NAME.test(name);
}

export function isContainedPath(value: string): boolean {
    const normalized = value.replace(/\\/g, '/');

    return !normalized.startsWith('/') && !/^[A-Za-z]:/.test(normalized) && !normalized.split('/').includes('..');
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

        for (const entry of fields) {
            const raw = source?.[entry.name];
            const nextPath = path.length === 0 ? entry.name : `${path}.${entry.name}`;
            const nextKey = key.length === 0 ? entry.name : `${key}.${entry.name}`;
            const value = this.value(entry, raw, nextPath, nextKey);

            if (value !== undefined) {
                result[entry.name] = value;
            }
        }

        return result;
    }

    private value(entry: ManifestField, raw: ManifestValue | undefined, path: string, key: string): ManifestValue | undefined {
        if (entry.members !== null) {
            if (raw === undefined || raw === null) {
                return entry.defaultValue === null ? undefined : this.fields(entry.members, null, path, key);
            }

            return this.fields(entry.members, isManifestObject(raw) ? raw : null, path, key);
        }

        if (raw === undefined || raw === null) {
            return entry.defaultValue === null ? undefined : structuredClone(entry.defaultValue);
        }

        if (Array.isArray(raw)) {
            return this.list(entry, raw, path, key);
        }

        return this.scalar(entry, raw, path, key);
    }

    private list(entry: ManifestField, raw: ManifestValue[], path: string, key: string): ManifestValue[] {
        if (raw.length === 0 && !entry.allowEmpty) {
            this.report(INVALID_TYPE, `"${path}" must be a non-empty list but received an empty list.`, key);
        }

        if (entry.elements !== null) {
            const members = entry.elements;

            return raw.map((element, index) => this.fields(members, isManifestObject(element) ? element : null, path, `${key}.${index}`));
        }

        return raw.map((element, index) => this.scalar(entry, element, path, `${key}.${index}`));
    }

    private scalar(entry: ManifestField, raw: ManifestValue, path: string, key: string): ManifestValue {
        if (typeof raw === 'number' && entry.rule === 'positive-integer' && (!Number.isInteger(raw) || raw <= 0)) {
            this.report(INVALID_TYPE, `"${path}" must be a positive integer but received ${raw}.`, key);
        }

        return typeof raw === 'string' ? this.text(entry, raw, path, key) : raw;
    }

    private text(entry: ManifestField, raw: string, path: string, key: string): string {
        const value = raw.trim();

        if (value.length === 0) {
            this.report(INVALID_TYPE, `"${path}" must be a non-empty string but received an empty string.`, key);

            return value;
        }

        this.name(entry, value, path, key);
        this.version(entry, value, path, key);

        return this.path(entry, value, path, key);
    }

    private name(entry: ManifestField, value: string, path: string, key: string): void {
        if (entry.rule === 'resource-name' && !isValidResourceName(value)) {
            this.report(INVALID_NAME, `"${path}" must be a valid MTA resource name but received "${value}".`, key);
        }

        if (entry.rule === 'dependency-name' && !isValidResourceName(value)) {
            this.report(INVALID_DEPENDENCY, `"${path}" must be a valid MTA resource name but received "${value}".`, key);
        }
    }

    private version(entry: ManifestField, value: string, path: string, key: string): void {
        if (entry.rule !== 'engine-version' || value === LATEST_ENGINE_VERSION || ENGINE_VERSION.test(value)) {
            return;
        }

        this.report(INVALID_ENGINE_VERSION, `"${path}" must be a version such as "1.6.0", or "${LATEST_ENGINE_VERSION}", but received "${value}".`, key);
    }

    private path(entry: ManifestField, value: string, path: string, key: string): string {
        if (entry.rule === 'contained-path') {
            if (!isContainedPath(value)) {
                this.report(ESCAPING_PATH, `"${path}" must stay inside the project directory but received "${value}".`, key);
            }

            return normalizePattern(value);
        }

        if (entry.rule !== 'static-path' && entry.rule !== 'source-pattern') {
            return value;
        }

        if (entry.rule === 'static-path' && !isLiteralPattern(value)) {
            this.report(INVALID_PATTERN, `"${path}" must be a plain path but received the pattern "${value}".`, key);

            return normalizePattern(value);
        }

        const problem = patternProblem(value);

        if (problem !== null) {
            const code = problem === 'absolute' || problem === 'traversal' ? ESCAPING_PATH : INVALID_PATTERN;

            this.report(code, `"${path}" ${patternProblemText(problem)}, but received "${value}".`, key);
        }

        return normalizePattern(value);
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
