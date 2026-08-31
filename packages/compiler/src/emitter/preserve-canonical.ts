import { emit } from './emitter';
import type { HybridSourceEdit } from './hybrid-source-map';
import { blankSpan } from './preserve-comments';
import type { PreserveInput } from './preserve-input';

import type { Statement } from '@compiler/parser/ast';
import type { SourceSpan } from '@compiler/parser/source-metadata';

const TRAILING_SEMICOLON = /^[ \t]*;/;

function lineCount(text: string): number {
    return text.split('\n').length;
}

function indentOf(source: string, start: number): string {
    const prefix = source.slice(source.lastIndexOf('\n', start - 1) + 1, start);

    return /^[ \t]*$/.test(prefix) ? prefix : '';
}

function reindent(code: string, indent: string): string {
    if (indent.length === 0) {
        return code;
    }

    return code
        .split('\n')
        .map((line, index) => (index === 0 || line.length === 0 ? line : `${indent}${line}`))
        .join('\n');
}

function erasedEnd(source: string, span: SourceSpan): number {
    const trailing = TRAILING_SEMICOLON.exec(source.slice(span.end));

    return trailing === null ? span.end : span.end + trailing[0].length;
}

function erasedEdit(source: string, span: SourceSpan): HybridSourceEdit {
    const end = erasedEnd(source, span);

    return { start: span.start, end, replacement: blankSpan(source.slice(span.start, end)) };
}

export function canonicalEdit(input: PreserveInput, statement: Statement, span: SourceSpan): HybridSourceEdit | null {
    const { source } = input;
    const emitted = emit({ ...input.program, body: [statement] }, input.types, input.references, input.generatedMembers, statement.position.line - 1, input.staticAccess);
    const trimmed = span.end < source.length && emitted.code.endsWith('\n') ? emitted.code.slice(0, -1) : emitted.code;

    if (trimmed.length === 0) {
        return erasedEdit(source, span);
    }

    const end = erasedEnd(source, span);
    const authored = source.slice(span.start, end);
    const replacement = `${reindent(trimmed, indentOf(source, span.start))}${source.slice(span.end, end).trim()}`;
    const missing = lineCount(authored) - lineCount(replacement);

    if (missing < 0 && input.development) {
        return null;
    }

    const padded = missing > 0 && source.slice(end).trim().length > 0 ? `${replacement}${'\n'.repeat(missing)}` : replacement;

    return { start: span.start, end, replacement: padded, lines: emitted.lines };
}
