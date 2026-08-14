import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('generic type aliases', () => {
    it('substitutes a type argument in a nullable alias', () => {
        const source = "type Nullable<T> = T | nil\nlocal a: Nullable<string> = ''\nlocal b: Nullable<string> = 1\n";

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('expects "string?" but received "number"');
    });

    it('substitutes type arguments through object members', () => {
        const valid = 'type Box<T> = { value: T }\nlocal box: Box<number> = { value = 1 }\n';
        const invalid = 'type Box<T> = { value: T }\nlocal box: Box<number> = { value = 1 }\nlocal text: string = box.value\n';

        expect(codes(valid)).toEqual([]);
        expect(codes(invalid)).toEqual(['check-type-mismatch']);
    });

    it('composes generic aliases', () => {
        const source = 'type Nullable<T> = T | nil\ntype Result<T> = Nullable<T>[]\nlocal values: Result<number> = { 1, "two" }\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('substitutes a type argument through a map alias', () => {
        const source = 'type Dict<T> = table<string, T>\nlocal ages: Dict<number> = {}\nlocal name: string = ages.thigas\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('expects "string" but received "number"');
    });

    it('reports missing and extra type arguments', () => {
        const source = 'type Box<T> = { value: T }\nlocal missing: Box = { value = 1 }\nlocal extra: Box<string, number> = { value = "one" }\n';

        expect(codes(source)).toEqual(['check-generic-arity', 'check-generic-arity']);
    });
});

describe('map types', () => {
    it('accepts a table with a key and a value type', () => {
        expect(codes('local ages: table<string, number> = {}\n')).toEqual([]);
        expect(codes('function take(data: table<string, any>): void\nend\n')).toEqual([]);
    });

    it('types an indexed read by the value type', () => {
        expect(codes("local ages: table<string, number> = {}\nlocal age: number = ages['thigas']\n")).toEqual([]);
        expect(codes("local ages: table<string, number> = {}\nlocal age: string = ages['thigas']\n")).toEqual(['check-type-mismatch']);
    });

    it('reports a key of the wrong type', () => {
        const source = 'local ages: table<string, number> = {}\nlocal age: number = ages[1]\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toBe('Key expects "string" but received "number".');
    });

    it('types the variables of a pairs loop', () => {
        const valid = 'local ages: table<string, number> = {}\n\nfor name, age in pairs(ages) do\n    local total: number = age + #name\nend\n';
        const invalid = 'local ages: table<string, number> = {}\n\nfor name, age in pairs(ages) do\n    local text: string = age\nend\n';

        expect(codes(valid)).toEqual([]);
        expect(codes(invalid)).toEqual(['check-type-mismatch']);
    });

    it('keeps a map assignable to a plain table', () => {
        expect(codes('local ages: table<string, number> = {}\nlocal any: table = ages\n')).toEqual([]);
        expect(codes('local plain: table = {}\nlocal ages: table<string, number> = plain\n')).toEqual([]);
    });

    it('reports a map with an incompatible value type', () => {
        const source = 'local names: table<string, string> = {}\nlocal ages: table<string, number> = names\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('expects "table<string, number>" but received "table<string, string>"');
    });

    it('reports a table annotation with the wrong number of arguments', () => {
        expect(codes('local ages: table<string> = {}\n')).toEqual(['check-generic-arity']);
        expect(messages('local ages: table<string> = {}\n')[0]).toBe('Type "table" expects a key type and a value type but received 1.');
    });
});
