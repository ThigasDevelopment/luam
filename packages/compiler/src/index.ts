import { EMPTY_AMBIENT, ownDeclarations, type AmbientDeclarations } from '@compiler/checker/ambient';
import type { SourceDirectives } from '@compiler/checker/build-directives';
import { check } from '@compiler/checker/checker';
import { resolveStrictMode, type StrictMode } from '@compiler/checker/directives';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { hasErrors, sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { resolveEnvironment, type Environment } from '@compiler/environment/environment';
import { emit } from '@compiler/emitter/emitter';
import type { RuntimeHelper, SourceLineMapping } from '@compiler/emitter/state';
import { DEFAULT_COMPILER_OPTIONS, type CompilerOptions } from '@compiler/manifest/manifest-defaults';
import { parse } from '@compiler/parser/parser';
import { isDeclarationPath } from '@compiler/project/source-kind';
import { expandHelpers, helperForGlobal } from '@runtime/helpers';

import type { Statement } from '@compiler/parser/ast';

export interface CompileOptions {
    filePath?: string;
    environment?: Environment;
    ambient?: AmbientDeclarations;
    project?: ProjectDeclarations;
    compilerOptions?: CompilerOptions;
    emitCode?: boolean;
}

export interface CompileResult {
    code: string | null;
    diagnostics: Diagnostic[];
    requiredHelpers: RuntimeHelper[];
    mode: StrictMode;
    environment: Environment;
    declarations: AmbientDeclarations;
    declaredGlobals: ReadonlyMap<string, SourcePosition>;
    externalReferences: ReadonlyMap<string, SourcePosition>;
    directives: SourceDirectives;
    lines: SourceLineMapping[];
    topLevelReturn: SourcePosition | null;
}

function findTopLevelReturn(statements: readonly Statement[]): SourcePosition | null {
    for (const statement of statements) {
        if (statement.kind === 'return-statement') {
            return statement.position;
        }

        let bodies: readonly (readonly Statement[])[] = [];

        switch (statement.kind) {
            case 'do-statement':
            case 'while-statement':
            case 'repeat-statement':
            case 'numeric-for-statement':
            case 'generic-for-statement':
                bodies = [statement.body];
                break;
            case 'if-statement':
                bodies = [...statement.clauses.map((clause) => clause.body), ...(statement.alternate === null ? [] : [statement.alternate])];
                break;
        }

        for (const body of bodies) {
            const position = findTopLevelReturn(body);

            if (position !== null) {
                return position;
            }
        }
    }

    return null;
}

export function compile(source: string, options: CompileOptions = {}): CompileResult {
    const settings = options.compilerOptions ?? DEFAULT_COMPILER_OPTIONS;
    const parsed = parse(source);
    const mode = resolveStrictMode(parsed.directives, settings.strict);
    const resolved = resolveEnvironment(options.filePath ?? null, parsed.directives, options.environment ?? null);
    const environment = resolved.environment;
    const isDeclarationFile = options.filePath !== undefined && isDeclarationPath(options.filePath);
    const checked = check(parsed.program, mode, environment, {
        ambient: options.ambient ?? EMPTY_AMBIENT,
        project: options.project ?? EMPTY_PROJECT_DECLARATIONS,
        isDeclarationFile,
        oop: settings.oop,
        noUnusedLocals: settings.noUnusedLocals,
        noUnusedParameters: settings.noUnusedParameters,
    });
    const diagnostics = sortDiagnostics([...parsed.diagnostics, ...resolved.diagnostics, ...checked.diagnostics]);
    const shared = {
        diagnostics,
        mode,
        environment,
        declarations: ownDeclarations(checked.declarations, options.ambient),
        declaredGlobals: checked.declaredGlobals,
        externalReferences: checked.externalReferences,
        directives: checked.directives,
        topLevelReturn: findTopLevelReturn(parsed.program.body),
    };

    if (hasErrors(diagnostics) || options.emitCode === false || isDeclarationFile) {
        return { ...shared, code: null, requiredHelpers: [], lines: [] };
    }

    const emitted = emit(parsed.program, checked.types, checked.references, checked.generatedMembers);
    const required = new Set<RuntimeHelper>(emitted.requiredHelpers);

    for (const name of checked.references) {
        const helper = checked.declaredGlobals.has(name) ? null : helperForGlobal(name);

        if (helper !== null) {
            required.add(helper);
        }
    }

    return { ...shared, code: emitted.code, requiredHelpers: expandHelpers(required).sort(), lines: emitted.lines };
}
