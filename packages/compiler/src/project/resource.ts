import type { RuntimeHelperName } from '@runtime/helpers';

import { generateManifest, type ManifestContribution, type ManifestFile, type ManifestScript } from './manifest';
import { sortFileDiagnostics, type FileDiagnostic, type ProjectResult } from './module';
import type { AssemblyReporter } from './progress';
import {
    collectHelpers,
    collectScripts,
    findDuplicateOutputs,
    resolveLoadOrder,
    sourceEntries,
    type ResourceAsset,
    type ResourceHelper,
    type ResourceScript,
} from './resource-layout';

export { LIBRARY_DIRECTORY, libraryPath, outputPath, type ResourceAsset, type ResourceHelper, type ResourceScript } from './resource-layout';

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
}

export interface ResourceBuild {
    manifest: string;
    scripts: ResourceScript[];
    helpers: ResourceHelper[];
    configuration: ResourceScript | null;
    assets: ResourceAsset[];
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

    return { path: configuration.path, source: configuration.source, environment: 'shared', content: configuration.content };
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

export function assembleResource(project: ProjectResult, options: ResourceOptions, onStep?: AssemblyReporter): ResourceAssembly {
    if (project.hasErrors) {
        return { build: null, diagnostics: project.diagnostics };
    }

    const helpers = collectHelpers(project.modules, options.helpers ?? []);
    const scripts = collectScripts(project.modules);
    const configuration = configurationScript(options.configuration);
    const sorted = [...(options.assets ?? [])].sort((left, right) => left.path.localeCompare(right.path));
    const outputs = configuration === null ? scripts : [...scripts, configuration];
    const duplicates = findDuplicateOutputs(outputs, sorted);
    const order = resolveLoadOrder(options.loadOrder ?? [], scripts, sorted);
    const diagnostics = sortFileDiagnostics([...project.diagnostics, ...duplicates, ...order.diagnostics]);

    if (duplicates.length > 0 || order.diagnostics.length > 0) {
        return { build: null, diagnostics };
    }

    onStep?.('assembly');

    const assets = orderAssets(sorted, order.assets);
    const sources = sourceEntries(scripts, order.scripts).map((entry): ManifestScript => ({ ...entry, group: 'source' }));
    const manifest = generateManifest(
        manifestInfo(options),
        manifestScripts(helpers, configuration, sources),
        manifestFiles(assets),
        collectContributions(project),
        { oop: options.oop === true, minMtaVersion: options.minMtaVersion ?? null },
    );

    onStep?.('manifest');

    return { build: { manifest, scripts, helpers, configuration, assets }, diagnostics };
}
