export type CliSeverity = 'error' | 'warning';

export interface CliDiagnostic {
    severity: CliSeverity;
    code: string;
    message: string;
}

export function cliError(code: string, message: string): CliDiagnostic {
    return { severity: 'error', code, message };
}

export function cliWarning(code: string, message: string): CliDiagnostic {
    return { severity: 'warning', code, message };
}

export function hasCliErrors(diagnostics: readonly CliDiagnostic[]): boolean {
    return diagnostics.some((diagnostic) => diagnostic.severity === 'error');
}

export function formatCliDiagnostic(diagnostic: CliDiagnostic): string {
    return `${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}`;
}
