import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import { hasErrors } from '@compiler/diagnostics/diagnostic';
import { findConfigFile, type ConfigFileSystem } from '@compiler/project/config-file-system';

import { DEFAULT_FORMAT_OPTIONS, type FormatOptions } from './format-options';
import { analyzeFormatterFile, formatterFileError } from './formatter-file';
import { FORMATTER_FILE_NAME } from './formatter-fields';

export type FormatterFileSystem = ConfigFileSystem;

export interface ResolvedFormatOptions {
    path: string | null;
    options: FormatOptions;
    diagnostics: Diagnostic[];
    valid: boolean;
}

export const DEFAULT_FORMATTER_OPTIONS: ResolvedFormatOptions = { path: null, options: DEFAULT_FORMAT_OPTIONS, diagnostics: [], valid: true };

export function findFormatterFile(files: FormatterFileSystem, start: string): string | null {
    return findConfigFile(files, start, FORMATTER_FILE_NAME);
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
