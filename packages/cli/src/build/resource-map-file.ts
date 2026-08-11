import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, posix, relative, resolve } from 'node:path';

import type { LuamConfig } from '@cli/config/config-schema';
import { RESOURCE_MAP_VERSION, serializeResourceMap, type ResourceMap, type ResourceMapSegment } from '@compiler/project/resource';

import type { Dirent } from 'node:fs';

export const RESOURCE_MAP_SUFFIX = '.luam-map.json';

export type LoadedResourceMap = { map: ResourceMap; error: null } | { map: null; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
    return Number.isInteger(value) && Number(value) > 0;
}

function isLine(value: unknown, previous: number, maximum: number): boolean {
    return (
        isObject(value) &&
        isPositiveInteger(value.generatedLine) &&
        value.generatedLine > previous &&
        value.generatedLine <= maximum &&
        isPositiveInteger(value.sourceLine) &&
        (value.symbol === undefined || typeof value.symbol === 'string')
    );
}

function isSegment(value: unknown, previousEnd: number): value is ResourceMapSegment {
    if (
        !isObject(value) ||
        (value.kind !== 'module' && value.kind !== 'helper') ||
        !isPositiveInteger(value.generatedStartLine) ||
        !isPositiveInteger(value.generatedEndLine) ||
        !isPositiveInteger(value.contentStartLine) ||
        value.generatedStartLine <= previousEnd ||
        value.generatedEndLine < value.generatedStartLine ||
        value.contentStartLine < value.generatedStartLine ||
        value.contentStartLine > value.generatedEndLine ||
        typeof value.source !== 'string' ||
        !Array.isArray(value.lines)
    ) {
        return false;
    }

    const maximum = value.generatedEndLine - value.contentStartLine + 1;
    let previous = 0;

    for (const line of value.lines) {
        if (!isLine(line, previous, maximum)) {
            return false;
        }

        previous = line.generatedLine;
    }

    return true;
}

function areSegments(value: unknown): value is ResourceMapSegment[] {
    if (!Array.isArray(value)) {
        return false;
    }

    let previousEnd = 0;

    for (const segment of value) {
        if (!isSegment(segment, previousEnd)) {
            return false;
        }

        previousEnd = segment.generatedEndLine;
    }

    return true;
}

function normalizedPath(path: string): string {
    return posix.normalize(path.replace(/\\/g, '/')).replace(/^\.\//, '');
}

function hasValidFiles(value: unknown): boolean {
    if (!Array.isArray(value)) {
        return false;
    }

    const paths = new Set<string>();

    for (const file of value) {
        if (!isObject(file) || typeof file.path !== 'string' || !areSegments(file.segments)) {
            return false;
        }

        const path = normalizedPath(file.path);

        if (paths.has(path)) {
            return false;
        }

        paths.add(path);
    }

    return true;
}

function isResourceMap(value: unknown): value is ResourceMap {
    return (
        isObject(value) &&
        value.version === RESOURCE_MAP_VERSION &&
        typeof value.resource === 'string' &&
        (value.layout === 'tree' || value.layout === 'bundle') &&
        (value.minified === undefined || typeof value.minified === 'boolean') &&
        hasValidFiles(value.files)
    );
}

function reason(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export function resourceMapPath(root: string, config: LuamConfig): string {
    return resolve(root, config.outDir, `${config.name}${RESOURCE_MAP_SUFFIX}`);
}

export function explicitResourceMapPath(root: string, path: string): string {
    return isAbsolute(path) ? path : resolve(root, path);
}

export function writeResourceMap(root: string, config: LuamConfig, map: ResourceMap | null): void {
    const path = resourceMapPath(root, config);

    if (map === null) {
        if (existsSync(path)) {
            unlinkSync(path);
        }

        return;
    }

    mkdirSync(dirname(path), { recursive: true });

    const content = serializeResourceMap(map);

    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) {
        writeFileSync(path, content, 'utf8');
    }
}

export function readResourceMap(path: string): LoadedResourceMap {
    try {
        const value: unknown = JSON.parse(readFileSync(path, 'utf8'));

        if (isObject(value) && Number.isInteger(value.version) && value.version !== RESOURCE_MAP_VERSION) {
            return { map: null, error: `Resource map version ${String(value.version)} is not supported.` };
        }

        return isResourceMap(value) ? { map: value, error: null } : { map: null, error: `Resource map "${path}" has an invalid structure.` };
    } catch (error: unknown) {
        return { map: null, error: `Resource map "${path}" could not be read: ${reason(error)}` };
    }
}

const SKIPPED_DIRECTORIES: ReadonlySet<string> = new Set(['node_modules']);

function isSearchable(name: string): boolean {
    return !name.startsWith('.') && !SKIPPED_DIRECTORIES.has(name);
}

function collectResourceMaps(directory: string, found: string[]): void {
    let entries: Dirent[];

    try {
        entries = readdirSync(directory, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        const absolute = join(directory, entry.name);

        if (entry.isDirectory()) {
            if (isSearchable(entry.name)) {
                collectResourceMaps(absolute, found);
            }

            continue;
        }

        if (entry.isFile() && entry.name.endsWith(RESOURCE_MAP_SUFFIX)) {
            found.push(absolute);
        }
    }
}

export function discoverResourceMap(root: string): { path: string | null; candidates: string[] } {
    if (!existsSync(root)) {
        return { path: null, candidates: [] };
    }

    const found: string[] = [];

    collectResourceMaps(root, found);

    const candidates = found.sort((left, right) => left.localeCompare(right));

    return { path: candidates.length === 1 ? candidates[0] ?? null : null, candidates: candidates.map((path) => relative(root, path).replace(/\\/g, '/')) };
}
