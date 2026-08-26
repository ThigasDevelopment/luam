import type { SemanticTokensLegend } from 'vscode-languageserver';

export const TOKEN_TYPES = [
    'class',
    'interface',
    'enum',
    'enumMember',
    'type',
    'parameter',
    'variable',
    'property',
    'function',
    'method',
    'decorator',
    'event',
] as const;

export const TOKEN_MODIFIERS = ['declaration', 'defaultLibrary', 'mtaNative', 'serverOnly', 'clientOnly', 'erased', 'generated'] as const;

export type SemanticTokenType = (typeof TOKEN_TYPES)[number];

export type SemanticTokenModifier = (typeof TOKEN_MODIFIERS)[number];

export const SEMANTIC_LEGEND: SemanticTokensLegend = {
    tokenTypes: [...TOKEN_TYPES],
    tokenModifiers: [...TOKEN_MODIFIERS],
};

export interface SemanticToken {
    line: number;
    character: number;
    length: number;
    type: SemanticTokenType;
    modifiers: readonly SemanticTokenModifier[];
}

export function modifierBits(modifiers: readonly SemanticTokenModifier[]): number {
    return modifiers.reduce((bits, modifier) => bits | (1 << TOKEN_MODIFIERS.indexOf(modifier)), 0);
}

export function modifiersFrom(bits: number): SemanticTokenModifier[] {
    return TOKEN_MODIFIERS.filter((modifier, index) => (bits & (1 << index)) !== 0);
}

export function sortTokens(tokens: readonly SemanticToken[]): SemanticToken[] {
    return [...tokens].sort((first, second) => (first.line === second.line ? first.character - second.character : first.line - second.line));
}

export function encodeTokens(tokens: readonly SemanticToken[]): number[] {
    const data: number[] = [];

    let line = 0;
    let character = 0;

    for (const token of sortTokens(tokens)) {
        const lineDelta = token.line - line;
        const characterDelta = lineDelta === 0 ? token.character - character : token.character;

        data.push(lineDelta, characterDelta, token.length, TOKEN_TYPES.indexOf(token.type), modifierBits(token.modifiers));

        line = token.line;
        character = token.character;
    }

    return data;
}

export function decodeTokens(data: readonly number[]): SemanticToken[] {
    const tokens: SemanticToken[] = [];

    let line = 0;
    let character = 0;

    for (let index = 0; index + 4 < data.length; index += 5) {
        const lineDelta = data[index] ?? 0;

        line += lineDelta;
        character = lineDelta === 0 ? character + (data[index + 1] ?? 0) : (data[index + 1] ?? 0);

        tokens.push({
            line,
            character,
            length: data[index + 2] ?? 0,
            type: TOKEN_TYPES[data[index + 3] ?? 0] ?? 'variable',
            modifiers: modifiersFrom(data[index + 4] ?? 0),
        });
    }

    return tokens;
}
