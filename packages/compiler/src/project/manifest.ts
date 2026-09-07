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

export interface ManifestAuthor {
    name: string;
    extra: readonly (readonly [string, string])[];
}

export interface ManifestInfo {
    author: ManifestAuthor | null;
    version: string | null;
    description: string | null;
}

export interface ManifestInclude {
    resource: string;
    group: boolean;
}

export interface ManifestEnvironment {
    oop: boolean | null;
    minServerVersion: string | null;
    minClientVersion: string | null;
}

export interface ManifestScript {
    src: string;
    environment: Environment;
    group: boolean;
}

export interface ManifestFile {
    src: string;
    group: boolean;
}

export interface GeneratedManifest {
    resource: string;
    info: ManifestInfo;
    includes: readonly ManifestInclude[];
    environment: ManifestEnvironment;
    scripts: readonly ManifestScript[];
    files: readonly ManifestFile[];
    exports: readonly ManifestContribution[];
}

const INDENT = '    ';

const RESOURCE_TYPE = 'script';

const DEFAULT_SIDE: Environment = 'server';

const SIDE_ORDER: Readonly<Record<Environment, number>> = { shared: 0, server: 1, client: 2 };

const INFO_COMMENT = 'INFO';

const ENVIRONMENT_COMMENT = 'ENVIRONMENT';

const SCRIPT_COMMENT = 'SCRIPTS';

const FILE_COMMENT = 'FILES';

const EXPORT_COMMENT = 'EXPORTS';

const XML_NAME = /^[A-Za-z_][A-Za-z0-9._-]*$/;

const ESCAPES: Readonly<Record<string, string>> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
};

export function isValidElementName(name: string): boolean {
    return XML_NAME.test(name);
}

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

function grouped<T extends { group: boolean }>(entries: readonly T[], render: (entry: T) => string): string[] {
    return entries.flatMap((entry, index) => (entry.group && index > 0 ? ['', render(entry)] : [render(entry)]));
}

function infoElement(info: ManifestInfo): string {
    const attributes = info.author === null ? [] : [attribute('author', info.author.name)];

    attributes.push(attribute('type', RESOURCE_TYPE));

    if (info.version !== null) {
        attributes.push(attribute('version', info.version));
    }

    if (info.description !== null) {
        attributes.push(attribute('description', info.description));
    }

    for (const [name, value] of info.author?.extra ?? []) {
        attributes.push(attribute(name, value));
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

function includeElement(include: ManifestInclude): string {
    return `${INDENT}<include ${attribute('resource', include.resource)} />`;
}

function versionElement(environment: ManifestEnvironment): string[] {
    const attributes: string[] = [];

    if (environment.minServerVersion !== null) {
        attributes.push(attribute('server', environment.minServerVersion));
    }

    if (environment.minClientVersion !== null) {
        attributes.push(attribute('client', environment.minClientVersion));
    }

    return attributes.length === 0 ? [] : [`${INDENT}<min_mta_version ${attributes.join(' ')} />`];
}

function environmentElements(environment: ManifestEnvironment): string[] {
    const oop = environment.oop === null ? [] : [textElement('oop', String(environment.oop))];

    return [...oop, ...versionElement(environment)];
}

function exportElements(contributions: readonly ManifestContribution[]): string[] {
    const sorted = [...contributions].sort((left, right) => SIDE_ORDER[left.side] - SIDE_ORDER[right.side] || left.name.localeCompare(right.name));

    return sorted.flatMap((contribution, index) => {
        const previous = sorted[index - 1];
        const boundary = previous !== undefined && previous.side !== contribution.side;

        return boundary ? ['', exportElement(contribution)] : [exportElement(contribution)];
    });
}

export function generateManifest(manifest: GeneratedManifest): string {
    const lines = [
        `<${manifest.resource}>`,
        ...section(INFO_COMMENT, [infoElement(manifest.info), ...grouped(manifest.includes, includeElement)]),
        ...section(ENVIRONMENT_COMMENT, environmentElements(manifest.environment)),
        ...section(SCRIPT_COMMENT, grouped(manifest.scripts, scriptElement)),
        ...section(FILE_COMMENT, grouped(manifest.files, fileElement)),
        ...section(EXPORT_COMMENT, exportElements(manifest.exports)),
        `</${manifest.resource}>`,
        '',
    ];

    return lines.join('\n');
}
