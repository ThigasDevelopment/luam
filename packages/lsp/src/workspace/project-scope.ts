import { dirname } from 'node:path';

import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';

import { normalizeFsPath, pathKey } from './document-uri';
import { EMPTY_LIBRARY_INDEX, loadLibraries, type LibraryIndex } from './library-index';
import { loadProjectDeclarations, loadProjectEnvironment } from './project-environment';
import { DEFAULT_PROJECT_SETTINGS, settingsKey, type ProjectSettings } from './project-settings';

export const DEFAULT_PROJECT_KEY = '';

export interface ProjectScope {
    key: string;
    roots: readonly string[];
    settings: ProjectSettings;
    project: ProjectDeclarations;
    env: Readonly<Record<string, string>>;
    libraries: LibraryIndex;
    signature: string;
}

export function projectKeyOf(manifestPath: string): string {
    return pathKey(dirname(normalizeFsPath(manifestPath)));
}

export function scopeSignature(settings: ProjectSettings, roots: readonly string[]): string {
    return `${settingsKey(settings)}|${roots.join(',')}`;
}

export function createProjectScope(key: string, roots: readonly string[], settings: ProjectSettings): ProjectScope {
    const owner = roots[0];
    const libraries = owner === undefined || settings.libraries.length === 0 ? EMPTY_LIBRARY_INDEX : loadLibraries(owner, settings.libraries);

    return {
        key,
        roots,
        settings,
        project: roots.length === 0 ? EMPTY_PROJECT_DECLARATIONS : loadProjectDeclarations(roots, settings.environment),
        env: roots.length === 0 ? {} : loadProjectEnvironment(roots, settings.environment),
        libraries,
        signature: scopeSignature(settings, roots),
    };
}

export function createDefaultProjectScope(roots: readonly string[]): ProjectScope {
    return createProjectScope(DEFAULT_PROJECT_KEY, roots, DEFAULT_PROJECT_SETTINGS);
}

export function scopeOwning(scopes: Iterable<ProjectScope>, path: string, fallback: ProjectScope): ProjectScope {
    const key = pathKey(path);
    let owner: ProjectScope | null = null;

    for (const scope of scopes) {
        if (scope.key === DEFAULT_PROJECT_KEY) {
            continue;
        }

        const inside = key === scope.key || key.startsWith(`${scope.key}/`);

        if (inside && (owner === null || scope.key.length > owner.key.length)) {
            owner = scope;
        }
    }

    return owner ?? fallback;
}
