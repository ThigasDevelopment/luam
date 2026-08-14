import type { Expression, Statement } from '@compiler/parser/ast';

import type { CheckContext } from './context';
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

function declaredType(context: CheckContext, name: string): Type | null {
    return context.binder.lookup(name)?.type ?? null;
}

function guardedName(expression: Expression): string | null {
    if (expression.kind !== 'call-expression' || expression.callee.kind !== 'identifier' || expression.callee.name !== GUARD_FUNCTION) {
        return null;
    }

    const [argument] = expression.args;

    return argument !== undefined && argument.kind === 'identifier' ? argument.name : null;
}

function guardFact(left: Expression, right: Expression): [string, Type] | null {
    const name = guardedName(left);
    const value = right.kind === 'string-literal' ? GUARD_TYPES[right.value] : undefined;

    return name === null || value === undefined ? null : [name, value];
}

function nilComparison(left: Expression, right: Expression): string | null {
    if (left.kind === 'identifier' && right.kind === 'nil-literal') {
        return left.name;
    }

    return right.kind === 'identifier' && left.kind === 'nil-literal' ? right.name : null;
}

function present(context: CheckContext, name: string, facts: Map<string, Type>): void {
    const declared = declaredType(context, name);

    if (declared !== null) {
        facts.set(name, withoutNil(declared));
    }
}

function mergeAlternatives(left: ReadonlyMap<string, Type>, right: ReadonlyMap<string, Type>, facts: Map<string, Type>): void {
    for (const [name, type] of left) {
        const other = right.get(name);

        if (other !== undefined) {
            facts.set(name, createUnion([type, other]));
        }
    }
}

function collectFacts(context: CheckContext, expression: Expression, facts: Map<string, Type>): void {
    if (expression.kind === 'group-expression') {
        collectFacts(context, expression.expression, facts);

        return;
    }

    if (expression.kind === 'identifier') {
        present(context, expression.name, facts);

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
        const missing = nilComparison(expression.left, expression.right);

        if (guard !== null) {
            facts.set(guard[0], guard[1]);
        } else if (missing !== null) {
            facts.set(missing, NIL_TYPE);
        }

        return;
    }

    if (expression.operator === '~=') {
        const name = nilComparison(expression.left, expression.right);

        if (name !== null) {
            present(context, name, facts);
        }
    }
}

export function conditionFacts(context: CheckContext, condition: Expression): Map<string, Type> {
    const facts = new Map<string, Type>();

    collectFacts(context, condition, facts);

    return facts;
}

function alwaysExits(body: readonly Statement[]): boolean {
    const last = body[body.length - 1];

    if (last === undefined) {
        return false;
    }

    if (last.kind === 'return-statement' || last.kind === 'break-statement') {
        return true;
    }

    if (last.kind !== 'if-statement' || last.alternate === null) {
        return false;
    }

    return last.clauses.every((clause) => alwaysExits(clause.body)) && alwaysExits(last.alternate);
}

export function guardFacts(context: CheckContext, statement: Statement): Map<string, Type> {
    const [clause] = statement.kind === 'if-statement' ? statement.clauses : [];

    if (statement.kind !== 'if-statement' || statement.alternate !== null || statement.clauses.length !== 1 || clause === undefined) {
        return new Map();
    }

    return alwaysExits(clause.body) ? negatedFacts(context, clause.condition) : new Map();
}

export function negatedFacts(context: CheckContext, condition: Expression): Map<string, Type> {
    const facts = new Map<string, Type>();

    if (condition.kind === 'binary-expression' && condition.operator === 'or') {
        for (const [name, type] of [...negatedFacts(context, condition.left), ...negatedFacts(context, condition.right)]) {
            facts.set(name, type);
        }

        return facts;
    }

    if (condition.kind === 'binary-expression' && condition.operator === '==') {
        const name = nilComparison(condition.left, condition.right);

        if (name !== null) {
            present(context, name, facts);
        }
    }

    if (condition.kind === 'unary-expression' && condition.operator === 'not' && condition.operand.kind === 'identifier') {
        present(context, condition.operand.name, facts);
    }

    return facts;
}
