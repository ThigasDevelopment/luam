import { describe, expect, it } from 'vitest';

import { formatDiagnostic } from '@compiler/diagnostics/diagnostic';
import { compile } from '@compiler/index';

describe('compile', () => {
    it('compiles an empty source string', () => {
        const result = compile('');

        expect(result.code).toBe('');
        expect(result.diagnostics).toEqual([]);
        expect(result.requiredHelpers).toEqual([]);
    });

    it('compiles typed source to Lua 5.1', () => {
        const result = compile("local name: string = 'Thigas'\nprint(name)\n");

        expect(result.code).toBe("local name = 'Thigas'\nprint(name)\n");
        expect(result.diagnostics).toEqual([]);
    });

    it('produces no output when the source has a type error', () => {
        const result = compile("local total: number = 'text'");

        expect(result.code).toBeNull();
        expect(result.diagnostics.map((diagnostic) => diagnostic.stage)).toEqual(['checker']);
    });

    it('produces no output when the source has a syntax error', () => {
        const result = compile('if a then\n    print(1)\n');

        expect(result.code).toBeNull();
        expect(result.diagnostics.map((diagnostic) => diagnostic.stage)).toEqual(['parser']);
    });

    it('produces no output when the source has a lexical error', () => {
        const result = compile('local a = 1\nif a != 2 then\n    print(1)\nend\n');

        expect(result.code).toBeNull();
        expect(result.diagnostics.map((diagnostic) => diagnostic.stage)).toEqual(['lexer']);
    });

    it('orders diagnostics from every stage by source position', () => {
        const result = compile("local total: number = 'text'\nprint(&)\na + 1\n");
        const offsets = result.diagnostics.map((diagnostic) => diagnostic.position.offset);

        expect(result.diagnostics.map((diagnostic) => diagnostic.stage).sort()).toEqual(['checker', 'lexer', 'parser']);
        expect(offsets).toEqual([...offsets].sort((left, right) => left - right));
    });

    it('resolves the strictness mode from a directive', () => {
        expect(compile('local a = 1').mode).toBe('strict');
        expect(compile('--!nonstrict\nlocal a = 1\n').mode).toBe('nonstrict');
        expect(compile('--!nocheck\nlocal a = 1\n').mode).toBe('nocheck');
    });

    it('reports the runtime helpers the generated resource requires', () => {
        const result = compile("local name: string = 'Thigas'\nlocal greeting = `Ola ${name}`\nlocal items: any[] = {}\nprint(items.count)\n");

        expect(result.requiredHelpers).toEqual(['string', 'table']);
    });

    it('formats a diagnostic with its stage, code, and position', () => {
        const [diagnostic] = compile("local total: number = 'text'").diagnostics;

        expect(diagnostic === undefined ? '' : formatDiagnostic(diagnostic)).toBe(
            'error check-type-mismatch (1:23): Variable "total" expects "number" but received "string".',
        );
    });
});
