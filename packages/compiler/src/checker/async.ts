import type { AwaitExpression, TypeAnnotation } from '@compiler/parser/ast';
import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

import type { CheckContext } from './context';
import type { DeclarationRegistry } from './registry';
import { ANY_TYPE, createFunction, createNamed, createOptional, typeToString, type Type } from './types';

export const PROMISE_TYPE = 'Promise';

export const SLEEP_FUNCTION = 'sleep';

const PROMISE_PARAMETER = 'T';

const ORIGIN: SourcePosition = { line: 0, column: 0, offset: 0 };

const AWAIT_OUTSIDE_MESSAGE =
    '"await" is only valid inside an async function. Declare the function "async function name()", or wait on the promise with ":next(...)".';

const ASYNC_ANNOTATION_MESSAGE =
    'An async function is annotated with the type it resolves to, not with "Promise". Write the inner type and the signature becomes a promise of it.';

const SLEEP_OUTSIDE_MESSAGE =
    '"sleep" suspends a coroutine and there is none here. Declare the function "async function name()", or run the body as a thread pool job.';

export function promiseOf(inner: Type): Type {
    return createNamed(PROMISE_TYPE, [inner]);
}

export function isPromiseType(type: Type): boolean {
    return (type.kind === 'named' || type.kind === 'record') && type.name === PROMISE_TYPE;
}

export function declarePromiseType(declarations: DeclarationRegistry): void {
    const value = createNamed(PROMISE_PARAMETER);
    const onFulfilled = createFunction([value], ANY_TYPE, 1, false, ['value']);
    const onRejected = createFunction([ANY_TYPE], ANY_TYPE, 1, false, ['reason']);
    const chained = promiseOf(ANY_TYPE);

    const next = createFunction([onFulfilled, createOptional(onRejected)], chained, 1, false, ['onFulfilled', 'onRejected']);
    const failure = createFunction([onRejected], chained, 1, false, ['onRejected']);

    declarations.declareInterface({
        name: PROMISE_TYPE,
        isBuiltin: true,
        typeParameters: [PROMISE_PARAMETER],
        typeConstraints: [null],
        superInterfaces: [],
        members: new Map([
            ['next', { name: 'next', type: next, isMethod: true, position: ORIGIN }],
            ['catch', { name: 'catch', type: failure, isMethod: true, position: ORIGIN }],
        ]),
        position: ORIGIN,
    });
}

export function awaitedType(context: CheckContext, operand: Type, expression: AwaitExpression): Type {
    if (!context.inAsyncBody()) {
        context.report('check-await-outside-async', AWAIT_OUTSIDE_MESSAGE, expression.position);

        return ANY_TYPE;
    }

    if (operand.kind === 'any' || operand.kind === 'unknown') {
        return ANY_TYPE;
    }

    if (isPromiseType(operand)) {
        return (operand.kind === 'named' ? operand.typeArguments?.[0] : ANY_TYPE) ?? ANY_TYPE;
    }

    const message = `"await" expects a promise but received "${typeToString(operand)}". Only an async function or "new Promise(...)" produces one.`;

    context.report('check-await-non-promise', message, expression.position);

    return ANY_TYPE;
}

function isPromiseAnnotation(isAsync: boolean, annotation: TypeAnnotation | null): boolean {
    return isAsync && annotation !== null && annotation.kind === 'type-name' && annotation.name === PROMISE_TYPE;
}

export function asyncInnerAnnotation(isAsync: boolean, annotation: TypeAnnotation | null): TypeAnnotation | null {
    return isPromiseAnnotation(isAsync, annotation) ? null : annotation;
}

export function reportAsyncAnnotation(context: CheckContext, isAsync: boolean, annotation: TypeAnnotation | null): void {
    if (!isPromiseAnnotation(isAsync, annotation) || annotation === null) {
        return;
    }

    context.report('check-async-return-annotation', ASYNC_ANNOTATION_MESSAGE, annotation.position);
}

export function reportSleepOutsideAsync(context: CheckContext, name: string, position: SourcePosition): void {
    if (name !== SLEEP_FUNCTION || context.declaredGlobals.has(name) || context.binder.lookup(name)?.isLocal === true || context.suspendable()) {
        return;
    }

    context.warn('check-sleep-outside-async', SLEEP_OUTSIDE_MESSAGE, position);
}
