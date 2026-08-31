import { typeToString, type Type } from '@compiler/checker/types';
import type { Token } from '@compiler/lexer/token';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';

const UNPARSED_PREFIXES: readonly string[] = ['lex-', 'parse-'];

const ANY_LABEL = 'any';

export interface ParenIndex {
    openings: number[];
    closings: ReadonlyMap<number, number>;
}

export function parsesCleanly(analysis: DocumentAnalysis): boolean {
    return !analysis.diagnostics.some((diagnostic) => UNPARSED_PREFIXES.some((prefix) => diagnostic.code.startsWith(prefix)));
}

export function typeLabel(type: Type | null | undefined): string | null {
    if (type === null || type === undefined || type.kind === 'any') {
        return null;
    }

    const rendered = typeToString(type);

    return rendered.length === 0 || rendered === ANY_LABEL ? null : rendered;
}

export function buildParenIndex(tokens: readonly Token[]): ParenIndex {
    const openings: number[] = [];
    const closings = new Map<number, number>();
    const stack: number[] = [];

    for (const token of tokens) {
        if (token.kind !== 'punctuation') {
            continue;
        }

        if (token.value === '(') {
            openings.push(token.position.offset);
            stack.push(token.position.offset);

            continue;
        }

        if (token.value !== ')') {
            continue;
        }

        const opened = stack.pop();

        if (opened !== undefined) {
            closings.set(opened, token.end.offset);
        }
    }

    return { openings, closings };
}

export function parameterListEnd(index: ParenIndex, from: number): number | null {
    let low = 0;
    let high = index.openings.length;

    while (low < high) {
        const middle = Math.floor((low + high) / 2);

        if ((index.openings[middle] ?? 0) < from) {
            low = middle + 1;
        } else {
            high = middle;
        }
    }

    const opening = index.openings[low];

    return opening === undefined ? null : (index.closings.get(opening) ?? null);
}
