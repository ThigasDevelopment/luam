import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

import type { Type } from './types';

export interface SymbolInfo {
    name: string;
    type: Type;
    isLocal: boolean;
    position: SourcePosition;
}

export class Binder {
    private readonly scopes: Array<Map<string, SymbolInfo>> = [new Map()];

    private readonly aliases = new Map<string, Type>();

    private builtins: ReadonlyMap<string, SymbolInfo> = new Map();

    useBuiltins(symbols: ReadonlyMap<string, SymbolInfo>): void {
        this.builtins = symbols;
    }

    pushScope(): void {
        this.scopes.push(new Map());
    }

    popScope(): void {
        if (this.scopes.length > 1) {
            this.scopes.pop();
        }
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
                return symbol;
            }
        }

        return this.builtins.get(name) ?? null;
    }

    isDeclaredInCurrentScope(name: string): boolean {
        return this.scopes[this.scopes.length - 1]?.has(name) ?? false;
    }

    declareAlias(name: string, type: Type): void {
        this.aliases.set(name, type);
    }

    lookupAlias(name: string): Type | null {
        return this.aliases.get(name) ?? null;
    }
}
