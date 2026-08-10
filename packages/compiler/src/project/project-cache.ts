import { EMPTY_AMBIENT, mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import { EMPTY_PROJECT_DECLARATIONS, type ProjectDeclarations } from '@compiler/checker/project-declarations';
import { ALL_ENVIRONMENTS, canReference, type Environment } from '@compiler/environment/environment';
import { compile } from '@compiler/index';

import { fingerprintDeclarations, hashString } from './fingerprint';
import { toContributions } from './manifest';
import { sortFileDiagnostics, type CompiledModule, type FileDiagnostic, type ProjectFile, type ProjectResult } from './module';
import { validateContributions, validateModuleReferences } from './module-graph';
import type { ProgressReporter } from './progress';
import { isDeclarationPath } from './source-kind';

interface DeclarationEntry {
    path: string;
    hash: string;
    environment: Environment;
    declarations: AmbientDeclarations;
    fingerprint: string;
}

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
    oop?: boolean;
    onProgress?: ProgressReporter;
}

export interface ProjectCache {
    compile(files: readonly ProjectFile[], options?: CompileProjectOptions): ProjectResult;
    clear(): void;
}

type AmbientKeys = Readonly<Record<Environment, string>>;

type AmbientResolver = (entry: DeclarationEntry) => AmbientDeclarations;

interface ModuleContext {
    keys: AmbientKeys;
    resolve: AmbientResolver;
    project: ProjectDeclarations;
    oop: boolean;
}

function flattenDiagnostics(modules: readonly CompiledModule[]): FileDiagnostic[] {
    return modules.flatMap((module) => module.diagnostics.map((diagnostic) => ({ path: module.path, diagnostic })));
}

function ambientKeys(collected: readonly DeclarationEntry[], project: ProjectDeclarations, oop: boolean): AmbientKeys {
    const keys: Partial<Record<Environment, string>> = {};
    const projectKey = `${oop ? 'oop' : ''}|${JSON.stringify(project.globals)}`;

    for (const environment of ALL_ENVIRONMENTS) {
        const visible = collected.filter((entry) => canReference(environment, entry.environment));

        keys[environment] = hashString(`${projectKey}|${visible.map((entry) => `${entry.path}=${entry.fingerprint}`).join(';')}`);
    }

    return keys as AmbientKeys;
}

function declaresNothing(declarations: AmbientDeclarations): boolean {
    const { classes, interfaces, enums, globals } = declarations;

    return classes.length === 0 && interfaces.length === 0 && enums.length === 0 && globals.length === 0;
}

function createAmbientResolver(collected: readonly DeclarationEntry[]): AmbientResolver {
    const visible = new Map<Environment, DeclarationEntry[]>();
    const merged = new Map<Environment, AmbientDeclarations>();

    for (const environment of ALL_ENVIRONMENTS) {
        const entries = collected.filter((entry) => canReference(environment, entry.environment) && !declaresNothing(entry.declarations));

        visible.set(environment, entries);
        merged.set(environment, mergeAmbient(entries.map((entry) => entry.declarations)));
    }

    return (entry: DeclarationEntry): AmbientDeclarations => {
        if (declaresNothing(entry.declarations)) {
            return merged.get(entry.environment) ?? EMPTY_AMBIENT;
        }

        const entries = visible.get(entry.environment) ?? [];

        return mergeAmbient(entries.filter((candidate) => candidate.path !== entry.path).map((candidate) => candidate.declarations));
    };
}

function compileModule(file: ProjectFile, ambient: AmbientDeclarations, context: ModuleContext): CompiledModule {
    const result = compile(file.source, {
        filePath: file.path,
        ambient,
        project: context.project,
        oop: context.oop,
    });

    return {
        path: file.path,
        environment: result.environment,
        isDeclaration: isDeclarationPath(file.path),
        code: result.code,
        requiredHelpers: result.requiredHelpers,
        declaredGlobals: result.declaredGlobals,
        externalReferences: result.externalReferences,
        contributions: toContributions(result.directives, result.environment),
        diagnostics: result.diagnostics,
    };
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

    function declarationsFor(file: ProjectFile, reused: { count: number }): DeclarationEntry {
        const hash = hashString(file.source);
        const cached = declarationCache.get(file.path);

        if (cached !== undefined && cached.hash === hash) {
            reused.count += 1;

            return cached;
        }

        const result = compile(file.source, { filePath: file.path, emitCode: false });
        const entry: DeclarationEntry = {
            path: file.path,
            hash,
            environment: result.environment,
            declarations: result.declarations,
            fingerprint: fingerprintDeclarations(result.declarations),
        };

        declarationCache.set(file.path, entry);

        return entry;
    }

    function moduleFor(pair: CompilationPair, context: ModuleContext, reused: { count: number }): CompiledModule {
        const { file, entry } = pair;
        const ambientKey = context.keys[entry.environment];
        const cached = moduleCache.get(file.path);

        if (cached !== undefined && cached.hash === entry.hash && cached.ambientKey === ambientKey) {
            reused.count += 1;

            return cached.module;
        }

        const module = compileModule(file, context.resolve(entry), context);

        moduleCache.set(file.path, { hash: entry.hash, ambientKey, module });

        return module;
    }

    return {
        compile: (files: readonly ProjectFile[], options: CompileProjectOptions = {}): ProjectResult => {
            const declarationsReused = { count: 0 };
            const modulesReused = { count: 0 };
            const project = options.project ?? EMPTY_PROJECT_DECLARATIONS;
            const oop = options.oop === true;
            const pairs = files.map((file) => ({ file, entry: declarationsFor(file, declarationsReused) }));
            const collected = pairs.map((pair) => pair.entry);
            const context = {
                keys: ambientKeys(collected, project, oop),
                resolve: createAmbientResolver(collected),
                project,
                oop,
            };
            const modules = pairs.map((pair, index) => {
                const module = moduleFor(pair, context, modulesReused);

                options.onProgress?.({ item: pair.file.path, index: index + 1, total: pairs.length });

                return module;
            });
            const references = validateModuleReferences(modules);
            const contributions = validateContributions(modules);
            const diagnostics = sortFileDiagnostics([...flattenDiagnostics(modules), ...references, ...contributions]);
            const paths = new Set(files.map((file) => file.path));

            prune(declarationCache, paths);
            prune(moduleCache, paths);

            return {
                modules,
                diagnostics,
                hasErrors: diagnostics.some((entry) => entry.diagnostic.severity === 'error'),
                stats: { files: files.length, declarationsReused: declarationsReused.count, modulesReused: modulesReused.count },
            };
        },
        clear: (): void => {
            declarationCache.clear();
            moduleCache.clear();
        },
    };
}
