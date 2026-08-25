import { typeToString, type FunctionType } from '@compiler/checker/types';
import type { EventCallForm } from '@mta-types/event-call-semantics';
import { InsertTextFormat, type CompletionItem, type Range } from 'vscode-languageserver';

import { positionAt } from '@lsp/support/source-text';

const ATTACHED_TO = 'root';

const BODY_STOP = '$0';

export interface SnippetSpan {
    start: number;
    end: number;
}

function closingQuote(text: string, stringStart: number): number {
    const quote = text[stringStart];

    for (let cursor = stringStart + 1; cursor < text.length && text[cursor] !== '\n'; cursor += 1) {
        if (text[cursor] === quote) {
            return cursor;
        }

        cursor += text[cursor] === '\\' ? 1 : 0;
    }

    return -1;
}

export function replaceSpan(text: string, stringStart: number): SnippetSpan | null {
    const quote = closingQuote(text, stringStart);

    if (quote === -1) {
        const line = text.indexOf('\n', stringStart);

        return { start: stringStart + 1, end: line === -1 ? text.length : line };
    }

    let cursor = quote + 1;

    while (text[cursor] === ' ' || text[cursor] === '\t') {
        cursor += 1;
    }

    const next = text[cursor];

    if (next === undefined || next === '\n' || next === '\r') {
        return { start: stringStart + 1, end: quote + 1 };
    }

    if (next !== ')') {
        return null;
    }

    cursor += 1;

    return { start: stringStart + 1, end: text[cursor] === ';' ? cursor + 1 : cursor };
}

function parameterList(handler: FunctionType | null): string {
    if (handler === null) {
        return '';
    }

    const parameters = handler.parameters.map((parameter, index) => {
        const label = handler.parameterNames?.[index] ?? `argument${index + 1}`;
        const optional = index >= handler.minimumArguments || parameter.kind === 'optional';
        const rendered = parameter.kind === 'optional' ? parameter.element : parameter;

        return `${label}${optional ? '?' : ''}: ${typeToString(rendered)}`;
    });

    return [...parameters, ...(handler.isVariadic ? ['...'] : [])].join(', ');
}

export function handlerSnippet(name: string, quote: string, handler: FunctionType | null, body: string): string {
    return [
        `${name}${quote}, ${ATTACHED_TO},`,
        `    function (${parameterList(handler)})`,
        `        ${body}`,
        '    end',
        ');',
    ].join('\n');
}

export function withHandlerSnippet(
    item: CompletionItem,
    options: { text: string; starts: readonly number[]; stringStart: number; handler: FunctionType | null; snippets: boolean },
): CompletionItem {
    const span = replaceSpan(options.text, options.stringStart);

    if (span === null) {
        return item;
    }

    const quote = options.text[options.stringStart] ?? "'";
    const start = positionAt(options.starts, span.start);
    const end = positionAt(options.starts, span.end);
    const range: Range = {
        start: { line: start.line - 1, character: start.column - 1 },
        end: { line: end.line - 1, character: end.column - 1 },
    };

    return {
        ...item,
        filterText: item.label,
        insertTextFormat: options.snippets ? InsertTextFormat.Snippet : InsertTextFormat.PlainText,
        textEdit: { range, newText: handlerSnippet(item.label, quote, options.handler, options.snippets ? BODY_STOP : '') },
    };
}

export function offersSnippet(form: EventCallForm | undefined): boolean {
    return form?.operation === 'subscribe' && form.callbackArgument !== undefined;
}
