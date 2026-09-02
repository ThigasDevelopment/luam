import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const CONFIG =
    "type Open = {\n    kind: 'open',\n    at: number\n}\n\ntype Closed = {\n    kind: 'closed',\n    by: string\n}\n\ntype State = Open | Closed\n\nlocal function take(state: State): void\nend\n\n";

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('an inferred table literal widens its members', () => {
    it('accepts a computed number where the literal held zero', () => {
        expect(codes('local shape = { x = 0, y = 0 }\n\nshape = { x = 1.5, y = 2.5 }\n')).toEqual([]);
    });

    it('accepts another string where the literal held one', () => {
        expect(codes("local state = { kind = 'open' }\n\nstate = { kind = 'closed' }\n")).toEqual([]);
    });

    it('accepts another boolean where the literal held one', () => {
        expect(codes('local flags = { ready = true }\n\nflags = { ready = false }\n')).toEqual([]);
    });

    it('widens a nested literal all the way down', () => {
        expect(codes('local it = { position = { x = 0 } }\n\nit = { position = { x = 5.5 } }\n')).toEqual([]);
    });

    it('widens three levels deep', () => {
        expect(codes('local it = { a = { b = { c = 0 } } }\n\nit = { a = { b = { c = 9.5 } } }\n')).toEqual([]);
    });

    it('widens an array literal element', () => {
        expect(codes('local scores = { 1, 2 }\n\nscores = { 3.5, 4.5 }\n')).toEqual([]);
    });

    it('names the widened member in a mismatch', () => {
        expect(codes("local shape = { x = 0 }\n\nshape = { x = 'a' }\n")).toEqual(['check-type-mismatch']);
    });
});

describe('an annotated target keeps its literal types', () => {
    it('still checks a literal member type', () => {
        expect(codes("local s: { kind: 'open' } = { kind = 'open' }\n\nprint(s)\n")).toEqual([]);
    });

    it('still reports the wrong literal', () => {
        expect(codes("local s: { kind: 'open' } = { kind = 'closed' }\n\nprint(s)\n")).toEqual(['check-type-mismatch']);
    });

    it('still selects a member of a discriminated union from a literal', () => {
        expect(codes(`${CONFIG}take({ kind = 'open', at = 1 })\n`)).toEqual([]);
    });

    it('still reports a literal that matches no member', () => {
        expect(codes(`${CONFIG}take({ kind = 'open', by = 'a' })\n`)).toEqual(['check-type-mismatch']);
    });
});

describe('widening does not reach the output', () => {
    it('emits the literal as written', () => {
        expect(compile('local shape = { x = 0, y = 0 }\n').code).toBe('local shape = { x = 0, y = 0 }\n');
    });
});
