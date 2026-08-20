import { findExtension, type NativeExtension } from '@compiler/extensions/native-extensions';
import type { CallExpression, Expression, MemberExpression } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import { isTableLike, typeToString, type Type } from './types';

const EXTENSION_FORM = 'check-extension-form';

const NOT_CALLABLE = 'check-not-callable';

const UNCALLABLE_KINDS: ReadonlySet<Type['kind']> = new Set(['number', 'string', 'boolean', 'array', 'string-literal', 'number-literal', 'boolean-literal']);

export function extensionFor(receiver: Type, property: string): NativeExtension | null {
    const literal = receiver.kind === 'string-literal' ? 'string' : receiver.kind === 'number-literal' ? 'number' : null;
    const kind = literal ?? (receiver.kind === 'string' || receiver.kind === 'number' ? receiver.kind : null);
    const target = kind ?? (isTableLike(receiver) ? 'table' : null);

    return target === null ? null : findExtension(target, property);
}

export function reportExtensionForm(context: CheckContext, expression: MemberExpression, extension: NativeExtension): void {
    const called = context.calledMembers.has(expression);
    const property = extension.property;

    if (extension.style === 'property' && called) {
        const message = `"${property}" is a property extension, so it takes no call. Remove the "()": reading "${property}" already gives the value.`;

        context.report(EXTENSION_FORM, message, expression.position);
    }

    if (extension.style === 'call' && !called) {
        const message = `"${property}" is a call extension, so it needs its arguments. Write "${property}(...)": reading it alone never runs it.`;

        context.report(EXTENSION_FORM, message, expression.position);
    }
}

function calleeName(callee: Expression): string | null {
    if (callee.kind === 'identifier') {
        return callee.name;
    }

    return callee.kind === 'member-expression' ? callee.property : null;
}

function isExtensionCallee(context: CheckContext, callee: Expression): boolean {
    return callee.kind === 'member-expression' && extensionFor(context.typeOf(callee.object), callee.property) !== null;
}

export function reportNotCallable(context: CheckContext, expression: CallExpression, calleeType: Type): void {
    if (!UNCALLABLE_KINDS.has(calleeType.kind) || isExtensionCallee(context, expression.callee)) {
        return;
    }

    const name = calleeName(expression.callee);
    const subject = name === null ? 'This value' : `"${name}"`;
    const message = `${subject} is a "${typeToString(calleeType)}" and cannot be called.`;

    context.report(NOT_CALLABLE, message, expression.position);
}
