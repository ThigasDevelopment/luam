import type { Expression, GenericForStatement, IfClause, NumericForStatement, Statement } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import { checkExpression } from './expressions';
import { checkStatements } from './statements';
import { ANY_TYPE, isNumeric, NUMBER_TYPE, typeToString } from './types';

export function checkBlock(context: CheckContext, body: readonly Statement[]): void {
    context.binder.pushScope();
    checkStatements(context, body);
    context.binder.popScope();
}

export function checkIf(context: CheckContext, clauses: readonly IfClause[], alternate: Statement[] | null): void {
    for (const clause of clauses) {
        checkExpression(context, clause.condition);
        checkBlock(context, clause.body);
    }

    if (alternate !== null) {
        checkBlock(context, alternate);
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

    context.binder.pushScope();
    context.binder.declare({ name: statement.variable.name, type: NUMBER_TYPE, isLocal: true, position: statement.variable.position });
    checkStatements(context, statement.body);
    context.binder.popScope();
}

export function checkGenericFor(context: CheckContext, statement: GenericForStatement): void {
    statement.iterators.forEach((iterator) => checkExpression(context, iterator));
    context.binder.pushScope();

    for (const variable of statement.variables) {
        const declared = variable.annotation === null ? ANY_TYPE : context.resolveAnnotation(variable.annotation);

        context.binder.declare({ name: variable.name, type: declared, isLocal: true, position: variable.position });
    }

    checkStatements(context, statement.body);
    context.binder.popScope();
}
