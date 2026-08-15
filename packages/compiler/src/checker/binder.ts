import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

import type { Type } from './types';

export type SymbolOrigin = 'local' | 'parameter';

export interface SymbolInfo {
    name: string;
    type: Type;
    isLocal: boolean;
    position: SourcePosition;
    origin?: SymbolOrigin;
    read?: boolean;
}

export interface TypeAliasInfo {
    type: Type;
    parameters: readonly string[];
}

export class Binder {
    private readonly scopes: Array<Map<string, SymbolInfo>> = [new Map()];

    private readonly aliases = new Map<string, TypeAliasInfo>();

    private readonly discarded: SymbolInfo[] = [];

    private builtins: ReadonlyMap<string, SymbolInfo> = new Map();

    useBuiltins(symbols: ReadonlyMap<string, SymbolInfo>): void {
        this.builtins = symbols;
    }

    pushScope(): void {
        this.scopes.push(new Map());
    }

    popScope(): void {
        if (this.scopes.length <= 1) {
            return;
        }

        for (const symbol of this.scopes.pop()?.values() ?? []) {
            this.discarded.push(symbol);
        }
    }

    declaredSymbols(): SymbolInfo[] {
        return [...this.discarded, ...this.scopes.flatMap((scope) => [...scope.values()])];
    }

    declare(symbol: SymbolInfo): void {
        const scope = this.scopes[this.scopes.length - 1];

        scope?.set(symbol.name, symbol);
    }

    declareGlobal(symbol: SymbolInfo): void {
        const scope = this.scopes[0];

        scope?.set(symbol.name, symbol);
    }

    lookup(name: string): SymbolInfo | null {
        for (let index = this.scopes.length - 1; index >= 0; index -= 1) {
            const symbol = this.scopes[index]?.get(name);

            if (symbol !== undefined) {
                symbol.read = true;

                return symbol;
            }
        }

        return this.builtins.get(name) ?? null;
    }

    isDeclaredInCurrentScope(name: string): boolean {
        return this.scopes[this.scopes.length - 1]?.has(name) ?? false;
    }

    declareAlias(name: string, type: Type, parameters: readonly string[] = []): void {
        this.aliases.set(name, { type, parameters });
    }

    lookupAlias(name: string): TypeAliasInfo | null {
        return this.aliases.get(name) ?? null;
    }

    resolvedAliases(): ReadonlyMap<string, Type> {
        return new Map([...this.aliases].map(([name, info]) => [name, info.type]));
    }
}
