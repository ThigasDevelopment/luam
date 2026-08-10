import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Type } from '@compiler/checker/types';

export type SymbolKind =
    | 'local'
    | 'parameter'
    | 'function'
    | 'global'
    | 'class'
    | 'interface'
    | 'enum'
    | 'type-alias'
    | 'field'
    | 'method'
    | 'enum-member';

export type ReferenceKind = 'value' | 'type' | 'member';

export interface SymbolDeclaration {
    name: string;
    kind: SymbolKind;
    position: SourcePosition;
    scopeId: number;
    container: string | null;
    detail: string;
    type: Type | null;
    parameters: readonly string[];
}

export interface SymbolReference {
    name: string;
    kind: ReferenceKind;
    position: SourcePosition;
    scopeId: number;
    container: string | null;
}

export const VALUE_KINDS: ReadonlySet<SymbolKind> = new Set<SymbolKind>(['local', 'parameter', 'function', 'global', 'class', 'enum']);

export const TYPE_KINDS: ReadonlySet<SymbolKind> = new Set<SymbolKind>(['class', 'interface', 'enum', 'type-alias']);

export const MEMBER_KINDS: ReadonlySet<SymbolKind> = new Set<SymbolKind>(['field', 'method', 'enum-member']);

export function endOffset(declaration: SymbolDeclaration | SymbolReference): number {
    return declaration.position.offset + declaration.name.length;
}

export function matchesReferenceKind(declaration: SymbolDeclaration, kind: ReferenceKind): boolean {
    if (kind === 'member') {
        return MEMBER_KINDS.has(declaration.kind);
    }

    if (kind === 'type') {
        return TYPE_KINDS.has(declaration.kind);
    }

    return VALUE_KINDS.has(declaration.kind);
}
