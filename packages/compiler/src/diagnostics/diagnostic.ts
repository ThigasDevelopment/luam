export type DiagnosticStage = 'lexer' | 'parser' | 'checker' | 'emitter' | 'project' | 'manifest';

export type DiagnosticSeverity = 'error' | 'warning';

export interface SourcePosition {
    line: number;
    column: number;
    offset: number;
}

export interface Diagnostic {
    stage: DiagnosticStage;
    severity: DiagnosticSeverity;
    code: string;
    message: string;
    position: SourcePosition;
    end: SourcePosition | null;
}

export function createPosition(line: number, column: number, offset: number): SourcePosition {
    return { line, column, offset };
}

export function createDiagnostic(
    stage: DiagnosticStage,
    code: string,
    message: string,
    position: SourcePosition,
    severity: DiagnosticSeverity = 'error',
    end: SourcePosition | null = null,
): Diagnostic {
    return { stage, severity, code, message, position, end };
}

export function formatDiagnostic(diagnostic: Diagnostic): string {
    const { severity, code, position, message } = diagnostic;

    return `${severity} ${code} (${position.line}:${position.column}): ${message}`;
}

export function hasErrors(diagnostics: readonly Diagnostic[]): boolean {
    return diagnostics.some((diagnostic) => diagnostic.severity === 'error');
}

export function sortDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[] {
    return [...diagnostics].sort((left, right) => left.position.offset - right.position.offset);
}
