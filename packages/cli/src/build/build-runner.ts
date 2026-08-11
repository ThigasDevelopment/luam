import type { PhaseDuration } from '@cli/build/build-phase';
import { renderEnvironmentTemplate } from '@cli/build/env-template';
import { readHelperSource } from '@cli/build/helper-files';
import { createPhaseTracker, type PhaseTracker } from '@cli/build/phase-tracker';
import { readProjectInputs, ENVIRONMENT_FILE, type ProjectInputs } from '@cli/build/project-inputs';
import { discoverSources } from '@cli/build/source-discovery';
import type { LuamConfig } from '@cli/config/config-schema';
import { hasCliErrors, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import { projectDeclarations } from '@compiler/checker/project-declarations';
import type { FileDiagnostic, ProjectFile, ProjectStats } from '@compiler/project/module';
import { createProjectCache, type ProjectCache } from '@compiler/project/project-cache';
import type { AssemblyStep } from '@compiler/project/progress';
import { assembleResource, materializeBundles, type OutputLayout, type ResourceBuild, type ResourceMap, type ResourceOptions } from '@compiler/project/resource';
import type { RuntimeHelperName } from '@runtime/helpers';

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
}

export interface CompileOptions {
    cache?: ProjectCache;
    tracker?: PhaseTracker;
    minMtaVersion?: string | null;
    developmentLogs?: LuamConfig['development']['logs'] | null;
    layout?: OutputLayout;
    map?: boolean;
}

function helperList(config: LuamConfig, inputs: ProjectInputs): RuntimeHelperName[] {
    if (inputs.declared === null || config.helpers.includes('env')) {
        return config.helpers;
    }

    const helpers: RuntimeHelperName[] = [...config.helpers, 'env'];

    return helpers.sort();
}

function resourceOptions(
    config: LuamConfig,
    inputs: ProjectInputs,
    minMtaVersion: string | null,
    developmentLogs: LuamConfig['development']['logs'] | null,
    layout: OutputLayout,
): ResourceOptions {
    const options: ResourceOptions = {
        oop: config.oop,
        helpers: helperList(config, inputs),
        assets: inputs.assets,
        configuration: inputs.configuration,
        loadOrder: config.loadOrder,
        minMtaVersion,
        developmentLogs,
        layout,
        resourceName: config.name,
    };

    if (config.author !== null) {
        options.author = config.author;
    }

    if (config.version !== null) {
        options.version = config.version;
    }

    if (config.description !== null) {
        options.description = config.description;
    }

    return options;
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

    const sources = discoverSources(root, config.sourceDirs);
    const inputs = readProjectInputs(root, config.sourceDirs, config.assetDirs);
    const diagnostics = [...sources.diagnostics, ...inputs.diagnostics];

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
        };
    }

    tracker.begin('compile', sources.files.length);

    const declarations = projectDeclarations(inputs.declared?.entries ?? null, ENVIRONMENT_FILE);
    const project = cache.compile(sources.files, {
        project: declarations,
        oop: config.oop,
        onProgress: (event) => tracker.advance(event.item, event.index, event.total),
    });

    tracker.begin('assembly');

    const assembly = assembleResource(
        project,
        resourceOptions(config, inputs, options.minMtaVersion ?? null, options.developmentLogs ?? null, options.layout ?? 'tree'),
        (step: AssemblyStep) => {
            if (step === 'assembly') {
                tracker.begin('manifest');
            }
        },
    );

    const build = assembly.build === null ? null : materialize(assembly.build, config.name, options.map ?? true);

    tracker.end(build === null ? 'failed' : 'done');

    return {
        build,
        diagnostics,
        fileDiagnostics: assembly.diagnostics,
        fileCount: sources.files.length,
        durationMs: performance.now() - started,
        stats: project.stats,
        environmentTemplate: inputs.deployed === null ? null : renderEnvironmentTemplate(inputs.deployed),
        phases: tracker.durations(),
        sources: diagnosticSources(sources.files, assembly.diagnostics),
        map: build?.map ?? null,
    };
}
