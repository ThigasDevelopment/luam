import type { Environment } from '@compiler/environment/environment';

import type { ExportContribution } from './manifest';

export const ABI_VERSION = 1;

export const ABI_EXTENSION = '.abi.json';

const MAX_ABI_BYTES = 262144;

const MAX_EXPORTS = 512;

const MAX_PARAMETERS = 32;

const MAX_TYPE_LENGTH = 512;

const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const RESOURCE_PATTERN = /^[A-Za-z0-9_-]+$/;

const SIDES: ReadonlySet<string> = new Set(['server', 'client', 'shared']);

export interface AbiParameter {
    name: string;
    type: string;
}

export interface ExportSignature {
    parameters: AbiParameter[];
    minimumArguments: number;
    variadic: boolean;
    returns: string;
}

export interface AbiExport {
    name: string;
    side: Environment;
    http: boolean;
    parameters: AbiParameter[];
    minimumArguments: number;
    variadic: boolean;
    returns: string;
}

export interface ResourceAbi {
    abi: number;
    resource: string;
    exports: AbiExport[];
}

export function serializeAbi(abi: ResourceAbi): string {
    const exports = [...abi.exports].sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));

    return `${JSON.stringify({ abi: abi.abi, resource: abi.resource, exports }, null, 4)}\n`;
}

function readString(value: unknown, limit: number): string | null {
    return typeof value === 'string' && value.length > 0 && value.length <= limit ? value : null;
}

function readParameter(value: unknown): AbiParameter | null {
    if (typeof value !== 'object' || value === null) {
        return null;
    }

    const entry = value as Record<string, unknown>;
    const name = readString(entry.name, 64);
    const type = readString(entry.type, MAX_TYPE_LENGTH);

    return name === null || type === null || !NAME_PATTERN.test(name) ? null : { name, type };
}

function readExport(value: unknown): AbiExport | null {
    if (typeof value !== 'object' || value === null) {
        return null;
    }

    const entry = value as Record<string, unknown>;
    const name = readString(entry.name, 128);
    const side = readString(entry.side, 16);
    const returns = readString(entry.returns, MAX_TYPE_LENGTH);
    const parameters = Array.isArray(entry.parameters) ? entry.parameters : null;

    if (name === null || !NAME_PATTERN.test(name) || side === null || !SIDES.has(side) || returns === null || parameters === null) {
        return null;
    }

    if (parameters.length > MAX_PARAMETERS) {
        return null;
    }

    const read = parameters.map(readParameter);

    if (read.some((parameter) => parameter === null)) {
        return null;
    }

    return {
        name,
        side: side as Environment,
        http: entry.http === true,
        parameters: read as AbiParameter[],
        minimumArguments: typeof entry.minimumArguments === 'number' && Number.isInteger(entry.minimumArguments) ? entry.minimumArguments : 0,
        variadic: entry.variadic === true,
        returns,
    };
}

export function parseResourceAbi(text: string): ResourceAbi | null {
    if (text.length > MAX_ABI_BYTES) {
        return null;
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch {
        return null;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return null;
    }

    const document = parsed as Record<string, unknown>;
    const resource = readString(document.resource, 64);
    const entries = Array.isArray(document.exports) ? document.exports : null;

    if (document.abi !== ABI_VERSION || resource === null || !RESOURCE_PATTERN.test(resource) || entries === null || entries.length > MAX_EXPORTS) {
        return null;
    }

    const read = entries.map(readExport);

    if (read.some((entry) => entry === null)) {
        return null;
    }

    return { abi: ABI_VERSION, resource, exports: read as AbiExport[] };
}

export function abiFileName(resource: string): string {
    return `${resource}${ABI_EXTENSION}`;
}

export function lookupAbiExport(contracts: readonly ResourceAbi[], resource: string, name: string): AbiExport | null {
    return contracts.find((entry) => entry.resource === resource)?.exports.find((entry) => entry.name === name) ?? null;
}

export function knowsResource(contracts: readonly ResourceAbi[], resource: string): boolean {
    return contracts.some((entry) => entry.resource === resource);
}

export function buildResourceAbi(resource: string, contributions: readonly ExportContribution[]): ResourceAbi {
    const exports = contributions.map((contribution): AbiExport => {
        const signature = contribution.signature;

        return {
            name: contribution.name,
            side: contribution.side,
            http: contribution.http,
            parameters: signature?.parameters ?? [],
            minimumArguments: signature?.minimumArguments ?? 0,
            variadic: signature?.variadic ?? true,
            returns: signature?.returns ?? 'any',
        };
    });

    return { abi: ABI_VERSION, resource, exports };
}
