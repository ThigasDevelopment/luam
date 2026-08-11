import type { DeclarationRegistry } from '@compiler/checker/registry';
import type { Type } from '@compiler/checker/types';
import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Expression, FunctionExpression } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

import { locateWord, positionAt } from '@lsp/support/source-text';

import { ROOT_SCOPE, ScopeTree } from './scope-tree';
import { matchesReferenceKind, type ReferenceKind, type SymbolDeclaration, type SymbolKind, type SymbolReference } from './symbol';

export interface BlockContext {
    scopeId: number;
    end: number;
    container: string | null;
}

export type FunctionWalker = (state: CollectorState, block: BlockContext, expression: FunctionExpression) => void;

export interface CollectorState {
    text: string;
    starts: number[];
    scopes: ScopeTree;
    declarations: SymbolDeclaration[];
    references: SymbolReference[];
    types: ReadonlyMap<Expression, Type>;
    walkFunction: FunctionWalker;
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>;
    checkerDeclarations: DeclarationRegistry;
}

export interface DeclarationInput {
    name: string;
    kind: SymbolKind;
    position: SourcePosition;
    detail: string;
    container?: string | null;
    type?: Type | null;
    parameters?: readonly string[];
    isSynthetic?: boolean;
}

export function createState(
    text: string,
    starts: number[],
    types: ReadonlyMap<Expression, Type>,
    walkFunction: FunctionWalker,
    checkerDeclarations: DeclarationRegistry,
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]> = new Map(),
): CollectorState {
    return { text, starts, scopes: new ScopeTree(), declarations: [], references: [], types, walkFunction, generatedMembers, checkerDeclarations };
}

export function declareSymbol(state: CollectorState, scopeId: number, input: DeclarationInput): SymbolDeclaration {
    const declaration: SymbolDeclaration = {
        name: input.name,
        kind: input.kind,
        position: input.position,
        scopeId,
        container: input.container ?? null,
        detail: input.detail,
        type: input.type ?? null,
        parameters: input.parameters ?? [],
        isSynthetic: input.isSynthetic ?? false,
    };

    state.declarations.push(declaration);
    state.scopes.declare(scopeId, declaration);

    return declaration;
}

export function addReference(
    state: CollectorState,
    name: string,
    kind: ReferenceKind,
    position: SourcePosition,
    scopeId: number,
    container: string | null = null,
): void {
    state.references.push({ name, kind, position, scopeId, container });
}

export function typeOf(state: CollectorState, expression: Expression): Type | null {
    return state.types.get(expression) ?? null;
}

export function receiverName(state: CollectorState, expression: Expression): string | null {
    const type = typeOf(state, expression);

    return type !== null && type.kind === 'named' ? type.name : null;
}

export function locatePosition(state: CollectorState, from: number, word: string): SourcePosition | null {
    const offset = locateWord(state.text, from, word);

    return offset === null ? null : positionAt(state.starts, offset);
}

export function isGlobalTarget(state: CollectorState, scopeId: number, name: string, offset: number): boolean {
    const resolved = state.scopes.resolve(scopeId, name, offset, (declaration) => matchesReferenceKind(declaration, 'value'));

    return resolved === null;
}

export function declareGlobalTarget(state: CollectorState, name: string, position: SourcePosition, detail: string): void {
    declareSymbol(state, ROOT_SCOPE, { name, kind: 'global', position, detail });
}
