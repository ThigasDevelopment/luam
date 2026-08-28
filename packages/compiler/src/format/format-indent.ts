import type { Piece } from './format-pieces';

const OPENERS: ReadonlySet<string> = new Set(['(', '[', '{', 'then', 'do', 'repeat', 'function']);

const CLOSERS: ReadonlySet<string> = new Set([')', ']', '}', 'end', 'until']);

export interface LineIndent {
    indent: number;
    next: number;
}

function opensOf(piece: Piece): number {
    if (piece.kind === 'comment') {
        return 0;
    }

    return piece.value === 'else' || OPENERS.has(piece.value) ? 1 : 0;
}

function closesOf(piece: Piece): number {
    if (piece.kind === 'comment') {
        return 0;
    }

    return piece.value === 'else' || piece.value === 'elseif' || CLOSERS.has(piece.value) ? 1 : 0;
}

function leadingRun(pieces: readonly Piece[]): number {
    let length = 0;

    while (length < pieces.length) {
        const piece = pieces[length];

        if (piece === undefined || closesOf(piece) === 0) {
            break;
        }

        length += 1;
    }

    return length;
}

export function indentOf(depth: number, pieces: readonly Piece[]): LineIndent {
    const leading = leadingRun(pieces);
    const indent = Math.max(0, leading === 0 ? depth : depth - 1);
    const opened = pieces.reduce((total, piece, index) => total + opensOf(piece) - (index < leading ? 0 : closesOf(piece)), 0);

    return { indent, next: opened > 0 ? indent + 1 : indent };
}
