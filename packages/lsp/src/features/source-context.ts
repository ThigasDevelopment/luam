import { isIdentifierChar } from '@lsp/support/source-text';

export interface CallFrame {
    open: number;
    argument: number;
    isCall: boolean;
}

export interface SourceContext {
    inString: boolean;
    inComment: boolean;
    stringStart: number;
    frame: CallFrame | null;
    frames: readonly CallFrame[];
}

type ScanMode = 'code' | 'line-comment' | 'block-comment' | 'short-string' | 'long-string';

export interface ScanState {
    mode: ScanMode;
    quote: string;
    level: number;
    stringStart: number;
    frames: CallFrame[];
}

const QUOTES: ReadonlySet<string> = new Set(["'", '"', '`']);

const OPENERS: ReadonlySet<string> = new Set(['[', '{']);

const CLOSERS: ReadonlySet<string> = new Set([')', ']', '}']);

function longOpener(text: string, index: number): number | null {
    if (text[index] !== '[') {
        return null;
    }

    let level = 0;
    let cursor = index + 1;

    while (text[cursor] === '=') {
        level += 1;
        cursor += 1;
    }

    return text[cursor] === '[' ? level : null;
}

function longCloser(text: string, index: number, level: number): number | null {
    if (text[index] !== ']') {
        return null;
    }

    let cursor = index + 1;
    let seen = 0;

    while (text[cursor] === '=') {
        seen += 1;
        cursor += 1;
    }

    return seen === level && text[cursor] === ']' ? cursor + 1 : null;
}

function looksLikeCall(text: string, open: number): boolean {
    let cursor = open - 1;

    while (cursor >= 0 && (text[cursor] === ' ' || text[cursor] === '\t')) {
        cursor -= 1;
    }

    const previous = text[cursor];

    if (previous === undefined) {
        return false;
    }

    return isIdentifierChar(previous) || previous === ')' || previous === ']' || previous === '"' || previous === "'";
}

function advanceComment(text: string, state: ScanState, index: number): number {
    if (text[index + 1] !== '*') {
        state.mode = 'line-comment';

        return index + 1;
    }

    state.mode = 'block-comment';

    return index + 2;
}

function advanceCode(text: string, state: ScanState, index: number): number {
    const char = text[index] ?? '';

    const next = text[index + 1] ?? '';

    if (char === '#' && (next === '*' || next === '!' || next === '' || /\s/.test(next))) {
        return advanceComment(text, state, index);
    }

    const level = longOpener(text, index);

    if (level !== null) {
        state.mode = 'long-string';
        state.level = level;
        state.stringStart = index;

        return index + 2 + level;
    }

    if (QUOTES.has(char)) {
        state.mode = 'short-string';
        state.quote = char;
        state.stringStart = index;

        return index + 1;
    }

    if (char === '(' || OPENERS.has(char)) {
        state.frames.push({ open: index, argument: 0, isCall: char === '(' && looksLikeCall(text, index) });

        return index + 1;
    }

    if (CLOSERS.has(char)) {
        state.frames.pop();

        return index + 1;
    }

    if (char === ',') {
        const top = state.frames.at(-1);

        if (top !== undefined) {
            top.argument += 1;
        }
    }

    return index + 1;
}

export function advance(text: string, state: ScanState, index: number): number {
    const char = text[index] ?? '';

    if (state.mode === 'line-comment') {
        if (char === '\n') {
            state.mode = 'code';
        }

        return index + 1;
    }

    if (state.mode === 'block-comment') {
        if (char !== '*' || text[index + 1] !== '#') {
            return index + 1;
        }

        state.mode = 'code';

        return index + 2;
    }

    if (state.mode === 'long-string') {
        const closed = longCloser(text, index, state.level);

        if (closed === null) {
            return index + 1;
        }

        state.mode = 'code';

        return closed;
    }

    if (state.mode === 'short-string') {
        if (char === '\\') {
            return index + 2;
        }

        if (char === state.quote || char === '\n') {
            state.mode = 'code';
        }

        return index + 1;
    }

    return advanceCode(text, state, index);
}

export function scanContext(text: string, offset: number): SourceContext {
    const state: ScanState = { mode: 'code', quote: '', level: 0, stringStart: -1, frames: [] };

    let index = 0;

    while (index < offset) {
        index = advance(text, state, index);
    }

    const inString = state.mode === 'short-string' || state.mode === 'long-string';

    return {
        inString,
        inComment: state.mode === 'line-comment' || state.mode === 'block-comment',
        stringStart: inString ? state.stringStart : -1,
        frame: state.frames.at(-1) ?? null,
        frames: state.frames,
    };
}

export function frameArguments(text: string, open: number, offset: number): string[] {
    const state: ScanState = { mode: 'code', quote: '', level: 0, stringStart: -1, frames: [{ open, argument: 0, isCall: true }] };
    const boundaries: number[] = [];

    let index = open + 1;

    while (index < offset && state.frames.length > 0) {
        if (state.mode === 'code' && text[index] === ',' && state.frames.length === 1) {
            boundaries.push(index);
        }

        index = advance(text, state, index);
    }

    const starts = [open + 1, ...boundaries.map((boundary) => boundary + 1)];

    return starts.map((start, position) => text.slice(start, boundaries[position] ?? offset).trim());
}

export function calleeSegments(text: string, open: number): { segments: string[]; trigger: '.' | ':' | null } {
    const segments: string[] = [];

    let cursor = open;
    let trigger: '.' | ':' | null = null;

    while (cursor > 0 && (text[cursor - 1] === ' ' || text[cursor - 1] === '\t')) {
        cursor -= 1;
    }

    for (;;) {
        let start = cursor;

        while (start > 0 && isIdentifierChar(text[start - 1])) {
            start -= 1;
        }

        if (start === cursor) {
            break;
        }

        segments.unshift(text.slice(start, cursor));

        const previous = text[start - 1];

        if (previous !== '.' && previous !== ':') {
            break;
        }

        trigger = trigger ?? previous;
        cursor = start - 1;
    }

    return { segments, trigger };
}
