import { createDiagnostic, type Diagnostic } from '@compiler/diagnostics/diagnostic';

import { isLineBreak } from './char';
import type { Cursor } from './cursor';
import { longBracketLevel, readLongBracket } from './long-bracket';

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
    return cursor.matches('--');
}

export function scanComment(cursor: Cursor, diagnostics: Diagnostic[]): Comment {
    const position = cursor.position();

    cursor.advance(2);

    const level = longBracketLevel(cursor);

    if (level === null) {
        return scanLineComment(cursor);
    }

    const result = readLongBracket(cursor, level);

    if (!result.terminated) {
        diagnostics.push(
            createDiagnostic('lexer', 'lex-unterminated-comment', 'Unterminated block comment. Close it with "]]".', position),
        );
    }

    return { text: result.text.trim(), isDirective: false };
}
