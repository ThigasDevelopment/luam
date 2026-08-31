import type { SourceDirectives } from '@compiler/checker/build-directives';
import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Environment } from '@compiler/environment/environment';
import { typeToString, type Type } from '@compiler/checker/types';

import type { ExportSignature } from './export-abi';

export interface ExportContribution {
    kind: 'export';
    name: string;
    http: boolean;
    side: Environment;
    signature: ExportSignature | null;
    position: SourcePosition;
}

export type ManifestContribution = ExportContribution;

const OCCUPIED_SIDES: Readonly<Record<Environment, readonly Environment[]>> = {
    server: ['server'],
    client: ['client'],
    shared: ['server', 'client'],
};

export function occupiedSides(contribution: ExportContribution): readonly Environment[] {
    return OCCUPIED_SIDES[contribution.side];
}

export function sidesOf(environment: Environment): readonly Environment[] {
    return OCCUPIED_SIDES[environment];
}

export function exportSignature(type: Type | undefined): ExportSignature | null {
    if (type === undefined || type.kind !== 'function') {
        return null;
    }

    const parameters = type.parameters.map((parameter, index) => ({ name: type.parameterNames?.[index] ?? `arg${index + 1}`, type: typeToString(parameter) }));

    return { parameters, minimumArguments: type.minimumArguments, variadic: type.isVariadic, returns: typeToString(type.returnType) };
}

export function toContributions(directives: SourceDirectives, environment: Environment, globals: ReadonlyMap<string, Type>): ManifestContribution[] {
    return directives.exports.map(
        (entry): ManifestContribution => ({
            kind: 'export',
            name: entry.name,
            http: entry.http,
            side: environment,
            signature: exportSignature(globals.get(entry.name)),
            position: entry.position,
        }),
    );
}

export interface ManifestInfo {
    author?: string;
    version?: string;
    description?: string;
}

export interface ManifestOptions {
    oop?: boolean;
    minMtaVersion?: string | null;
    dependencies?: readonly string[];
}

export type ScriptGroup = 'library' | 'libraries' | 'configuration' | 'source';

export interface ManifestScript {
    src: string;
    environment: Environment;
    group: ScriptGroup;
}

export interface ManifestFile {
    src: string;
}

const INDENT = '    ';

const RESOURCE_TYPE = 'script';

const DEFAULT_SIDE: Environment = 'server';

const SIDE_ORDER: Readonly<Record<Environment, number>> = { shared: 0, server: 1, client: 2 };

const SCRIPT_GROUPS: readonly ScriptGroup[] = ['library', 'libraries', 'configuration', 'source'];

const GROUP_COMMENTS: Readonly<Record<ScriptGroup, string>> = {
    library: 'Runtime library',
    libraries: 'Libraries',
    configuration: 'Configuration',
    source: 'Source scripts',
};

const INFO_COMMENT = 'Resource information';

const EXPORT_COMMENT = 'Exported functions';

const ASSET_COMMENT = 'Assets';

const VERSION_COMMENT = 'Minimum MTA version';

const DEPENDENCY_COMMENT = 'Required resources';

const ESCAPES: Readonly<Record<string, string>> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
};

export function escapeXml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

function attribute(name: string, value: string): string {
    return `${name}="${escapeXml(value)}"`;
}

function textElement(name: string, value: string): string {
    return `${INDENT}<${name}>${escapeXml(value)}</${name}>`;
}

function section(text: string, entries: readonly string[]): string[] {
    return entries.length === 0 ? [] : [`${INDENT}<!-- ${text} -->`, ...entries];
}

function infoElement(info: ManifestInfo): string {
    const attributes = info.author === undefined ? [] : [attribute('author', info.author)];

    attributes.push(attribute('type', RESOURCE_TYPE));

    if (info.version !== undefined) {
        attributes.push(attribute('version', info.version));
    }

    if (info.description !== undefined) {
        attributes.push(attribute('description', info.description));
    }

    return `${INDENT}<info ${attributes.join(' ')} />`;
}

function scriptElement(script: ManifestScript): string {
    if (script.environment === DEFAULT_SIDE) {
        return `${INDENT}<script ${attribute('src', script.src)} />`;
    }

    return `${INDENT}<script ${attribute('src', script.src)} ${attribute('type', script.environment)} ${attribute('cache', 'false')} />`;
}

function fileElement(file: ManifestFile): string {
    return `${INDENT}<file ${attribute('src', file.src)} />`;
}

function exportElement(contribution: ExportContribution): string {
    const attributes = [attribute('function', contribution.name), attribute('http', String(contribution.http))];

    if (contribution.side === DEFAULT_SIDE) {
        return `${INDENT}<export ${attributes.join(' ')} />`;
    }

    attributes.splice(1, 0, attribute('type', contribution.side));

    return `${INDENT}<export ${attributes.join(' ')} />`;
}

function includeElement(resource: string): string {
    return `${INDENT}<include ${attribute('resource', resource)} />`;
}

function versionElement(version: string): string {
    return `${INDENT}<min_mta_version ${attribute('server', version)} ${attribute('client', version)} />`;
}

function exportElements(contributions: readonly ManifestContribution[]): string[] {
    return [...contributions]
        .sort((left, right) => SIDE_ORDER[left.side] - SIDE_ORDER[right.side] || left.name.localeCompare(right.name))
        .map(exportElement);
}

function scriptSections(scripts: readonly ManifestScript[]): string[] {
    return SCRIPT_GROUPS.flatMap((group) => section(GROUP_COMMENTS[group], scripts.filter((script) => script.group === group).map(scriptElement)));
}

export function generateManifest(
    info: ManifestInfo,
    scripts: readonly ManifestScript[],
    files: readonly ManifestFile[] = [],
    contributions: readonly ManifestContribution[] = [],
    options: ManifestOptions = {},
): string {
    const version = options.minMtaVersion ?? null;
    const dependencies = [...new Set(options.dependencies ?? [])].sort();
    const lines = [
        '<meta>',
        ...(options.oop === true ? [textElement('oop', 'true')] : []),
        ...section(INFO_COMMENT, [infoElement(info)]),
        ...section(DEPENDENCY_COMMENT, dependencies.map(includeElement)),
        ...scriptSections(scripts),
        ...section(EXPORT_COMMENT, exportElements(contributions)),
        ...section(ASSET_COMMENT, files.map(fileElement)),
        ...section(VERSION_COMMENT, version === null ? [] : [versionElement(version)]),
        '</meta>',
        '',
    ];

    return lines.join('\n');
}
