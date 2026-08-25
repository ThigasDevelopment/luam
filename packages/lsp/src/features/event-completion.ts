import { descriptorToType } from '@compiler/checker/api-types';
import { customEventHandler } from '@compiler/checker/event-calls';
import type { EventInfo } from '@compiler/checker/registry';
import type { FunctionType } from '@compiler/checker/types';
import type { Environment } from '@compiler/environment/environment';
import { eventCallForms, type EventCallForm } from '@mta-types/event-call-semantics';
import { eventEnvironment, eventHandler, eventsFor } from '@mta-types/event-lookup';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { offersSnippet, withHandlerSnippet } from '@lsp/features/event-handler-snippet';
import { handlerText } from '@lsp/features/event-signature';
import { calleeSegments, type CallFrame } from '@lsp/features/source-context';

const CUSTOM_EVENT = /\baddEvent\s*\(\s*['"]([^'"]+)['"]/g;

function nameForms(text: string, frame: CallFrame): EventCallForm[] {
    const { segments, trigger } = calleeSegments(text, frame.open);

    if (trigger !== null || segments.length !== 1) {
        return [];
    }

    return eventCallForms(segments[0] ?? '').filter((form) => form.eventNameArgument === frame.argument);
}

export function isEventArgument(text: string, frame: CallFrame): boolean {
    return nameForms(text, frame).length > 0;
}

export function insideEventHandler(text: string, frames: readonly CallFrame[]): boolean {
    return frames.some((frame) => {
        const { segments, trigger } = calleeSegments(text, frame.open);

        if (!frame.isCall || trigger !== null || segments.length !== 1) {
            return false;
        }

        return eventCallForms(segments[0] ?? '').some((form) => form.callbackArgument === frame.argument);
    });
}

function targetEnvironment(analysis: DocumentAnalysis, forms: readonly EventCallForm[]): Environment {
    const target = forms[0]?.target;

    return target === undefined || target === 'current' ? analysis.environment : target;
}

function reaches(environment: Environment, target: Environment): boolean {
    return environment === 'shared' || target === 'shared' || environment === target;
}

function declaredEvents(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], target: Environment): EventInfo[] {
    const merged = new Map<string, EventInfo>();

    for (const event of [...analysis.declarations.allEvents(), ...others.flatMap((other) => [...other.own.events])]) {
        if (reaches(event.environment, target) && !merged.has(event.name)) {
            merged.set(event.name, event);
        }
    }

    return [...merged.values()];
}

function runtimeEvents(documents: readonly DocumentAnalysis[]): string[] {
    const names = new Set<string>();

    for (const document of documents) {
        for (const match of document.text.matchAll(CUSTOM_EVENT)) {
            const name = match[1];

            if (name !== undefined) {
                names.add(name);
            }
        }
    }

    return [...names].sort();
}

export interface EventItemOptions {
    stringStart: number;
    snippets: boolean;
}

function builtinHandler(name: string, target: Environment): FunctionType | null {
    const environment = eventEnvironment(name) ?? 'shared';
    const descriptor = eventHandler(name, environment === 'shared' ? target : environment);
    const handler = descriptor === null ? null : descriptorToType(descriptor);

    return handler?.kind === 'function' ? handler : null;
}

function builtinItem(name: string, target: Environment): CompletionItem {
    const environment = eventEnvironment(name) ?? 'shared';
    const handler = builtinHandler(name, target);
    const origin = `mta event (${environment})`;
    const detail = handler === null ? origin : `${handlerText(name, handler)} — ${origin}`;

    return { label: name, kind: CompletionItemKind.Event, detail };
}

export function eventItems(
    analysis: DocumentAnalysis,
    others: readonly DocumentAnalysis[],
    frame: CallFrame,
    options: EventItemOptions,
): CompletionItem[] {
    const forms = nameForms(analysis.text, frame);
    const target = targetEnvironment(analysis, forms);
    const scaffold = offersSnippet(forms[0]);
    const items: CompletionItem[] = [];
    const seen = new Set<string>();

    const offer = (item: CompletionItem, handler: FunctionType | null): CompletionItem =>
        scaffold ? withHandlerSnippet(item, { text: analysis.text, starts: analysis.starts, stringStart: options.stringStart, handler, snippets: options.snippets }) : item;

    for (const event of declaredEvents(analysis, others, target)) {
        const handler = customEventHandler(event);

        seen.add(event.name);
        items.push(offer({ label: event.name, kind: CompletionItemKind.Event, detail: `${handlerText(event.name, handler)} — custom event (${event.environment})` }, handler));
    }

    for (const name of runtimeEvents([analysis, ...others])) {
        if (!seen.has(name)) {
            seen.add(name);
            items.push(offer({ label: name, kind: CompletionItemKind.Event, detail: 'custom event' }, null));
        }
    }

    for (const name of eventsFor(target)) {
        if (!seen.has(name)) {
            seen.add(name);
            items.push(offer(builtinItem(name, target), builtinHandler(name, target)));
        }
    }

    return items;
}
