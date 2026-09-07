import { compareLibraryOrigins, libraryFilePath, libraryOutputPath, type LibraryFile, type LibraryOrigin } from './library';
import type { CompiledModule, FileDiagnostic } from './module';

import { createDiagnostic } from '@compiler/diagnostics/diagnostic';
import { FILE_START, normalizePath, type Environment } from '@compiler/environment/environment';
import { expandHelpers, helperDepth, RUNTIME_HELPERS, type RuntimeHelperName } from '@runtime/helpers';

import type { SourceLineMapping } from '@compiler/emitter/source-map';

export interface ResourceScript {
    path: string;
    source: string;
    environment: Environment;
    content: string;
    lines?: SourceLineMapping[];
}

export interface ResourceHelper {
    helper: RuntimeHelperName;
    path: string;
    file: string;
    environment: Environment;
    replacements?: Readonly<Record<string, string>>;
}

export interface ResourceAsset {
    path: string;
    source: string;
    isDownloaded: boolean;
}

export const LIBRARY_DIRECTORY = 'lib';

export function outputPath(sourcePath: string): string {
    return normalizePath(sourcePath)
        .replace(/^\.\//, '')
        .replace(/\.luam$/, '.lua');
}

export function libraryPath(file: string): string {
    return `${LIBRARY_DIRECTORY}/${file}`;
}

function mergeEnvironment(current: Environment | undefined, environment: Environment): Environment {
    if (current === undefined) {
        return environment;
    }

    return current === environment ? current : 'shared';
}

function declaredEnvironment(helper: RuntimeHelperName): Environment | null {
    return RUNTIME_HELPERS[helper].environment ?? null;
}

export function collectHelpers(modules: readonly CompiledModule[], manual: readonly RuntimeHelperName[]): ResourceHelper[] {
    const environments = new Map<RuntimeHelperName, Environment>();

    for (const helper of expandHelpers(manual)) {
        environments.set(helper, declaredEnvironment(helper) ?? 'shared');
    }

    for (const module of modules) {
        for (const helper of expandHelpers(module.requiredHelpers)) {
            environments.set(helper, declaredEnvironment(helper) ?? mergeEnvironment(environments.get(helper), module.environment));
        }
    }

    return [...environments.entries()]
        .map(([helper, environment]) => {
            const file = RUNTIME_HELPERS[helper].file;

            return { helper, file, path: libraryPath(file), environment };
        })
        .sort((left, right) => helperDepth(left.helper) - helperDepth(right.helper) || left.path.localeCompare(right.path));
}

function emitted(modules: readonly CompiledModule[]): (CompiledModule & { code: string })[] {
    return modules.filter((module): module is CompiledModule & { code: string } => module.code !== null);
}

export type ScriptOrder = ReadonlyMap<string, number>;

const UNORDERED = Number.MAX_SAFE_INTEGER;

function orderOf(order: ScriptOrder, source: string): number {
    return order.get(normalizePath(source)) ?? UNORDERED;
}

export function collectScripts(modules: readonly CompiledModule[], order: ScriptOrder = new Map()): ResourceScript[] {
    return emitted(modules)
        .filter((module) => module.origin === null)
        .map((module) => ({ path: outputPath(module.path), source: module.path, environment: module.environment, content: module.code, lines: module.lines }))
        .sort((left, right) => orderOf(order, left.source) - orderOf(order, right.source) || left.path.localeCompare(right.path));
}

interface OrderedScript {
    origin: LibraryOrigin;
    script: ResourceScript;
}

function libraryScript(origin: LibraryOrigin, environment: Environment, content: string, lines: SourceLineMapping[]): OrderedScript {
    const script = {
        path: libraryOutputPath(origin.package, environment, origin.relativePath),
        source: libraryFilePath(origin.package, origin.relativePath),
        environment,
        content,
        lines,
    };

    return { origin, script };
}

export function collectLibraryScripts(modules: readonly CompiledModule[], files: readonly LibraryFile[] = []): ResourceScript[] {
    const compiled = emitted(modules)
        .filter((module) => module.origin !== null)
        .map((module) => libraryScript(module.origin as LibraryOrigin, module.environment, module.code, module.lines));
    const verbatim = files.map((file) => libraryScript(file.origin, file.environment, file.content, []));

    return [...compiled, ...verbatim].sort((left, right) => compareLibraryOrigins(left.origin, right.origin)).map((entry) => entry.script);
}

export function findDuplicateOutputs(scripts: readonly ResourceScript[], assets: readonly ResourceAsset[]): FileDiagnostic[] {
    const seen = new Map<string, string>();
    const diagnostics: FileDiagnostic[] = [];

    for (const entry of [...scripts, ...assets]) {
        const previous = seen.get(entry.path);

        if (previous === undefined) {
            seen.set(entry.path, entry.source);

            continue;
        }

        const message = `"${entry.source}" and "${previous}" both produce "${entry.path}". Rename one of the source files.`;

        diagnostics.push({ path: entry.source, diagnostic: createDiagnostic('project', 'project-duplicate-output', message, FILE_START) });
    }

    return diagnostics;
}
