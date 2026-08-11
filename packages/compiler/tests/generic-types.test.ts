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

    it('reports missing and extra type arguments', () => {
        const source = 'type Box<T> = { value: T }\nlocal missing: Box = { value = 1 }\nlocal extra: Box<string, number> = { value = "one" }\n';

        expect(codes(source)).toEqual(['check-generic-arity', 'check-generic-arity']);
    });
});
