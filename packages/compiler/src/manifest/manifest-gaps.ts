import type { Comment } from '@compiler/lexer/comment-scanner';
import type { Token } from '@compiler/lexer/token';

import type { GapOracle } from './manifest-pass';

interface Span {
    start: number;
    end: number;
    isComment: boolean;
}

const BLANK_LINE_BREAKS = 2;

function newlinesBetween(source: string, from: number, to: number): number {
    return to <= from ? 0 : (source.slice(from, to).match(/\n/g)?.length ?? 0);
}

export function createGapOracle(source: string, tokens: readonly Token[], comments: readonly Comment[]): GapOracle {
    const spans: Span[] = [
        ...tokens.filter((token) => token.kind !== 'eof').map((token) => ({ start: token.position.offset, end: token.end.offset, isComment: false })),
        ...comments.map((comment) => ({ start: comment.position.offset, end: comment.end.offset, isComment: true })),
    ].sort((left, right) => left.start - right.start);
    const index = new Map(spans.map((span, position) => [span.start, position]));

    return (offset: number): boolean => {
        let position = index.get(offset) ?? -1;

        while (position > 0) {
            const previous = spans[position - 1];
            const current = spans[position];

            if (previous === undefined || current === undefined) {
                return false;
            }

            if (newlinesBetween(source, previous.end, current.start) >= BLANK_LINE_BREAKS) {
                return true;
            }

            if (!previous.isComment) {
                return false;
            }

            position -= 1;
        }

        return false;
    };
}
