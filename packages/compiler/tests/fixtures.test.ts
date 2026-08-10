import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { check } from '@compiler/checker/checker';
import { resolveStrictMode } from '@compiler/checker/directives';
import { compile } from '@compiler/index';
import { scan } from '@compiler/lexer/lexer';
import { parse } from '@compiler/parser/parser';

const directory = fileURLToPath(new URL('./fixtures', import.meta.url));

const fixtures = readdirSync(directory)
    .filter((file) => file.endsWith('.luam'))
    .sort();

function read(file: string): string {
    return readFileSync(join(directory, file), 'utf8');
}

describe.each(fixtures)('fixture %s', (file) => {
    const source = read(file);

    it('locks the token stream', () => {
        const tokens = scan(source)
            .tokens.filter((token) => token.kind !== 'eof')
            .map((token) => `${token.kind} "${token.value}" ${token.position.line}:${token.position.column}`);

        expect(tokens).toMatchSnapshot();
    });

    it('locks the abstract syntax tree', () => {
        const result = parse(source);

        expect(result.diagnostics).toEqual([]);
        expect(result.program).toMatchSnapshot();
    });

    it('reports no type diagnostics', () => {
        const result = parse(source);
        const checked = check(result.program, resolveStrictMode(result.directives));

        expect(checked.diagnostics).toEqual([]);
    });

    it('locks the generated Lua 5.1 output', () => {
        const result = compile(source);

        expect(result.diagnostics).toEqual([]);
        expect(result.code).toMatchSnapshot();
        expect(result.requiredHelpers).toMatchSnapshot();
    });
});
