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
}

export const INDENT = '    ';

export function createEmitState(
    types: Map<Expression, Type>,
    references: ReadonlySet<string>,
    generatedMembers: ReadonlyMap<ClassDeclaration, ClassMethodDeclaration[]>,
): EmitState {
    return { types, references, generatedMembers, helpers: new Set<RuntimeHelper>(), indent: 0 };
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
