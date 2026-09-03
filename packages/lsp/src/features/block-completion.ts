import { CompletionItemKind, InsertTextFormat, InsertTextMode, type CompletionItem } from 'vscode-languageserver';

import { blockContext, type BlockContext, type BlockFrame } from '@lsp/features/block-context';
import type { CallFrame } from '@lsp/features/source-context';

interface BlockSnippet {
    keyword: string;
    label: string;
    detail: string;
    body: string;
}

const BODY = '    $0';

const DEFAULT_STOP = /\$\{\d+:([^}]*)\}/g;

const EMPTY_STOP = /\$\{\d+\}|\$0/g;

const SCAFFOLDS: readonly BlockSnippet[] = [
    {
        keyword: 'if',
        label: 'if .. then .. end',
        detail: 'if condition then ... end — write a conditional',
        body: ['if ${1:condition} then', BODY, 'end'].join('\n'),
    },
    {
        keyword: 'for',
        label: 'for .. do .. end',
        detail: 'for index = 1, 10 do ... end — write a numeric loop',
        body: ['for ${1:index} = ${2:1}, ${3:10} do', BODY, 'end'].join('\n'),
    },
    {
        keyword: 'for',
        label: 'for .. in .. do .. end',
        detail: 'for key, value in pairs(items) do ... end — write a generic loop',
        body: ['for ${1:key}, ${2:value} in pairs(${3:items}) do', BODY, 'end'].join('\n'),
    },
    {
        keyword: 'while',
        label: 'while .. do .. end',
        detail: 'while condition do ... end — write a conditional loop',
        body: ['while ${1:condition} do', BODY, 'end'].join('\n'),
    },
    {
        keyword: 'repeat',
        label: 'repeat .. until',
        detail: 'repeat ... until condition — write a loop that runs once first',
        body: ['repeat', BODY, 'until ${1:condition}'].join('\n'),
    },
    {
        keyword: 'do',
        label: 'do .. end',
        detail: 'do ... end — open a scope of its own',
        body: ['do', BODY, 'end'].join('\n'),
    },
    {
        keyword: 'function',
        label: 'function .. end',
        detail: 'function name() ... end — declare a function',
        body: ['function ${1:name}(${2})', BODY, 'end'].join('\n'),
    },
];

function endCloser(keyword: string, owner: string): BlockSnippet {
    return {
        keyword,
        label: `${keyword} .. end`,
        detail: `${keyword} ... end — close the ${owner} block`,
        body: [keyword, BODY, 'end'].join('\n'),
    };
}

function untilCloser(): BlockSnippet {
    return {
        keyword: 'until',
        label: 'until condition',
        detail: 'until condition — close the repeat block',
        body: 'until ${1:condition}',
    };
}

function closerFor(frame: BlockFrame): BlockSnippet | null {
    if (frame.keyword === 'repeat') {
        return untilCloser();
    }

    if (!frame.headerOpen) {
        return null;
    }

    if (frame.keyword === 'if') {
        return endCloser('then', 'if');
    }

    return frame.keyword === 'for' || frame.keyword === 'while' ? endCloser('do', frame.keyword) : null;
}

function plainText(body: string): string {
    return body.replace(DEFAULT_STOP, '$1').replace(EMPTY_STOP, '');
}

function blockItem(snippet: BlockSnippet, rank: string, snippets: boolean): CompletionItem {
    return {
        label: snippet.label,
        kind: CompletionItemKind.Snippet,
        detail: snippet.detail,
        filterText: snippet.keyword,
        sortText: `${rank}${snippet.keyword}`,
        insertText: snippets ? snippet.body : plainText(snippet.body),
        insertTextFormat: snippets ? InsertTextFormat.Snippet : InsertTextFormat.PlainText,
        insertTextMode: InsertTextMode.adjustIndentation,
    };
}

function closerItems(context: BlockContext, snippets: boolean): CompletionItem[] {
    const closer = context.frame === null ? null : closerFor(context.frame);

    if (closer === null) {
        return [];
    }

    const item = blockItem(closer, '0', snippets);

    return [context.unbalanced ? { ...item, preselect: true } : item];
}

export interface BlockOptions {
    statementStart: boolean;
    snippets: boolean;
    bracket: CallFrame | null;
}

export function blockItems(text: string, offset: number, options: BlockOptions): CompletionItem[] {
    const context = blockContext(text, offset);

    if (options.bracket !== null && options.bracket.open > (context.frame?.start ?? -1)) {
        return [];
    }

    const closers = closerItems(context, options.snippets);

    if (!options.statementStart) {
        return closers;
    }

    return [...closers, ...SCAFFOLDS.map((scaffold) => blockItem(scaffold, '~', options.snippets))];
}
