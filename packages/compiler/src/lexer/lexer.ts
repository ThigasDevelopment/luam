import { createDiagnostic, type Diagnostic } from '@compiler/diagnostics/diagnostic';

import { isIdentifierPart, isIdentifierStart, isLineBreak, isWhitespace } from './char';
import { isCommentStart, scanComment } from './comment-scanner';
import { Cursor } from './cursor';
import { isDecrementOperator } from './decrement';
import { longBracketLevel } from './long-bracket';
import { isNumberStart, scanNumber } from './number-scanner';
import { scanLongString, scanQuotedString, scanTemplate } from './text-scanner';
import { createToken, isKeyword, symbolKind, SYMBOLS, type Token } from './token';

export interface LexResult {
    tokens: Token[];
    diagnostics: Diagnostic[];
    directives: string[];
}

function scanIdentifier(cursor: Cursor): string {
    const start = cursor.offset();

    while (isIdentifierPart(cursor.peek())) {
        cursor.advance();
    }

    return cursor.slice(start, cursor.offset());
}

function skipLine(cursor: Cursor): void {
    while (!cursor.isEof() && !isLineBreak(cursor.peek())) {
        cursor.advance();
    }
}

function skipBlock(cursor: Cursor): void {
    cursor.advance(2);

    while (!cursor.isEof() && !cursor.matches('*/')) {
        cursor.advance();
    }

    cursor.advance(2);
}

function skipLongBlock(cursor: Cursor): void {
    cursor.advance(4);

    while (!cursor.isEof() && !cursor.matches(']]')) {
        cursor.advance();
    }

    cursor.advance(2);
}

function scanForeignSyntax(cursor: Cursor, diagnostics: Diagnostic[], tokens: readonly Token[]): boolean {
    const position = cursor.position();

    if (cursor.matches('--') && !isDecrementOperator(cursor, tokens)) {
        const isBlock = cursor.matches('--[[');
        const message = isBlock ? 'Use "#* *#" for block comments. "--[[ ]]" is not valid syntax.' : 'Use "#" for line comments. "--" is not valid comment syntax.';

        diagnostics.push(createDiagnostic('lexer', 'lex-foreign-comment', message, position));

        if (isBlock) {
            skipLongBlock(cursor);
        } else {
            skipLine(cursor);
        }

        return true;
    }

    if (cursor.matches('//')) {
        diagnostics.push(createDiagnostic('lexer', 'lex-foreign-comment', 'Use "#" for line comments. "//" is not valid syntax.', position));
        skipLine(cursor);

        return true;
    }

    if (cursor.matches('/*')) {
        const message = 'Use "#* *#" for block comments. "/* */" is not valid syntax.';

        diagnostics.push(createDiagnostic('lexer', 'lex-foreign-comment', message, position));
        skipBlock(cursor);

        return true;
    }

    return false;
}

function scanSymbol(cursor: Cursor, diagnostics: Diagnostic[]): Token | null {
    const position = cursor.position();

    if (cursor.matches('!=')) {
        cursor.advance(2);
        diagnostics.push(createDiagnostic('lexer', 'lex-foreign-operator', 'Use "~=" for inequality. "!=" is not valid syntax.', position));

        return createToken('operator', '~=', position, cursor.position());
    }

    for (const symbol of SYMBOLS) {
        if (!cursor.matches(symbol)) {
            continue;
        }

        cursor.advance(symbol.length);

        return createToken(symbolKind(symbol), symbol, position, cursor.position());
    }

    diagnostics.push(createDiagnostic('lexer', 'lex-unexpected-character', `Unexpected character "${cursor.peek()}".`, position));
    cursor.advance();

    return null;
}

function scanToken(cursor: Cursor, diagnostics: Diagnostic[]): Token | null {
    const position = cursor.position();
    const character = cursor.peek();

    if (isNumberStart(cursor)) {
        return createToken('number', scanNumber(cursor), position, cursor.position());
    }

    if (isIdentifierStart(character)) {
        const value = scanIdentifier(cursor);

        return createToken(isKeyword(value) ? 'keyword' : 'identifier', value, position, cursor.position());
    }

    if (character === "'" || character === '"') {
        return createToken('string', scanQuotedString(cursor, diagnostics), position, cursor.position());
    }

    if (character === '`') {
        const segments = scanTemplate(cursor, diagnostics);

        return createToken('template', '', position, cursor.position(), segments);
    }

    const level = longBracketLevel(cursor);

    if (level !== null) {
        return createToken('string', scanLongString(cursor, level, diagnostics), position, cursor.position());
    }

    return scanSymbol(cursor, diagnostics);
}

export function scan(source: string): LexResult {
    const cursor = new Cursor(source);
    const tokens: Token[] = [];
    const diagnostics: Diagnostic[] = [];
    const directives: string[] = [];

    while (!cursor.isEof()) {
        if (isWhitespace(cursor.peek())) {
            cursor.advance();

            continue;
        }

        if (isCommentStart(cursor) && !isDecrementOperator(cursor, tokens)) {
            const comment = scanComment(cursor, diagnostics);

            if (comment.isDirective) {
                directives.push(comment.text.slice(1));
            }

            continue;
        }

        if (scanForeignSyntax(cursor, diagnostics, tokens)) {
            continue;
        }

        const token = scanToken(cursor, diagnostics);

        if (token !== null) {
            tokens.push(token);
        }
    }

    tokens.push(createToken('eof', '', cursor.position(), cursor.position()));

    return { tokens, diagnostics, directives };
}
