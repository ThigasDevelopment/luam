import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

import { parse } from '@compiler/parser/parser';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

function emit(source: string): string {
    const result = compile(source);

    expect(result.diagnostics).toEqual([]);

    return result.code ?? '';
}

const ARGS = 'type TesteArgs = { name: string }\n';

describe('object types', () => {
    it('parses an object type as a type alias', () => {
        const program = parse(ARGS).program;
        const statement = program.body[0];

        expect(statement?.kind).toBe('type-alias-statement');
        expect(statement?.kind === 'type-alias-statement' ? statement.annotation : null).toEqual({
            kind: 'type-object',
            members: [
                {
                    name: 'name',
                    annotation: { kind: 'type-name', name: 'string', typeArguments: [], position: { line: 1, column: 26, offset: 25 } },
                    position: { line: 1, column: 20, offset: 19 },
                },
            ],
            position: { line: 1, column: 18, offset: 17 },
        });
    });

    it('accepts an alias of an object type as a constructor parameter', () => {
        expect(codes(`${ARGS}\nclass Teste {\n    constructor(args: TesteArgs) {\n        print(args.name)\n    }\n}\n`)).toEqual([]);
    });

    it('accepts an inline object type as a constructor parameter', () => {
        expect(codes('class Teste {\n    constructor(args: { name: string }) {\n        print(args.name)\n    }\n}\n')).toEqual([]);
    });

    it('erases the annotation from the generated Lua', () => {
        expect(emit(`${ARGS}\nlocal function take(args: { name: string }): void\nend\n`)).toBe('local function take(args)\nend\n');
    });

    it('names an unknown key after the alias that declared it', () => {
        const source = `${ARGS}\nlocal function take(args: TesteArgs): void\n    print(args.nome)\nend\n`;

        expect(codes(source)).toEqual(['check-unknown-record-key']);
        expect(messages(source)[0]).toBe('"nome" is not a key of "TesteArgs". Declared keys: "name".');
    });

    it('names an unknown key after the inline type that declared it', () => {
        const source = 'local function take(args: { name: string }): void\n    print(args.nome)\nend\n';

        expect(messages(source)[0]).toBe('"nome" is not a key of "{ name: string }". Declared keys: "name".');
    });

    it('separates keys with a comma, a semicolon, or a line break', () => {
        expect(codes('local a: { id: number, tag: string } = {}\n')).toEqual([]);
        expect(codes('local b: { id: number; tag: string } = {}\n')).toEqual([]);
        expect(codes('local c: {\n    id: number\n    tag: string\n} = {}\n')).toEqual([]);
    });

    it('accepts an object type nested in another type', () => {
        expect(codes('local owners: { id: number }[] = {}\n')).toEqual([]);
        expect(codes('type Args = { owner: { id: number } }\n\nlocal a: Args = {}\n')).toEqual([]);
        expect(codes('local pending?: { id: number } = nil\n')).toEqual([]);
        expect(codes('local read: fun(entry: { id: number }): void = print\n')).toEqual([]);
    });

    it('accepts an object type as a return type', () => {
        expect(codes("local function make(): { name: string }\n    return { name = 'x' }\nend\n\nprint(make().name)\n")).toEqual([]);
    });

    it('carries the optional marker on the key', () => {
        expect(codes("type Args = { name: string, tag?: string }\n\nlocal a: Args = { name = 'x' }\n")).toEqual([]);
        expect(codes('local a: { tag: string? } = {}\n')).toEqual(['parse-optional-position']);
    });

    it('compares two object types by their keys', () => {
        const source = 'type A = { name: string }\ntype B = { name: number }\n\nlocal function take(value: A): void\nend\n\nlocal b: B = {}\n\ntake(b)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toBe('Argument 1 expects "A" but received "B".');
    });

    it('accepts a source that declares every required key of the target', () => {
        const source = 'local function take(value: { name: string }): void\nend\n\nlocal a: { name: string, tag: string } = {}\n\ntake(a)\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports a source that is missing a required key of the target', () => {
        const source = 'local function take(value: { name: string, tag: string }): void\nend\n\nlocal a: { name: string } = {}\n\ntake(a)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('ignores a missing key that the target declares optional', () => {
        expect(codes('local function take(value: { name: string, tag?: string }): void\nend\n\nlocal a: { name: string } = {}\n\ntake(a)\n')).toEqual([]);
    });

    it('reports a key declared more than once', () => {
        expect(codes('type A = { name: string, name: number }\n')).toEqual(['parse-duplicate-key']);
    });

    it('reports a key with no type annotation', () => {
        expect(codes('type A = { name }\n')).toEqual(['parse-invalid-type']);
        expect(messages('type A = { name }\n')[0]).toBe('Key "name" of an object type requires a type annotation.');
    });

    it('accepts an object type with no keys', () => {
        expect(codes('type A = {}\n\nlocal a: A = {}\n')).toEqual([]);
    });
});
