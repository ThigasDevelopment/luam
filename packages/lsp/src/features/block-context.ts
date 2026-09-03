import { advance, type ScanState } from '@lsp/features/source-context';
import { isIdentifierChar } from '@lsp/support/source-text';

export type BlockKeyword = 'if' | 'for' | 'while' | 'function' | 'repeat' | 'do';

export interface BlockFrame {
    keyword: BlockKeyword;
    headerOpen: boolean;
    start: number;
}

export interface BlockContext {
    frame: BlockFrame | null;
    unbalanced: boolean;
}

const HEADER_OPENERS: readonly BlockKeyword[] = ['if', 'for', 'while'];

const PLAIN_OPENERS: readonly BlockKeyword[] = ['function', 'repeat'];

function openerFor(openers: readonly BlockKeyword[], word: string): BlockKeyword | null {
    return openers.find((keyword) => keyword === word) ?? null;
}

function readWord(text: string, index: number): string {
    let end = index;

    while (isIdentifierChar(text[end])) {
        end += 1;
    }

    return text.slice(index, end);
}

function applyWord(word: string, start: number, frames: BlockFrame[]): void {
    const header = openerFor(HEADER_OPENERS, word);

    if (header !== null) {
        frames.push({ keyword: header, headerOpen: true, start });

        return;
    }

    const plain = openerFor(PLAIN_OPENERS, word);

    if (plain !== null) {
        frames.push({ keyword: plain, headerOpen: false, start });

        return;
    }

    const top = frames.at(-1) ?? null;

    if (word === 'elseif' && top?.keyword === 'if') {
        top.headerOpen = true;

        return;
    }

    if (word === 'then' && top?.keyword === 'if') {
        top.headerOpen = false;

        return;
    }

    if (word === 'do') {
        if (top !== null && top.headerOpen && top.keyword !== 'if') {
            top.headerOpen = false;

            return;
        }

        frames.push({ keyword: 'do', headerOpen: false, start });

        return;
    }

    if (word === 'end') {
        frames.pop();

        return;
    }

    if (word === 'until' && top?.keyword === 'repeat') {
        frames.pop();
    }
}

export function blockContext(text: string, offset: number): BlockContext {
    const state: ScanState = { mode: 'code', quote: '', level: 0, stringStart: -1, frames: [] };
    const frames: BlockFrame[] = [];

    let snapshot: BlockFrame | null = null;
    let depth = 0;
    let taken = false;
    let closed = false;
    let index = 0;

    while (index < text.length) {
        if (!taken && index >= offset) {
            const top = frames.at(-1) ?? null;

            snapshot = top === null ? null : { ...top };
            depth = frames.length;
            taken = true;
        }

        if (state.mode === 'code' && isIdentifierChar(text[index])) {
            const word = readWord(text, index);
            const end = index + word.length;

            if (index >= offset || offset > end) {
                applyWord(word, index, frames);
            }

            index = end;
        } else {
            index = advance(text, state, index);
        }

        closed = closed || (taken && frames.length < depth);
    }

    if (!taken) {
        snapshot = frames.at(-1) ?? null;
    }

    return { frame: snapshot, unbalanced: snapshot !== null && !closed };
}
