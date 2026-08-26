import type { Environment } from '@compiler/environment/environment';
import { findDeclaration } from '@mta-types/catalog';

import type { SemanticTokenModifier, SemanticTokenType } from '@lsp/features/semantic-legend';
import type { SymbolDeclaration, SymbolKind } from '@lsp/symbols/symbol';

export interface Classification {
    type: SemanticTokenType;
    modifiers: SemanticTokenModifier[];
}

const TYPE_OF_KIND: Readonly<Record<SymbolKind, SemanticTokenType>> = {
    local: 'variable',
    parameter: 'parameter',
    function: 'function',
    global: 'variable',
    class: 'class',
    interface: 'interface',
    enum: 'enum',
    'type-alias': 'type',
    field: 'property',
    method: 'method',
    'enum-member': 'enumMember',
    event: 'event',
};

const ERASED_KINDS: ReadonlySet<SymbolKind> = new Set<SymbolKind>(['interface', 'type-alias']);

export const PRIMITIVE_TYPES: ReadonlySet<string> = new Set([
    'any',
    'boolean',
    'never',
    'number',
    'string',
    'table',
    'thread',
    'unknown',
    'userdata',
    'void',
]);

export function typeOfKind(kind: SymbolKind): SemanticTokenType {
    return TYPE_OF_KIND[kind];
}

export function declarationClassification(declaration: SymbolDeclaration): Classification {
    const modifiers: SemanticTokenModifier[] = ['declaration'];

    if (ERASED_KINDS.has(declaration.kind)) {
        modifiers.push('erased');
    }

    return { type: typeOfKind(declaration.kind), modifiers };
}

export function typePositionClassification(declaration: SymbolDeclaration | null, name: string): Classification | null {
    if (declaration !== null) {
        return { type: typeOfKind(declaration.kind), modifiers: ['erased'] };
    }

    if (PRIMITIVE_TYPES.has(name)) {
        return { type: 'type', modifiers: ['erased', 'defaultLibrary'] };
    }

    return { type: 'type', modifiers: ['erased'] };
}

function environmentModifiers(environment: Environment): SemanticTokenModifier[] {
    if (environment === 'server') {
        return ['serverOnly'];
    }

    return environment === 'client' ? ['clientOnly'] : [];
}

export function catalogClassification(name: string): Classification | null {
    const declaration = findDeclaration(name);

    if (declaration === null) {
        return null;
    }

    const type: SemanticTokenType = declaration.type.kind === 'function' ? 'function' : 'variable';

    if (declaration.source !== 'mta') {
        return { type, modifiers: ['defaultLibrary'] };
    }

    return { type, modifiers: ['defaultLibrary', 'mtaNative', ...environmentModifiers(declaration.environment)] };
}
