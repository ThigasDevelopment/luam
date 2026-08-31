import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { selectPathFiles, selectProjectFiles, type FormatSelection } from '@cli/format/format-selection';
import { NODE_FORMATTER_FILES } from '@cli/format/formatter-file-system';
import { cliError, cliWarning, hasCliErrors, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import { reportCliDiagnostics, reportManifestDiagnostics } from '@cli/reporting/diagnostic-reporter';
import { formatDuration } from '@cli/reporting/duration';
import { pluralize } from '@cli/reporting/plural';
import { createReporter, type Reporter } from '@cli/reporting/reporter';
import { formatSource } from '@compiler/format/format';
import type { FormatOptions } from '@compiler/format/format-options';
import { resolveFormatterOptions } from '@compiler/format/formatter-discovery';

import type { LuamConfig } from '@cli/config/config-schema';
import type { Logger } from '@cli/reporting/logger';

export interface FormatContext {
    root: string;
    config: LuamConfig | null;
    logger: Logger;
    reporter?: Reporter;
}

export interface FormatCommandOptions {
    check: boolean;
    paths: readonly string[];
}

const UNPARSEABLE_SOURCE = 'format-source-unparseable';

const UNREADABLE_SOURCE = 'format-source-unreadable';

const UNWRITABLE_SOURCE = 'format-source-unwritable';

function describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function select(context: FormatContext, options: FormatCommandOptions): FormatSelection {
    if (options.paths.length > 0) {
        return selectPathFiles(context.root, options.paths);
    }

    if (context.config === null) {
        return { files: [], diagnostics: [] };
    }

    return selectProjectFiles(context.root, context.config);
}

function formatFile(context: FormatContext, path: string, check: boolean, style: FormatOptions, diagnostics: CliDiagnostic[]): boolean {
    const absolute = resolve(context.root, path);
    let source: string;

    try {
        source = readFileSync(absolute, 'utf8');
    } catch (error: unknown) {
        diagnostics.push(cliError(UNREADABLE_SOURCE, `The source file "${path}" could not be read: ${describe(error)}`));

        return false;
    }

    const formatted = formatSource(source, style);

    if (formatted === null) {
        diagnostics.push(cliWarning(UNPARSEABLE_SOURCE, `"${path}" could not be parsed and was left unchanged. Run "luam check" to see why.`));

        return false;
    }

    if (formatted === source) {
        return false;
    }

    if (check) {
        return true;
    }

    try {
        writeFileSync(absolute, formatted, 'utf8');
    } catch (error: unknown) {
        diagnostics.push(cliError(UNWRITABLE_SOURCE, `The source file "${path}" could not be written: ${describe(error)}`));

        return false;
    }

    return true;
}

export function runFormatCommand(context: FormatContext, options: FormatCommandOptions): number {
    const reporter = context.reporter ?? createReporter(context.logger);
    const started = Date.now();
    const style = resolveFormatterOptions(NODE_FORMATTER_FILES, context.root);

    if (!style.valid) {
        reportManifestDiagnostics(reporter, style.path ?? '', '', style.diagnostics);
        reporter.error(`The formatter configuration "${style.path ?? ''}" is invalid. Nothing was formatted.`);

        return EXIT_USAGE;
    }

    const selection = select(context, options);
    const diagnostics = [...selection.diagnostics];
    const touched: string[] = [];

    for (const path of selection.files) {
        if (formatFile(context, path, options.check, style.options, diagnostics)) {
            touched.push(path);
        }
    }

    if (options.check) {
        for (const path of touched) {
            reporter.raw(path);
        }
    }

    reportCliDiagnostics(reporter, diagnostics);

    const failed = hasCliErrors(diagnostics) || (options.check && touched.length > 0);
    const label = options.check ? 'differing' : 'reformatted';
    const summary = `${pluralize(selection.files.length, 'file')} scanned, ${touched.length} ${label} in ${formatDuration(Date.now() - started)}.`;

    if (failed) {
        reporter.error(`Format failed: ${summary}`);

        return EXIT_DIAGNOSTICS;
    }

    reporter.success(`Format passed: ${summary}`);

    return EXIT_OK;
}
