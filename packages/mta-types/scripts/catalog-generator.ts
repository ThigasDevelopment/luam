import { CALLBACK_TYPE_GAPS, CATALOG_OVERRIDES } from '#mta-types/catalog-overrides';

import { emitCatalog } from './catalog-emitter.ts';
import { diffCatalogs, fingerprint, readIndex, type CatalogDiff, type CatalogIndex } from './catalog-fingerprint.ts';
import { emitElementTypes, emitEvents } from './catalog-data-emitter.ts';
import { normalize, type NormalizedCatalog } from './catalog-normalizer.ts';
import { emitDocumentation } from './documentation-emitter.ts';
import { parseEvents } from './event-parser.ts';
import { emitEventSignatures } from './event-signature-emitter.ts';
import { GeneratorError, type CatalogEntry, type GeneratedFile, type ParsedDeclaration } from './generator-model.ts';
import { emitOopSurface } from './oop-emitter.ts';
import { parseOopClasses } from './oop-parser.ts';
import { buildOopSurface, type OopSurfaceResult } from './oop-surface-builder.ts';
import { parseUpstream } from './upstream-catalog.ts';
import { eventFiles } from './upstream-source.ts';
import { wikiCatalogSource, type WikiCatalogSource } from './wiki-catalog-source.ts';

const MINIMUM_DECLARATIONS = 1380;

const MINIMUM_OOP_MEMBERS = 400;

export interface GenerationResult {
    files: readonly GeneratedFile[];
    catalog: NormalizedCatalog;
    oop: OopSurfaceResult;
    multiReturns: readonly string[];
    elementTypes: number;
    events: { server: number; client: number };
    documented: number;
    source: WikiCatalogSource;
    index: CatalogIndex;
    diff: CatalogDiff;
}

function sortedEntries(entries: readonly CatalogEntry[]): CatalogEntry[] {
    return [...entries].sort((left, right) => left.name.localeCompare(right.name, 'en'));
}

function isCallback(descriptor: ParsedDeclaration['type']): boolean {
    if (descriptor.kind === 'function') {
        return true;
    }

    if (descriptor.kind === 'optional') {
        return isCallback(descriptor.element);
    }

    return descriptor.kind === 'union' && descriptor.options.some(isCallback);
}

function auditCallbacks(server: readonly ParsedDeclaration[], client: readonly ParsedDeclaration[], catalog: NormalizedCatalog): void {
    const entries = {
        server: new Map([...catalog.shared, ...catalog.server, ...catalog.serverVariants].map((entry) => [entry.name, entry])),
        client: new Map([...catalog.shared, ...catalog.client, ...catalog.clientVariants].map((entry) => [entry.name, entry])),
    };
    const canonical = new Map([...catalog.shared, ...catalog.server, ...catalog.client].map((entry) => [entry.name, entry]));
    const missing = new Set<string>();

    for (const [environment, declarations] of [['server', server], ['client', client]] as const) {
        for (const declaration of declarations) {
            if (declaration.type.kind !== 'function') {
                continue;
            }

            declaration.type.parameters.forEach((parameter, index) => {
                const emitted = entries[environment].get(declaration.name)?.type;
                const emittedParameter = emitted?.kind === 'function' ? emitted.parameters[index] : undefined;
                const gap = CALLBACK_TYPE_GAPS[declaration.name];
                const isOpaqueGap = gap?.kind === 'opaque' && gap.parameter === index;

                if (isCallback(parameter) && !isOpaqueGap && (emittedParameter === undefined || !isCallback(emittedParameter))) {
                    missing.add(`${environment}:${declaration.name}[${index}]`);
                }
            });
        }
    }

    for (const [name, gap] of Object.entries(CALLBACK_TYPE_GAPS)) {
        const emitted = canonical.get(name)?.type;
        const parameter = emitted?.kind === 'function' ? emitted.parameters[gap.parameter] : undefined;

        const hasExpectedKind = parameter !== undefined && (gap.kind === 'callback' ? isCallback(parameter) : !isCallback(parameter));

        if (CATALOG_OVERRIDES[name]?.type === undefined || !hasExpectedKind) {
            missing.add(`override:${name}[${gap.parameter}]`);
        }
    }

    if (missing.size > 0) {
        throw new GeneratorError('callback audit', `function parameters degraded to any: ${[...missing].sort().join(', ')}`);
    }
}

export function generate(): GenerationResult {
    const upstream = parseUpstream();
    const { server: serverContext, client: clientContext } = upstream.contexts;
    const elementTypes = upstream.elementTypes;
    const source = wikiCatalogSource(serverContext.elementTypes, upstream);

    if (source.unparsed.length > 0) {
        throw new GeneratorError('wiki snapshot', `${source.unparsed.length} pages carry no readable signature: ${source.unparsed.map((entry) => entry.name).join(', ')}`);
    }

    if (source.listed < MINIMUM_DECLARATIONS) {
        throw new GeneratorError('wiki snapshot', `parsed only ${source.listed} declarations, the snapshot looks incomplete`);
    }

    const server = [...source.server, ...upstream.variables.server];
    const client = [...source.client, ...upstream.variables.client];

    const catalog = normalize(server, client);
    auditCallbacks(server, client, catalog);
    const serverEvents = parseEvents(eventFiles('server'), serverContext);
    const clientEvents = parseEvents(eventFiles('client'), clientContext);
    const oop = buildOopSurface(
        [
            ...upstream.classes.server.flatMap((file) => parseOopClasses(file, serverContext, 'server')),
            ...upstream.classes.client.flatMap((file) => parseOopClasses(file, clientContext, 'client')),
        ],
        elementTypes,
        catalog,
    );

    if (oop.methods + oop.properties < MINIMUM_OOP_MEMBERS) {
        throw new GeneratorError('upstream', `resolved only ${oop.methods + oop.properties} OOP members, the source looks incomplete`);
    }

    const documented = [...catalog.shared, ...catalog.server, ...catalog.client];
    const files = [
        ...emitCatalog('shared', catalog.shared),
        ...emitCatalog('server', sortedEntries([...catalog.server, ...catalog.serverVariants])),
        ...emitCatalog('client', sortedEntries([...catalog.client, ...catalog.clientVariants])),
        ...emitDocumentation(documented),
        ...emitOopSurface(oop.classes),
        emitEvents(serverEvents.map((event) => event.name), clientEvents.map((event) => event.name)),
        ...emitEventSignatures(serverEvents, clientEvents),
        emitElementTypes([...elementTypes]),
    ];

    const index = fingerprint(documented);

    return {
        files: files.sort((left, right) => left.path.localeCompare(right.path, 'en')),
        catalog,
        oop,
        source,
        index,
        diff: diffCatalogs(readIndex(), index),
        multiReturns: source.multiReturns,
        elementTypes: elementTypes.length,
        events: { server: serverEvents.length, client: clientEvents.length },
        documented: documented.filter((entry) => entry.documentation.summary.length > 0).length,
    };
}
