import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

export type TokenKind = 'identifier' | 'keyword' | 'number' | 'string' | 'template' | 'operator' | 'punctuation' | 'eof';

export type TemplateSegmentKind = 'text' | 'interpolation';

export interface TemplateSegment {
    kind: TemplateSegmentKind;
    value: string;
    position: SourcePosition;
}

export interface Token {
    kind: TokenKind;
    value: string;
    position: SourcePosition;
    end: SourcePosition;
    segments: TemplateSegment[] | null;
}

export const KEYWORDS: ReadonlySet<string> = new Set([
    'and',
    'break',
    'do',
    'else',
    'elseif',
    'end',
    'false',
    'for',
    'function',
    'if',
    'in',
    'local',
    'nil',
    'not',
    'or',
    'repeat',
    'return',
    'then',
    'true',
    'until',
    'while',
]);

export const SYMBOLS: readonly string[] = [
    '...',
    '..=',
    '==',
    '~=',
    '<=',
    '>=',
    '+=',
    '-=',
    '*=',
    '/=',
    '..',
    '+',
    '-',
    '*',
    '/',
    '%',
    '^',
    '#',
    '<',
    '>',
    '=',
    '|',
    '?',
    '(',
    ')',
    '{',
    '}',
    '[',
    ']',
    ';',
    ':',
    ',',
    '.',
];

const PUNCTUATION: ReadonlySet<string> = new Set(['(', ')', '{', '}', '[', ']', ';', ':', ',', '.']);

export function isKeyword(value: string): boolean {
    return KEYWORDS.has(value);
}

export function symbolKind(symbol: string): TokenKind {
    return PUNCTUATION.has(symbol) ? 'punctuation' : 'operator';
}

export function createToken(
    kind: TokenKind,
    value: string,
    position: SourcePosition,
    end: SourcePosition,
    segments: TemplateSegment[] | null = null,
): Token {
    return { kind, value, position, end, segments };
}
