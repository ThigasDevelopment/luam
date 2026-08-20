export type PlaygroundEnvironment = 'server' | 'client' | 'shared';

export const ENVIRONMENTS: readonly PlaygroundEnvironment[] = ['shared', 'server', 'client'];

export const MAX_SOURCE_LENGTH = 20000;

export const COMPILE_BUDGET_MS = 4000;

export interface CompileRequest {
    id: number;
    source: string;
    environment: PlaygroundEnvironment;
    oop: boolean;
}

export interface PlaygroundDiagnostic {
    severity: string;
    code: string;
    message: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}

export interface CompileResponse {
    id: number;
    code: string | null;
    diagnostics: PlaygroundDiagnostic[];
    helpers: string[];
    environment: PlaygroundEnvironment;
    failure: string | null;
}

export function isCompileResponse(value: unknown): value is CompileResponse {
    return typeof value === 'object' && value !== null && typeof (value as { id?: unknown }).id === 'number';
}
