import type { AmbientDeclarations } from '@compiler/checker/ambient';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { compile } from '@compiler/index';
import { DEFAULT_COMPILER_OPTIONS, type CompilerOptions } from '@compiler/manifest/manifest-defaults';

import { createAmbientScope, optionsKey, sharedEnums, type AmbientScope, type DeclarationEntry } from './ambient-scope';
import type { ResourceAbi } from './export-abi';
import { fingerprintByName, fingerprintDeclarations, hashString } from './fingerprint';
import { toContributions } from './manifest';
import { sortFileDiagnostics, type CompiledModule, type FileDiagnostic, type ProjectFile, type ProjectResult } from './module';
import { validateContributions, validateModuleReferences } from './module-graph';
import type { ProgressReporter } from './progress';
import { isDeclarationPath } from './source-kind';

interface ModuleEntry {
    hash: string;
    ambientKey: string;
    module: CompiledModule;
}

interface CompilationPair {
    file: ProjectFile;
    entry: DeclarationEntry;
}

export interface CompileProjectOptions {
    project?: ProjectDeclarations;
    contracts?: readonly ResourceAbi[];
    compilerOptions?: CompilerOptions;
    development?: boolean;
    onProgress?: ProgressReporter;
}

export interface ProjectCache {
    compile(files: readonly ProjectFile[], options?: CompileProjectOptions): ProjectResult;
    clear(): void;
}

interface ModuleContext {
    scope: AmbientScope;
    contracts: readonly ResourceAbi[];
    project: ProjectDeclarations;
    projectReferences: ReadonlySet<string>;
    compilerOptions: CompilerOptions;
    development: boolean;
}

function flattenDiagnostics(modules: readonly CompiledModule[]): FileDiagnostic[] {
    return modules.flatMap((module) => module.diagnostics.map((diagnostic) => ({ path: module.path, diagnostic })));
}

function compileModule(file: ProjectFile, ambient: AmbientDeclarations, context: ModuleContext): CompiledModule {
    const result = compile(file.source, {
        filePath: file.path,
        ...(file.environment === undefined ? {} : { environment: file.environment }),
        ambient,
        contracts: context.contracts,
        project: context.project,
        projectReferences: context.projectReferences,
        compilerOptions: context.compilerOptions,
        development: context.development,
    });

    return {
        path: file.path,
        environment: result.environment,
        isDeclaration: isDeclarationPath(file.path),
        code: result.code,
        requiredHelpers: result.requiredHelpers,
        declaredGlobals: result.declaredGlobals,
        externalReferences: result.externalReferences,
        contributions: toContributions(result.directives, result.environment, result.moduleGlobals),
        diagnostics: result.diagnostics,
        lines: result.lines,
        topLevelReturn: result.topLevelReturn,
        events: result.events,
    };
}

function promoteWarnings(diagnostics: readonly FileDiagnostic[]): FileDiagnostic[] {
    return diagnostics.map((entry) =>
        entry.diagnostic.severity === 'warning' ? { path: entry.path, diagnostic: { ...entry.diagnostic, severity: 'error' as const } } : entry,
    );
}

function prune(cache: Map<string, unknown>, paths: ReadonlySet<string>): void {
    for (const path of [...cache.keys()]) {
        if (!paths.has(path)) {
            cache.delete(path);
        }
    }
}

export function createProjectCache(): ProjectCache {
    const declarationCache = new Map<string, DeclarationEntry>();
    const moduleCache = new Map<string, ModuleEntry>();

    function declarationsFor(file: ProjectFile, options: CompilerOptions, reused: { count: number }): DeclarationEntry {
        const hash = hashString(`${file.environment ?? ''}|${optionsKey(options)}|${file.source}`);
        const cached = declarationCache.get(file.path);

        if (cached !== undefined && cached.hash === hash) {
            reused.count += 1;

            return cached;
        }

        const result = compile(file.source, {
            filePath: file.path,
            ...(file.environment === undefined ? {} : { environment: file.environment }),
            compilerOptions: options,
            emitCode: false,
        });
        const entry: DeclarationEntry = {
            path: file.path,
            hash,
            environment: result.environment,
            declarations: result.declarations,
            externalReferences: [...result.externalReferences.keys()],
            fingerprint: fingerprintDeclarations(result.declarations),
            provides: fingerprintByName(result.declarations),
            requires: result.referencedNames,
        };

        declarationCache.set(file.path, entry);

        return entry;
    }

    function moduleFor(pair: CompilationPair, context: ModuleContext, reused: { count: number }): CompiledModule {
        const { file, entry } = pair;
        const ambientKey = context.scope.keyFor(entry);
        const cached = moduleCache.get(file.path);

        if (cached !== undefined && cached.hash === entry.hash && cached.ambientKey === ambientKey) {
            reused.count += 1;

            return cached.module;
        }

        const module = compileModule(file, context.scope.resolve(entry), context);

        moduleCache.set(file.path, { hash: entry.hash, ambientKey, module });

        return module;
    }

    return {
        compile: (files: readonly ProjectFile[], options: CompileProjectOptions = {}): ProjectResult => {
            const declarationsReused = { count: 0 };
            const modulesReused = { count: 0 };
            const project = options.project ?? EMPTY_PROJECT_DECLARATIONS;
            const compilerOptions = options.compilerOptions ?? DEFAULT_COMPILER_OPTIONS;
            const pairs = files.map((file) => ({ file, entry: declarationsFor(file, compilerOptions, declarationsReused) }));
            const collected = pairs.map((pair) => pair.entry);
            const projectReferences = sharedEnums(collected);
            const development = options.development === true;
            const contracts = options.contracts ?? [];
            const context: ModuleContext = {
                scope: createAmbientScope(collected, { project, references: projectReferences, options: compilerOptions, development, contracts }),
                contracts,
                project,
                projectReferences,
                compilerOptions,
                development,
            };
            const modules = pairs.map((pair, index) => {
                const module = moduleFor(pair, context, modulesReused);

                options.onProgress?.({ item: pair.file.path, index: index + 1, total: pairs.length });

                return module;
            });
            const references = validateModuleReferences(modules);
            const contributions = validateContributions(modules);
            const collectedDiagnostics = sortFileDiagnostics([...flattenDiagnostics(modules), ...references, ...contributions]);
            const diagnostics = compilerOptions.warningsAsErrors ? promoteWarnings(collectedDiagnostics) : collectedDiagnostics;
            const paths = new Set(files.map((file) => file.path));

            prune(declarationCache, paths);
            prune(moduleCache, paths);

            return {
                modules,
                diagnostics,
                hasErrors: diagnostics.some((entry) => entry.diagnostic.severity === 'error'),
                stats: { files: files.length, declarationsReused: declarationsReused.count, modulesReused: modulesReused.count },
                events: collected.flatMap((entry) => entry.declarations.events),
            };
        },
        clear: (): void => {
            declarationCache.clear();
            moduleCache.clear();
        },
    };
}
