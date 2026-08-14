import { FUNCTION_TYPE } from '@compiler/parser/type-annotation';
import { ELEMENT_TYPES } from '@mta-types/generated/element-types';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { scanContext, type CallFrame } from '@lsp/features/source-context';
import { isIdentifierChar } from '@lsp/support/source-text';
import { TYPE_KINDS } from '@lsp/symbols/symbol';

const PRIMITIVES: readonly string[] = ['any', 'boolean', 'nil', 'number', 'string', 'table', 'thread', 'unknown', 'userdata', 'void'];

const FUNCTION_HEAD = /\bfunction\s*[A-Za-z_][A-Za-z0-9_.:]*\s*$|\bfunction\s*$/;

const LOCAL_HEAD = /\blocal\s*$/;

const LOCAL_LINE = /\blocal\b[^=]*$/;

const MEMBER_HEAD = /^\s*$/;

const TYPE_BODY_HEAD = /\b(?:class|interface)\s+[A-Za-z_][A-Za-z0-9_]*[A-Za-z0-9_,\s]*$/;

const ALIAS_HEAD = /\btype\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*<[^>]*>)?\s*=\s*$/;

const ALIAS_BODY_HEAD = /\btype\s+[A-Za-z_][A-Za-z0-9_]*(?:\s*<[^>]*>)?\s*=[^\n]*$/;

const METHOD_HEAD = /(?:^|\n)[ \t]*[A-Za-z_][A-Za-z0-9_]*[ \t]*$/;

function skipSpaces(text: string, from: number): number {
    let cursor = from;

    while (cursor > 0 && (text[cursor - 1] === ' ' || text[cursor - 1] === '\t')) {
        cursor -= 1;
    }

    return cursor;
}

function skipIdentifier(text: string, from: number): number {
    let cursor = from;

    while (cursor > 0 && isIdentifierChar(text[cursor - 1])) {
        cursor -= 1;
    }

    return cursor;
}

function skipMarks(text: string, from: number): number {
    let cursor = from;

    while (text[cursor - 1] === '?' || text[cursor - 1] === ']' || text[cursor - 1] === '[') {
        cursor -= 1;
    }

    return cursor;
}

function skipTypeText(text: string, from: number): number {
    let cursor = skipSpaces(text, from);

    while (text[cursor - 1] === '|' || text[cursor - 1] === '&') {
        const marks = skipMarks(text, skipSpaces(text, cursor - 1));
        const start = skipIdentifier(text, marks);

        if (start === marks) {
            return cursor;
        }

        cursor = skipSpaces(text, start);
    }

    return cursor;
}

function lineHead(text: string, colon: number): string {
    const start = text.lastIndexOf('\n', colon - 1) + 1;

    return text.slice(start, colon);
}

function isTypeBody(text: string, open: number): boolean {
    const head = text.slice(Math.max(0, open - 160), open);

    if (TYPE_BODY_HEAD.test(head) || ALIAS_BODY_HEAD.test(head)) {
        return true;
    }

    return text[open] === '{' && isTypePosition(text, open);
}

function isParameterList(text: string, inner: CallFrame, outer: CallFrame | undefined): boolean {
    const head = text.slice(Math.max(0, inner.open - 80), inner.open);

    if (FUNCTION_HEAD.test(head)) {
        return true;
    }

    return outer !== undefined && isTypeBody(text, outer.open) && METHOD_HEAD.test(head);
}

function isAnnotationColon(text: string, colon: number): boolean {
    let beforeColon = skipSpaces(text, colon);

    if (text[beforeColon - 1] === ')') {
        return true;
    }

    if (text[beforeColon - 1] === '?') {
        beforeColon = skipSpaces(text, beforeColon - 1);
    }

    const nameStart = skipIdentifier(text, beforeColon);

    if (nameStart === beforeColon) {
        return false;
    }

    const cursor = skipSpaces(text, nameStart);
    const previous = text[cursor - 1];
    const head = lineHead(text, cursor);
    const frames = scanContext(text, colon).frames;
    const inner = frames.at(-1);

    if (LOCAL_HEAD.test(head)) {
        return true;
    }

    if (previous === '(' || previous === ',') {
        return inner === undefined ? LOCAL_LINE.test(head) : isParameterList(text, inner, frames.at(-2));
    }

    return MEMBER_HEAD.test(head) && inner !== undefined && isTypeBody(text, inner.open);
}

export function isTypePosition(text: string, offset: number): boolean {
    const wordStart = skipIdentifier(text, offset);
    const cursor = skipTypeText(text, wordStart);

    if (text[cursor - 1] === ':') {
        return isAnnotationColon(text, cursor - 1);
    }

    return ALIAS_HEAD.test(text.slice(Math.max(0, cursor - 120), cursor));
}

export function typeItems(analysis: DocumentAnalysis, offset: number): CompletionItem[] {
    const items: CompletionItem[] = PRIMITIVES.map((label) => ({ label, kind: CompletionItemKind.Keyword, detail: 'primitive type' }));
    const seen = new Set(PRIMITIVES);

    items.push({ label: FUNCTION_TYPE, kind: CompletionItemKind.Keyword, detail: 'function type — fun(string, number): void' });
    seen.add(FUNCTION_TYPE);

    const push = (label: string, kind: CompletionItemKind, detail: string): void => {
        if (seen.has(label)) {
            return;
        }

        seen.add(label);
        items.push({ label, kind, detail });
    };

    for (const declaration of analysis.index.visibleAt(offset)) {
        if (TYPE_KINDS.has(declaration.kind)) {
            push(declaration.name, CompletionItemKind.Class, declaration.detail);
        }
    }

    for (const info of analysis.declarations.allClasses()) {
        push(info.name, CompletionItemKind.Class, `class ${info.name}`);
    }

    for (const info of analysis.declarations.allInterfaces()) {
        push(info.name, CompletionItemKind.Interface, `interface ${info.name}`);
    }

    for (const info of analysis.declarations.allEnums()) {
        push(info.name, CompletionItemKind.Enum, `enum ${info.name}`);
    }

    for (const element of ELEMENT_TYPES) {
        push(element.name, CompletionItemKind.Class, element.parent === null ? 'mta element type' : `mta element type extending ${element.parent}`);
    }

    return items;
}
