import type { Cursor } from './cursor';
import { isDigit, isHexDigit } from './char';

function scanHexadecimal(cursor: Cursor): void {
    cursor.advance(2);

    while (isHexDigit(cursor.peek())) {
        cursor.advance();
    }
}

function scanExponent(cursor: Cursor): void {
    cursor.advance();

    if (cursor.peek() === '+' || cursor.peek() === '-') {
        cursor.advance();
    }

    while (isDigit(cursor.peek())) {
        cursor.advance();
    }
}

export function isNumberStart(cursor: Cursor): boolean {
    return isDigit(cursor.peek()) || (cursor.peek() === '.' && isDigit(cursor.peek(1)));
}

export function scanNumber(cursor: Cursor): string {
    const start = cursor.offset();

    if (cursor.peek() === '0' && (cursor.peek(1) === 'x' || cursor.peek(1) === 'X')) {
        scanHexadecimal(cursor);

        return cursor.slice(start, cursor.offset());
    }

    while (isDigit(cursor.peek())) {
        cursor.advance();
    }

    if (cursor.peek() === '.') {
        cursor.advance();

        while (isDigit(cursor.peek())) {
            cursor.advance();
        }
    }

    if (cursor.peek() === 'e' || cursor.peek() === 'E') {
        scanExponent(cursor);
    }

    return cursor.slice(start, cursor.offset());
}
