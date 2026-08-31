import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { listProjectFiles } from '@cli/build/project-files';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { Environment } from '@compiler/environment/environment';
import {
    installCommand,
    libraryFilePath,
    missingRequirements,
    readLibraryDeclaration,
    INVALID_LIBRARY,
    MISSING_LIBRARY,
    type LibraryDeclaration,
    type LibraryFile,
    type LibraryOrigin,
} from '@compiler/project/library';
import type { ProjectFile } from '@compiler/project/module';
import { matchesPattern, watchRoots } from '@compiler/project/path-pattern';
import { isTestPath, SOURCE_EXTENSION } from '@compiler/project/source-kind';

export interface ResolvedLibrary {
    declaration: LibraryDeclaration;
    root: string;
}

export interface ResolvedLibraries {
    libraries: ResolvedLibrary[];
    files: ProjectFile[];
    verbatim: LibraryFile[];
    diagnostics: CliDiagnostic[];
}

interface MatchedFile {
    relativePath: string;
    environment: Environment;
    order: number;
}

const LUA_EXTENSION = '.lua';

const PACKAGE_MANIFEST = 'package.json';

const MODULES_DIRECTORY = 'node_modules';

function packageRoot(root: string, name: string): string {
    return resolve(root, MODULES_DIRECTORY, ...name.split('/'));
}

function readPackageManifest(path: string): unknown {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return null;
    }
}

const SIDE_ORDER: readonly Environment[] = ['shared', 'server', 'client'];

function orderedPatterns(declaration: LibraryDeclaration): { environment: Environment; pattern: string }[] {
    return SIDE_ORDER.flatMap((environment) => declaration.sources[environment].map((pattern) => ({ environment, pattern })));
}

function matchFile(path: string, patterns: readonly { environment: Environment; pattern: string }[]): MatchedFile | null {
    const order = patterns.findIndex((entry) => matchesPattern(entry.pattern, path));
    const matched = patterns[order];

    if (matched === undefined) {
        return null;
    }

    return { relativePath: path, environment: matched.environment, order };
}

function matchedFiles(root: string, declaration: LibraryDeclaration, diagnostics: CliDiagnostic[]): MatchedFile[] {
    const patterns = orderedPatterns(declaration);
    const roots = [...new Set(patterns.map((entry) => entry.pattern))];
    const tree = listProjectFiles(root, watchRoots(roots));
    const matched: MatchedFile[] = [];

    for (const path of tree.files) {
        if (isTestPath(path) || (!path.endsWith(SOURCE_EXTENSION) && !path.endsWith(LUA_EXTENSION))) {
            continue;
        }

        const found = matchFile(path, patterns);

        if (found !== null) {
            matched.push(found);
        }
    }

    for (const message of tree.errors) {
        diagnostics.push(cliError(INVALID_LIBRARY, `"${declaration.name}" could not be read: ${message}`));
    }

    return matched.sort((left, right) => left.order - right.order || left.relativePath.localeCompare(right.relativePath));
}

function readLibraryFile(root: string, relativePath: string, name: string, diagnostics: CliDiagnostic[]): string | null {
    try {
        return readFileSync(resolve(root, relativePath), 'utf8');
    } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : String(error);

        diagnostics.push(cliError(INVALID_LIBRARY, `"${libraryFilePath(name, relativePath)}" could not be read: ${reason}`));

        return null;
    }
}

function collectFiles(root: string, declaration: LibraryDeclaration, packageIndex: number, resolved: ResolvedLibraries): void {
    const matched = matchedFiles(root, declaration, resolved.diagnostics);

    for (const [index, entry] of matched.entries()) {
        const content = readLibraryFile(root, entry.relativePath, declaration.name, resolved.diagnostics);

        if (content === null) {
            continue;
        }

        const origin: LibraryOrigin = { package: declaration.name, root, relativePath: entry.relativePath, packageIndex, index };

        if (entry.relativePath.endsWith(LUA_EXTENSION)) {
            resolved.verbatim.push({ origin, environment: entry.environment, content });

            continue;
        }

        resolved.files.push({ path: libraryFilePath(declaration.name, entry.relativePath), source: content, environment: entry.environment, origin });
    }
}

function resolveLibrary(root: string, name: string, packageIndex: number, resolved: ResolvedLibraries): void {
    const directory = packageRoot(root, name);
    const manifestPath = resolve(directory, PACKAGE_MANIFEST);

    if (!existsSync(manifestPath)) {
        const subject = `"${name}" is listed in "libraries" but is not installed`;

        resolved.diagnostics.push(cliError(MISSING_LIBRARY, `${subject}. Install it with "${installCommand(name)}" and build again.`));

        return;
    }

    const declaration = readLibraryDeclaration(name, readPackageManifest(manifestPath));

    for (const problem of declaration.problems) {
        resolved.diagnostics.push(cliError(problem.code, problem.message));
    }

    if (declaration.declaration === null) {
        return;
    }

    resolved.libraries.push({ declaration: declaration.declaration, root: directory });
    collectFiles(directory, declaration.declaration, packageIndex, resolved);
}

export function resolveLibraries(root: string, names: readonly string[]): ResolvedLibraries {
    const resolved: ResolvedLibraries = { libraries: [], files: [], verbatim: [], diagnostics: [] };
    const seen = new Set<string>();

    for (const name of names) {
        if (seen.has(name)) {
            continue;
        }

        seen.add(name);
        resolveLibrary(root, name, seen.size - 1, resolved);
    }

    for (const problem of missingRequirements(resolved.libraries.map((library) => library.declaration))) {
        resolved.diagnostics.push(cliError(problem.code, problem.message));
    }

    return resolved;
}
