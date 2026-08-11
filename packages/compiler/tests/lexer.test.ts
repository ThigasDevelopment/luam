import { describe, expect, it } from 'vitest';

import { scan } from '@compiler/lexer/lexer';
import { KEYWORDS, LUAM_KEYWORDS, type Token } from '@compiler/lexer/token';

function describeTokens(source: string): string[] {
    return scan(source)
        .tokens.filter((token) => token.kind !== 'eof')
        .map((token: Token) => `${token.kind} "${token.value}" ${token.position.line}:${token.position.column}`);
}

function codes(source: string): string[] {
    return scan(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('lexer', () => {
    it('separates keywords from identifiers', () => {
        expect(describeTokens('local value = nil')).toEqual([
            'keyword "local" 1:1',
            'identifier "value" 1:7',
            'operator "=" 1:13',
            'keyword "nil" 1:15',
        ]);
    });

    it('reserves the words Luam adds on top of Lua 5.1', () => {
        const source = 'class constructor continue declare enum export extends implements interface new type';

        expect(scan(source).tokens.filter((token) => token.kind === 'identifier')).toEqual([]);
        expect([...LUAM_KEYWORDS].every((word) => KEYWORDS.has(word))).toBe(true);
    });

    it('scans integer, float, exponent, and hexadecimal numbers', () => {
        expect(scan('42 1.5 2e3 0xFF').tokens.map((token) => token.value)).toEqual(['42', '1.5', '2e3', '0xFF', '']);
    });

    it('scans single quoted, double quoted, and long bracket strings', () => {
        expect(scan("'one' \"two\" [[three]]").tokens.map((token) => token.value)).toEqual(['one', 'two', 'three', '']);
    });

    it('decodes string escape sequences', () => {
        expect(scan("'line\\nbreak\\ttab'").tokens[0]?.value).toBe('line\nbreak\ttab');
    });

    it('tracks line and column for every token', () => {
        expect(describeTokens('local a\nlocal b')).toEqual([
            'keyword "local" 1:1',
            'identifier "a" 1:7',
            'keyword "local" 2:1',
            'identifier "b" 2:7',
        ]);
    });

    it('skips line and block comments', () => {
        expect(describeTokens('# line\n#* block\ncomment *#\nlocal a')).toEqual(['keyword "local" 4:1', 'identifier "a" 4:7']);
    });

    it('collects directive comments', () => {
        expect(scan('#!strict\n#!server\nlocal a').directives).toEqual(['strict', 'server']);
    });

    it('scans Lua operators including the inequality operator', () => {
        expect(scan('~= == .. % ^ ... ..=').tokens.map((token) => token.value)).toEqual(['~=', '==', '..', '%', '^', '...', '..=', '']);
    });

    it('scans a function type annotation as ordinary keyword and punctuation tokens', () => {
        expect(describeTokens('function(string): void')).toEqual([
            'keyword "function" 1:1',
            'punctuation "(" 1:9',
            'identifier "string" 1:10',
            'punctuation ")" 1:16',
            'punctuation ":" 1:17',
            'identifier "void" 1:19',
        ]);
    });

    it('scans compound assignment operators', () => {
        expect(scan('+= -= *= /=').tokens.map((token) => token.value)).toEqual(['+=', '-=', '*=', '/=', '']);
    });

    it('scans increment and decrement operators', () => {
        expect(scan('count++').tokens.map((token) => token.value)).toEqual(['count', '++', '']);
        expect(scan('count--').tokens.map((token) => token.value)).toEqual(['count', '--', '']);
        expect(scan('count--;').tokens.map((token) => token.value)).toEqual(['count', '--', ';', '']);
        expect(scan('items[1]--\n').tokens.map((token) => token.value)).toEqual(['items', '[', '1', ']', '--', '']);
        expect(scan('count-- # note').tokens.map((token) => token.value)).toEqual(['count', '--', '']);
    });

    it('keeps the length operator distinct from comments', () => {
        expect(scan('#items').tokens.map((token) => token.value)).toEqual(['#', 'items', '']);
        expect(scan('# items').tokens.map((token) => token.value)).toEqual(['']);
        expect(scan('local size = #items # note').tokens.map((token) => token.value)).toEqual(['local', 'size', '=', '#', 'items', '']);
        expect(scan('#!strict\ncount').directives).toEqual(['strict']);
    });

    it('reports != as a lexical error and recovers as ~=', () => {
        const result = scan('a != b');

        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['lex-foreign-operator']);
        expect(result.diagnostics[0]?.message).toContain('~=');
        expect(result.tokens[1]?.value).toBe('~=');
    });

    it('reports foreign comment syntax', () => {
        expect(codes('// comment')).toEqual(['lex-foreign-comment']);
        expect(codes('/* comment */')).toEqual(['lex-foreign-comment']);
        expect(codes('-- comment')).toEqual(['lex-foreign-comment']);
        expect(codes('--[[ comment ]]')).toEqual(['lex-foreign-comment']);
    });

    it('reports an unterminated string with a position', () => {
        const [diagnostic] = scan("local a = 'open").diagnostics;

        expect(diagnostic?.code).toBe('lex-unterminated-string');
        expect(diagnostic?.position).toEqual({ line: 1, column: 11, offset: 10 });
    });

    it('reports an unterminated block comment with a position', () => {
        const [diagnostic] = scan('#* open').diagnostics;

        expect(diagnostic?.code).toBe('lex-unterminated-comment');
        expect(diagnostic?.position).toEqual({ line: 1, column: 1, offset: 0 });
    });

    it('scans a decorator sigil as punctuation', () => {
        expect(describeTokens('@Getter')).toEqual(['punctuation "@" 1:1', 'identifier "Getter" 1:2']);
        expect(codes('local a = @')).toEqual([]);
    });

    it('splits template strings into text and interpolation segments', () => {
        const [token] = scan('`Ola ${name:Guest}, tudo bem?`').tokens;

        expect(token?.kind).toBe('template');
        expect(token?.segments).toEqual([
            { kind: 'text', value: 'Ola ', position: { line: 1, column: 2, offset: 1 } },
            { kind: 'interpolation', value: 'name:Guest', position: { line: 1, column: 6, offset: 5 } },
            { kind: 'text', value: ', tudo bem?', position: { line: 1, column: 19, offset: 18 } },
        ]);
    });

    it('reports an unterminated template string', () => {
        expect(codes('`Ola ${name}')).toEqual(['lex-unterminated-template']);
    });

    it('matches the token snapshot for a typed program', () => {
        const source = "#!strict\nlocal total: number = 0\nfor index = 1, 10 do\n    total += index\nend\n";

        expect(describeTokens(source)).toMatchSnapshot();
    });
});
