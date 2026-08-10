import { EMPTY_AMBIENT, ownDeclarations, type AmbientDeclarations } from '@compiler/checker/ambient';
import type { SourceDirectives } from '@compiler/checker/build-directives';
import { check } from '@compiler/checker/checker';
import { resolveStrictMode, type StrictMode } from '@compiler/checker/directives';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { hasErrors, sortDiagnostics, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { resolveEnvironment, type Environment } from '@compiler/environment/environment';
import { emit } from '@compiler/emitter/emitter';
import type { RuntimeHelper } from '@compiler/emitter/state';
import { parse } from '@compiler/parser/parser';
import { isDeclarationPath } from '@compiler/project/source-kind';
import { expandHelpers, helperForGlobal } from '@runtime/helpers';

export interface CompileOptions {
    filePath?: string;
    environment?: Environment;
    ambient?: AmbientDeclarations;
    project?: ProjectDeclarations;
    oop?: boolean;
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
}

export function compile(source: string, options: CompileOptions = {}): CompileResult {
    const parsed = parse(source);
    const mode = resolveStrictMode(parsed.directives);
    const resolved = resolveEnvironment(options.filePath ?? null, parsed.directives);
    const environment = options.environment ?? resolved.environment;
    const isDeclarationFile = options.filePath !== undefined && isDeclarationPath(options.filePath);
    const checked = check(parsed.program, mode, environment, {
        ambient: options.ambient ?? EMPTY_AMBIENT,
        project: options.project ?? EMPTY_PROJECT_DECLARATIONS,
        isDeclarationFile,
        oop: options.oop === true,
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
    };

    if (hasErrors(diagnostics) || options.emitCode === false || isDeclarationFile) {
        return { ...shared, code: null, requiredHelpers: [] };
    }

    const emitted = emit(parsed.program, checked.types, checked.references, checked.generatedMembers);
    const required = new Set<RuntimeHelper>(emitted.requiredHelpers);

    for (const name of checked.references) {
        const helper = checked.declaredGlobals.has(name) ? null : helperForGlobal(name);

        if (helper !== null) {
            required.add(helper);
        }
    }

    return { ...shared, code: emitted.code, requiredHelpers: expandHelpers(required).sort() };
}
