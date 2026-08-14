import type { MemberExpression } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import { ANY_TYPE, createUnion, typeToString, type Type, type UnionType } from './types';

function isShapeOption(context: CheckContext, option: Type): boolean {
    if (option.kind === 'record') {
        return true;
    }

    if (option.kind !== 'named') {
        return false;
    }

    return context.declarations.lookupInterface(option.name) !== null || context.declarations.lookupClass(option.name) !== null;
}

function memberOf(context: CheckContext, option: Type, property: string): Type | null {
    if (option.kind === 'record') {
        return option.members.get(property) ?? null;
    }

    return option.kind === 'named' ? (context.declarations.lookupMember(option.name, property)?.type ?? null) : null;
}

export function optionMemberType(context: CheckContext, option: Type, property: string): Type | null {
    return isShapeOption(context, option) ? memberOf(context, option, property) : null;
}

export function resolveUnionMember(context: CheckContext, type: UnionType, expression: MemberExpression): Type | null {
    if (!type.options.every((option) => isShapeOption(context, option))) {
        return null;
    }

    const resolved: Type[] = [];
    const missing: string[] = [];

    for (const option of type.options) {
        const member = memberOf(context, option, expression.property);

        if (member === null) {
            missing.push(`"${typeToString(option)}"`);
        } else {
            resolved.push(member);
        }
    }

    if (missing.length === 0) {
        return createUnion(resolved);
    }

    const message = `"${expression.property}" is not a key of every member of "${typeToString(type)}". It is missing from ${missing.join(', ')}.`;

    context.report('check-unknown-union-key', message, expression.position);

    return ANY_TYPE;
}
