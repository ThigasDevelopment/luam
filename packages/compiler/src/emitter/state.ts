import type { Type } from '@compiler/checker/types';
import type { Expression } from '@compiler/parser/ast';
import type { RuntimeHelperName } from '@runtime/helpers';

export type RuntimeHelper = RuntimeHelperName;

export interface EmitState {
    types: Map<Expression, Type>;
    references: ReadonlySet<string>;
    helpers: Set<RuntimeHelper>;
    indent: number;
}

export const INDENT = '    ';

export function createEmitState(types: Map<Expression, Type>, references: ReadonlySet<string>): EmitState {
    return { types, references, helpers: new Set<RuntimeHelper>(), indent: 0 };
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
