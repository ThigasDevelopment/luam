import { descriptorToType } from '@compiler/checker/api-types';
import { customEventHandler } from '@compiler/checker/event-calls';
import type { EventInfo } from '@compiler/checker/registry';
import type { Environment } from '@compiler/environment/environment';
import { eventCallForms, type EventCallForm } from '@mta-types/event-call-semantics';
import { eventEnvironment, eventHandler, eventsFor } from '@mta-types/event-lookup';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
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

function builtinItem(name: string, target: Environment): CompletionItem {
    const environment = eventEnvironment(name) ?? 'shared';
    const descriptor = eventHandler(name, environment === 'shared' ? target : environment);
    const handler = descriptor === null ? null : descriptorToType(descriptor);
    const origin = `mta event (${environment})`;
    const detail = handler === null || handler.kind !== 'function' ? origin : `${handlerText(name, handler)} — ${origin}`;

    return { label: name, kind: CompletionItemKind.Event, detail };
}

export function eventItems(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], frame: CallFrame): CompletionItem[] {
    const target = targetEnvironment(analysis, nameForms(analysis.text, frame));
    const items: CompletionItem[] = [];
    const seen = new Set<string>();

    for (const event of declaredEvents(analysis, others, target)) {
        seen.add(event.name);
        items.push({
            label: event.name,
            kind: CompletionItemKind.Event,
            detail: `${handlerText(event.name, customEventHandler(event))} — custom event (${event.environment})`,
        });
    }

    for (const name of runtimeEvents([analysis, ...others])) {
        if (!seen.has(name)) {
            seen.add(name);
            items.push({ label: name, kind: CompletionItemKind.Event, detail: 'custom event' });
        }
    }

    for (const name of eventsFor(target)) {
        if (!seen.has(name)) {
            seen.add(name);
            items.push(builtinItem(name, target));
        }
    }

    return items;
}
