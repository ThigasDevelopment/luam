import { formatCliDiagnostic, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import { reportGroupedDiagnostics } from '@cli/reporting/diagnostic-layout';
import { pluralize } from '@cli/reporting/plural';
import type { Reporter } from '@cli/reporting/reporter';
import type { FileDiagnostic } from '@compiler/project/module';

export interface DiagnosticCounts {
    errors: number;
    warnings: number;
}

export function formatFileDiagnostic(entry: FileDiagnostic): string {
    const { path, diagnostic } = entry;
    const location = `${path}:${diagnostic.position.line}:${diagnostic.position.column}`;

    return `${location} ${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}`;
}

export function countFileDiagnostics(entries: readonly FileDiagnostic[]): DiagnosticCounts {
    const errors = entries.filter((entry) => entry.diagnostic.severity === 'error').length;

    return { errors, warnings: entries.length - errors };
}

export function countCliDiagnostics(diagnostics: readonly CliDiagnostic[]): DiagnosticCounts {
    const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error').length;

    return { errors, warnings: diagnostics.length - errors };
}

export function reportCliDiagnostics(reporter: Reporter, diagnostics: readonly CliDiagnostic[]): void {
    for (const diagnostic of diagnostics) {
        const line = formatCliDiagnostic(diagnostic);

        if (diagnostic.severity === 'error') {
            reporter.error(line);

            continue;
        }

        reporter.warn(line);
    }
}

function reportPlainFileDiagnostics(reporter: Reporter, entries: readonly FileDiagnostic[]): void {
    for (const entry of entries) {
        const line = formatFileDiagnostic(entry);

        if (entry.diagnostic.severity === 'error') {
            reporter.rawError(line);

            continue;
        }

        reporter.rawWarn(line);
    }
}

export function reportFileDiagnostics(reporter: Reporter, entries: readonly FileDiagnostic[], sources: ReadonlyMap<string, string>): void {
    if (!reporter.capability.interactive) {
        reportPlainFileDiagnostics(reporter, entries);

        return;
    }

    reportGroupedDiagnostics(reporter, entries, { sources });
}

export function formatCounts(counts: DiagnosticCounts): string {
    return `${pluralize(counts.errors, 'error')}, ${pluralize(counts.warnings, 'warning')}`;
}
