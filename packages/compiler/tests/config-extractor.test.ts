import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { extractConfigDeclarations, isGeneratedDeclaration, renderConfigDeclarations } from '@compiler/project/config-extractor';

function types(source: string): Record<string, string> {
    return Object.fromEntries(extractConfigDeclarations(source).declarations.map((entry) => [entry.name, entry.type]));
}

function problems(source: string): string[] {
    return extractConfigDeclarations(source).problems.map((problem) => problem.message);
}

describe('config extraction', () => {
    it('reads a literal of every primitive kind', () => {
        const source = "NAME = 'core'\nMAX = 32\nRATE = -1.5\nDEBUG = true\nMISSING = nil\n";

        expect(types(source)).toEqual({ NAME: 'string', MAX: 'number', RATE: 'number', DEBUG: 'boolean', MISSING: 'any' });
    });

    it('reads a keyed table as an object type', () => {
        expect(types("DATABASE = { host = 'localhost', port = 3306 }\n")).toEqual({ DATABASE: '{ host: string, port: number }' });
    });

    it('reads a bracketed key', () => {
        expect(types("LABELS = { ['ready'] = 'Ready' }\n")).toEqual({ LABELS: '{ ready: string }' });
    });

    it('reads a positional table as an array', () => {
        expect(types("SPAWNS = { 1, 2, 3 }\n")).toEqual({ SPAWNS: 'number[]' });
    });

    it('widens an array of mixed elements', () => {
        expect(types("MIXED = { 1, 'two' }\n")).toEqual({ MIXED: 'any[]' });
    });

    it('falls back to a table for a mixed keyed and positional table', () => {
        expect(types("BOTH = { 1, name = 'a' }\n")).toEqual({ BOTH: 'table' });
    });

    it('reads a nested table', () => {
        expect(types("ROOT = { inner = { flag = true } }\n")).toEqual({ ROOT: '{ inner: { flag: boolean } }' });
    });

    it('reads an array of tables', () => {
        expect(types("ITEMS = { { id = 1 }, { id = 2 } }\n")).toEqual({ ITEMS: '{ id: number }[]' });
    });

    it('reads an empty table as a table', () => {
        expect(types('EMPTY = { }\n')).toEqual({ EMPTY: 'table' });
    });

    it('skips lua comments', () => {
        expect(types("-- a comment\nNAME = 'core' -- trailing\n--[[ block ]]\nMAX = 1\n")).toEqual({ NAME: 'string', MAX: 'number' });
    });

    it('reads a local assignment', () => {
        expect(types("local NAME = 'core'\n")).toEqual({ NAME: 'string' });
    });

    it('keeps the last value of a repeated name', () => {
        expect(types("NAME = 'first'\nNAME = 2\n")).toEqual({ NAME: 'number' });
    });

    it('accepts a semicolon separator', () => {
        expect(types("NAME = 'core';\nMAX = 1;\n")).toEqual({ NAME: 'string', MAX: 'number' });
    });
});

describe('unsupported config content', () => {
    it('refuses a function call', () => {
        expect(problems("NAME = getResourceName()\n")[0]).toContain('Declare this value by hand');
    });

    it('refuses a function definition', () => {
        expect(problems('function handle()\nend\n').length).toBeGreaterThan(0);
    });

    it('refuses a concatenation', () => {
        expect(problems("NAME = 'a' .. 'b'\n").length).toBeGreaterThan(0);
    });

    it('refuses a table nested past the limit', () => {
        const source = `DEEP = ${'{ inner = '.repeat(12)}1${' }'.repeat(12)}\n`;

        expect(problems(source)[0]).toContain('nested deeper than');
    });

    it('refuses a file past the size limit', () => {
        expect(problems(`PAD = '${'x'.repeat(300000)}'\n`)[0]).toContain('larger than');
    });

    it('reports the position of the problem', () => {
        const found = extractConfigDeclarations("NAME = 'core'\nMAX = getMax()\n").problems[0];

        expect(found?.line).toBe(2);
    });

    it('keeps what it read before the problem', () => {
        expect(types("NAME = 'core'\nMAX = getMax()\n")).toEqual({ NAME: 'string' });
    });
});

describe('generated declarations', () => {
    it('renders a declaration file the checker accepts', () => {
        const extracted = extractConfigDeclarations("NAME = 'core'\nDATABASE = { host = 'localhost', port = 3306 }\nSPAWNS = { 1, 2 }\n");
        const rendered = renderConfigDeclarations('config.lua', extracted.declarations);
        const result = compile(rendered, { filePath: 'src/shared/config.d.luam' });

        expect(result.diagnostics).toEqual([]);
        expect(rendered).toContain('declare NAME: string');
        expect(rendered).toContain('declare DATABASE: { host: string, port: number }');
        expect(rendered).toContain('declare SPAWNS: number[]');
    });

    it('renders the same text for the same input', () => {
        const extracted = extractConfigDeclarations("NAME = 'core'\nMAX = 1\n");

        expect(renderConfigDeclarations('config.lua', extracted.declarations)).toBe(renderConfigDeclarations('config.lua', extracted.declarations));
    });

    it('marks the file as generated', () => {
        const rendered = renderConfigDeclarations('config.lua', extractConfigDeclarations("NAME = 'core'\n").declarations);

        expect(isGeneratedDeclaration(rendered)).toBe(true);
        expect(isGeneratedDeclaration('declare NAME: string\n')).toBe(false);
    });
});
