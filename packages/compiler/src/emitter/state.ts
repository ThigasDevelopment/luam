import { emissionMarker, type EmissionMarker, type SourceLineMapping } from './source-map';

import type { Type } from '@compiler/checker/types';
import type { Expression } from '@compiler/parser/ast';
import type { ClassDeclaration, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';
import type { RuntimeHelperName } from '@runtime/helpers';

export type RuntimeHelper = RuntimeHelperName;

export interface EmitState {
    types: Map<Expression, Type>;
    references: ReadonlySet<string>;
    helpers: Set<RuntimeHelper>;
    indent: number;
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>;
    markers: EmissionMarker[];
    symbol: string | undefined;
    loopWrap: boolean;
}

export const INDENT = '    ';

export function createEmitState(
    types: Map<Expression, Type>,
    references: ReadonlySet<string>,
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>,
): EmitState {
    return { types, references, generatedMembers, helpers: new Set<RuntimeHelper>(), indent: 0, markers: [], symbol: undefined, loopWrap: false };
}

export function requireHelper(state: EmitState, helper: RuntimeHelper | null): void {
    if (helper !== null) {
        state.helpers.add(helper);
    }
}

export function typeOf(state: EmitState, expression: Expression): Type | null {
    return state.types.get(expression) ?? null;
}

export function indentLine(state: EmitState, text: string): string {
    return `${INDENT.repeat(state.indent)}${text}`;
}

export function markSource(state: EmitState, sourceLine: number, symbol = state.symbol): string {
    const marker: EmissionMarker = { sourceLine };

    if (symbol !== undefined) {
        marker.symbol = symbol;
    }

    state.markers.push(marker);

    return emissionMarker(state.markers.length - 1);
}

export function withSymbol<T>(state: EmitState, symbol: string | undefined, action: () => T): T {
    const previous = state.symbol;

    state.symbol = symbol;

    try {
        return action();
    } finally {
        state.symbol = previous;
    }
}

export type { SourceLineMapping };
