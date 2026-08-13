import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { EMPTY_PROJECT_DECLARATIONS, projectDeclarations, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { parseEnvFile } from '@compiler/project/env-file';

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
