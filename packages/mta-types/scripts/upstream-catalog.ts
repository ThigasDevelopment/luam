import { ELEMENT_TYPE_ALIASES } from '#mta-types/catalog-overrides';

import { resolveElementTypes } from './catalog-data-emitter.ts';
import { parseClasses, parseFunctions, parseTypeAliases, parseVariables } from './declaration-parser.ts';
import type { ElementTypeEntry, ParsedDeclaration } from './generator-model.ts';
import type { MapContext } from './type-mapper.ts';
import { classFiles, functionFiles, typeFiles, variableFile, type UpstreamFile } from './upstream-source.ts';

export interface UpstreamParse {
    server: readonly ParsedDeclaration[];
    client: readonly ParsedDeclaration[];
    variables: { server: readonly ParsedDeclaration[]; client: readonly ParsedDeclaration[] };
    elementTypes: readonly ElementTypeEntry[];
    classes: { server: readonly UpstreamFile[]; client: readonly UpstreamFile[] };
    contexts: { server: MapContext; client: MapContext };
    multiReturns: ReadonlySet<string>;
}

export function parseUpstream(): UpstreamParse {
    const serverClasses = classFiles('server');
    const clientClasses = classFiles('client');
    const elementTypes = resolveElementTypes([...serverClasses, ...clientClasses].flatMap(parseClasses));
    const shared: MapContext = {
        elementTypes: new Set(elementTypes.map((entry) => entry.name)),
        aliases: ELEMENT_TYPE_ALIASES,
        typeParameters: new Set(),
    };
    const contexts = {
        server: { ...shared, typeAliases: parseTypeAliases(typeFiles('server')) },
        client: { ...shared, typeAliases: parseTypeAliases(typeFiles('client')) },
    };
    const multiReturns = new Set<string>();
    const functionsFor = (side: 'server' | 'client'): ParsedDeclaration[] =>
        functionFiles(side).flatMap((file) => parseFunctions(file, contexts[side], multiReturns));

    return {
        server: functionsFor('server'),
        client: functionsFor('client'),
        variables: {
            server: parseVariables(variableFile('server'), contexts.server),
            client: parseVariables(variableFile('client'), contexts.client),
        },
        elementTypes,
        classes: { server: serverClasses, client: clientClasses },
        contexts,
        multiReturns,
    };
}
