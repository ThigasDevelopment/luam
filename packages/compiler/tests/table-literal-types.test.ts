import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

const TYPES =
    "type Base = {\n    id: string\n}\n\ntype SQLite = Base & {\n    kind: 'sqlite',\n    path: string\n}\n\ntype MySQL = Base & {\n    kind: 'mysql',\n    host: string\n}\n\ntype Config = SQLite | MySQL\n\n";

describe('table literal shape', () => {
    it('reports an empty literal for a type with required keys', () => {
        const source = `${TYPES}local data: Config = {}\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('but received "{}"');
    });

    it('reports a literal that is missing a required key', () => {
        const source = `${TYPES}local data: Config = { kind = 'sqlite' }\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('accepts a literal that satisfies one member of the union', () => {
        expect(codes(`${TYPES}local data: Config = { id = 'a', kind = 'sqlite', path = 'db' }\n`)).toEqual([]);
    });

    it('accepts the other member', () => {
        expect(codes(`${TYPES}local data: Config = { id = 'a', kind = 'mysql', host = 'h' }\n`)).toEqual([]);
    });

    it('rejects a literal whose discriminant matches no member', () => {
        expect(codes(`${TYPES}local data: Config = { id = 'a', kind = 'oracle', host = 'h' }\n`)).toEqual(['check-type-mismatch']);
    });

    it('rejects a key with the wrong value type', () => {
        expect(codes("type Row = {\n    id: number\n}\n\nlocal row: Row = { id = 'a' }\n")).toEqual(['check-type-mismatch']);
    });

    it('catches a misspelled key through the missing one', () => {
        const source = "type Args = {\n    name: string\n}\n\nlocal function take(args: Args): void\nend\n\ntake({ nmae = 'a' })\n";

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('ignores a key the target declares optional', () => {
        expect(codes("type Row = {\n    id: string,\n    tag?: string\n}\n\nlocal row: Row = { id = 'a' }\n")).toEqual([]);
    });

    it('keeps an empty literal valid for an array', () => {
        expect(codes('local scores: number[] = {}\n')).toEqual([]);
    });

    it('keeps an empty literal valid for a map', () => {
        expect(codes('local ages: table<string, number> = {}\n')).toEqual([]);
    });

    it('keeps an empty literal valid for table', () => {
        expect(codes('local bag: table = {}\n')).toEqual([]);
    });

    it('widens an unannotated empty literal to table', () => {
        expect(codes('local items = {}\n\nprint(items.count)\n')).toEqual([]);
    });

    it('keeps the shape of an unannotated literal', () => {
        expect(codes("local config = { name = 'a' }\n\nprint(config.name)\n")).toEqual([]);
    });

    it('reports an unknown key on an unannotated literal', () => {
        expect(codes("local config = { name = 'a' }\n\nprint(config.tag)\n")).toEqual(['check-unknown-record-key']);
    });

    it('leaves an array literal alone', () => {
        expect(codes('local scores: number[] = { 10, 20 }\n')).toEqual([]);
    });

    it('leaves a mixed literal permissive', () => {
        expect(codes("local mixed: table = { 1, name = 'a' }\n")).toEqual([]);
    });

    it('checks a nested literal', () => {
        const source = 'type Args = {\n    owner: {\n        id: number\n    }\n}\n\nlocal args: Args = { owner = {} }\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });
});
