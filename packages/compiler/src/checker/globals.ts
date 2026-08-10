import type { Environment } from '@compiler/environment/environment';
import { globalsFor } from '@mta-types/catalog';

import { descriptorToType } from './api-types';
import type { SymbolInfo } from './binder';

const BUILTIN_POSITION = { line: 0, column: 0, offset: 0 };

const cache = new Map<Environment, ReadonlyMap<string, SymbolInfo>>();

function buildSymbols(environment: Environment): ReadonlyMap<string, SymbolInfo> {
    const symbols = new Map<string, SymbolInfo>();

    for (const declaration of globalsFor(environment)) {
        symbols.set(declaration.name, {
            name: declaration.name,
            type: descriptorToType(declaration.type),
            isLocal: false,
            position: BUILTIN_POSITION,
        });
    }

    return symbols;
}

export function clearBuiltinCache(): void {
    cache.clear();
}

export function builtinSymbols(environment: Environment): ReadonlyMap<string, SymbolInfo> {
    const cached = cache.get(environment);

    if (cached !== undefined) {
        return cached;
    }

    const symbols = buildSymbols(environment);

    cache.set(environment, symbols);

    return symbols;
}
