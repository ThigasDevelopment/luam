import type { Comment } from '@compiler/lexer/comment-scanner';
import type { Token, TokenKind } from '@compiler/lexer/token';
import type { ErasureSpan } from '@compiler/parser/source-metadata';

export type PieceKind = TokenKind | 'comment';

export interface Piece {
    kind: PieceKind;
    value: string;
    offset: number;
    line: number;
    endLine: number;
    isType: boolean;
}

export interface Line {
    pieces: Piece[];
    blankBefore: boolean;
}

function isTypeOffset(erasures: readonly ErasureSpan[], offset: number): boolean {
    return erasures.some((span) => offset >= span.start && offset < span.end);
}

function tokenPiece(source: string, token: Token, erasures: readonly ErasureSpan[]): Piece {
    return {
        kind: token.kind,
        value: source.slice(token.position.offset, token.end.offset),
        offset: token.position.offset,
        line: token.position.line,
        endLine: token.end.line,
        isType: isTypeOffset(erasures, token.position.offset),
    };
}

function commentPiece(source: string, comment: Comment): Piece {
    return {
        kind: 'comment',
        value: source.slice(comment.position.offset, comment.end.offset).trimEnd(),
        offset: comment.position.offset,
        line: comment.position.line,
        endLine: comment.end.line,
        isType: false,
    };
}

export function piecesOf(source: string, tokens: readonly Token[], comments: readonly Comment[], erasures: readonly ErasureSpan[]): Piece[] {
    const pieces = [
        ...tokens.filter((token) => token.kind !== 'eof').map((token) => tokenPiece(source, token, erasures)),
        ...comments.map((comment) => commentPiece(source, comment)),
    ];

    return pieces.sort((left, right) => left.offset - right.offset);
}

export function linesOf(pieces: readonly Piece[]): Line[] {
    const lines: Line[] = [];

    let previous: Piece | null = null;

    for (const piece of pieces) {
        const current = lines[lines.length - 1];

        if (previous !== null && current !== undefined && piece.line === previous.endLine) {
            current.pieces.push(piece);
        } else {
            lines.push({ pieces: [piece], blankBefore: previous !== null && piece.line - previous.endLine > 1 });
        }

        previous = piece;
    }

    return lines;
}
