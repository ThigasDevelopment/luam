import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

import { parse } from '@compiler/parser/parser';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

const BASE = 'type Base = {\n    id: string\n}\n\n';

describe('intersection types', () => {
    it('parses an intersection as a type alias', () => {
        const program = parse(`${BASE}type Row = Base & { name: string }\n`).program;
        const statement = program.body[1];

        expect(statement?.kind).toBe('type-alias-statement');
        expect(statement?.kind === 'type-alias-statement' ? statement.annotation.kind : null).toBe('type-intersection');
    });

    it('binds tighter than a union', () => {
        const program = parse('type Row = { a: string } & { b: string } | { c: string }\n').program;
        const statement = program.body[0];
        const annotation = statement?.kind === 'type-alias-statement' ? statement.annotation : null;

        expect(annotation?.kind).toBe('type-union');
        expect(annotation?.kind === 'type-union' ? annotation.options.map((option) => option.kind) : []).toEqual(['type-intersection', 'type-object']);
    });

    it('merges the keys of both parts', () => {
        const source = `${BASE}type Row = Base & {\n    name: string\n}\n\nfunction take(row: Row): void\n    local id: string = row.id\n    local name: string = row.name\nend\n`;

        expect(codes(source)).toEqual([]);
    });

    it('rejects a key that no part declares', () => {
        const source = `${BASE}type Row = Base & {\n    name: string\n}\n\nfunction take(row: Row): void\n    local missing: string = row.nope\nend\n`;

        expect(codes(source)).toEqual(['check-unknown-record-key']);
        expect(messages(source)[0]).toContain('is not a key of "Row"');
    });

    it('keeps the declared type of every merged key', () => {
        const source = `${BASE}type Row = Base & {\n    size: number\n}\n\nfunction take(row: Row): void\n    local id: number = row.id\nend\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('merges an interface into an object type', () => {
        const source =
            'interface Base {\n    id: string\n}\n\ntype Row = Base & {\n    name: string\n}\n\nfunction take(row: Row): void\n    local id: string = row.id\n    local name: string = row.name\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports a part that is not an object type', () => {
        const source = 'type Row = string & {\n    id: string\n}\n';

        expect(codes(source)).toEqual(['check-invalid-intersection']);
    });

    it('reports two parts that declare the same key differently', () => {
        const source = `${BASE}type Row = Base & {\n    id: number\n}\n`;

        expect(codes(source)).toEqual(['check-conflicting-intersection-member']);
        expect(messages(source)[0]).toContain('both "string" and "number"');
    });

    it('accepts a key declared the same way in both parts', () => {
        const source = `${BASE}type Row = Base & {\n    id: string\n}\n`;

        expect(codes(source)).toEqual([]);
    });

    it('chains more than two parts', () => {
        const source =
            'type A = {\n    a: string\n}\n\ntype B = {\n    b: string\n}\n\ntype C = A & B & {\n    c: string\n}\n\nfunction take(value: C): void\n    local a: string = value.a\n    local b: string = value.b\n    local c: string = value.c\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('emits no runtime code for an intersection alias', () => {
        const result = compile(`${BASE}type Row = Base & {\n    name: string\n}\n\nlocal row: Row = { id = 'a', name = 'b' }\n`);

        expect(result.diagnostics).toEqual([]);
        expect(result.code).not.toContain('Row');
    });
});
