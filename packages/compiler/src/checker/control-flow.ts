import type { Expression, GenericForStatement, IfClause, NumericForStatement, Statement } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import { checkExpression } from './expressions';
import { conditionFacts, negatedFacts } from './narrowing';
import { checkStatements } from './statements';
import { ANY_TYPE, isNumeric, NUMBER_TYPE, typeToString, type Type } from './types';

const ITERATOR_FUNCTIONS: ReadonlySet<string> = new Set(['pairs', 'ipairs']);

export function checkBlock(context: CheckContext, body: readonly Statement[]): void {
    context.binder.pushScope();
    checkStatements(context, body);
    context.binder.popScope();
}

function checkNarrowedBlock(context: CheckContext, facts: ReadonlyMap<string, Type>, body: readonly Statement[]): void {
    context.pushNarrowing(facts);
    checkBlock(context, body);
    context.popNarrowing();
}

export function checkIf(context: CheckContext, clauses: readonly IfClause[], alternate: Statement[] | null): void {
    for (const clause of clauses) {
        checkExpression(context, clause.condition);
        checkNarrowedBlock(context, conditionFacts(context, clause.condition), clause.body);
    }

    if (alternate === null) {
        return;
    }

    const [only] = clauses;

    checkNarrowedBlock(context, clauses.length === 1 && only !== undefined ? negatedFacts(context, only.condition) : new Map(), alternate);
}

export function checkNumericFor(context: CheckContext, statement: NumericForStatement): void {
    const bounds = [statement.start, statement.limit, statement.step].filter((value): value is Expression => value !== null);

    for (const bound of bounds) {
        const type = checkExpression(context, bound);

        if (!isNumeric(type)) {
            context.report('check-invalid-operand', `Numeric "for" expects "number" but received "${typeToString(type)}".`, bound.position);
        }
    }

    context.binder.pushScope();
    context.binder.declare({ name: statement.variable.name, type: NUMBER_TYPE, isLocal: true, position: statement.variable.position, origin: 'local' });
    checkStatements(context, statement.body);
    context.binder.popScope();
}

function iteratedTypes(context: CheckContext, iterators: readonly Expression[]): Type[] {
    const [iterator] = iterators;

    if (iterators.length !== 1 || iterator === undefined || iterator.kind !== 'call-expression' || iterator.callee.kind !== 'identifier') {
        return [];
    }

    const [source] = iterator.args;

    if (!ITERATOR_FUNCTIONS.has(iterator.callee.name) || source === undefined) {
        return [];
    }

    const type = context.typeOf(source);

    if (type.kind === 'map') {
        return iterator.callee.name === 'ipairs' ? [NUMBER_TYPE, type.value] : [type.key, type.value];
    }

    return type.kind === 'array' ? [NUMBER_TYPE, type.element] : [];
}

export function checkGenericFor(context: CheckContext, statement: GenericForStatement): void {
    statement.iterators.forEach((iterator) => checkExpression(context, iterator));

    const iterated = iteratedTypes(context, statement.iterators);

    context.binder.pushScope();

    statement.variables.forEach((variable, index) => {
        const inferred = iterated[index] ?? ANY_TYPE;
        const declared = variable.annotation === null ? inferred : context.resolveAnnotation(variable.annotation);

        context.binder.declare({ name: variable.name, type: declared, isLocal: true, position: variable.position, origin: 'local' });
    });

    checkStatements(context, statement.body);
    context.binder.popScope();
}
