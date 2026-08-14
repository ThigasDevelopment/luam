import type { Expression } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import { optionMemberType } from './union-members';
import { createStringLiteral, createUnion, isAssignable, withoutNil, type Type } from './types';

interface DiscriminantTest {
    name: string;
    property: string;
    value: Type;
}

function discriminantTest(left: Expression, right: Expression): DiscriminantTest | null {
    if (left.kind !== 'member-expression' || left.object.kind !== 'identifier' || right.kind !== 'string-literal') {
        return null;
    }

    return { name: left.object.name, property: left.property, value: createStringLiteral(right.value) };
}

function subjectType(context: CheckContext, name: string): Type | null {
    const type = context.narrowedType(name) ?? context.binder.lookup(name)?.type ?? null;

    return type === null ? null : withoutNil(type);
}

function filterOptions(context: CheckContext, test: DiscriminantTest, keep: boolean): Type | null {
    const subject = subjectType(context, test.name);

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

    return narrowed === null ? null : [test.name, narrowed];
}
