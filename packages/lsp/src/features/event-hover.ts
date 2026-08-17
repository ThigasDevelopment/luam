import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { eventNameAt, handlerText, type EventNameContext } from '@lsp/features/event-signature';

function origin(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], context: EventNameContext): string {
    if (context.custom === null) {
        return `mta event (${context.environment})`;
    }

    const owner = [analysis, ...others].find((document) => document.own.events.some((event) => event.name === context.name));

    if (owner === undefined) {
        return `custom event (${context.custom.environment})`;
    }

    return `custom event declared in ${owner.relative} (${context.custom.environment})`;
}

export function eventHover(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], offset: number): Hover | null {
    const context = eventNameAt(analysis, offset);

    if (context === null || context.handler === null) {
        return null;
    }

    const signature = ['```luam', handlerText(context.name, context.handler), '```'].join('\n');

    return { contents: { kind: 'markdown', value: `${signature}\n\n${origin(analysis, others, context)}` } };
}
