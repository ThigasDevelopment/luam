import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

const IDENTIFIER_PATTERN = /[A-Za-z0-9_]/;

export function lineStarts(text: string): number[] {
    const starts = [0];

    for (let index = 0; index < text.length; index += 1) {
        if (text[index] === '\n') {
            starts.push(index + 1);
        }
    }

    return starts;
}

export function positionAt(starts: readonly number[], offset: number): SourcePosition {
    let low = 0;
    let high = starts.length - 1;

    while (low < high) {
        const middle = Math.ceil((low + high) / 2);

        if ((starts[middle] ?? 0) > offset) {
            high = middle - 1;
        } else {
            low = middle;
        }
    }

    return { line: low + 1, column: offset - (starts[low] ?? 0) + 1, offset };
}

export function offsetAt(starts: readonly number[], line: number, character: number, length: number): number {
    const index = Math.min(Math.max(line, 0), starts.length - 1);
    const start = starts[index] ?? 0;

    return Math.min(start + Math.max(character, 0), length);
}

export function isIdentifierChar(character: string | undefined): boolean {
    return character !== undefined && IDENTIFIER_PATTERN.test(character);
}

export function locateWord(text: string, from: number, word: string): number | null {
    if (word.length === 0) {
        return null;
    }

    let index = text.indexOf(word, Math.max(from, 0));

    while (index !== -1) {
        if (!isIdentifierChar(text[index - 1]) && !isIdentifierChar(text[index + word.length])) {
            return index;
        }

        index = text.indexOf(word, index + 1);
    }

    return null;
}

export function wordAt(text: string, offset: number): string | null {
    let start = offset;
    let end = offset;

    while (start > 0 && isIdentifierChar(text[start - 1])) {
        start -= 1;
    }

    while (end < text.length && isIdentifierChar(text[end])) {
        end += 1;
    }

    return end > start ? text.slice(start, end) : null;
}
