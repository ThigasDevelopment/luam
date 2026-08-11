import type { Diagnostic, SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { RuntimeHelper } from '@compiler/emitter/state';
import type { SourceLineMapping } from '@compiler/emitter/source-map';
import type { Environment } from '@compiler/environment/environment';

import type { ManifestContribution } from './manifest';

export interface ProjectFile {
    path: string;
    source: string;
}

export interface CompiledModule {
    path: string;
    environment: Environment;
    isDeclaration: boolean;
    code: string | null;
    requiredHelpers: RuntimeHelper[];
    declaredGlobals: ReadonlyMap<string, SourcePosition>;
    externalReferences: ReadonlyMap<string, SourcePosition>;
    contributions: ManifestContribution[];
    diagnostics: Diagnostic[];
    lines: SourceLineMapping[];
    topLevelReturn: SourcePosition | null;
}

export interface FileDiagnostic {
    path: string;
    diagnostic: Diagnostic;
}

export interface ProjectStats {
    files: number;
    declarationsReused: number;
    modulesReused: number;
}

export interface ProjectResult {
    modules: CompiledModule[];
    diagnostics: FileDiagnostic[];
    hasErrors: boolean;
    stats: ProjectStats;
}

export function sortFileDiagnostics(diagnostics: readonly FileDiagnostic[]): FileDiagnostic[] {
    return [...diagnostics].sort((left, right) => {
        if (left.path !== right.path) {
            return left.path < right.path ? -1 : 1;
        }

        return left.diagnostic.position.offset - right.diagnostic.position.offset;
    });
}
