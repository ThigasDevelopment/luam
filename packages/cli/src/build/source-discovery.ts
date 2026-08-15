import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { listProjectFiles } from '@cli/build/project-files';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { SourceMapping } from '@compiler/manifest/manifest-contract';
import type { ProjectFile } from '@compiler/project/module';
import { isLiteralPattern, normalizePattern } from '@compiler/project/path-pattern';
import { createSourceResolver, describeMatches, type SourceResolver } from '@compiler/project/source-mapping';
import { SOURCE_EXTENSION } from '@compiler/project/source-kind';

export interface DiscoveredSources {
    files: ProjectFile[];
    resolver: SourceResolver;
    diagnostics: CliDiagnostic[];
}

const MISSING_SOURCE = 'config-missing-source';

const NO_SOURCES = 'config-no-sources';

const SIDE_CONFLICT = 'config-source-side-conflict';

const UNREADABLE_SOURCE = 'build-source-unreadable';

function checkLiterals(root: string, resolver: SourceResolver, found: ReadonlySet<string>, diagnostics: CliDiagnostic[]): void {
    for (const pattern of resolver.patterns.filter(isLiteralPattern)) {
        if (!pattern.endsWith(SOURCE_EXTENSION)) {
            diagnostics.push(cliError(MISSING_SOURCE, `"${pattern}" is listed in "sources" but does not end in "${SOURCE_EXTENSION}".`));

            continue;
        }

        if (!found.has(pattern)) {
            diagnostics.push(cliError(MISSING_SOURCE, `"${pattern}" is listed in "sources" but does not exist in "${normalizePattern(root)}".`));
        }
    }
}

function readSource(root: string, path: string, diagnostics: CliDiagnostic[]): string | null {
    try {
        return readFileSync(resolve(root, path), 'utf8');
    } catch (error: unknown) {
        diagnostics.push(cliError(UNREADABLE_SOURCE, `The source file "${path}" could not be read: ${error instanceof Error ? error.message : String(error)}`));

        return null;
    }
}

export function discoverSources(root: string, sources: SourceMapping, excluded: readonly string[] = []): DiscoveredSources {
    const resolver = createSourceResolver(sources);
    const tree = listProjectFiles(root, resolver.roots, excluded);
    const diagnostics = tree.errors.map((message) => cliError(UNREADABLE_SOURCE, message));
    const files: ProjectFile[] = [];
    const matched = new Set<string>();

    for (const path of tree.files.filter((entry) => entry.endsWith(SOURCE_EXTENSION))) {
        const resolution = resolver.resolve(path);

        if (resolution.matches.length === 0) {
            continue;
        }

        matched.add(path);

        if (resolution.environment === null) {
            diagnostics.push(cliError(SIDE_CONFLICT, `"${path}" is matched by more than one side: ${describeMatches(resolution.matches)}. Narrow the patterns.`));

            continue;
        }

        const source = readSource(root, path, diagnostics);

        if (source !== null) {
            files.push({ path, source, environment: resolution.environment });
        }
    }

    checkLiterals(root, resolver, matched, diagnostics);

    if (files.length === 0 && diagnostics.length === 0) {
        diagnostics.push(cliError(NO_SOURCES, `No "${SOURCE_EXTENSION}" source files matched "sources" in "${normalizePattern(root)}".`));
    }

    return { files: files.sort((left, right) => left.path.localeCompare(right.path)), resolver, diagnostics };
}
