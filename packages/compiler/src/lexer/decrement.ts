import { isLineBreak } from './char';
import type { Cursor } from './cursor';
import type { Token } from './token';

const OPERAND_END: ReadonlySet<string> = new Set([')', ']']);

const STATEMENT_END: ReadonlySet<string> = new Set(['', ';', '}']);

function endsOperand(token: Token | undefined): boolean {
    if (token === undefined) {
        return false;
    }

    return token.kind === 'identifier' || (token.kind === 'punctuation' && OPERAND_END.has(token.value));
}

function endsStatement(cursor: Cursor): boolean {
    let offset = 2;

    while (cursor.peek(offset) === ' ' || cursor.peek(offset) === '\t') {
        offset += 1;
    }

    const character = cursor.peek(offset);

    if (character === '-' && cursor.peek(offset + 1) === '-') {
        return true;
    }

    return isLineBreak(character) || STATEMENT_END.has(character);
}

export function isDecrementOperator(cursor: Cursor, tokens: readonly Token[]): boolean {
    const previous = tokens[tokens.length - 1];

    if (!endsOperand(previous) || previous?.end.offset !== cursor.offset()) {
        return false;
    }

    return endsStatement(cursor);
}
