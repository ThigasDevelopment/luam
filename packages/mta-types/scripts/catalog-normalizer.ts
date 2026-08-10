import type { ApiEnvironment } from '#mta-types/api-declaration';
import { CATALOG_OVERRIDES, EXCLUDED_APIS } from '#mta-types/catalog-overrides';
import { LUA_GLOBALS } from '#mta-types/lua-standard';
import { LUAM_RUNTIME_GLOBALS } from '#mta-types/luam-runtime';
import { ANY, type TypeDescriptor } from '#mta-types/type-descriptor';

import type { CatalogEntry, ParsedDeclaration } from './generator-model.ts';

export interface NormalizedCatalog {
    shared: readonly CatalogEntry[];
    server: readonly CatalogEntry[];
    client: readonly CatalogEntry[];
    reserved: readonly string[];
}

const RESERVED: ReadonlySet<string> = new Set([...Object.keys(LUA_GLOBALS), ...Object.keys(LUAM_RUNTIME_GLOBALS), ...EXCLUDED_APIS]);

export function mergeDescriptor(left: TypeDescriptor, right: TypeDescriptor): TypeDescriptor {
    if (JSON.stringify(left) === JSON.stringify(right)) {
        return left;
    }

    if (left.kind === 'tuple' && right.kind === 'tuple') {
        if (left.elements.length !== right.elements.length) {
            return ANY;
        }

        return {
            kind: 'tuple',
            elements: left.elements.map((element, index) => mergeDescriptor(element, right.elements[index] ?? ANY)),
        };
    }

    if (left.kind !== 'function' || right.kind !== 'function') {
        return ANY;
    }

    const length = Math.max(left.parameters.length, right.parameters.length);
    const parameters = Array.from({ length }, (_unused, index) => mergeDescriptor(left.parameters[index] ?? ANY, right.parameters[index] ?? ANY));

    return {
        kind: 'function',
        parameters,
        returnType: mergeDescriptor(left.returnType, right.returnType),
        minimumArguments: Math.min(left.minimumArguments, right.minimumArguments),
        isVariadic: left.isVariadic || right.isVariadic,
    };
}

function collapse(declarations: readonly ParsedDeclaration[]): Map<string, ParsedDeclaration> {
    const byName = new Map<string, ParsedDeclaration>();

    for (const declaration of declarations) {
        const existing = byName.get(declaration.name);

        if (existing === undefined) {
            byName.set(declaration.name, declaration);

            continue;
        }

        byName.set(declaration.name, { ...existing, type: mergeDescriptor(existing.type, declaration.type) });
    }

    return byName;
}

function applyOverride(entry: CatalogEntry): CatalogEntry {
    const override = CATALOG_OVERRIDES[entry.name];

    if (override === undefined) {
        return entry;
    }

    return {
        ...entry,
        environment: override.environment ?? entry.environment,
        type: override.type ?? entry.type,
    };
}

function byName(left: CatalogEntry, right: CatalogEntry): number {
    return left.name.localeCompare(right.name, 'en');
}

export function normalize(server: readonly ParsedDeclaration[], client: readonly ParsedDeclaration[]): NormalizedCatalog {
    const serverByName = collapse(server);
    const clientByName = collapse(client);
    const buckets: Record<ApiEnvironment, CatalogEntry[]> = { shared: [], server: [], client: [] };
    const reserved: string[] = [];
    const seen = new Set<string>();

    for (const name of [...serverByName.keys(), ...clientByName.keys()]) {
        if (seen.has(name)) {
            continue;
        }

        seen.add(name);

        if (RESERVED.has(name)) {
            reserved.push(name);

            continue;
        }

        const fromServer = serverByName.get(name);
        const fromClient = clientByName.get(name);
        const source = fromServer ?? fromClient;

        if (source === undefined) {
            continue;
        }

        const isShared = fromServer !== undefined && fromClient !== undefined;
        const environment: ApiEnvironment = isShared ? 'shared' : fromServer !== undefined ? 'server' : 'client';
        const type = isShared && fromClient !== undefined ? mergeDescriptor(source.type, fromClient.type) : source.type;
        const entry = applyOverride({ name, category: source.category, environment, type });

        buckets[entry.environment].push(entry);
    }

    return {
        shared: buckets.shared.sort(byName),
        server: buckets.server.sort(byName),
        client: buckets.client.sort(byName),
        reserved: reserved.sort(),
    };
}
