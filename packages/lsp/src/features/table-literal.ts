import type { Type } from '@compiler/checker/types';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';

import { constructionMembers } from './type-shape';

const TYPE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

function openingBrace(text: string, offset: number): number {
    let depth = 0;

    for (let index = offset - 1; index >= 0; index -= 1) {
        const char = text[index];

        if (char === '}') {
            depth += 1;

            continue;
        }

        if (char !== '{') {
            continue;
        }

        if (depth === 0) {
            return index;
        }

        depth -= 1;
    }

    return -1;
}

function skipSpaceBack(text: string, from: number): number {
    let index = from;

    while (index >= 0 && (text[index] === ' ' || text[index] === '\t')) {
        index -= 1;
    }

    return index;
}

function annotationBefore(text: string, brace: number): string | null {
    const assign = skipSpaceBack(text, brace - 1);

    if (text[assign] !== '=') {
        return null;
    }

    const end = skipSpaceBack(text, assign - 1);
    let start = end;

    while (start >= 0 && text[start] !== ':' && text[start] !== '\n') {
        start -= 1;
    }

    return text[start] === ':' ? text.slice(start + 1, end + 1).trim() : null;
}

const ASSIGN_GUARDS: ReadonlySet<string> = new Set(['=', '~', '<', '>']);

function isValuePosition(text: string, brace: number, offset: number): boolean {
    let depth = 0;

    for (let index = offset - 1; index > brace; index -= 1) {
        const char = text[index];

        if (char === '}' || char === ')' || char === ']') {
            depth += 1;

            continue;
        }

        if (char === '{' || char === '(' || char === '[') {
            depth -= 1;

            continue;
        }

        if (depth > 0) {
            continue;
        }

        if (char === ',' || char === '\n') {
            return false;
        }

        if (char === '=' && text[index + 1] !== '=' && !ASSIGN_GUARDS.has(text[index - 1] ?? '')) {
            return true;
        }
    }

    return false;
}

export function isTableKeyPosition(text: string, offset: number): boolean {
    const brace = openingBrace(text, offset);

    return brace !== -1 && !isValuePosition(text, brace, offset);
}

export function tableLiteralMembers(analysis: DocumentAnalysis, offset: number): ReadonlyMap<string, Type> | null {
    const brace = openingBrace(analysis.text, offset);

    if (brace === -1) {
        return null;
    }

    const name = annotationBefore(analysis.text, brace);

    if (name === null || !TYPE_NAME.test(name)) {
        return null;
    }

    return constructionMembers(analysis, { kind: 'named', name }, writtenPairs(analysis.text, offset));
}

const FIELD = /[{}]|([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:'([^']*)'|"([^"]*)")?/g;

export function writtenPairs(text: string, offset: number): ReadonlyMap<string, string | null> {
    const brace = openingBrace(text, offset);

    if (brace === -1) {
        return new Map();
    }

    const written = new Map<string, string | null>();
    const body = text.slice(brace + 1, offset);
    let depth = 0;

    for (const match of body.matchAll(FIELD)) {
        if (match[0] === '{') {
            depth += 1;
        } else if (match[0] === '}') {
            depth -= 1;
        } else if (depth === 0 && match[1] !== undefined) {
            written.set(match[1], match[2] ?? match[3] ?? null);
        }
    }

    return written;
}

export function writtenKeys(text: string, offset: number): ReadonlySet<string> {
    return new Set(writtenPairs(text, offset).keys());
}
