import { createDiagnostic, type Diagnostic } from '@compiler/diagnostics/diagnostic';

import { isLineBreak } from './char';
import type { Cursor } from './cursor';
import { readLongBracket } from './long-bracket';
import type { TemplateSegment } from './token';

const ESCAPES: Readonly<Record<string, string>> = {
    a: '',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
};

function readEscape(cursor: Cursor): string {
    cursor.advance();

    const character = cursor.peek();

    cursor.advance();

    return ESCAPES[character] ?? character;
}

export function scanQuotedString(cursor: Cursor, diagnostics: Diagnostic[]): string {
    const position = cursor.position();
    const quote = cursor.peek();

    cursor.advance();

    let value = '';

    while (!cursor.isEof() && cursor.peek() !== quote && !isLineBreak(cursor.peek())) {
        value += cursor.peek() === '\\' ? readEscape(cursor) : cursor.advance();
    }

    if (cursor.peek() !== quote) {
        const message = `Unterminated string. Close it with ${quote}.`;

        diagnostics.push(createDiagnostic('lexer', 'lex-unterminated-string', message, position));

        return value;
    }

    cursor.advance();

    return value;
}

export function scanLongString(cursor: Cursor, level: number, diagnostics: Diagnostic[]): string {
    const position = cursor.position();
    const result = readLongBracket(cursor, level);

    if (!result.terminated) {
        const message = 'Unterminated long string. Close it with "]]".';

        diagnostics.push(createDiagnostic('lexer', 'lex-unterminated-string', message, position));
    }

    return result.text;
}

function readInterpolation(cursor: Cursor, diagnostics: Diagnostic[]): TemplateSegment {
    const position = cursor.position();

    cursor.advance(2);

    let depth = 1;
    let value = '';

    while (!cursor.isEof() && depth > 0) {
        const character = cursor.peek();

        if (character === '{') {
            depth += 1;
        }

        if (character === '}') {
            depth -= 1;

            if (depth === 0) {
                break;
            }
        }

        value += cursor.advance();
    }

    if (cursor.peek() !== '}') {
        const message = 'Unterminated template interpolation. Close it with "}".';

        diagnostics.push(createDiagnostic('lexer', 'lex-unterminated-interpolation', message, position));

        return { kind: 'interpolation', value: value.trim(), position };
    }

    cursor.advance();

    return { kind: 'interpolation', value: value.trim(), position };
}

export function scanTemplate(cursor: Cursor, diagnostics: Diagnostic[]): TemplateSegment[] {
    const position = cursor.position();
    const segments: TemplateSegment[] = [];

    cursor.advance();

    let text = '';
    let textPosition = cursor.position();

    while (!cursor.isEof() && cursor.peek() !== '`') {
        if (cursor.matches('${')) {
            if (text.length > 0) {
                segments.push({ kind: 'text', value: text, position: textPosition });
                text = '';
            }

            segments.push(readInterpolation(cursor, diagnostics));
            textPosition = cursor.position();

            continue;
        }

        text += cursor.peek() === '\\' ? readEscape(cursor) : cursor.advance();
    }

    if (text.length > 0) {
        segments.push({ kind: 'text', value: text, position: textPosition });
    }

    if (cursor.peek() !== '`') {
        const message = 'Unterminated template string. Close it with a backtick.';

        diagnostics.push(createDiagnostic('lexer', 'lex-unterminated-template', message, position));

        return segments;
    }

    cursor.advance();

    return segments;
}
