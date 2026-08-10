import { ELEMENT_TYPE_ALIASES } from '#mta-types/catalog-overrides';

import { emitCatalog } from './catalog-emitter.ts';
import { emitElementTypes, emitEvents, resolveElementTypes } from './catalog-data-emitter.ts';
import { normalize, type NormalizedCatalog } from './catalog-normalizer.ts';
import { parseClasses, parseEvents, parseFunctions, parseVariables } from './declaration-parser.ts';
import { emitDocumentation } from './documentation-emitter.ts';
import { GeneratorError, type GeneratedFile, type ParsedDeclaration } from './generator-model.ts';
import { emitOopSurface } from './oop-emitter.ts';
import { parseOopClasses } from './oop-parser.ts';
import { buildOopSurface, type OopSurfaceResult } from './oop-surface-builder.ts';
import type { MapContext } from './type-mapper.ts';
import { classFiles, eventFile, functionFiles, variableFile } from './upstream-source.ts';

const MINIMUM_DECLARATIONS = 800;

const MINIMUM_OOP_MEMBERS = 400;

export interface GenerationResult {
    files: readonly GeneratedFile[];
    catalog: NormalizedCatalog;
    oop: OopSurfaceResult;
    multiReturns: readonly string[];
    elementTypes: number;
    events: { server: number; client: number };
    documented: number;
}

function declarationsFor(side: 'server' | 'client', context: MapContext, multiReturns: Set<string>): ParsedDeclaration[] {
    const declarations = functionFiles(side).flatMap((file) => parseFunctions(file, context, multiReturns));

    return [...declarations, ...parseVariables(variableFile(side), context)];
}

export function generate(): GenerationResult {
    const serverClasses = classFiles('server');
    const clientClasses = classFiles('client');
    const sources = [...serverClasses, ...clientClasses];
    const classes = sources.flatMap(parseClasses);
    const elementTypes = resolveElementTypes(classes);
    const context: MapContext = {
        elementTypes: new Set(elementTypes.map((entry) => entry.name)),
        aliases: ELEMENT_TYPE_ALIASES,
        typeParameters: new Set(),
    };

    const multiReturns = new Set<string>();
    const server = declarationsFor('server', context, multiReturns);
    const client = declarationsFor('client', context, multiReturns);

    if (server.length + client.length < MINIMUM_DECLARATIONS) {
        throw new GeneratorError('upstream', `parsed only ${server.length + client.length} declarations, the source looks incomplete`);
    }

    const catalog = normalize(server, client);
    const serverEvents = parseEvents(eventFile('server'));
    const clientEvents = parseEvents(eventFile('client'));
    const oop = buildOopSurface(
        [
            ...serverClasses.flatMap((file) => parseOopClasses(file, context, 'server')),
            ...clientClasses.flatMap((file) => parseOopClasses(file, context, 'client')),
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
        ...emitCatalog('server', catalog.server),
        ...emitCatalog('client', catalog.client),
        ...emitDocumentation(documented),
        ...emitOopSurface(oop.classes),
        emitEvents(serverEvents, clientEvents),
        emitElementTypes(elementTypes),
    ];

    return {
        files: files.sort((left, right) => left.path.localeCompare(right.path, 'en')),
        catalog,
        oop,
        multiReturns: [...multiReturns].sort(),
        elementTypes: elementTypes.length,
        events: { server: serverEvents.length, client: clientEvents.length },
        documented: documented.filter((entry) => entry.documentation.summary.length > 0).length,
    };
}
