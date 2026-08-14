import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

import { EMPTY_PROJECT_DECLARATIONS, projectDeclarations, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { parseEnvFile } from '@compiler/project/env-file';

import { pathKey } from '@lsp/workspace/document-uri';

const ENVIRONMENT_FILE = '.env';

function readEnvironment(root: string): string | null {
    const path = resolve(root, ENVIRONMENT_FILE);

    try {
        return existsSync(path) ? readFileSync(path, 'utf8') : null;
    } catch {
        return null;
    }
}

export function isEnvironmentPath(path: string): boolean {
    return basename(path) === ENVIRONMENT_FILE;
}

const sources = new Map<string, string | null>();

export function forgetEnvironments(): void {
    sources.clear();
}

function withinRoots(directory: string, roots: readonly string[]): boolean {
    if (roots.length === 0) {
        return true;
    }

    const key = pathKey(directory);

    return roots.some((root) => {
        const rootKey = pathKey(root);

        return key === rootKey || key.startsWith(`${rootKey}/`);
    });
}

function nearestEnvironment(path: string, roots: readonly string[]): string | null {
    let current = dirname(path);

    while (withinRoots(current, roots)) {
        const cached = sources.get(current);
        const source = cached === undefined ? readEnvironment(current) : cached;

        sources.set(current, source);

        if (source !== null) {
            return source;
        }

        const parent = dirname(current);

        if (parent === current) {
            return null;
        }

        current = parent;
    }

    return null;
}

export function documentDeclarations(path: string, roots: readonly string[]): ProjectDeclarations {
    const source = nearestEnvironment(path, roots);

    return source === null ? loadProjectDeclarations(roots) : projectDeclarations(parseEnvFile(source).entries, ENVIRONMENT_FILE);
}

export function documentEnvironment(path: string, roots: readonly string[]): Record<string, string> {
    const source = nearestEnvironment(path, roots);

    if (source === null) {
        return loadProjectEnvironment(roots);
    }

    return Object.fromEntries(parseEnvFile(source).entries.map((entry) => [entry.key, entry.value]));
}

export function loadProjectDeclarations(roots: readonly string[]): ProjectDeclarations {
    for (const root of roots) {
        const source = readEnvironment(root);

        if (source !== null) {
            return projectDeclarations(parseEnvFile(source).entries, ENVIRONMENT_FILE);
        }
    }

    return EMPTY_PROJECT_DECLARATIONS;
}

export function loadProjectEnvironment(roots: readonly string[]): Record<string, string> {
    for (const root of roots) {
        const source = readEnvironment(root);

        if (source !== null) {
            return Object.fromEntries(parseEnvFile(source).entries.map((entry) => [entry.key, entry.value]));
        }
    }

    return {};
}
