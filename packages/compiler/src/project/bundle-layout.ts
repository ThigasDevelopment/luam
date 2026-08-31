import type { ResourceHelper, ResourceScript } from './resource-layout';
import { RESOURCE_MAP_VERSION, type ResourceMap, type ResourceMapFile, type ResourceMapSegment } from './resource-map';

import type { Environment } from '@compiler/environment/environment';

export const BUNDLE_DIRECTORY = 'src';

export interface BundleHelperMember {
    kind: 'helper';
    helper: ResourceHelper;
}

export interface BundleModuleMember {
    kind: 'module';
    module: ResourceScript;
}

export type BundleMember = BundleHelperMember | BundleModuleMember;

export interface ResourceBundle {
    path: string;
    environment: Environment;
    members: BundleMember[];
}

export type HelperContentResolver = (helper: ResourceHelper) => string;

export interface MaterializedBundles {
    scripts: ResourceScript[];
    map: ResourceMap;
}

const ENVIRONMENTS: readonly Environment[] = ['shared', 'server', 'client'];

export function bundlePath(environment: Environment): string {
    return `${BUNDLE_DIRECTORY}/${environment}.lua`;
}

export function collectBundles(
    helpers: readonly ResourceHelper[],
    scripts: readonly ResourceScript[],
    pinned: readonly ResourceScript[],
    libraries: readonly ResourceScript[] = [],
): ResourceBundle[] {
    const pinnedPaths = new Set(pinned.map((script) => script.path));

    return ENVIRONMENTS.flatMap((environment): ResourceBundle[] => {
        const environmentHelpers = helpers.filter((helper) => helper.environment === environment).map((helper): BundleMember => ({ kind: 'helper', helper }));
        const orderedModules = [
            ...libraries.filter((script) => script.environment === environment),
            ...pinned.filter((script) => script.environment === environment),
            ...scripts.filter((script) => script.environment === environment && !pinnedPaths.has(script.path)),
        ].map((module): BundleMember => ({ kind: 'module', module }));
        const members = [...environmentHelpers, ...orderedModules];

        return members.length === 0 ? [] : [{ path: bundlePath(environment), environment, members }];
    });
}

function terminated(content: string): string {
    return content.length > 0 && !content.endsWith('\n') ? `${content}\n` : content;
}

function newlineCount(value: string): number {
    return value.match(/\n/g)?.length ?? 0;
}

function contentLineCount(value: string): number {
    return value.length === 0 ? 0 : newlineCount(value) + (value.endsWith('\n') ? 0 : 1);
}

function materializeBundle(bundle: ResourceBundle, resolveHelper: HelperContentResolver): { script: ResourceScript; file: ResourceMapFile } {
    const parts: string[] = [];
    const segments: ResourceMapSegment[] = [];
    let generatedStartLine = 1;

    for (const member of bundle.members) {
        const content = member.kind === 'helper' ? resolveHelper(member.helper) : member.module.content;
        const block = terminated(content);
        const generatedEndLine = generatedStartLine + newlineCount(block) - 1;
        const contentStartLine = generatedStartLine;
        const contentEndLine = contentStartLine + contentLineCount(content) - 1;
        const source = member.kind === 'helper' ? member.helper.file : member.module.source;
        const lines = member.kind === 'helper' ? [] : (member.module.lines ?? []);

        if (contentEndLine >= contentStartLine) {
            segments.push({ kind: member.kind, generatedStartLine: contentStartLine, generatedEndLine: contentEndLine, contentStartLine, source, lines });
        }

        parts.push(block);
        generatedStartLine = generatedEndLine + 1;
    }

    return {
        script: { path: bundle.path, source: bundle.path, environment: bundle.environment, content: parts.join(''), lines: [] },
        file: { path: bundle.path, segments },
    };
}

export function materializeBundles(resource: string, bundles: readonly ResourceBundle[], resolveHelper: HelperContentResolver): MaterializedBundles {
    const materialized = bundles.map((bundle) => materializeBundle(bundle, resolveHelper));

    return {
        scripts: materialized.map((entry) => entry.script),
        map: { version: RESOURCE_MAP_VERSION, resource, layout: 'bundle', files: materialized.map((entry) => entry.file) },
    };
}
