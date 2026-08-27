import type { Expression } from '@compiler/parser/ast';

import { pathOf, pathType } from './access-path';
import type { CheckContext } from './context';
import { discriminantFact } from './discriminant';
import {
    ANY_TYPE,
    BOOLEAN_TYPE,
    createFunction,
    createUnion,
    NIL_TYPE,
    NUMBER_TYPE,
    STRING_TYPE,
    TABLE_TYPE,
    THREAD_TYPE,
    USERDATA_TYPE,
    withoutNil,
    type Type,
} from './types';

const GUARD_FUNCTION = 'type';

const GUARD_TYPES: Readonly<Record<string, Type>> = {
    boolean: BOOLEAN_TYPE,
    function: createFunction([], ANY_TYPE, 0, true),
    nil: NIL_TYPE,
    number: NUMBER_TYPE,
    string: STRING_TYPE,
    table: TABLE_TYPE,
    thread: THREAD_TYPE,
    userdata: USERDATA_TYPE,
};

function guardedPath(expression: Expression): string | null {
    if (expression.kind !== 'call-expression' || expression.callee.kind !== 'identifier' || expression.callee.name !== GUARD_FUNCTION) {
        return null;
    }

    const [argument] = expression.args;

    return argument === undefined ? null : pathOf(argument);
}

function guardFact(left: Expression, right: Expression): [string, Type] | null {
    const path = guardedPath(left);
    const value = right.kind === 'string-literal' ? GUARD_TYPES[right.value] : undefined;

    return path === null || value === undefined ? null : [path, value];
}

function nilComparison(left: Expression, right: Expression): Expression | null {
    if (right.kind === 'nil-literal' && pathOf(left) !== null) {
        return left;
    }

    return left.kind === 'nil-literal' && pathOf(right) !== null ? right : null;
}

function present(context: CheckContext, expression: Expression, facts: Map<string, Type>): void {
    const path = pathOf(expression);
    const declared = path === null ? null : pathType(context, expression);

    if (path !== null && declared !== null) {
        facts.set(path, withoutNil(declared));
    }
}

function missing(expression: Expression, facts: Map<string, Type>): void {
    const path = pathOf(expression);

    if (path !== null) {
        facts.set(path, NIL_TYPE);
    }
}

function mergeAlternatives(left: ReadonlyMap<string, Type>, right: ReadonlyMap<string, Type>, facts: Map<string, Type>): void {
    for (const [path, type] of left) {
        const other = right.get(path);

        if (other !== undefined) {
            facts.set(path, createUnion([type, other]));
        }
    }
}

function applyDiscriminant(context: CheckContext, left: Expression, right: Expression, keep: boolean, facts: Map<string, Type>): void {
    const fact = discriminantFact(context, left, right, keep);

    if (fact !== null) {
        facts.set(fact[0], fact[1]);
    }
}

function collectFacts(context: CheckContext, expression: Expression, facts: Map<string, Type>): void {
    if (expression.kind === 'group-expression') {
        collectFacts(context, expression.expression, facts);

        return;
    }

    if (expression.kind === 'identifier' || expression.kind === 'member-expression') {
        present(context, expression, facts);

        return;
    }

    if (expression.kind !== 'binary-expression') {
        return;
    }

    if (expression.operator === 'and') {
        collectFacts(context, expression.left, facts);
        collectFacts(context, expression.right, facts);

        return;
    }

    if (expression.operator === 'or') {
        mergeAlternatives(conditionFacts(context, expression.left), conditionFacts(context, expression.right), facts);

        return;
    }

    if (expression.operator === '==') {
        const guard = guardFact(expression.left, expression.right) ?? guardFact(expression.right, expression.left);
        const absent = nilComparison(expression.left, expression.right);

        if (guard !== null) {
            facts.set(guard[0], guard[1]);
        } else if (absent !== null) {
            missing(absent, facts);
        } else {
            applyDiscriminant(context, expression.left, expression.right, true, facts);
        }

        return;
    }

    if (expression.operator === '~=') {
        const tested = nilComparison(expression.left, expression.right);

        if (tested !== null) {
            present(context, tested, facts);
        } else {
            applyDiscriminant(context, expression.left, expression.right, false, facts);
        }
    }
}

export function conditionFacts(context: CheckContext, condition: Expression): Map<string, Type> {
    const facts = new Map<string, Type>();

    collectFacts(context, condition, facts);

    return facts;
}

export function negatedFacts(context: CheckContext, condition: Expression): Map<string, Type> {
    const facts = new Map<string, Type>();

    if (condition.kind === 'binary-expression' && condition.operator === 'or') {
        for (const [path, type] of [...negatedFacts(context, condition.left), ...negatedFacts(context, condition.right)]) {
            facts.set(path, type);
        }

        return facts;
    }

    if (condition.kind === 'binary-expression' && condition.operator === '==') {
        const tested = nilComparison(condition.left, condition.right);

        if (tested !== null) {
            present(context, tested, facts);
        } else {
            applyDiscriminant(context, condition.left, condition.right, false, facts);
        }
    }

    if (condition.kind === 'binary-expression' && condition.operator === '~=') {
        applyDiscriminant(context, condition.left, condition.right, true, facts);
    }

    if (condition.kind === 'unary-expression' && condition.operator === 'not') {
        present(context, condition.operand, facts);
    }

    return facts;
}
