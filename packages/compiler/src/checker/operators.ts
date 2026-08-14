import type { Expression } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import {
    acceptsNil,
    ANY_TYPE,
    BOOLEAN_TYPE,
    createNumberLiteral,
    createUnion,
    isConcatenable,
    isNumeric,
    NIL_TYPE,
    NUMBER_TYPE,
    STRING_TYPE,
    typeToString,
    withoutNil,
    type Type,
} from './types';

const ARITHMETIC: ReadonlySet<string> = new Set(['+', '-', '*', '/', '%', '^']);

const COMPARISON: ReadonlySet<string> = new Set(['<', '>', '<=', '>=']);

function reportInvalidOperand(context: CheckContext, operator: string, operand: Type, expression: Expression): void {
    context.report('check-invalid-operand', `Operator "${operator}" cannot be applied to "${typeToString(operand)}".`, expression.position);
}

export function checkBinary(context: CheckContext, operator: string, left: Type, right: Type, expression: Expression): Type {
    if (operator === 'or') {
        return context.record(expression, createUnion([withoutNil(left), right]));
    }

    if (operator === 'and') {
        return context.record(expression, acceptsNil(left) ? createUnion([right, NIL_TYPE]) : right);
    }

    if (operator === '==' || operator === '~=' || COMPARISON.has(operator)) {
        return context.record(expression, BOOLEAN_TYPE);
    }

    if (operator === '..') {
        [left, right].forEach((operand) => {
            if (!isConcatenable(operand)) {
                reportInvalidOperand(context, operator, operand, expression);
            }
        });

        return context.record(expression, STRING_TYPE);
    }

    if (ARITHMETIC.has(operator)) {
        [left, right].forEach((operand) => {
            if (!isNumeric(operand)) {
                reportInvalidOperand(context, operator, operand, expression);
            }
        });

        return context.record(expression, NUMBER_TYPE);
    }

    return context.record(expression, ANY_TYPE);
}

export function checkUnary(context: CheckContext, operator: string, operand: Type, expression: Expression): Type {
    if (operator === 'not') {
        return context.record(expression, BOOLEAN_TYPE);
    }

    if (operator === '-' && !isNumeric(operand)) {
        reportInvalidOperand(context, operator, operand, expression);
    }

    if (operator === '-' && operand.kind === 'number-literal') {
        return context.record(expression, createNumberLiteral(-operand.value));
    }

    return context.record(expression, NUMBER_TYPE);
}
