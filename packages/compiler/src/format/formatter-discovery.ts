import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import { hasErrors } from '@compiler/diagnostics/diagnostic';

import { DEFAULT_FORMAT_OPTIONS, type FormatOptions } from './format-options';
import { analyzeFormatterFile, formatterFileError } from './formatter-file';
import { FORMATTER_FILE_NAME } from './formatter-fields';

export interface FormatterFileSystem {
    exists(path: string): boolean;
    read(path: string): string;
    join(directory: string, name: string): string;
    parent(directory: string): string;
}

export interface ResolvedFormatOptions {
    path: string | null;
    options: FormatOptions;
    diagnostics: Diagnostic[];
    valid: boolean;
}

const LIBRARY_DIRECTORY = 'node_modules';

export const DEFAULT_FORMATTER_OPTIONS: ResolvedFormatOptions = { path: null, options: DEFAULT_FORMAT_OPTIONS, diagnostics: [], valid: true };

function insideLibrary(directory: string): boolean {
    return directory.split(/[\\/]/).includes(LIBRARY_DIRECTORY);
}

export function findFormatterFile(files: FormatterFileSystem, start: string): string | null {
    let directory = start;

    for (;;) {
        if (insideLibrary(directory)) {
            return null;
        }

        const candidate = files.join(directory, FORMATTER_FILE_NAME);

        if (files.exists(candidate)) {
            return candidate;
        }

        const parent = files.parent(directory);

        if (parent === directory) {
            return null;
        }

        directory = parent;
    }
}

export function readFormatterFile(files: FormatterFileSystem, path: string, root: string): ResolvedFormatOptions {
    let source: string;

    try {
        source = files.read(path);
    } catch (error: unknown) {
        const message = `"${path}" could not be read: ${error instanceof Error ? error.message : String(error)}`;

        return { path, options: DEFAULT_FORMAT_OPTIONS, diagnostics: [formatterFileError(message)], valid: false };
    }

    const analysis = analyzeFormatterFile(source, root);

    return { path, options: analysis.options, diagnostics: analysis.diagnostics, valid: !hasErrors(analysis.diagnostics) };
}

export function resolveFormatterOptions(files: FormatterFileSystem, start: string): ResolvedFormatOptions {
    const path = findFormatterFile(files, start);

    return path === null ? DEFAULT_FORMATTER_OPTIONS : readFormatterFile(files, path, files.parent(path));
}
