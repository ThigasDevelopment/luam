import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

export interface SourceExcerpt {
    line: number;
    text: string;
    caretColumn: number;
    caretWidth: number;
}

const IDENTIFIER = /[A-Za-z0-9_]/;

function tokenWidth(text: string, column: number): number {
    const start = column - 1;

    if (start < 0 || start >= text.length) {
        return 1;
    }

    let end = start;

    while (end < text.length && IDENTIFIER.test(text.charAt(end))) {
        end += 1;
    }

    return Math.max(1, end - start);
}

export function readExcerpt(source: string | undefined, position: SourcePosition): SourceExcerpt | null {
    if (source === undefined || position.line < 1) {
        return null;
    }

    const text = source.split(/\r?\n/)[position.line - 1];

    if (text === undefined) {
        return null;
    }

    const caretColumn = Math.max(1, Math.min(position.column, text.length + 1));

    return { line: position.line, text, caretColumn, caretWidth: tokenWidth(text, caretColumn) };
}

export function caretRow(excerpt: SourceExcerpt): string {
    return `${' '.repeat(excerpt.caretColumn - 1)}${'^'.repeat(excerpt.caretWidth)}`;
}
