import type { Cursor } from './cursor';

export interface LongBracketResult {
    text: string;
    terminated: boolean;
}

export function longBracketLevel(cursor: Cursor, offset = 0): number | null {
    if (cursor.peek(offset) !== '[') {
        return null;
    }

    let level = 0;

    while (cursor.peek(offset + level + 1) === '=') {
        level += 1;
    }

    return cursor.peek(offset + level + 1) === '[' ? level : null;
}

export function readLongBracket(cursor: Cursor, level: number): LongBracketResult {
    cursor.advance(level + 2);

    if (cursor.peek() === '\r') {
        cursor.advance();
    }

    if (cursor.peek() === '\n') {
        cursor.advance();
    }

    const closing = `]${'='.repeat(level)}]`;
    const start = cursor.offset();

    while (!cursor.isEof() && !cursor.matches(closing)) {
        cursor.advance();
    }

    const text = cursor.slice(start, cursor.offset());

    if (cursor.isEof()) {
        return { text, terminated: false };
    }

    cursor.advance(closing.length);

    return { text, terminated: true };
}
