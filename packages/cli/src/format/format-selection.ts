import { statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { listProjectFiles } from '@cli/build/project-files';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';

import type { LuamConfig } from '@cli/config/config-schema';
import { normalizePattern } from '@compiler/project/path-pattern';
import { isDeclarationPath, isSourcePath } from '@compiler/project/source-kind';
import { createSourceResolver } from '@compiler/project/source-mapping';

export interface FormatSelection {
    files: string[];
    diagnostics: CliDiagnostic[];
}

const UNREADABLE_PATH = 'format-path-unreadable';

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
    const resolver = createSourceResolver(config.sources);
    const tree = listProjectFiles(root, ['.'], [config.outDir]);
    const files = tree.files.filter((path) => isSourcePath(path) && (isDeclarationPath(path) || resolver.resolve(path).matches.length > 0));

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
            if (isSourcePath(path)) {
                files.push(path);
            } else {
                diagnostics.push(cliError(UNREADABLE_PATH, `"${path}" is not a Luam source file.`));
            }

            continue;
        }

        const tree = listProjectFiles(root, [path]);

        files.push(...tree.files.filter(isSourcePath));
        diagnostics.push(...tree.errors.map((message) => cliError(UNREADABLE_PATH, message)));
    }

    return { files: sorted(files), diagnostics };
}
