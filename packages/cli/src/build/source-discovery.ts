import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { listProjectFiles, listRootFiles } from '@cli/build/project-files';
import { cliError, cliWarning, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { ScriptEntry } from '@compiler/manifest/manifest-contract';
import type { ProjectFile } from '@compiler/project/module';
import { isLiteralPattern, normalizePattern, patternRoot } from '@compiler/project/path-pattern';
import { LIBRARIES_DIRECTORY, LIBRARY_DIRECTORY, type ResourceScript } from '@compiler/project/resource';
import { createScriptResolver, describeMatches, type ScriptResolver } from '@compiler/project/source-mapping';
import { isTestPath, SOURCE_EXTENSION, TEST_EXTENSION } from '@compiler/project/source-kind';

export interface DiscoveredSources {
    files: ProjectFile[];
    natives: ResourceScript[];
    resolver: ScriptResolver;
    order: ReadonlyMap<string, number>;
    diagnostics: CliDiagnostic[];
}

const MISSING_SCRIPT = 'config-missing-script';

const EMPTY_SCRIPT_ENTRY = 'config-empty-script-entry';

const NO_SCRIPTS = 'config-no-scripts';

const SIDE_CONFLICT = 'config-script-side-conflict';

const RESERVED_SCRIPT = 'config-reserved-script-path';

const TEST_SOURCE = 'config-test-source';

const UNMATCHED_SOURCE = 'config-unmatched-source';

const UNREADABLE_SOURCE = 'build-source-unreadable';

const NATIVE_EXTENSION = '.lua';

const NAMED_LIMIT = 5;

const RESERVED_ROOTS: readonly string[] = [LIBRARY_DIRECTORY, LIBRARIES_DIRECTORY];

const REMEDIES = [
    'Add an entry to "scripts", move the file under a path "scripts" already names,',
    'or put it in the project root, where a file no entry names is built with the side its "#!" directive declares.',
].join(' ');

function entryText(entry: ScriptEntry, index: number): string {
    return `"scripts[${index + 1}]" (${JSON.stringify(entry.path)} as "${entry.type}")`;
}

function isReserved(path: string): boolean {
    return RESERVED_ROOTS.some((root) => path === root || path.startsWith(`${root}/`));
}

function isDirectory(root: string, path: string): boolean {
    try {
        return statSync(resolve(root, path)).isDirectory();
    } catch {
        return false;
    }
}

function checkEntries(root: string, entries: readonly ScriptEntry[], matched: ReadonlyMap<number, number>, diagnostics: CliDiagnostic[]): void {
    for (const [index, entry] of entries.entries()) {
        const path = normalizePattern(entry.path);

        if (isReserved(path)) {
            diagnostics.push(
                cliError(
                    RESERVED_SCRIPT,
                    `${entryText(entry, index)} names "${path}", which the build generates: "${LIBRARY_DIRECTORY}" holds the runtime helpers and "${LIBRARIES_DIRECTORY}" holds the vendored libraries. Remove the entry; both are emitted before every authored one.`,
                ),
            );

            continue;
        }

        if (isLiteralPattern(path) && isTestPath(path)) {
            diagnostics.push(
                cliError(TEST_SOURCE, `${entryText(entry, index)} names a "${TEST_EXTENSION}" file, which "luam test" runs and the build never writes into the resource.`),
            );

            continue;
        }

        if ((matched.get(index) ?? 0) > 0) {
            continue;
        }

        if (isLiteralPattern(path)) {
            diagnostics.push(cliError(MISSING_SCRIPT, `${entryText(entry, index)} does not exist in "${normalizePattern(root)}".`));

            continue;
        }

        const base = patternRoot(path);

        if (base.length === 0 || isDirectory(root, base)) {
            diagnostics.push(
                cliWarning(EMPTY_SCRIPT_ENTRY, `${entryText(entry, index)} matched no file under "${base.length === 0 ? normalizePattern(root) : base}". Remove the entry or correct the pattern.`),
            );
        }
    }
}

function collectRootSources(root: string, resolver: ScriptResolver, excluded: readonly string[], files: ProjectFile[], diagnostics: CliDiagnostic[]): void {
    for (const path of listRootFiles(root, excluded)) {
        if (!path.endsWith(SOURCE_EXTENSION) || isTestPath(path) || resolver.resolve(path).matches.length > 0) {
            continue;
        }

        const source = readSource(root, path, diagnostics);

        if (source !== null) {
            files.push({ path, source });
        }
    }
}

function describePaths(paths: readonly string[]): string {
    const named = paths
        .slice(0, NAMED_LIMIT)
        .map((path) => `"${path}"`)
        .join(', ');
    const rest = paths.length - NAMED_LIMIT;

    return rest > 0 ? `${named} and ${rest} more` : named;
}

function reportNothingBuilt(root: string, excluded: readonly string[]): CliDiagnostic {
    const paths = listProjectFiles(root, [''], excluded).files.filter((path) => path.endsWith(SOURCE_EXTENSION) && !isTestPath(path));

    if (paths.length === 0) {
        return cliError(NO_SCRIPTS, `No "${SOURCE_EXTENSION}" source files matched "scripts" in "${normalizePattern(root)}".`);
    }

    return cliError(UNMATCHED_SOURCE, `No "scripts" entry matched ${describePaths(paths)} in "${normalizePattern(root)}". ${REMEDIES}`);
}

function readSource(root: string, path: string, diagnostics: CliDiagnostic[]): string | null {
    try {
        return readFileSync(resolve(root, path), 'utf8');
    } catch (error: unknown) {
        diagnostics.push(cliError(UNREADABLE_SOURCE, `The source file "${path}" could not be read: ${error instanceof Error ? error.message : String(error)}`));

        return null;
    }
}

export function discoverSources(root: string, scripts: readonly ScriptEntry[], excluded: readonly string[] = []): DiscoveredSources {
    const resolver = createScriptResolver(scripts);
    const tree = listProjectFiles(root, resolver.roots, excluded);
    const diagnostics = tree.errors.map((message) => cliError(UNREADABLE_SOURCE, message));
    const files: ProjectFile[] = [];
    const natives: ResourceScript[] = [];
    const order = new Map<string, number>();
    const matched = new Map<number, number>();

    for (const path of tree.files) {
        const buildable = path.endsWith(SOURCE_EXTENSION) || path.endsWith(NATIVE_EXTENSION);

        if (!buildable || isTestPath(path)) {
            continue;
        }

        const resolution = resolver.resolve(path);
        const [first] = resolution.matches;

        if (first === undefined) {
            continue;
        }

        for (const match of resolution.matches) {
            matched.set(match.index, (matched.get(match.index) ?? 0) + 1);
        }

        if (resolution.environment === null) {
            diagnostics.push(
                cliError(SIDE_CONFLICT, `"${path}" is matched by more than one "scripts" entry: ${describeMatches(resolution.matches)}. Every file belongs to one entry.`),
            );

            continue;
        }

        const source = readSource(root, path, diagnostics);

        if (source === null) {
            continue;
        }

        order.set(path, first.index);

        if (path.endsWith(NATIVE_EXTENSION)) {
            natives.push({ path, source: path, environment: resolution.environment, content: source, lines: [] });

            continue;
        }

        files.push({ path, source, environment: resolution.environment });
    }

    collectRootSources(root, resolver, excluded, files, diagnostics);
    checkEntries(root, scripts, matched, diagnostics);

    if (files.length === 0 && natives.length === 0 && diagnostics.length === 0) {
        diagnostics.push(reportNothingBuilt(root, excluded));
    }

    return { files: files.sort((left, right) => left.path.localeCompare(right.path)), natives, resolver, order, diagnostics };
}
