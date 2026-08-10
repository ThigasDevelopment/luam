import type { Diagnostic as CompilerDiagnostic } from '@compiler/diagnostics/diagnostic';
import type { Range } from 'vscode-languageserver';

import { isIdentifierChar, positionAt } from '@lsp/support/source-text';

const QUOTES: ReadonlySet<string> = new Set(["'", '"', '`']);

function isDigit(char: string | undefined): boolean {
    return char !== undefined && char >= '0' && char <= '9';
}

function isSpace(char: string | undefined): boolean {
    return char === ' ' || char === '\t' || char === '\r' || char === '\n';
}

function wordEnd(text: string, from: number): number {
    let cursor = from;

    while (cursor < text.length && isIdentifierChar(text[cursor])) {
        cursor += 1;
    }

    return cursor;
}

function numberEnd(text: string, from: number): number {
    let cursor = from;

    while (cursor < text.length && (isDigit(text[cursor]) || text[cursor] === '.' || isIdentifierChar(text[cursor]))) {
        cursor += 1;
    }

    return cursor;
}

function stringEnd(text: string, from: number): number {
    const quote = text[from];

    let cursor = from + 1;

    while (cursor < text.length && text[cursor] !== quote && text[cursor] !== '\n') {
        cursor += text[cursor] === '\\' ? 2 : 1;
    }

    return Math.min(cursor + 1, text.length);
}

function tokenEnd(text: string, from: number): number {
    const char = text[from];

    if (char === undefined || isSpace(char)) {
        return from;
    }

    if (isIdentifierChar(char)) {
        return isDigit(char) ? numberEnd(text, from) : wordEnd(text, from);
    }

    return QUOTES.has(char) ? stringEnd(text, from) : from + 1;
}

function lastVisible(text: string, before: number): number {
    let cursor = Math.min(before, text.length);

    while (cursor > 0 && isSpace(text[cursor - 1])) {
        cursor -= 1;
    }

    return cursor;
}

function anchorSpan(text: string, offset: number): { start: number; end: number } {
    const end = lastVisible(text, offset);

    if (end === 0) {
        return { start: 0, end: Math.min(1, text.length) };
    }

    let start = end - 1;

    while (start > 0 && isIdentifierChar(text[start - 1]) && isIdentifierChar(text[start])) {
        start -= 1;
    }

    return { start, end };
}

export function diagnosticSpan(text: string, diagnostic: CompilerDiagnostic): { start: number; end: number } {
    const offset = Math.min(Math.max(diagnostic.position.offset, 0), text.length);
    const declared = diagnostic.end === null ? offset : Math.min(diagnostic.end.offset, text.length);

    if (declared > offset) {
        return { start: offset, end: declared };
    }

    const end = tokenEnd(text, offset);

    return end > offset ? { start: offset, end } : anchorSpan(text, offset);
}

export function diagnosticRange(text: string, starts: readonly number[], diagnostic: CompilerDiagnostic): Range {
    const span = diagnosticSpan(text, diagnostic);
    const start = positionAt(starts, span.start);
    const end = positionAt(starts, span.end);

    return {
        start: { line: start.line - 1, character: start.column - 1 },
        end: { line: end.line - 1, character: end.column - 1 },
    };
}
