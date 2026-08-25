import { resolveCallExtension, resolvePropertyExtension } from './extensions';

import type { Type } from '@compiler/checker/types';
import type { Expression, Statement } from '@compiler/parser/ast';

export type ExpressionTypes = Map<Expression, Type>;

export function isPreservableExpression(expression: Expression, types: ExpressionTypes): boolean {
    switch (expression.kind) {
        case 'template-literal':
        case 'new-expression':
            return false;
        case 'member-expression':
            return (
                resolvePropertyExtension(types.get(expression.object) ?? null, expression.property) === null &&
                isPreservableExpression(expression.object, types)
            );
        case 'index-expression':
            return isPreservableExpression(expression.object, types) && isPreservableExpression(expression.index, types);
        case 'call-expression':
            if (expression.method === null && expression.callee.kind === 'identifier' && expression.callee.name === 'super') {
                return false;
            }

            if (
                expression.callee.kind === 'member-expression' &&
                resolveCallExtension(types.get(expression.callee.object) ?? null, expression.callee.property) !== null
            ) {
                return false;
            }

            return isPreservableExpression(expression.callee, types) && expression.args.every((argument) => isPreservableExpression(argument, types));
        case 'table-expression':
            return expression.fields.every(
                (field) => (field.key === null || isPreservableExpression(field.key, types)) && isPreservableExpression(field.value, types),
            );
        case 'binary-expression':
            return isPreservableExpression(expression.left, types) && isPreservableExpression(expression.right, types);
        case 'unary-expression':
            return isPreservableExpression(expression.operand, types);
        case 'group-expression':
            return isPreservableExpression(expression.expression, types);
        default:
            return true;
    }
}

function every(expressions: readonly Expression[], types: ExpressionTypes): boolean {
    return expressions.every((expression) => isPreservableExpression(expression, types));
}

export function isPreservableStatement(statement: Statement, types: ExpressionTypes): boolean {
    switch (statement.kind) {
        case 'local-statement':
            return every(statement.values, types);
        case 'assignment-statement':
            return statement.operator === '=' && every(statement.targets, types) && every(statement.values, types);
        case 'call-statement':
            return isPreservableExpression(statement.expression, types);
        case 'return-statement':
            return every(statement.values, types);
        case 'while-statement':
        case 'repeat-statement':
            return isPreservableExpression(statement.condition, types);
        case 'if-statement':
            return statement.clauses.every((clause) => isPreservableExpression(clause.condition, types));
        case 'numeric-for-statement':
            return (
                isPreservableExpression(statement.start, types) &&
                isPreservableExpression(statement.limit, types) &&
                (statement.step === null || isPreservableExpression(statement.step, types))
            );
        case 'generic-for-statement':
            return every(statement.iterators, types);
        case 'break-statement':
        case 'declare-statement':
        case 'do-statement':
        case 'event-declaration':
        case 'function-declaration':
        case 'interface-declaration':
        case 'type-alias-statement':
            return true;
        default:
            return false;
    }
}
