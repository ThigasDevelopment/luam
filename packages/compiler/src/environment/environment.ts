import { createDiagnostic, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';

export type Environment = 'server' | 'client' | 'shared';

export const DEFAULT_ENVIRONMENT: Environment = 'shared';

export const FILE_START: SourcePosition = { line: 1, column: 1, offset: 0 };

export const ALL_ENVIRONMENTS: readonly Environment[] = ['server', 'client', 'shared'];

const ENVIRONMENTS: ReadonlySet<string> = new Set(ALL_ENVIRONMENTS);

const SOURCE_ROOT = 'src';

export interface EnvironmentResolution {
    environment: Environment;
    fromPath: Environment | null;
    fromMapping: Environment | null;
    fromDirective: Environment | null;
    diagnostics: Diagnostic[];
}

export function isEnvironment(value: string): value is Environment {
    return ENVIRONMENTS.has(value);
}

export function normalizePath(filePath: string): string {
    return filePath.replace(/\\/g, '/');
}

export interface EnvironmentRoot {
    root: string;
    environment: Environment;
}

export function environmentRoot(filePath: string): EnvironmentRoot | null {
    const segments = normalizePath(filePath)
        .split('/')
        .filter((segment) => segment.length > 0);

    for (let index = segments.length - 1; index >= 1; index -= 1) {
        const segment = segments[index];

        if (segments[index - 1] === SOURCE_ROOT && segment !== undefined && isEnvironment(segment)) {
            return { root: segments.slice(0, index + 1).join('/'), environment: segment };
        }
    }

    return null;
}

export function environmentFromPath(filePath: string): Environment | null {
    return environmentRoot(filePath)?.environment ?? null;
}

function collectDirectiveEnvironments(directives: readonly string[]): Environment[] {
    const found: Environment[] = [];

    for (const directive of directives) {
        const value = directive.trim();

        if (isEnvironment(value) && !found.includes(value)) {
            found.push(value);
        }
    }

    return found;
}

function reportConflictingDirectives(found: readonly Environment[], diagnostics: Diagnostic[]): void {
    if (found.length < 2) {
        return;
    }

    const message = `A file declares a single environment but found "${found.join('", "')}". Keep only one "#!" environment directive.`;

    diagnostics.push(createDiagnostic('checker', 'env-conflicting-directive', message, FILE_START));
}

function reportAssignedConflict(assigned: Environment, fromDirective: Environment, mapped: boolean, diagnostics: Diagnostic[]): void {
    if (assigned === fromDirective) {
        return;
    }

    const origin = mapped ? 'The "sources" mapping assigns the' : 'The path resolves to the';
    const message = `${origin} "${assigned}" environment but the directive declares "${fromDirective}". The directive wins.`;

    diagnostics.push(createDiagnostic('checker', 'env-path-directive-conflict', message, FILE_START, 'warning'));
}

export function resolveEnvironment(filePath: string | null, directives: readonly string[], fromMapping: Environment | null = null): EnvironmentResolution {
    const diagnostics: Diagnostic[] = [];
    const fromPath = filePath === null ? null : environmentFromPath(filePath);
    const found = collectDirectiveEnvironments(directives);
    const fromDirective = found[0] ?? null;
    const assigned = fromMapping ?? fromPath;

    reportConflictingDirectives(found, diagnostics);

    if (assigned !== null && fromDirective !== null) {
        reportAssignedConflict(assigned, fromDirective, fromMapping !== null, diagnostics);
    }

    return { environment: fromDirective ?? assigned ?? DEFAULT_ENVIRONMENT, fromPath, fromMapping, fromDirective, diagnostics };
}

export function canReference(consumer: Environment, provider: Environment): boolean {
    return provider === 'shared' || provider === consumer;
}
