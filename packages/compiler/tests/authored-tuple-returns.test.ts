import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const ADAPTER =
    'class MySqlAdapter {\n    query = function (sql: string): (boolean, number, number)\n        return true, 0, 0\n    end\n}\n\nlocal adapter = new MySqlAdapter()\n\n';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('an authored multi-return signature', () => {
    it('accepts a declaration that returns three values', () => {
        const source = 'local function positions(): (number, number, number)\n    return 1, 2, 3\nend\n\nprint(positions())\n';

        expect(codes(source)).toEqual([]);
    });

    it('types every name a caller destructures', () => {
        const source = `${ADAPTER}local result, rows, lastId = adapter:query('select 1')\n\nlocal ok: boolean = result\nlocal count: number = rows\nlocal id: number = lastId\n\nprint(ok, count, id)\n`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a caller that names an element with the wrong type', () => {
        const source = `${ADAPTER}local result: number = adapter:query('select 1')\n\nprint(result)\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('reports a return with the wrong arity', () => {
        const source = 'local function positions(): (number, number, number)\n    return 1, 2\nend\n\nprint(positions())\n';

        expect(codes(source)).toEqual(['check-return-mismatch']);
        expect(messages(source)[0]).toContain('3 return values but returns 2');
    });

    it('reports the element that fails, by position', () => {
        const source = "local function positions(): (number, number, number)\n    return 1, 'a', 3\nend\n\nprint(positions())\n";

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('Return value 2');
    });

    it('narrows to the first element anywhere but final position', () => {
        const source = 'local function positions(): (number, number, number)\n    return 1, 2, 3\nend\n\nlocal held: string = positions()\n\nprint(held)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('received "number"');
    });

    it('accepts the form on a fun type', () => {
        const source = 'local reader?: fun(): (boolean, number) = nil\n\nprint(reader)\n';

        expect(codes(source)).toEqual([]);
    });

    it('emits the function as written', () => {
        const source = 'local function positions(): (number, number, number)\n    return 1, 2, 3\nend\n';

        expect(compile(source).code).toBe('local function positions()\n    return 1, 2, 3\nend\n');
    });
});

describe('a tuple is a return shape only', () => {
    it('reports one in a parameter', () => {
        const source = 'local function take(v: (number, number)): void\nend\n\nprint(take)\n';

        expect(codes(source)).toEqual(['check-tuple-position']);
        expect(messages(source)[0]).toContain('cannot type a parameter');
    });

    it('reports one in a variable annotation', () => {
        expect(codes('local v: (number, number) = 1\n\nprint(v)\n')).toEqual(['check-tuple-position']);
    });

    it('reports one in a class field', () => {
        expect(codes('class Api {\n    pair: (number, number) = 1\n}\n')).toEqual(['check-tuple-position']);
    });

    it('reports one in an interface member', () => {
        expect(codes('interface Api {\n    pair: (number, number)\n}\n')).toEqual(['check-tuple-position']);
    });

    it('reports one in an alias body', () => {
        expect(codes('type Pair = (number, number)\n')).toEqual(['check-tuple-position']);
    });

    it('leaves a single parenthesised type alone', () => {
        expect(codes('local maybe?: (fun(string): void) = nil\n\nprint(maybe)\n')).toEqual([]);
    });
});
