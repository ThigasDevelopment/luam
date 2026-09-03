import { resolveCallExtension, resolvePropertyExtension } from './extensions';

import type { Type } from '@compiler/checker/types';
import type { Expression, Statement } from '@compiler/parser/ast';

export type ExpressionTypes = Map<Expression, Type>;

export type StaticAccess = ReadonlySet<Expression>;

const NO_STATIC_ACCESS: StaticAccess = new Set<Expression>();

export function isPreservableExpression(expression: Expression, types: ExpressionTypes, statics: StaticAccess = NO_STATIC_ACCESS): boolean {
    switch (expression.kind) {
        case 'template-literal':
        case 'new-expression':
        case 'await-expression':
            return false;
        case 'function-expression':
            return !expression.isAsync;
        case 'member-expression':
            return (
                !statics.has(expression) &&
                resolvePropertyExtension(types.get(expression.object) ?? null, expression.property) === null &&
                isPreservableExpression(expression.object, types, statics)
            );
        case 'index-expression':
            return isPreservableExpression(expression.object, types, statics) && isPreservableExpression(expression.index, types, statics);
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

            return isPreservableExpression(expression.callee, types, statics) && expression.args.every((argument) => isPreservableExpression(argument, types, statics));
        case 'table-expression':
            return expression.fields.every(
                (field) => (field.key === null || isPreservableExpression(field.key, types, statics)) && isPreservableExpression(field.value, types, statics),
            );
        case 'binary-expression':
            return isPreservableExpression(expression.left, types, statics) && isPreservableExpression(expression.right, types, statics);
        case 'unary-expression':
            return isPreservableExpression(expression.operand, types, statics);
        case 'group-expression':
            return isPreservableExpression(expression.expression, types, statics);
        default:
            return true;
    }
}

function every(expressions: readonly Expression[], types: ExpressionTypes, statics: StaticAccess): boolean {
    return expressions.every((expression) => isPreservableExpression(expression, types, statics));
}

export function isPreservableStatement(statement: Statement, types: ExpressionTypes, statics: StaticAccess = NO_STATIC_ACCESS): boolean {
    switch (statement.kind) {
        case 'local-statement':
            return every(statement.values, types, statics);
        case 'assignment-statement':
            return statement.operator === '=' && every(statement.targets, types, statics) && every(statement.values, types, statics);
        case 'call-statement':
            return isPreservableExpression(statement.expression, types, statics);
        case 'return-statement':
            return every(statement.values, types, statics);
        case 'while-statement':
        case 'repeat-statement':
            return isPreservableExpression(statement.condition, types, statics);
        case 'if-statement':
            return statement.clauses.every((clause) => isPreservableExpression(clause.condition, types, statics));
        case 'numeric-for-statement':
            return (
                isPreservableExpression(statement.start, types, statics) &&
                isPreservableExpression(statement.limit, types, statics) &&
                (statement.step === null || isPreservableExpression(statement.step, types, statics))
            );
        case 'generic-for-statement':
            return every(statement.iterators, types, statics);
        case 'function-declaration':
            return !statement.isAsync;
        case 'break-statement':
        case 'declare-statement':
        case 'do-statement':
        case 'event-declaration':
        case 'interface-declaration':
        case 'type-alias-statement':
            return true;
        default:
            return false;
    }
}
