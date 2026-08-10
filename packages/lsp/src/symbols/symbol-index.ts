import type { Type } from '@compiler/checker/types';
import type { Expression, FunctionExpression, Program } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

import { createState, type BlockContext, type CollectorState } from './collector-state';
import { ROOT_SCOPE, type ScopeTree } from './scope-tree';
import { collectFunctionScope, collectStatements } from './statement-collector';
import { endOffset, matchesReferenceKind, type SymbolDeclaration, type SymbolReference } from './symbol';

function walkFunction(state: CollectorState, block: BlockContext, expression: FunctionExpression): void {
    collectFunctionScope(state, block, {
        start: expression.position.offset,
        end: block.end,
        parameters: expression.parameters,
        body: expression.body,
        selfType: null,
        container: block.container,
    });
}

function containerMatches(declaration: SymbolDeclaration, reference: SymbolReference): boolean {
    return reference.container === null || declaration.container === null || declaration.container === reference.container;
}

export class SymbolIndex {
    readonly scopes: ScopeTree;

    readonly declarations: readonly SymbolDeclaration[];

    readonly references: readonly SymbolReference[];

    constructor(scopes: ScopeTree, declarations: readonly SymbolDeclaration[], references: readonly SymbolReference[]) {
        this.scopes = scopes;
        this.declarations = declarations;
        this.references = references;
    }

    findReferenceAt(offset: number): SymbolReference | null {
        let found: SymbolReference | null = null;

        for (const reference of this.references) {
            const inside = offset >= reference.position.offset && offset <= endOffset(reference);

            if (inside && (found === null || reference.position.offset > found.position.offset)) {
                found = reference;
            }
        }

        return found;
    }

    findDeclarationAt(offset: number): SymbolDeclaration | null {
        let found: SymbolDeclaration | null = null;

        for (const declaration of this.declarations) {
            const inside = offset >= declaration.position.offset && offset <= endOffset(declaration);

            if (inside && (found === null || declaration.position.offset > found.position.offset)) {
                found = declaration;
            }
        }

        return found;
    }

    resolve(reference: SymbolReference): SymbolDeclaration | null {
        const accept = (declaration: SymbolDeclaration): boolean =>
            matchesReferenceKind(declaration, reference.kind) && containerMatches(declaration, reference);

        return this.scopes.resolve(reference.scopeId, reference.name, reference.position.offset, accept);
    }

    referencesTo(declaration: SymbolDeclaration): SymbolReference[] {
        return this.references.filter((reference) => this.resolve(reference) === declaration);
    }

    declarationFor(offset: number): SymbolDeclaration | null {
        const reference = this.findReferenceAt(offset);
        const resolved = reference === null ? null : this.resolve(reference);

        return resolved ?? this.findDeclarationAt(offset);
    }

    visibleAt(offset: number): SymbolDeclaration[] {
        return this.scopes.visible(this.scopes.innermostAt(offset));
    }

    membersOf(container: string): SymbolDeclaration[] {
        return this.declarations.filter((declaration) => declaration.container === container);
    }
}

export function buildSymbolIndex(
    text: string,
    starts: number[],
    program: Program,
    types: ReadonlyMap<Expression, Type>,
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]> = new Map(),
): SymbolIndex {
    const state = createState(text, starts, types, walkFunction, generatedMembers);
    const block: BlockContext = { scopeId: ROOT_SCOPE, end: text.length, container: null };

    collectStatements(state, block, program.body);
    state.scopes.close(ROOT_SCOPE, text.length);

    return new SymbolIndex(state.scopes, state.declarations, state.references);
}
