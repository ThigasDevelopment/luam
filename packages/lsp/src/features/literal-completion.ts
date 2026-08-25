import type { Type } from '@compiler/checker/types';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { isIdentifierChar } from '@lsp/support/source-text';

import { valueText } from './api-text';
import { localType } from './argument-expectation';
import { tableLiteralMembers } from './table-literal';

export function stringLiteralValues(type: Type, seen: Set<string> = new Set()): string[] {
    if (type.kind === 'string-literal') {
        return [type.value];
    }

    if (type.kind === 'optional') {
        return stringLiteralValues(type.element, seen);
    }

    if (type.kind !== 'union') {
        return [];
    }

    for (const option of type.options) {
        for (const value of stringLiteralValues(option, seen)) {
            seen.add(value);
        }
    }

    return [...seen];
}

function skipSpaceBack(text: string, from: number): number {
    let index = from;

    while (index >= 0 && (text[index] === ' ' || text[index] === '\t')) {
        index -= 1;
    }

    return index;
}

function identifierBefore(text: string, from: number): string | null {
    const end = skipSpaceBack(text, from);
    let start = end;

    while (start >= 0 && isIdentifierChar(text[start])) {
        start -= 1;
    }

    if (start === end || text[start] === '.' || text[start] === ':') {
        return null;
    }

    return text.slice(start + 1, end + 1);
}

function annotatedName(text: string, assign: number): string | null {
    for (let index = assign - 1; index >= 0 && text[index] !== '\n'; index -= 1) {
        if (text[index] !== ':') {
            continue;
        }

        const marker = text[index - 1] === '?' ? index - 2 : index - 1;

        return identifierBefore(text, marker);
    }

    return null;
}

function assignedName(text: string, stringStart: number): string | null {
    const assign = skipSpaceBack(text, stringStart - 1);

    if (text[assign] !== '=' || text[assign - 1] === '=' || text[assign - 1] === '~' || text[assign - 1] === '<' || text[assign - 1] === '>') {
        return null;
    }

    return identifierBefore(text, assign - 1) ?? annotatedName(text, assign);
}

export function expectedStringType(analysis: DocumentAnalysis, stringStart: number): Type | null {
    const name = assignedName(analysis.text, stringStart);

    if (name === null) {
        return null;
    }

    const member = tableLiteralMembers(analysis, stringStart)?.get(name);

    return member ?? localType(analysis, stringStart, name);
}

export function literalItems(values: readonly string[]): CompletionItem[] {
    return values.map((value) => ({
        label: value,
        kind: CompletionItemKind.Constant,
        detail: `'${value}'`,
        insertText: value,
    }));
}

export function onlyStringLiterals(type: Type): boolean {
    if (type.kind === 'optional') {
        return onlyStringLiterals(type.element);
    }

    if (type.kind === 'string-literal') {
        return true;
    }

    if (type.kind !== 'union') {
        return false;
    }

    const options = type.options.filter((option) => option.kind !== 'nil');

    return options.length > 0 && options.every(onlyStringLiterals);
}

export function quotedLiteralItems(values: readonly string[]): CompletionItem[] {
    return values.map((value) => ({
        label: value,
        kind: CompletionItemKind.Constant,
        detail: `'${value}'`,
        insertText: valueText('string', value),
        sortText: `0${value}`,
    }));
}
