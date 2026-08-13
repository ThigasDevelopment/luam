import type { Type } from '@compiler/checker/types';

import { booleanValue, numberValue, stringValue, unionOf, type Evaluated } from './manifest-evaluated';
import { isTruthy } from './manifest-value';

export type OperatorOutcome = { evaluated: Evaluated; error: null } | { evaluated: null; error: string };

const ORDERING: readonly string[] = ['<', '<=', '>', '>='];

function isNumber(type: Type): boolean {
    return type.kind === 'number' || type.kind === 'any';
}

function isText(type: Type): boolean {
    return type.kind === 'string' || type.kind === 'string-literal' || type.kind === 'any';
}

function fail(operator: string, expected: string, left: Type, right: Type, describe: (type: Type) => string): OperatorOutcome {
    const culprit = describe(isNumber(left) || isText(left) ? right : left);

    return { evaluated: null, error: `"${operator}" expects ${expected} on both sides but received ${culprit}.` };
}

function arithmetic(operator: string, left: number, right: number): number {
    switch (operator) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '/':
            return left / right;
        case '%':
            return left - Math.floor(left / right) * right;
        default:
            return left ** right;
    }
}

function compare(operator: string, left: number | string, right: number | string): boolean {
    switch (operator) {
        case '<':
            return left < right;
        case '<=':
            return left <= right;
        case '>':
            return left > right;
        default:
            return left >= right;
    }
}

export function applyAnd(left: Evaluated, right: Evaluated): Evaluated {
    const value = isTruthy(left.value) ? right.value : left.value;

    return { value, type: unionOf([left.falsy, right.type]), truthy: right.truthy, falsy: unionOf([left.falsy, right.falsy]) };
}

export function applyOr(left: Evaluated, right: Evaluated): Evaluated {
    const value = isTruthy(left.value) ? left.value : right.value;

    return { value, type: unionOf([left.truthy, right.type]), truthy: unionOf([left.truthy, right.truthy]), falsy: right.falsy };
}

function applyOrdering(operator: string, left: Evaluated, right: Evaluated, describe: (type: Type) => string): OperatorOutcome {
    const numeric = isNumber(left.type) && isNumber(right.type);
    const textual = isText(left.type) && isText(right.type);

    if (!numeric && !textual) {
        return fail(operator, 'two numbers or two strings', left.type, right.type, describe);
    }

    return { evaluated: booleanValue(compare(operator, left.value as number | string, right.value as number | string)), error: null };
}

function applyConcat(left: Evaluated, right: Evaluated, describe: (type: Type) => string): OperatorOutcome {
    const usable = (type: Type): boolean => isText(type) || isNumber(type);

    if (!usable(left.type) || !usable(right.type)) {
        return fail('..', 'a string or a number', left.type, right.type, describe);
    }

    return { evaluated: stringValue(`${left.value as string}${right.value as string}`), error: null };
}

export function applyBinary(operator: string, left: Evaluated, right: Evaluated, describe: (type: Type) => string): OperatorOutcome {
    if (operator === 'and') {
        return { evaluated: applyAnd(left, right), error: null };
    }

    if (operator === 'or') {
        return { evaluated: applyOr(left, right), error: null };
    }

    if (operator === '==' || operator === '~=') {
        const same = left.value === right.value;

        return { evaluated: booleanValue(operator === '==' ? same : !same), error: null };
    }

    if (ORDERING.includes(operator)) {
        return applyOrdering(operator, left, right, describe);
    }

    if (operator === '..') {
        return applyConcat(left, right, describe);
    }

    if (!isNumber(left.type) || !isNumber(right.type)) {
        return fail(operator, 'a number', left.type, right.type, describe);
    }

    return { evaluated: numberValue(arithmetic(operator, left.value as number, right.value as number)), error: null };
}

export function applyUnary(operator: string, operand: Evaluated, describe: (type: Type) => string): OperatorOutcome {
    if (operator === 'not') {
        return { evaluated: booleanValue(!isTruthy(operand.value)), error: null };
    }

    if (operator === '-') {
        if (!isNumber(operand.type)) {
            return { evaluated: null, error: `"-" expects a number but received ${describe(operand.type)}.` };
        }

        return { evaluated: numberValue(-(operand.value as number)), error: null };
    }

    return { evaluated: null, error: `"${operator}" is not available in a manifest.` };
}
