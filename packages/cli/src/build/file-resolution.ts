import { statSync } from 'node:fs';
import { resolve } from 'node:path';

import { listProjectFiles } from '@cli/build/project-files';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { FileEntry } from '@compiler/manifest/manifest-contract';
import { isLiteralPattern, matchesPattern, normalizePattern, patternRoot } from '@compiler/project/path-pattern';
import { ENVIRONMENT_FILE, LIBRARIES_DIRECTORY, LIBRARY_DIRECTORY, type ResourceAsset } from '@compiler/project/resource';
import type { ManifestFile } from '@compiler/project/manifest';

export interface ResolvedFiles {
    assets: ResourceAsset[];
    elements: ManifestFile[];
    diagnostics: CliDiagnostic[];
}

const EMPTY_FILE_ENTRY = 'config-empty-file-entry';

const MISSING_FILE = 'config-missing-file';

const OUTPUT_COLLISION = 'config-output-collision';

const ENVIRONMENT_FILE_ENTRY = 'config-environment-file-entry';

const MANIFEST_OUTPUT = 'meta.xml';

function isDirectory(root: string, path: string): boolean {
    try {
        return statSync(resolve(root, path)).isDirectory();
    } catch {
        return false;
    }
}

function exists(root: string, path: string): boolean {
    try {
        statSync(resolve(root, path));

        return true;
    } catch {
        return false;
    }
}

function reservedOutput(destination: string): string | null {
    if (destination === MANIFEST_OUTPUT) {
        return 'the generated "meta.xml"';
    }

    for (const directory of [LIBRARY_DIRECTORY, LIBRARIES_DIRECTORY]) {
        if (destination === directory || destination.startsWith(`${directory}/`)) {
            return `the generated "${directory}" directory`;
        }
    }

    return null;
}

function entryText(entry: FileEntry, index: number): string {
    return `"files[${index + 1}]" (${JSON.stringify(entry.path)})`;
}

function emptyMessage(root: string, entry: FileEntry, index: number, base: string): string {
    if (base.length > 0 && !isDirectory(root, base)) {
        return `${entryText(entry, index)} names no file: "${base}" is not a directory in "${normalizePattern(root)}".`;
    }

    const where = base.length === 0 ? `"${normalizePattern(root)}"` : `"${base}"`;

    return `${entryText(entry, index)} matched no file under ${where}. Remove the entry or correct the pattern.`;
}

function collect(root: string, entry: FileEntry, index: number, excluded: readonly string[], diagnostics: CliDiagnostic[]): ResourceAsset[] {
    const from = normalizePattern(entry.path);

    if (isLiteralPattern(from) && !isDirectory(root, from)) {
        if (!exists(root, from)) {
            diagnostics.push(cliError(MISSING_FILE, `${entryText(entry, index)} does not exist in "${normalizePattern(root)}".`));

            return [];
        }

        return [{ path: from, source: from, isDownloaded: true }];
    }

    const base = isLiteralPattern(from) ? from : patternRoot(from);
    const pattern = isLiteralPattern(from) ? `${from}/**/*` : from;
    const tree = listProjectFiles(root, [base], excluded);

    for (const message of tree.errors) {
        diagnostics.push(cliError(MISSING_FILE, message));
    }

    const matched = tree.files.filter((path) => matchesPattern(pattern, path));

    if (matched.length === 0 && tree.errors.length === 0) {
        diagnostics.push(cliError(EMPTY_FILE_ENTRY, emptyMessage(root, entry, index, base)));
    }

    return matched.map((path) => ({ path, source: path, isDownloaded: true }));
}

function reject(assets: readonly ResourceAsset[], diagnostics: CliDiagnostic[]): ResourceAsset[] {
    const seen = new Map<string, string>();
    const accepted: ResourceAsset[] = [];

    for (const asset of assets) {
        const reserved = reservedOutput(asset.path);
        const previous = seen.get(asset.path);

        if (reserved !== null) {
            diagnostics.push(cliError(OUTPUT_COLLISION, `"${asset.source}" would be written to "${asset.path}", which is reserved for ${reserved}.`));
        } else if (previous !== undefined) {
            diagnostics.push(cliError(OUTPUT_COLLISION, `"${asset.source}" is claimed by two "files" entries. Keep one entry, or narrow the patterns so each file has one.`));
        } else {
            seen.set(asset.path, asset.source);
            accepted.push(asset);
        }
    }

    return accepted;
}

function checkEnvironmentFile(entries: readonly FileEntry[], assets: readonly ResourceAsset[], diagnostics: CliDiagnostic[]): void {
    if (!assets.some((asset) => asset.path === ENVIRONMENT_FILE)) {
        return;
    }

    const [index] = entries.flatMap((entry, position) => (matchesPattern(normalizePattern(entry.path), ENVIRONMENT_FILE) ? [position] : []));

    diagnostics.push(
        cliError(
            ENVIRONMENT_FILE_ENTRY,
            `${entryText(entries[index ?? 0] ?? { path: ENVIRONMENT_FILE, group: false }, index ?? 0)} reaches "${ENVIRONMENT_FILE}", and a client that can download the environment file is a resource that leaks its secrets. Narrow the pattern.`,
        ),
    );
}

export function resolveFiles(root: string, entries: readonly FileEntry[], excluded: readonly string[] = []): ResolvedFiles {
    const diagnostics: CliDiagnostic[] = [];
    const collected = entries.flatMap((entry, index) => collect(root, entry, index, excluded, diagnostics));
    const assets = reject(collected, diagnostics);

    checkEnvironmentFile(entries, assets, diagnostics);

    return {
        assets: assets.sort((left, right) => left.path.localeCompare(right.path)),
        elements: entries.map((entry) => ({ src: normalizePattern(entry.path), group: entry.group })),
        diagnostics,
    };
}
