import type { SymbolDeclaration } from './symbol';

export const ROOT_SCOPE = 0;

export interface ScopeOwner {
    name: string | null;
}

export interface Scope {
    id: number;
    parent: number | null;
    start: number;
    end: number;
    owner: ScopeOwner | null;
    declarations: SymbolDeclaration[];
}

export class ScopeTree {
    private readonly scopes: Scope[] = [{ id: ROOT_SCOPE, parent: null, start: 0, end: Number.MAX_SAFE_INTEGER, owner: null, declarations: [] }];

    open(parent: number, start: number, owner: ScopeOwner | null = null): number {
        const id = this.scopes.length;

        this.scopes.push({ id, parent, start, end: Number.MAX_SAFE_INTEGER, owner, declarations: [] });

        return id;
    }

    close(id: number, end: number): void {
        const scope = this.scopes[id];

        if (scope !== undefined) {
            scope.end = end;
        }
    }

    declare(scopeId: number, declaration: SymbolDeclaration): void {
        this.scopes[scopeId]?.declarations.push(declaration);
    }

    all(): readonly Scope[] {
        return this.scopes;
    }

    chain(scopeId: number): Scope[] {
        const chain: Scope[] = [];

        let current = this.scopes[scopeId];

        while (current !== undefined) {
            chain.push(current);

            current = current.parent === null ? undefined : this.scopes[current.parent];
        }

        return chain;
    }

    innermostAt(offset: number): number {
        let found = ROOT_SCOPE;

        for (const scope of this.scopes) {
            if (offset < scope.start || offset > scope.end) {
                continue;
            }

            const current = this.scopes[found];

            if (current === undefined || scope.start >= current.start) {
                found = scope.id;
            }
        }

        return found;
    }

    resolve(scopeId: number, name: string, offset: number, accept: (declaration: SymbolDeclaration) => boolean): SymbolDeclaration | null {
        const chain = this.chain(scopeId);
        const declared = this.search(chain, name, offset, accept);

        return declared ?? this.search(chain, name, Number.MAX_SAFE_INTEGER, accept);
    }

    enclosingFunction(offset: number): ScopeOwner | null {
        for (const scope of this.chain(this.innermostAt(offset))) {
            if (scope.owner !== null) {
                return scope.owner;
            }
        }

        return null;
    }

    visible(scopeId: number): SymbolDeclaration[] {
        const seen = new Set<string>();
        const visible: SymbolDeclaration[] = [];

        for (const scope of this.chain(scopeId)) {
            for (const declaration of scope.declarations) {
                const key = `${declaration.kind}:${declaration.name}`;

                if (!seen.has(key)) {
                    seen.add(key);
                    visible.push(declaration);
                }
            }
        }

        return visible;
    }

    private search(
        chain: readonly Scope[],
        name: string,
        offset: number,
        accept: (declaration: SymbolDeclaration) => boolean,
    ): SymbolDeclaration | null {
        for (const scope of chain) {
            for (let index = scope.declarations.length - 1; index >= 0; index -= 1) {
                const declaration = scope.declarations[index];

                if (declaration === undefined || declaration.name !== name || declaration.position.offset > offset) {
                    continue;
                }

                if (accept(declaration)) {
                    return declaration;
                }
            }
        }

        return null;
    }
}
