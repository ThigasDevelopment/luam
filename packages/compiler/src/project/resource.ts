import { collectBundles, type ResourceBundle } from './bundle-layout';
import { generateManifest, type ManifestContribution, type ManifestFile, type ManifestScript } from './manifest';
import { sortFileDiagnostics, type FileDiagnostic, type ProjectResult } from './module';
import type { AssemblyReporter } from './progress';
import {
    collectHelpers,
    collectDevelopmentLogHelpers,
    collectScripts,
    findDuplicateOutputs,
    resolveLoadOrder,
    sourceEntries,
    type ResourceAsset,
    type DevelopmentLogHelpers,
    type ResourceHelper,
    type ResourceScript,
} from './resource-layout';
import { RESOURCE_MAP_VERSION, type OutputLayout, type ResourceMap } from './resource-map';

import { createDiagnostic } from '@compiler/diagnostics/diagnostic';
import { FILE_START } from '@compiler/environment/environment';

import type { RuntimeHelperName } from '@runtime/helpers';

export { LIBRARY_DIRECTORY, libraryPath, outputPath, type ResourceAsset, type ResourceHelper, type ResourceScript } from './resource-layout';
export { BUNDLE_DIRECTORY, bundlePath, materializeBundles, type BundleMember, type HelperContentResolver, type ResourceBundle } from './bundle-layout';
export {
    RESOURCE_MAP_VERSION,
    resolveResourcePosition,
    serializeResourceMap,
    type OutputLayout,
    type ResourceMap,
    type ResourceMapFile,
    type ResourceMapSegment,
    type ResourcePositionResolution,
    type ResolvedSourcePosition,
} from './resource-map';

export interface ResourceConfiguration {
    path: string;
    source: string;
    content: string;
}

export interface ResourceOptions {
    author?: string;
    version?: string;
    description?: string;
    oop?: boolean;
    helpers?: readonly RuntimeHelperName[];
    assets?: readonly ResourceAsset[];
    configuration?: ResourceConfiguration | null;
    loadOrder?: readonly string[];
    minMtaVersion?: string | null;
    developmentLogs?: DevelopmentLogHelpers | null;
    layout?: OutputLayout;
    resourceName?: string;
}

export interface ResourceBuild {
    manifest: string;
    scripts: ResourceScript[];
    helpers: ResourceHelper[];
    configuration: ResourceScript | null;
    assets: ResourceAsset[];
    bundles: ResourceBundle[];
    layout: OutputLayout;
    map: ResourceMap | null;
}

export interface ResourceAssembly {
    build: ResourceBuild | null;
    diagnostics: FileDiagnostic[];
}

export const CONFIGURATION_FILE = 'config.lua';

export const ENVIRONMENT_FILE = '.env';

type ResourceInfo = { author?: string; version?: string; description?: string };

function configurationScript(configuration: ResourceConfiguration | null | undefined): ResourceScript | null {
    if (configuration === null || configuration === undefined) {
        return null;
    }

    return { path: configuration.path, source: configuration.source, environment: 'shared', content: configuration.content, lines: [] };
}

function helperEntry(helper: ResourceHelper): ManifestScript {
    return { src: helper.path, environment: helper.environment, group: 'library' };
}

function manifestScripts(helpers: readonly ResourceHelper[], configuration: ResourceScript | null, sources: readonly ManifestScript[]): ManifestScript[] {
    const settings: ManifestScript[] = configuration === null ? [] : [{ src: configuration.path, environment: 'shared', group: 'configuration' }];

    return [...helpers.map(helperEntry), ...settings, ...sources];
}

function collectContributions(project: ProjectResult): ManifestContribution[] {
    return project.modules.flatMap((module) => module.contributions);
}

function orderAssets(assets: readonly ResourceAsset[], pinned: readonly ResourceAsset[]): ResourceAsset[] {
    const pinnedPaths = new Set(pinned.map((asset) => asset.path));

    return [...pinned, ...assets.filter((asset) => !pinnedPaths.has(asset.path))];
}

function manifestFiles(assets: readonly ResourceAsset[]): ManifestFile[] {
    return assets.filter((asset) => asset.isDownloaded && asset.path !== ENVIRONMENT_FILE).map((asset) => ({ src: asset.path }));
}

function manifestInfo(options: ResourceOptions): ResourceInfo {
    const info: ResourceInfo = {};

    if (options.author !== undefined) {
        info.author = options.author;
    }

    if (options.version !== undefined) {
        info.version = options.version;
    }

    if (options.description !== undefined) {
        info.description = options.description;
    }

    return info;
}

function lineCount(content: string): number {
    return content.length === 0 ? 1 : (content.match(/\n/g)?.length ?? 0) + (content.endsWith('\n') ? 0 : 1);
}

function treeResourceMap(resource: string, scripts: readonly ResourceScript[]): ResourceMap {
    return {
        version: RESOURCE_MAP_VERSION,
        resource,
        layout: 'tree',
        files: scripts.map((script) => ({
            path: script.path,
            segments: [
                {
                    kind: 'module',
                    generatedStartLine: 1,
                    generatedEndLine: lineCount(script.content),
                    contentStartLine: 1,
                    source: script.source,
                    lines: script.lines ?? [],
                },
            ],
        })),
    };
}

function bundleDiagnostics(
    project: ProjectResult,
    bundles: readonly ResourceBundle[],
    scripts: readonly ResourceScript[],
    assets: readonly ResourceAsset[],
): FileDiagnostic[] {
    const diagnostics: FileDiagnostic[] = [];
    const outputs = [...scripts, ...assets];

    for (const module of project.modules) {
        if (module.code !== null && module.topLevelReturn !== null) {
            const message = `"${module.path}" contains a top-level return and cannot be included in a bundle. Remove the return or build the tree layout with "--no-bundle" or "output = { bundle = false }" in .luam.manifest.`;

            diagnostics.push({ path: module.path, diagnostic: createDiagnostic('project', 'project-bundle-toplevel-return', message, module.topLevelReturn) });
        }
    }

    for (const bundle of bundles) {
        const path = bundle.path;

        for (const { source } of outputs.filter((entry) => entry.path === path)) {
            const message = `"${source}" produces "${path}", which is reserved for the ${bundle.environment} bundle. Rename the source output or build the tree layout with "--no-bundle".`;

            diagnostics.push({ path: source, diagnostic: createDiagnostic('project', 'project-bundle-output-collision', message, FILE_START) });
        }
    }

    return diagnostics;
}

export function assembleResource(project: ProjectResult, options: ResourceOptions, onStep?: AssemblyReporter): ResourceAssembly {
    if (project.hasErrors) {
        return { build: null, diagnostics: project.diagnostics };
    }

    const helpers = [...collectHelpers(project.modules, options.helpers ?? []), ...collectDevelopmentLogHelpers(options.developmentLogs)];
    const scripts = collectScripts(project.modules);
    const configuration = configurationScript(options.configuration);
    const sorted = [...(options.assets ?? [])].sort((left, right) => left.path.localeCompare(right.path));
    const order = resolveLoadOrder(options.loadOrder ?? [], scripts, sorted);
    const layout = options.layout ?? 'tree';
    const bundles = layout === 'bundle' ? collectBundles(helpers, scripts, order.scripts) : [];
    const outputs = configuration === null ? scripts : [...scripts, configuration];
    const duplicates =
        layout === 'tree'
            ? findDuplicateOutputs(outputs, sorted)
            : [
                  ...findDuplicateOutputs(scripts, []),
                  ...findDuplicateOutputs(configuration === null ? [] : [configuration], sorted),
              ];
    const collisions = layout === 'bundle' ? bundleDiagnostics(project, bundles, scripts, sorted) : [];
    const diagnostics = sortFileDiagnostics([...project.diagnostics, ...duplicates, ...collisions, ...order.diagnostics]);

    if (duplicates.length > 0 || collisions.length > 0 || order.diagnostics.length > 0) {
        return { build: null, diagnostics };
    }

    onStep?.('assembly');

    const assets = orderAssets(sorted, order.assets);
    const sources =
        layout === 'tree'
            ? sourceEntries(scripts, order.scripts).map((entry): ManifestScript => ({ ...entry, group: 'source' }))
            : bundles.map((bundle): ManifestScript => ({ src: bundle.path, environment: bundle.environment, group: 'source' }));
    const manifestHelpers = layout === 'tree' ? helpers : [];
    const manifest = generateManifest(
        manifestInfo(options),
        manifestScripts(manifestHelpers, configuration, sources),
        manifestFiles(assets),
        collectContributions(project),
        { oop: options.oop === true, minMtaVersion: options.minMtaVersion ?? null },
    );

    onStep?.('manifest');

    const map = layout === 'tree' ? treeResourceMap(options.resourceName ?? '', scripts) : null;

    return { build: { manifest, scripts: layout === 'tree' ? scripts : [], helpers, configuration, assets, bundles, layout, map }, diagnostics };
}
