import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Environment } from '@compiler/environment/environment';
import { libraryFilePath, readLibraryDeclaration, type LibraryDeclaration } from '@compiler/project/library';
import { matchesPattern } from '@compiler/project/path-pattern';

import { normalizeFsPath, pathKey } from './document-uri';

export interface LibraryFileInfo {
    relative: string;
    environment: Environment;
}

export interface LibraryIndex {
    roots: string[];
    fileFor(path: string): LibraryFileInfo | null;
    isLibraryPath(path: string): boolean;
}

interface ResolvedLibrary {
    declaration: LibraryDeclaration;
    root: string;
}

const SIDE_ORDER: readonly Environment[] = ['shared', 'server', 'client'];

export const EMPTY_LIBRARY_INDEX: LibraryIndex = { roots: [], fileFor: (): null => null, isLibraryPath: (): boolean => false };

function packageRoot(root: string, name: string): string {
    return normalizeFsPath(resolve(root, 'node_modules', ...name.split('/')));
}

function readDeclaration(root: string, name: string): ResolvedLibrary | null {
    const directory = packageRoot(root, name);
    const manifest = resolve(directory, 'package.json');

    if (!existsSync(manifest)) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(readFileSync(manifest, 'utf8'));
        const declaration = readLibraryDeclaration(name, parsed).declaration;

        return declaration === null ? null : { declaration, root: directory };
    } catch {
        return null;
    }
}

function relativeTo(root: string, path: string): string | null {
    const key = pathKey(path);
    const rootKey = pathKey(root);

    return key.startsWith(`${rootKey}/`) ? normalizeFsPath(path).slice(root.length + 1) : null;
}

function sideOf(declaration: LibraryDeclaration, relativePath: string): Environment | null {
    for (const environment of SIDE_ORDER) {
        if (declaration.sources[environment].some((pattern) => matchesPattern(pattern, relativePath))) {
            return environment;
        }
    }

    return null;
}

export function loadLibraries(root: string, names: readonly string[]): LibraryIndex {
    const resolved = [...new Set(names)].map((name) => readDeclaration(root, name)).filter((entry): entry is ResolvedLibrary => entry !== null);

    if (resolved.length === 0) {
        return EMPTY_LIBRARY_INDEX;
    }

    function fileFor(path: string): LibraryFileInfo | null {
        for (const library of resolved) {
            const relativePath = relativeTo(library.root, path);
            const environment = relativePath === null ? null : sideOf(library.declaration, relativePath);

            if (relativePath !== null && environment !== null) {
                return { relative: libraryFilePath(library.declaration.name, relativePath), environment };
            }
        }

        return null;
    }

    return { roots: resolved.map((library) => library.root), fileFor, isLibraryPath: (path: string): boolean => fileFor(path) !== null };
}
