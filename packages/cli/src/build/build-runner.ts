import type { PhaseDuration } from '@cli/build/build-phase';
import { readDependencyContracts } from '@cli/build/contract-files';
import { readHelperSource } from '@cli/build/helper-files';
import { resolveLibraries } from '@cli/build/library-resolution';
import { createPhaseTracker, type PhaseTracker } from '@cli/build/phase-tracker';
import { readProjectInputs, type ProjectInputs } from '@cli/build/project-inputs';
import { discoverSources, type DiscoveredSources } from '@cli/build/source-discovery';
import type { LuamConfig } from '@cli/config/config-schema';
import { hasCliErrors, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import { projectDeclarations } from '@compiler/checker/project-declarations';
import { names } from '@compiler/manifest/manifest-contract';
import type { FileDiagnostic, ProjectFile, ProjectStats } from '@compiler/project/module';
import { createProjectCache, type ProjectCache } from '@compiler/project/project-cache';
import { buildResourceAbi, type ResourceAbi } from '@compiler/project/export-abi';
import type { LibraryFile } from '@compiler/project/library';
import type { RuntimeHelperName } from '@runtime/helpers';
import { outputPath } from '@compiler/project/resource-layout';
import type { ManifestEnvironment, ManifestInclude, ManifestInfo, ManifestScript } from '@compiler/project/manifest';
import type { AssemblyStep } from '@compiler/project/progress';
import {
    assembleResource,
    materializeBundles,
    renderEnvironmentTemplate,
    type OutputLayout,
    type ResourceBuild,
    type ResourceMap,
    type ResourceOptions,
} from '@compiler/project/resource';

export interface BuildOutcome {
    build: ResourceBuild | null;
    diagnostics: CliDiagnostic[];
    fileDiagnostics: FileDiagnostic[];
    fileCount: number;
    durationMs: number;
    stats: ProjectStats | null;
    environmentTemplate: string | null;
    phases: PhaseDuration[];
    sources: ReadonlyMap<string, string>;
    map: ResourceMap | null;
    contract: ResourceAbi | null;
}

export interface CompileOptions {
    additionalFiles?: readonly ProjectFile[];
    cache?: ProjectCache;
    tracker?: PhaseTracker;
    minServerVersion?: string | null;
    minClientVersion?: string | null;
    development?: boolean;
    layout?: OutputLayout;
    map?: boolean;
}

function helperList(inputs: ProjectInputs): RuntimeHelperName[] {
    return inputs.declared === null ? [] : ['env'];
}

function manifestInfo(config: LuamConfig): ManifestInfo {
    return { author: config.author, version: config.version, description: config.description };
}

function manifestIncludes(config: LuamConfig): ManifestInclude[] {
    return config.dependencies.map((entry) => ({ resource: entry.name, group: entry.group }));
}

function manifestEnvironment(config: LuamConfig, options: CompileOptions): ManifestEnvironment {
    return {
        oop: config.oopDeclared ? config.compilerOptions.oop : null,
        minServerVersion: options.minServerVersion ?? null,
        minClientVersion: options.minClientVersion ?? null,
    };
}

function authoredScripts(config: LuamConfig): ManifestScript[] {
    return config.scripts.map((entry) => ({ src: outputPath(entry.path), environment: entry.type, group: entry.group }));
}

function resourceOptions(
    config: LuamConfig,
    inputs: ProjectInputs,
    sources: DiscoveredSources,
    options: CompileOptions,
    layout: OutputLayout,
    libraryFiles: readonly LibraryFile[],
): ResourceOptions {
    return {
        resourceName: config.name,
        info: manifestInfo(config),
        includes: manifestIncludes(config),
        environment: manifestEnvironment(config, options),
        scripts: authoredScripts(config),
        files: inputs.elements,
        helpers: helperList(inputs),
        order: sources.order,
        libraries: config.libraries,
        natives: sources.natives,
        assets: inputs.assets,
        configuration: inputs.configuration,
        environmentFile: config.secret,
        libraryFiles,
        layout,
    };
}

function helperContent(helper: ResourceBuild['helpers'][number]): string {
    let content = readHelperSource(helper.helper, helper.file);

    for (const [placeholder, value] of Object.entries(helper.replacements ?? {})) {
        content = content.replaceAll(placeholder, value);
    }

    return content;
}

function materialize(build: ResourceBuild, resource: string, includeMap: boolean): ResourceBuild {
    if (build.layout === 'tree') {
        return includeMap ? build : { ...build, map: null };
    }

    const bundled = materializeBundles(resource, build.bundles, helperContent);

    return { ...build, scripts: bundled.scripts, map: includeMap ? bundled.map : null };
}

function diagnosticSources(files: readonly ProjectFile[], entries: readonly FileDiagnostic[]): ReadonlyMap<string, string> {
    const paths = new Set(entries.map((entry) => entry.path));

    return new Map(files.filter((file) => paths.has(file.path)).map((file) => [file.path, file.source]));
}

export function runCompile(root: string, config: LuamConfig, options: CompileOptions = {}): BuildOutcome {
    const cache = options.cache ?? createProjectCache();
    const tracker = options.tracker ?? createPhaseTracker();
    const started = performance.now();

    tracker.begin('discovery');

    const excluded = [config.outDir, config.contracts];
    const sources = discoverSources(root, config.scripts, excluded);
    const inputs = readProjectInputs(root, { files: config.files, secret: config.secret, excluded });
    const libraries = resolveLibraries(root, names(config.libraries));
    const projectFiles = [...sources.files, ...(options.additionalFiles ?? [])].sort((left, right) => left.path.localeCompare(right.path));
    const files = [...libraries.files, ...projectFiles];
    const contracts = readDependencyContracts(root, config);
    const diagnostics = [...sources.diagnostics, ...inputs.diagnostics, ...libraries.diagnostics, ...contracts.diagnostics];

    if (hasCliErrors(diagnostics)) {
        tracker.end('failed');

        return {
            build: null,
            diagnostics,
            fileDiagnostics: [],
            fileCount: 0,
            durationMs: performance.now() - started,
            stats: null,
            environmentTemplate: null,
            phases: tracker.durations(),
            sources: new Map(),
            map: null,
            contract: null,
        };
    }

    tracker.begin('compile', files.length);

    const declarations = projectDeclarations(inputs.declared?.entries ?? null, config.secret);
    const project = cache.compile(files, {
        project: declarations,
        contracts: contracts.contracts,
        compilerOptions: config.compilerOptions,
        development: options.development === true,
        onProgress: (event) => tracker.advance(event.item, event.index, event.total),
    });

    tracker.begin('assembly');

    const assembly = assembleResource(project, resourceOptions(config, inputs, sources, options, options.layout ?? 'tree', libraries.verbatim), (step: AssemblyStep) => {
        if (step === 'assembly') {
            tracker.begin('manifest');
        }
    });

    const build = assembly.build === null ? null : materialize(assembly.build, config.name, options.map ?? true);

    tracker.end(build === null ? 'failed' : 'done');

    return {
        build,
        diagnostics,
        fileDiagnostics: assembly.diagnostics,
        fileCount: files.length,
        durationMs: performance.now() - started,
        stats: project.stats,
        environmentTemplate: inputs.deployed === null ? null : renderEnvironmentTemplate(inputs.deployed),
        phases: tracker.durations(),
        sources: diagnosticSources(files, assembly.diagnostics),
        map: build?.map ?? null,
        contract: build === null ? null : buildResourceAbi(config.name, project.modules.flatMap((module) => module.contributions)),
    };
}
