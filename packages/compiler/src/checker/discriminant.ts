import type { Expression } from '@compiler/parser/ast';

import { pathOf, pathType } from './access-path';
import type { CheckContext } from './context';
import { optionMemberType } from './union-members';
import { createBooleanLiteral, createNumberLiteral, createStringLiteral, createUnion, isAssignable, withoutNil, type Type } from './types';

interface DiscriminantTest {
    path: string;
    subject: Expression;
    property: string;
    value: Type;
}

function literalValue(expression: Expression): Type | null {
    if (expression.kind === 'string-literal') {
        return createStringLiteral(expression.value);
    }

    if (expression.kind === 'boolean-literal') {
        return createBooleanLiteral(expression.value);
    }

    return expression.kind === 'number-literal' ? createNumberLiteral(expression.value) : null;
}

function discriminantTest(left: Expression, right: Expression): DiscriminantTest | null {
    if (left.kind !== 'member-expression') {
        return null;
    }

    const path = pathOf(left.object);
    const value = literalValue(right);

    return path === null || value === null ? null : { path, subject: left.object, property: left.property, value };
}

function subjectType(context: CheckContext, test: DiscriminantTest): Type | null {
    const type = context.narrowedType(test.path) ?? pathType(context, test.subject);

    return type === null ? null : withoutNil(type);
}

function filterOptions(context: CheckContext, test: DiscriminantTest, keep: boolean): Type | null {
    const subject = subjectType(context, test);

    if (subject === null || subject.kind !== 'union') {
        return null;
    }

    const matched: Type[] = [];

    for (const option of subject.options) {
        const member = optionMemberType(context, option, test.property);

        if (member === null) {
            return null;
        }

        if (isAssignable(test.value, member) === keep) {
            matched.push(option);
        }
    }

    return matched.length === 0 || matched.length === subject.options.length ? null : createUnion(matched);
}

export function discriminantFact(context: CheckContext, left: Expression, right: Expression, keep: boolean): [string, Type] | null {
    const test = discriminantTest(left, right) ?? discriminantTest(right, left);

    if (test === null) {
        return null;
    }

    const narrowed = filterOptions(context, test, keep);

    return narrowed === null ? null : [test.path, narrowed];
}
