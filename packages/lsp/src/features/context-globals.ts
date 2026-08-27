import { EVENT_CALL_SEMANTICS } from '@mta-types/event-call-semantics';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';

export const EVENT_CONTEXT_GLOBALS: readonly string[] = ['source', 'client', 'eventName', 'sourceResource', 'sourceResourceRoot'];

const TIMER_CONTEXT_GLOBALS: readonly string[] = ['sourceTimer'];

const SUBSCRIBE_CALLS: readonly string[] = Object.entries(EVENT_CALL_SEMANTICS)
    .filter(([, forms]) => forms.some((form) => form.callbackArgument !== undefined))
    .map(([name]) => name);

const ARGUMENT_TEXT = '(?:[^()\'"]|\'[^\']*\'|"[^"]*"|\\([^()]*\\))*';

const HANDLER_REFERENCE = new RegExp(`\\b(?:${SUBSCRIBE_CALLS.join('|')})\\s*\\(${ARGUMENT_TEXT},\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*\\)`, 'g');

const TIMER_REFERENCE = /\bsetTimer\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*,/g;

function referencedNames(text: string, pattern: RegExp): Set<string> {
    const names = new Set<string>();

    for (const match of text.matchAll(pattern)) {
        const name = match[1];

        if (name !== undefined) {
            names.add(name);
        }
    }

    return names;
}

function insideCallbackBody(analysis: DocumentAnalysis, offset: number, pattern: RegExp): boolean {
    const owner = analysis.index.scopes.enclosingFunction(offset);

    if (owner === null) {
        return false;
    }

    return owner.name === null || referencedNames(analysis.text, pattern).has(owner.name);
}

export function contextGlobalFilter(analysis: DocumentAnalysis, offset: number): (name: string) => boolean {
    let event: boolean | null = null;
    let timer: boolean | null = null;

    return (name: string): boolean => {
        if (EVENT_CONTEXT_GLOBALS.includes(name)) {
            event ??= insideCallbackBody(analysis, offset, HANDLER_REFERENCE);

            return event;
        }

        if (TIMER_CONTEXT_GLOBALS.includes(name)) {
            timer ??= insideCallbackBody(analysis, offset, TIMER_REFERENCE);

            return timer;
        }

        return true;
    };
}
