import { eventHandlerType } from '@compiler/checker/event-calls';
import type { EventInfo } from '@compiler/checker/registry';
import { typeToString, type FunctionType, type Type } from '@compiler/checker/types';
import type { Environment } from '@compiler/environment/environment';
import { eventCallForms, type EventCallForm } from '@mta-types/event-call-semantics';
import { eventEnvironment } from '@mta-types/event-lookup';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { argumentKind, stringLiteralValue } from '@lsp/features/argument-literals';
import { calleeSegments, frameArguments, scanContext, type CallFrame } from '@lsp/features/source-context';

export interface EventCall {
    name: string;
    form: EventCallForm;
    environment: Environment;
    handler: FunctionType;
}

export interface EventNameContext {
    name: string;
    environment: Environment;
    handler: FunctionType | null;
    custom: EventInfo | null;
}

function targetEnvironment(analysis: DocumentAnalysis, form: EventCallForm): Environment {
    return form.target === 'current' ? analysis.environment : form.target;
}

function fixedKindScore(form: EventCallForm, args: readonly string[]): number {
    return (form.fixedArgumentKinds ?? []).filter(({ argument, kind }) => argumentKind(args[argument] ?? '') === kind).length;
}

function callCandidates(analysis: DocumentAnalysis, frame: CallFrame, offset: number): EventCall[] {
    const { segments, trigger } = calleeSegments(analysis.text, frame.open);
    const forms = trigger === null && segments.length === 1 ? eventCallForms(segments[0] ?? '') : [];

    if (forms.length === 0) {
        return [];
    }

    const args = frameArguments(analysis.text, frame.open, offset);
    const found = forms.flatMap((form) => {
        const name = stringLiteralValue(args[form.eventNameArgument] ?? '');
        const environment = targetEnvironment(analysis, form);
        const handler = name === null ? null : eventHandlerType(analysis.declarations, name, environment);

        return name === null || handler === null ? [] : [{ name, form, environment, handler }];
    });

    found.sort((left, right) => {
        const score = fixedKindScore(right.form, args) - fixedKindScore(left.form, args);

        return score !== 0 ? score : (right.form.payloadArgument ?? 0) - (left.form.payloadArgument ?? 0);
    });

    return found;
}

export function eventArgumentType(call: EventCall, argument: number): Type | null {
    if (call.form.callbackArgument === argument) {
        return call.handler;
    }

    const payload = call.form.payloadArgument;

    if (payload === undefined || argument < payload) {
        return null;
    }

    const parameter = call.handler.parameters[argument - payload];

    if (parameter !== undefined) {
        return parameter;
    }

    return call.handler.isVariadic ? (call.handler.variadicType ?? null) : null;
}

export function eventCallAt(analysis: DocumentAnalysis, offset: number, frame: CallFrame | null): EventCall | null {
    if (frame === null || !frame.isCall) {
        return null;
    }

    return callCandidates(analysis, frame, offset)[0] ?? null;
}

export function eventArgumentExpectation(analysis: DocumentAnalysis, offset: number, frame: CallFrame | null): Type | null {
    if (frame === null || !frame.isCall) {
        return null;
    }

    for (const call of callCandidates(analysis, frame, offset)) {
        const type = eventArgumentType(call, frame.argument);

        if (type !== null) {
            return type;
        }
    }

    return null;
}

function stringAround(text: string, start: number): string | null {
    const quote = text[start];

    if (quote !== "'" && quote !== '"') {
        return null;
    }

    const end = text.indexOf(quote, start + 1);

    return end === -1 ? null : text.slice(start + 1, end);
}

function knownEnvironment(analysis: DocumentAnalysis, name: string, target: Environment): Environment {
    if (analysis.declarations.lookupEvent(name) !== null || eventHandlerType(analysis.declarations, name, target) !== null) {
        return target;
    }

    return eventEnvironment(name) ?? target;
}

export function eventNameAt(analysis: DocumentAnalysis, offset: number): EventNameContext | null {
    const context = scanContext(analysis.text, offset);
    const frame = context.frame;

    if (!context.inString || frame === null || !frame.isCall) {
        return null;
    }

    const { segments, trigger } = calleeSegments(analysis.text, frame.open);
    const forms = trigger === null && segments.length === 1 ? eventCallForms(segments[0] ?? '') : [];
    const form = forms.find((candidate) => candidate.eventNameArgument === frame.argument);
    const name = form === undefined ? null : stringAround(analysis.text, context.stringStart);

    if (form === undefined || name === null || name.length === 0) {
        return null;
    }

    const environment = knownEnvironment(analysis, name, targetEnvironment(analysis, form));

    return {
        name,
        environment,
        handler: eventHandlerType(analysis.declarations, name, environment),
        custom: analysis.declarations.lookupEvent(name),
    };
}

export function handlerParameterLabels(handler: FunctionType): string[] {
    const parameters = handler.parameters.map((parameter, index) => {
        const label = handler.parameterNames?.[index] ?? `argument${index + 1}`;
        const optional = index >= handler.minimumArguments || parameter.kind === 'optional';
        const rendered = parameter.kind === 'optional' ? parameter.element : parameter;

        return `${label}${optional ? '?' : ''}: ${typeToString(rendered)}`;
    });

    if (handler.isVariadic) {
        parameters.push(handler.variadicType === undefined ? '...' : `...: ${typeToString(handler.variadicType)}`);
    }

    return parameters;
}

export function handlerText(name: string, handler: FunctionType): string {
    return `event '${name}'(${handlerParameterLabels(handler).join(', ')})`;
}
