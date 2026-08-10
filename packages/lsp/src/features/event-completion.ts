import { eventEnvironment, eventsFor } from '@mta-types/event-lookup';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { calleeSegments, type CallFrame } from '@lsp/features/source-context';

const EVENT_ARGUMENTS: Readonly<Record<string, readonly number[]>> = {
    addEvent: [0],
    addEventHandler: [0],
    removeEventHandler: [0],
    triggerEvent: [0],
    triggerServerEvent: [0],
    triggerLatentServerEvent: [0],
    triggerClientEvent: [0, 1],
    triggerLatentClientEvent: [0, 1],
    cancelLatentEvent: [],
};

const CUSTOM_EVENT = /\baddEvent\s*\(\s*['"]([^'"]+)['"]/g;

export function isEventArgument(text: string, frame: CallFrame): boolean {
    const { segments, trigger } = calleeSegments(text, frame.open);

    if (trigger !== null || segments.length !== 1) {
        return false;
    }

    return EVENT_ARGUMENTS[segments[0] ?? '']?.includes(frame.argument) ?? false;
}

function customEvents(documents: readonly DocumentAnalysis[]): string[] {
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

export function eventItems(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[]): CompletionItem[] {
    const custom = customEvents([analysis, ...others]);
    const declared = new Set(custom);
    const items: CompletionItem[] = custom.map((name) => ({
        label: name,
        kind: CompletionItemKind.Event,
        detail: 'custom event',
    }));

    for (const name of eventsFor(analysis.environment)) {
        if (declared.has(name)) {
            continue;
        }

        items.push({ label: name, kind: CompletionItemKind.Event, detail: `mta event (${eventEnvironment(name) ?? 'shared'})` });
    }

    return items;
}
