import { collectBundles, type ResourceBundle } from './bundle-layout';
import { libraryDirectory, LIBRARIES_DIRECTORY, type LibraryFile } from './library';
import {
    generateManifest,
    type GeneratedManifest,
    type ManifestContribution,
    type ManifestEnvironment,
    type ManifestFile,
    type ManifestInclude,
    type ManifestInfo,
    type ManifestScript,
} from './manifest';
import { sortFileDiagnostics, type FileDiagnostic, type ProjectResult } from './module';
import type { AssemblyReporter } from './progress';
import {
    collectHelpers,
    collectLibraryScripts,
    collectScripts,
    findDuplicateOutputs,
    type ResourceAsset,
    type ResourceHelper,
    type ResourceScript,
    type ScriptOrder,
} from './resource-layout';
import { RESOURCE_MAP_VERSION, type OutputLayout, type ResourceMap } from './resource-map';

import { createDiagnostic } from '@compiler/diagnostics/diagnostic';
import { FILE_START } from '@compiler/environment/environment';

import type { RuntimeHelperName } from '@runtime/helpers';

export { LIBRARY_DIRECTORY, libraryPath, outputPath, type ResourceAsset, type ResourceHelper, type ResourceScript, type ScriptOrder } from './resource-layout';
export {
    LIBRARIES_DIRECTORY,
    libraryDirectory,
    libraryFilePath,
    libraryOutputPath,
    type LibraryDeclaration,
    type LibraryFile,
    type LibraryOrigin,
} from './library';
export { renderEnvironmentTemplate } from './env-template';
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
    resourceName?: string;
    info?: ManifestInfo;
    includes?: readonly ManifestInclude[];
    environment?: ManifestEnvironment;
    scripts?: readonly ManifestScript[];
    files?: readonly ManifestFile[];
    order?: ScriptOrder;
    libraries?: readonly LibraryGroup[];
    natives?: readonly ResourceScript[];
    helpers?: readonly RuntimeHelperName[];
    assets?: readonly ResourceAsset[];
    configuration?: ResourceConfiguration | null;
    environmentFile?: string | null;
    libraryFiles?: readonly LibraryFile[];
    layout?: OutputLayout;
}

export interface ResourceBuild {
    manifest: string;
    scripts: ResourceScript[];
    natives: ResourceScript[];
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

export const ENVIRONMENT_FILE_PLACEHOLDER = '__LUAM_ENV_FILE__';

export const DEFAULT_RESOURCE_ELEMENT = 'meta';

export const EMPTY_INFO: ManifestInfo = { author: null, version: null, description: null };

export const EMPTY_ENVIRONMENT: ManifestEnvironment = { oop: null, minServerVersion: null, minClientVersion: null };

function configurationScript(configuration: ResourceConfiguration | null | undefined, natives: readonly ResourceScript[]): ResourceScript | null {
    if (configuration === null || configuration === undefined || natives.some((native) => native.path === configuration.path)) {
        return null;
    }

    return { path: configuration.path, source: configuration.source, environment: 'shared', content: configuration.content, lines: [] };
}

function withEnvironmentFile(helpers: readonly ResourceHelper[], file: string | null | undefined): ResourceHelper[] {
    return helpers.map((helper) =>
        helper.helper === 'env' ? { ...helper, replacements: { [ENVIRONMENT_FILE_PLACEHOLDER]: file ?? ENVIRONMENT_FILE } } : helper,
    );
}

export interface LibraryGroup {
    name: string;
    group: boolean;
}

function headEntry(src: string, environment: ResourceScript['environment'], group = false): ManifestScript {
    return { src, environment, group };
}

function libraryEntries(libraries: readonly ResourceScript[], groups: readonly LibraryGroup[]): ManifestScript[] {
    const opened = new Set<string>();

    return libraries.map((script) => {
        const grouped = groups.find((entry) => script.path.startsWith(`${LIBRARIES_DIRECTORY}/${libraryDirectory(entry.name)}/`));
        const opens = grouped !== undefined && grouped.group && !opened.has(grouped.name);

        if (grouped !== undefined) {
            opened.add(grouped.name);
        }

        return headEntry(script.path, script.environment, opens);
    });
}

function isDeclared(scripts: readonly ManifestScript[], src: string): boolean {
    return scripts.some((script) => script.src === src);
}

function looseScripts(scripts: readonly ResourceScript[], order: ScriptOrder): ManifestScript[] {
    return scripts.filter((script) => !order.has(script.source)).map((script) => headEntry(script.path, script.environment));
}

function manifestScripts(
    helpers: readonly ResourceHelper[],
    libraries: readonly ManifestScript[],
    configuration: ResourceScript | null,
    authored: readonly ManifestScript[],
    loose: readonly ManifestScript[],
): ManifestScript[] {
    const head = [...helpers.map((helper) => headEntry(helper.path, helper.environment)), ...libraries];
    const settings = configuration === null || isDeclared(authored, configuration.path) ? [] : [headEntry(configuration.path, 'shared')];

    return [...head, ...settings, ...authored, ...loose];
}

function collectContributions(project: ProjectResult): ManifestContribution[] {
    return project.modules.flatMap((module) => module.contributions);
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
            const message = `"${module.path}" contains a top-level return and cannot be included in a bundle. Remove the return or build the tree layout with "--no-bundle" or "build = { details = { bundle = false } }" in .luam.manifest.`;

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

    const order = options.order ?? new Map();
    const helpers = withEnvironmentFile(collectHelpers(project.modules, options.helpers ?? []), options.environmentFile);
    const natives = [...(options.natives ?? [])];
    const scripts = collectScripts(project.modules, order);
    const libraries = collectLibraryScripts(project.modules, options.libraryFiles ?? []);
    const configuration = configurationScript(options.configuration, natives);
    const deployment = configuration === null ? [] : [configuration];
    const assets = [...(options.assets ?? [])];
    const layout = options.layout ?? 'tree';
    const bundles = layout === 'bundle' ? collectBundles(helpers, scripts, libraries) : [];
    const duplicates =
        layout === 'tree'
            ? findDuplicateOutputs([...libraries, ...scripts, ...natives, ...deployment], assets)
            : [...findDuplicateOutputs([...libraries, ...scripts], []), ...findDuplicateOutputs([...natives, ...deployment], assets)];
    const collisions = layout === 'bundle' ? bundleDiagnostics(project, bundles, scripts, assets) : [];
    const diagnostics = sortFileDiagnostics([...project.diagnostics, ...duplicates, ...collisions]);

    if (duplicates.length > 0 || collisions.length > 0) {
        return { build: null, diagnostics };
    }

    onStep?.('assembly');

    const bundled = bundles.map((bundle): ManifestScript => ({ src: bundle.path, environment: bundle.environment, group: false }));
    const verbatim = natives.map((native): ManifestScript => headEntry(native.path, native.environment));
    const authored = layout === 'tree' ? (options.scripts ?? []) : [...verbatim, ...bundled];
    const generated: GeneratedManifest = {
        resource: options.resourceName ?? DEFAULT_RESOURCE_ELEMENT,
        info: options.info ?? EMPTY_INFO,
        includes: options.includes ?? [],
        environment: options.environment ?? EMPTY_ENVIRONMENT,
        scripts: manifestScripts(
            layout === 'tree' ? helpers : [],
            layout === 'tree' ? libraryEntries(libraries, options.libraries ?? []) : [],
            configuration,
            authored,
            layout === 'tree' ? looseScripts(scripts, order) : [],
        ),
        files: options.files ?? [],
        exports: collectContributions(project),
    };
    const manifest = generateManifest(generated);

    onStep?.('manifest');

    const written = [...libraries, ...scripts];
    const map = layout === 'tree' ? treeResourceMap(options.resourceName ?? '', written) : null;

    return { build: { manifest, scripts: layout === 'tree' ? written : [], natives, helpers, configuration, assets, bundles, layout, map }, diagnostics };
}
