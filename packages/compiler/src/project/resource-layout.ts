import { createDiagnostic } from '@compiler/diagnostics/diagnostic';
import { environmentRoot, FILE_START, normalizePath, type Environment } from '@compiler/environment/environment';
import {
    DEVELOPMENT_RUNTIME_HELPERS,
    expandHelpers,
    helperDepth,
    RUNTIME_HELPERS,
    type DevelopmentRuntimeHelperName,
    type RuntimeHelperName,
} from '@runtime/helpers';

import type { CompiledModule, FileDiagnostic } from './module';

export interface ResourceScript {
    path: string;
    source: string;
    environment: Environment;
    content: string;
}

export interface ResourceHelper {
    helper: RuntimeHelperName | DevelopmentRuntimeHelperName;
    path: string;
    file: string;
    environment: Environment;
    replacements?: Readonly<Record<string, string>>;
}

export interface DevelopmentLogHelpers {
    maxMessageLength: number;
    rateLimit: number;
    rateWindowMs: number;
}

export interface ResourceAsset {
    path: string;
    source: string;
    isDownloaded: boolean;
}

export const LIBRARY_DIRECTORY = 'lib';

const WILDCARD_SUFFIX = '**/*.lua';

const ENVIRONMENT_ORDER: Readonly<Record<Environment, number>> = { shared: 0, server: 1, client: 2 };

export function outputPath(sourcePath: string): string {
    return normalizePath(sourcePath)
        .replace(/^\.\//, '')
        .replace(/\.luam$/, '.lua');
}

export function libraryPath(environment: Environment, file: string): string {
    return `${LIBRARY_DIRECTORY}/${environment}/${file}`;
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

            return { helper, file, path: libraryPath(environment, file), environment };
        })
        .sort((left, right) => helperDepth(left.helper) - helperDepth(right.helper) || left.path.localeCompare(right.path));
}

export function collectDevelopmentLogHelpers(options: DevelopmentLogHelpers | null | undefined): ResourceHelper[] {
    if (options === null || options === undefined) {
        return [];
    }

    const replacements = {
        __LUAM_MAX_MESSAGE_LENGTH__: String(options.maxMessageLength),
        __LUAM_RATE_LIMIT__: String(options.rateLimit),
        __LUAM_RATE_WINDOW_MS__: String(options.rateWindowMs),
    };

    return Object.values(DEVELOPMENT_RUNTIME_HELPERS).map((helper) => ({
        helper: helper.name,
        file: helper.file,
        path: libraryPath(helper.environment, helper.file),
        environment: helper.environment,
        replacements,
    }));
}

export function collectScripts(modules: readonly CompiledModule[]): ResourceScript[] {
    return modules
        .filter((module): module is CompiledModule & { code: string } => module.code !== null)
        .map((module) => ({ path: outputPath(module.path), source: module.path, environment: module.environment, content: module.code }))
        .sort((left, right) => ENVIRONMENT_ORDER[left.environment] - ENVIRONMENT_ORDER[right.environment] || left.path.localeCompare(right.path));
}

export interface LoadOrder {
    scripts: ResourceScript[];
    assets: ResourceAsset[];
    diagnostics: FileDiagnostic[];
}

const MISSING_LOAD_ORDER = 'is listed in "loadOrder" but no source file or asset matches it. Remove the entry or correct the path.';

function missingEntry(entry: string): FileDiagnostic {
    return { path: entry, diagnostic: createDiagnostic('project', 'project-load-order-missing', `"${entry}" ${MISSING_LOAD_ORDER}`, FILE_START) };
}

export function resolveLoadOrder(entries: readonly string[], scripts: readonly ResourceScript[], assets: readonly ResourceAsset[]): LoadOrder {
    const byScript = new Map(scripts.map((script) => [normalizePath(script.source), script]));
    const byAsset = new Map(assets.map((asset) => [normalizePath(asset.source), asset]));
    const resolved: LoadOrder = { scripts: [], assets: [], diagnostics: [] };
    const seen = new Set<string>();

    for (const entry of entries) {
        const path = normalizePath(entry).replace(/^\.\//, '');
        const script = byScript.get(path);
        const asset = byAsset.get(path);

        if (seen.has(path)) {
            continue;
        }

        seen.add(path);

        if (script === undefined && asset === undefined) {
            resolved.diagnostics.push(missingEntry(entry));

            continue;
        }

        if (script !== undefined) {
            resolved.scripts.push(script);
        }

        if (asset !== undefined) {
            resolved.assets.push(asset);
        }
    }

    return resolved;
}

export interface SourceEntry {
    src: string;
    environment: Environment;
}

interface WildcardGroup {
    root: string;
    environment: Environment;
    scripts: ResourceScript[];
}

function groupByRoot(scripts: readonly ResourceScript[]): WildcardGroup[] {
    const groups = new Map<string, WildcardGroup>();

    for (const script of scripts) {
        const resolved = environmentRoot(script.path);

        if (resolved === null) {
            continue;
        }

        const group = groups.get(resolved.root) ?? { root: resolved.root, environment: resolved.environment, scripts: [] };

        group.scripts.push(script);
        groups.set(resolved.root, group);
    }

    return [...groups.values()].sort(
        (left, right) => ENVIRONMENT_ORDER[left.environment] - ENVIRONMENT_ORDER[right.environment] || left.root.localeCompare(right.root),
    );
}

function isWildcardSafe(group: WildcardGroup): boolean {
    return group.scripts.every((script) => script.environment === group.environment);
}

function groupEntries(group: WildcardGroup, pinned: ReadonlySet<string>): SourceEntry[] {
    if (isWildcardSafe(group)) {
        return [{ src: `${group.root}/${WILDCARD_SUFFIX}`, environment: group.environment }];
    }

    return group.scripts.filter((script) => !pinned.has(script.path)).map((script) => ({ src: script.path, environment: script.environment }));
}

export function sourceEntries(scripts: readonly ResourceScript[], pinned: readonly ResourceScript[]): SourceEntry[] {
    const pinnedPaths = new Set(pinned.map((script) => script.path));
    const grouped = groupByRoot(scripts);
    const covered = new Set(grouped.flatMap((group) => group.scripts.map((script) => script.path)));
    const loose = scripts.filter((script) => !covered.has(script.path) && !pinnedPaths.has(script.path));

    return [
        ...pinned.map((script) => ({ src: script.path, environment: script.environment })),
        ...grouped.flatMap((group) => groupEntries(group, pinnedPaths)),
        ...loose.map((script) => ({ src: script.path, environment: script.environment })),
    ];
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
