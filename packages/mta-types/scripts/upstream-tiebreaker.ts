import type { TypeDescriptor } from '#mta-types/type-descriptor';

import type { ParsedDeclaration } from './generator-model.ts';

export interface TiebreakerResult {
    declarations: readonly ParsedDeclaration[];
    resolved: readonly string[];
}

const GENERIC_ELEMENT = 'Element';

function isGenericCallback(descriptor: TypeDescriptor): boolean {
    return descriptor.kind === 'function' && descriptor.parameters.length === 0 && descriptor.isVariadic && descriptor.returnType.kind === 'any';
}

function narrows(candidate: TypeDescriptor, current: TypeDescriptor): boolean {
    if (current.kind === 'any') {
        return candidate.kind !== 'any';
    }

    if (current.kind === 'table') {
        return candidate.kind === 'array' || candidate.kind === 'record';
    }

    if (current.kind === 'named' && current.name === GENERIC_ELEMENT) {
        return candidate.kind === 'named' && candidate.name !== GENERIC_ELEMENT;
    }

    return isGenericCallback(current) && candidate.kind === 'function' && !isGenericCallback(candidate);
}

function narrow(wiki: TypeDescriptor, upstream: TypeDescriptor | undefined, path: string, resolved: string[]): TypeDescriptor {
    if (upstream === undefined) {
        return wiki;
    }

    if (narrows(upstream, wiki)) {
        resolved.push(path);

        return upstream;
    }

    if (wiki.kind === 'function' && upstream.kind === 'function') {
        const aligned = wiki.parameters.length === upstream.parameters.length;

        return {
            ...wiki,
            parameters: aligned ? wiki.parameters.map((parameter, index) => narrow(parameter, upstream.parameters[index], `${path}[${index}]`, resolved)) : wiki.parameters,
            returnType: narrow(wiki.returnType, upstream.returnType, `${path}:return`, resolved),
        };
    }

    if (wiki.kind === 'tuple' && upstream.kind === 'tuple' && wiki.elements.length === upstream.elements.length) {
        return { ...wiki, elements: wiki.elements.map((element, index) => narrow(element, upstream.elements[index], `${path}.${index}`, resolved)) };
    }

    return wiki;
}

export function applyTiebreaker(wiki: readonly ParsedDeclaration[], upstream: readonly ParsedDeclaration[]): TiebreakerResult {
    const byName = new Map(upstream.map((declaration) => [declaration.name, declaration]));
    const resolved: string[] = [];

    const declarations = wiki.map((declaration) => ({
        ...declaration,
        type: narrow(declaration.type, byName.get(declaration.name)?.type, declaration.name, resolved),
    }));

    return { declarations, resolved: [...new Set(resolved)].sort() };
}
