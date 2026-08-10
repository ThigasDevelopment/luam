import type { Expression } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import {
    ANY_TYPE,
    BOOLEAN_TYPE,
    createUnion,
    isConcatenable,
    isNumeric,
    NUMBER_TYPE,
    STRING_TYPE,
    typeToString,
    type Type,
} from './types';

const ARITHMETIC: ReadonlySet<string> = new Set(['+', '-', '*', '/', '%', '^']);

const COMPARISON: ReadonlySet<string> = new Set(['<', '>', '<=', '>=']);

function reportInvalidOperand(context: CheckContext, operator: string, operand: Type, expression: Expression): void {
    context.report('check-invalid-operand', `Operator "${operator}" cannot be applied to "${typeToString(operand)}".`, expression.position);
}

export function checkBinary(context: CheckContext, operator: string, left: Type, right: Type, expression: Expression): Type {
    if (operator === 'and' || operator === 'or') {
        return context.record(expression, createUnion([left, right]));
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

    return context.record(expression, NUMBER_TYPE);
}
