import { statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { listProjectFiles } from '@cli/build/project-files';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';

import type { LuamConfig } from '@cli/config/config-schema';
import { normalizePattern } from '@compiler/project/path-pattern';
import { MANIFEST_FILE_NAME } from '@compiler/manifest/manifest-defaults';
import { isDeclarationPath, isSourcePath } from '@compiler/project/source-kind';
import { createScriptResolver } from '@compiler/project/source-mapping';

export interface FormatSelection {
    files: string[];
    diagnostics: CliDiagnostic[];
}

const UNREADABLE_PATH = 'format-path-unreadable';

export function isManifestFile(path: string): boolean {
    return normalizePattern(path).split('/').pop() === MANIFEST_FILE_NAME;
}

function isFormattable(path: string): boolean {
    return isSourcePath(path) || isManifestFile(path);
}

function entryKind(absolute: string): 'file' | 'directory' | null {
    try {
        const stats = statSync(absolute);

        return stats.isDirectory() ? 'directory' : 'file';
    } catch {
        return null;
    }
}

function sorted(files: readonly string[]): string[] {
    return [...new Set(files)].sort((left, right) => left.localeCompare(right));
}

export function selectProjectFiles(root: string, config: LuamConfig): FormatSelection {
    const resolver = createScriptResolver(config.scripts);
    const tree = listProjectFiles(root, ['.'], [config.outDir]);
    const files = tree.files.filter((path) => isManifestFile(path) || (isSourcePath(path) && (isDeclarationPath(path) || resolver.resolve(path).matches.length > 0)));

    return { files: sorted(files), diagnostics: tree.errors.map((message) => cliError(UNREADABLE_PATH, message)) };
}

export function selectPathFiles(root: string, paths: readonly string[]): FormatSelection {
    const files: string[] = [];
    const diagnostics: CliDiagnostic[] = [];

    for (const entry of paths) {
        const absolute = resolve(root, entry);
        const path = normalizePattern(relative(root, absolute));
        const kind = path.startsWith('..') ? null : entryKind(absolute);

        if (kind === null) {
            diagnostics.push(cliError(UNREADABLE_PATH, `"${normalizePattern(entry)}" does not exist in "${normalizePattern(root)}".`));

            continue;
        }

        if (kind === 'file') {
            if (isFormattable(path)) {
                files.push(path);
            } else {
                diagnostics.push(cliError(UNREADABLE_PATH, `"${path}" is neither a Luam source file nor a "${MANIFEST_FILE_NAME}".`));
            }

            continue;
        }

        const tree = listProjectFiles(root, [path]);

        files.push(...tree.files.filter(isFormattable));
        diagnostics.push(...tree.errors.map((message) => cliError(UNREADABLE_PATH, message)));
    }

    return { files: sorted(files), diagnostics };
}
