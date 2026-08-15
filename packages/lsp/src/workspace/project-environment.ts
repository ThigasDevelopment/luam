import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import { EMPTY_PROJECT_DECLARATIONS, projectDeclarations, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import type { EnvironmentFiles } from '@compiler/manifest/manifest-defaults';
import { EMPTY_ENV_FILE, mergeEnvFiles, parseEnvFile, type EnvFile } from '@compiler/project/env-file';

const sources = new Map<string, string | null>();

export function forgetEnvironments(): void {
    sources.clear();
}

function readFile(path: string): string | null {
    const cached = sources.get(path);

    if (cached !== undefined) {
        return cached;
    }

    let source: string | null = null;

    try {
        source = existsSync(path) ? readFileSync(path, 'utf8') : null;
    } catch {
        source = null;
    }

    sources.set(path, source);

    return source;
}

function parseAt(root: string, file: string): EnvFile | null {
    const source = readFile(resolve(root, file));

    return source === null ? null : parseEnvFile(source);
}

export function isEnvironmentPath(path: string, environment: EnvironmentFiles): boolean {
    const name = basename(path);

    return name === basename(environment.file) || name === basename(environment.localFile);
}

function firstRoot(roots: readonly string[], environment: EnvironmentFiles): EnvFile | null {
    for (const root of roots) {
        const declared = parseAt(root, environment.file);

        if (declared !== null) {
            return mergeEnvFiles(declared, parseAt(root, environment.localFile) ?? EMPTY_ENV_FILE);
        }
    }

    return null;
}

export function loadProjectDeclarations(roots: readonly string[], environment: EnvironmentFiles): ProjectDeclarations {
    const declared = firstRoot(roots, environment);

    return declared === null ? EMPTY_PROJECT_DECLARATIONS : projectDeclarations(declared.entries, environment.file);
}

export function loadProjectEnvironment(roots: readonly string[], environment: EnvironmentFiles): Record<string, string> {
    const declared = firstRoot(roots, environment);

    return declared === null ? {} : Object.fromEntries(declared.entries.map((entry) => [entry.key, entry.value]));
}
