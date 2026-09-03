import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { ASYNC_KEYWORD_TEXT } from '@lsp/features/async-keyword-text';
import { CLASS_KEYWORD_TEXT } from '@lsp/features/class-keyword-text';
import { DECLARATION_KEYWORD_TEXT } from '@lsp/features/declaration-keyword-text';
import { LUA_KEYWORD_TEXT } from '@lsp/features/lua-keyword-text';
import { HTTP_HOVER, LUA_VALUE_KEYWORD_TEXT } from '@lsp/features/lua-value-keyword-text';
import { toWordRange } from '@lsp/support/lsp-position';
import { positionAt, wordAt, wordStart } from '@lsp/support/source-text';

const KEYWORD_TEXT: ReadonlyMap<string, string> = new Map([
    ...ASYNC_KEYWORD_TEXT,
    ...CLASS_KEYWORD_TEXT,
    ...DECLARATION_KEYWORD_TEXT,
    ...LUA_KEYWORD_TEXT,
    ...LUA_VALUE_KEYWORD_TEXT,
]);

const EXPORT_HEAD = /\bexport\s+$/;

const STATIC_MODIFIER = 'static';

function isKeywordTokenAt(analysis: DocumentAnalysis, start: number, word: string): boolean {
    return analysis.tokens.some((token) => token.kind === 'keyword' && token.position.offset === start && token.value === word);
}

function isStaticModifierAt(analysis: DocumentAnalysis, start: number): boolean {
    const index = analysis.tokens.findIndex((token) => token.position.offset === start);
    const modifier = analysis.tokens[index];
    const name = analysis.tokens[index + 1];

    if (modifier?.kind !== 'identifier' || modifier.value !== STATIC_MODIFIER || name === undefined) {
        return false;
    }

    return name.kind === 'identifier' && name.position.line === modifier.position.line;
}

function keywordMarkdown(analysis: DocumentAnalysis, start: number, word: string): string | null {
    if (word === 'http') {
        return EXPORT_HEAD.test(analysis.text.slice(0, start)) ? HTTP_HOVER : null;
    }

    const value = KEYWORD_TEXT.get(word);

    if (value === undefined) {
        return null;
    }

    if (word === STATIC_MODIFIER) {
        return isStaticModifierAt(analysis, start) ? value : null;
    }

    return isKeywordTokenAt(analysis, start, word) ? value : null;
}

export function keywordHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    const word = wordAt(analysis.text, offset);

    if (word === null) {
        return null;
    }

    const start = wordStart(analysis.text, offset);
    const before = analysis.text[start - 1];

    if (before === '.' || before === ':') {
        return null;
    }

    const value = keywordMarkdown(analysis, start, word);

    if (value === null) {
        return null;
    }

    return { contents: { kind: 'markdown', value }, range: toWordRange(positionAt(analysis.starts, start), word) };
}
