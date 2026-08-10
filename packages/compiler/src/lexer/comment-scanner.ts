import { createDiagnostic, type Diagnostic } from '@compiler/diagnostics/diagnostic';

import { isLineBreak, isWhitespace } from './char';
import type { Cursor } from './cursor';

export interface Comment {
    text: string;
    isDirective: boolean;
}

function scanLineComment(cursor: Cursor): Comment {
    const start = cursor.offset();

    while (!cursor.isEof() && !isLineBreak(cursor.peek())) {
        cursor.advance();
    }

    const text = cursor.slice(start, cursor.offset());

    return { text: text.trim(), isDirective: text.startsWith('!') };
}

export function isCommentStart(cursor: Cursor): boolean {
    const next = cursor.peek(1);

    return cursor.peek() === '#' && (next === '*' || next === '!' || next === '' || isWhitespace(next));
}

export function scanComment(cursor: Cursor, diagnostics: Diagnostic[]): Comment {
    const position = cursor.position();

    if (!cursor.matches('#*')) {
        cursor.advance();

        return scanLineComment(cursor);
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

    return { text, isDirective: false };
}
