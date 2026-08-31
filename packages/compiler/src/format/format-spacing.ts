import { isLuamKeyword } from '@compiler/lexer/token';

import type { Piece, PieceKind } from './format-pieces';

const FUNCTION_TYPE = 'fun';

const VALUE_KINDS: ReadonlySet<PieceKind> = new Set<PieceKind>(['identifier', 'number', 'string', 'template']);

const VALUE_KEYWORDS: ReadonlySet<string> = new Set(['true', 'false', 'nil', 'end']);

const TIGHT_BEFORE: ReadonlySet<string> = new Set([',', ';', ')', ']', '.', '?', ':', '++', '--']);

const TIGHT_AFTER: ReadonlySet<string> = new Set(['(', '[', '.', '@', '#', '...']);

const CALL_PREFIX: ReadonlySet<string> = new Set([')', ']']);

const TYPE_BRACKETS: ReadonlySet<string> = new Set(['<', '>']);

function endsValue(piece: Piece): boolean {
    if (piece.kind === 'keyword') {
        return VALUE_KEYWORDS.has(piece.value);
    }

    return VALUE_KINDS.has(piece.kind) || piece.value === ')' || piece.value === ']' || piece.value === '}';
}

function isName(piece: Piece): boolean {
    return piece.kind === 'identifier' || (piece.kind === 'keyword' && isLuamKeyword(piece.value));
}

function bindsTight(piece: Piece): boolean {
    return isName(piece) || CALL_PREFIX.has(piece.value) || (piece.isType && piece.value === '>');
}

function isUnary(pieces: readonly Piece[], index: number): boolean {
    const piece = pieces[index];

    if (piece === undefined) {
        return false;
    }

    if (piece.value === '#') {
        return true;
    }

    if (piece.value !== '-') {
        return false;
    }

    const previous = index === 0 ? undefined : pieces[index - 1];

    return previous === undefined || !endsValue(previous);
}

export function isMethodColon(pieces: readonly Piece[], index: number): boolean {
    const next = pieces[index + 1];
    const after = pieces[index + 2];

    if (next === undefined || !isName(next) || next.value === FUNCTION_TYPE) {
        return false;
    }

    return after !== undefined && after.value === '(';
}

function spaceBefore(pieces: readonly Piece[], index: number): boolean {
    const piece = pieces[index];
    const previous = pieces[index - 1];

    if (piece === undefined || previous === undefined) {
        return false;
    }

    if (piece.kind === 'comment' || previous.kind === 'comment') {
        return true;
    }

    if (piece.value === '}') {
        return previous.value !== '{';
    }

    if (piece.isType && piece.value === '<' && previous.kind === 'keyword' && previous.value === 'function') {
        return true;
    }

    if (TIGHT_BEFORE.has(piece.value) || (piece.isType && TYPE_BRACKETS.has(piece.value))) {
        return false;
    }

    if (previous.isType && previous.value === '<') {
        return false;
    }

    if (previous.value === ':') {
        return !isMethodColon(pieces, index - 1);
    }

    if (TIGHT_AFTER.has(previous.value) || isUnary(pieces, index - 1)) {
        return false;
    }

    if (piece.value === '(' || piece.value === '[') {
        return !bindsTight(previous);
    }

    return true;
}

export function renderLine(pieces: readonly Piece[]): string {
    let text = '';

    for (const [index, piece] of pieces.entries()) {
        text += spaceBefore(pieces, index) ? ` ${piece.value}` : piece.value;
    }

    return text;
}
