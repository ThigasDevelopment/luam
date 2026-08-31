import { VERSION } from '@cli/cli/version';
import { countCliDiagnostics, countFileDiagnostics } from '@cli/reporting/diagnostic-reporter';

import type { BuildOutcome } from '@cli/build/build-runner';
import type { CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { Logger } from '@cli/reporting/logger';
import type { FileDiagnostic } from '@compiler/project/module';

export const REPORT_SCHEMA_VERSION = 1;

export interface JsonDiagnostic {
    path: string | null;
    line: number | null;
    column: number | null;
    endLine: number | null;
    endColumn: number | null;
    severity: 'error' | 'warning';
    code: string;
    message: string;
}

export interface JsonSummary {
    errors: number;
    warnings: number;
    files: number;
    durationMs: number;
}

export interface JsonReport {
    version: number;
    luam: string;
    command: string;
    success: boolean;
    diagnostics: JsonDiagnostic[];
    summary: JsonSummary;
}

function fromCli(diagnostic: CliDiagnostic): JsonDiagnostic {
    return { path: null, line: null, column: null, endLine: null, endColumn: null, ...diagnostic };
}

function fromFile(entry: FileDiagnostic): JsonDiagnostic {
    const { position, end, severity, code, message } = entry.diagnostic;

    return {
        path: entry.path,
        line: position.line,
        column: position.column,
        endLine: end === null ? null : end.line,
        endColumn: end === null ? null : end.column,
        severity,
        code,
        message,
    };
}

export function buildReport(command: string, outcome: BuildOutcome, success: boolean): JsonReport {
    const cli = countCliDiagnostics(outcome.diagnostics);
    const files = countFileDiagnostics(outcome.fileDiagnostics);

    return {
        version: REPORT_SCHEMA_VERSION,
        luam: VERSION,
        command,
        success,
        diagnostics: [...outcome.diagnostics.map(fromCli), ...outcome.fileDiagnostics.map(fromFile)],
        summary: {
            errors: cli.errors + files.errors,
            warnings: cli.warnings + files.warnings,
            files: outcome.fileCount,
            durationMs: Math.round(outcome.durationMs),
        },
    };
}

export function writeReport(logger: Logger, report: JsonReport): void {
    logger.info(JSON.stringify(report));
}
