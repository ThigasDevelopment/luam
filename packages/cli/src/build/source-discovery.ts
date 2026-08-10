import { readdirSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';

import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { ProjectFile } from '@compiler/project/module';

export interface DiscoveredSources {
    files: ProjectFile[];
    diagnostics: CliDiagnostic[];
}

const SOURCE_EXTENSION = '.luam';

const MISSING_DIR = 'build-source-dir-missing';

const UNREADABLE_SOURCE = 'build-source-unreadable';

const NO_SOURCES = 'build-no-sources';

const OUTSIDE_ROOT = 'build-source-dir-outside-root';

function isInsideRoot(root: string, absolute: string): boolean {
    const inside = relative(root, absolute);

    return inside.length > 0 && !inside.startsWith('..') && !isAbsolute(inside);
}

function isDirectory(path: string): boolean {
    try {
        return statSync(path).isDirectory();
    } catch {
        return false;
    }
}

function normalize(path: string): string {
    return path.replace(/\\/g, '/');
}

function collectDirectory(root: string, directory: string, files: ProjectFile[], diagnostics: CliDiagnostic[]): void {
    for (const entry of readdirSync(directory, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith(SOURCE_EXTENSION)) {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);

        try {
            files.push({ path: normalize(relative(root, absolute)), source: readFileSync(absolute, 'utf8') });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);

            diagnostics.push(cliError(UNREADABLE_SOURCE, `The source file "${normalize(relative(root, absolute))}" could not be read: ${message}`));
        }
    }
}

export function discoverSources(root: string, sourceDirs: readonly string[]): DiscoveredSources {
    const files: ProjectFile[] = [];
    const diagnostics: CliDiagnostic[] = [];

    for (const directory of sourceDirs) {
        const absolute = resolve(root, directory);

        if (!isInsideRoot(root, absolute)) {
            diagnostics.push(cliError(OUTSIDE_ROOT, `The source directory "${directory}" resolves outside the project root "${normalize(root)}".`));

            continue;
        }

        if (!isDirectory(absolute)) {
            diagnostics.push(cliError(MISSING_DIR, `The source directory "${directory}" does not exist in "${normalize(root)}".`));

            continue;
        }

        collectDirectory(root, absolute, files, diagnostics);
    }

    if (files.length === 0 && diagnostics.length === 0) {
        const searched = sourceDirs.map((entry) => `"${entry}"`).join(', ');

        diagnostics.push(cliError(NO_SOURCES, `No "${SOURCE_EXTENSION}" source files were found in ${searched}.`));
    }

    return { files: files.sort((left, right) => left.path.localeCompare(right.path)), diagnostics };
}
