import { createDiagnostic, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';

import { isLineBreak, isWhitespace } from './char';
import type { Cursor } from './cursor';

export interface Comment {
    kind: 'line' | 'block';
    text: string;
    isDirective: boolean;
    position: SourcePosition;
    end: SourcePosition;
}

function scanLineComment(cursor: Cursor, position: SourcePosition): Comment {
    const start = cursor.offset();

    while (!cursor.isEof() && !isLineBreak(cursor.peek())) {
        cursor.advance();
    }

    const text = cursor.slice(start, cursor.offset());

    return { kind: 'line', text: text.trim(), isDirective: text.startsWith('!'), position, end: cursor.position() };
}

export function isCommentStart(cursor: Cursor): boolean {
    const next = cursor.peek(1);

    return cursor.peek() === '#' && (next === '*' || next === '!' || next === '' || isWhitespace(next));
}

export function scanComment(cursor: Cursor, diagnostics: Diagnostic[]): Comment {
    const position = cursor.position();

    if (!cursor.matches('#*')) {
        cursor.advance();

        return scanLineComment(cursor, position);
    }

    cursor.advance(2);
    const start = cursor.offset();

    while (!cursor.isEof() && !cursor.matches('*#')) {
        cursor.advance();
    }

    const text = cursor.slice(start, cursor.offset()).trim();

    if (cursor.isEof()) {
        diagnostics.push(createDiagnostic('lexer', 'lex-unterminated-comment', 'Unterminated block comment. Close it with "*#".', position));
    } else {
        cursor.advance(2);
    }

    return { kind: 'block', text, isDirective: false, position, end: cursor.position() };
}
