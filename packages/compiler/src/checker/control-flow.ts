import type { Expression, GenericForStatement, IfClause, NumericForStatement, RepeatStatement, Statement, WhileStatement } from '@compiler/parser/ast';

import { forgetAssignedPaths } from './access-path';
import type { CheckContext } from './context';
import { checkExpression } from './expressions';
import { applyFacts, cloneFlow, joinFlows, type FlowState } from './flow';
import { conditionFacts, negatedFacts } from './narrowing';
import { checkStatements } from './statements';
import { ANY_TYPE, isNumeric, NUMBER_TYPE, typeToString, type Type } from './types';

const ITERATOR_FUNCTIONS: ReadonlySet<string> = new Set(['pairs', 'ipairs']);

export function checkBlock(context: CheckContext, body: readonly Statement[]): void {
    context.binder.pushScope();
    checkStatements(context, body);

    const declared = context.binder.currentScopeNames();

    context.binder.popScope();

    for (const name of declared) {
        context.forgetNarrowing(name);
    }
}

function branch(context: CheckContext, entry: FlowState, facts: ReadonlyMap<string, Type>, body: readonly Statement[]): FlowState {
    const state = cloneFlow(entry);

    applyFacts(state, facts);
    context.setFlow(state);
    checkBlock(context, body);

    return context.flowState;
}

export function checkIf(context: CheckContext, clauses: readonly IfClause[], alternate: Statement[] | null): void {
    const exits: FlowState[] = [];

    let current = context.flowState;

    for (const clause of clauses) {
        context.setFlow(current);
        checkExpression(context, clause.condition);

        const taken = conditionFacts(context, clause.condition);
        const skipped = cloneFlow(current);

        applyFacts(skipped, negatedFacts(context, clause.condition));
        exits.push(branch(context, current, taken, clause.body));
        current = skipped;
    }

    if (alternate === null) {
        exits.push(current);
    } else {
        context.setFlow(current);
        checkBlock(context, alternate);
        exits.push(context.flowState);
    }

    context.setFlow(joinFlows(exits));
}

function checkLoopBody(context: CheckContext, body: readonly Statement[], facts: ReadonlyMap<string, Type>): void {
    forgetAssignedPaths(context, body);

    const entry = context.flowState;
    const state = cloneFlow(entry);

    applyFacts(state, facts);
    context.setFlow(state);
    checkBlock(context, body);
    context.setFlow(entry);
}

function isTruthyLiteral(condition: Expression): boolean {
    if (condition.kind === 'group-expression') {
        return isTruthyLiteral(condition.expression);
    }

    const literal = condition.kind === 'number-literal' || condition.kind === 'string-literal' || condition.kind === 'template-literal';

    return literal || (condition.kind === 'boolean-literal' && condition.value);
}

function isFalsyLiteral(condition: Expression): boolean {
    if (condition.kind === 'group-expression') {
        return isFalsyLiteral(condition.expression);
    }

    return condition.kind === 'nil-literal' || (condition.kind === 'boolean-literal' && !condition.value);
}

function hasBreak(body: readonly Statement[]): boolean {
    return body.some((statement) => {
        if (statement.kind === 'break-statement') {
            return true;
        }

        if (statement.kind === 'do-statement') {
            return hasBreak(statement.body);
        }

        if (statement.kind === 'if-statement') {
            return statement.clauses.some((clause) => hasBreak(clause.body)) || (statement.alternate !== null && hasBreak(statement.alternate));
        }

        return false;
    });
}

export function checkWhile(context: CheckContext, statement: WhileStatement): void {
    forgetAssignedPaths(context, statement.body);
    checkExpression(context, statement.condition);
    checkLoopBody(context, statement.body, conditionFacts(context, statement.condition));
    context.applyFlowFacts(negatedFacts(context, statement.condition));

    if (isTruthyLiteral(statement.condition) && !hasBreak(statement.body)) {
        context.markUnreachable();
    }
}

export function checkRepeat(context: CheckContext, statement: RepeatStatement): void {
    checkLoopBody(context, statement.body, new Map());
    checkExpression(context, statement.condition);

    if (isFalsyLiteral(statement.condition) && !hasBreak(statement.body)) {
        context.markUnreachable();
    }
}

export function checkNumericFor(context: CheckContext, statement: NumericForStatement): void {
    const bounds = [statement.start, statement.limit, statement.step].filter((value): value is Expression => value !== null);

    for (const bound of bounds) {
        const type = checkExpression(context, bound);

        if (!isNumeric(type)) {
            context.report('check-invalid-operand', `Numeric "for" expects "number" but received "${typeToString(type)}".`, bound.position);
        }
    }

    forgetAssignedPaths(context, statement.body);

    const entry = context.flowState;

    context.setFlow(cloneFlow(entry));
    context.binder.pushScope();
    context.binder.declare({ name: statement.variable.name, type: NUMBER_TYPE, isLocal: true, position: statement.variable.position, origin: 'local' });
    checkStatements(context, statement.body);
    context.binder.popScope();
    context.setFlow(entry);
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

    forgetAssignedPaths(context, statement.body);

    const entry = context.flowState;

    context.setFlow(cloneFlow(entry));
    context.binder.pushScope();

    statement.variables.forEach((variable, index) => {
        const inferred = iterated[index] ?? ANY_TYPE;
        const declared = variable.annotation === null ? inferred : context.resolveAnnotation(variable.annotation);

        context.binder.declare({ name: variable.name, type: declared, isLocal: true, position: variable.position, origin: 'local' });
    });

    checkStatements(context, statement.body);
    context.binder.popScope();
    context.setFlow(entry);
}
