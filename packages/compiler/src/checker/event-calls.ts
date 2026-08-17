import type { Environment } from '@compiler/environment/environment';
import type { CallExpression, Expression } from '@compiler/parser/ast';
import { eventCallForms, type EventCallForm } from '@mta-types/event-call-semantics';
import { eventHandler } from '@mta-types/event-lookup';

import { descriptorToType } from './api-types';
import type { CheckContext } from './context';
import type { DeclarationRegistry, EventInfo } from './registry';
import { createFunction, VOID_TYPE, type FunctionType, type Type } from './types';

interface EventCallCandidate {
    form: EventCallForm;
    handler: FunctionType;
}

export function customEventHandler(event: EventInfo): FunctionType {
    const parameters = event.parameters.filter((parameter) => !parameter.isVariadic);
    const variadic = event.parameters.find((parameter) => parameter.isVariadic);
    const optional = parameters.findIndex((parameter) => parameter.type.kind === 'optional');

    return createFunction(
        parameters.map((parameter) => parameter.type),
        VOID_TYPE,
        optional === -1 ? parameters.length : optional,
        variadic !== undefined,
        parameters.map((parameter) => parameter.name),
        variadic?.type,
    );
}

export function eventHandlerType(declarations: DeclarationRegistry, name: string, target: Environment): FunctionType | null {
    const custom = declarations.lookupEvent(name);

    if (custom !== null && (custom.environment === 'shared' || custom.environment === target)) {
        return customEventHandler(custom);
    }

    const builtin = eventHandler(name, target);
    const resolved = builtin === null ? null : descriptorToType(builtin);

    return resolved?.kind === 'function' ? resolved : null;
}

function targetEnvironment(context: CheckContext, form: EventCallForm): Environment {
    return form.target === 'current' ? context.environment : form.target;
}

function payloadFits(form: EventCallForm, argumentCount: number, handler: FunctionType): boolean {
    if (form.payloadArgument === undefined) {
        return true;
    }

    const count = argumentCount - form.payloadArgument;

    return count >= handler.minimumArguments && (handler.isVariadic || count <= handler.parameters.length);
}

function fixedKindScore(form: EventCallForm, args: readonly Expression[]): number {
    return (form.fixedArgumentKinds ?? []).filter(({ argument, kind }) => args[argument]?.kind === `${kind}-literal`).length;
}

function candidates(context: CheckContext, expression: CallExpression, forms: readonly EventCallForm[]): EventCallCandidate[] {
    return forms.flatMap((form) => {
        const eventName = expression.args[form.eventNameArgument];

        if (eventName?.kind !== 'string-literal') {
            return [];
        }

        const handler = eventHandlerType(context.declarations, eventName.value, targetEnvironment(context, form));

        return handler === null ? [] : [{ form, handler }];
    });
}

function selectCandidate(context: CheckContext, expression: CallExpression, forms: readonly EventCallForm[]): EventCallCandidate | null {
    const resolved = candidates(context, expression, forms);
    const fitting = resolved.filter(({ form, handler }) => payloadFits(form, expression.args.length, handler));

    if (fitting.length === 0 && resolved.length !== 1) {
        return null;
    }

    const found = fitting.length === 0 ? resolved : fitting;

    found.sort((left, right) => {
        const score = fixedKindScore(right.form, expression.args) - fixedKindScore(left.form, expression.args);

        return score !== 0 ? score : (right.form.payloadArgument ?? 0) - (left.form.payloadArgument ?? 0);
    });

    return found[0] ?? null;
}

function specialize(signature: FunctionType, candidate: EventCallCandidate): FunctionType | null {
    const callback = candidate.form.callbackArgument;

    if (callback !== undefined) {
        const parameters = [...signature.parameters];

        parameters[callback] = candidate.handler;

        return { ...signature, parameters };
    }

    const payload = candidate.form.payloadArgument;

    if (payload === undefined) {
        return null;
    }

    return createFunction(
        [...signature.parameters.slice(0, payload), ...candidate.handler.parameters],
        signature.returnType,
        payload + candidate.handler.minimumArguments,
        candidate.handler.isVariadic,
        undefined,
        candidate.handler.variadicType,
    );
}

export function specializeEventCall(context: CheckContext, expression: CallExpression, signature: Type): FunctionType | null {
    if (signature.kind !== 'function' || expression.method !== null || expression.callee.kind !== 'identifier') {
        return null;
    }

    const forms = eventCallForms(expression.callee.name);
    const candidate = selectCandidate(context, expression, forms);

    return candidate === null ? null : specialize(signature, candidate);
}
