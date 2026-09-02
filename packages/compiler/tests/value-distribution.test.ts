import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { createTuple, typeToString, BOOLEAN_TYPE, NIL_TYPE, NUMBER_TYPE, STRING_TYPE, type Type } from '@compiler/checker/types';
import { distributeValueTypes } from '@compiler/checker/value-distribution';

const TRIPLE = createTuple([NUMBER_TYPE, STRING_TYPE, BOOLEAN_TYPE]);

const PAIR = createTuple([NUMBER_TYPE, STRING_TYPE]);

function printed(types: readonly Type[]): string[] {
    return distributeValueTypes(types).map(typeToString);
}

function codes(source: string): string[] {
    return compile(source, { filePath: 'src/server/main.luam' }).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('distributeValueTypes', () => {
    it('yields an empty list for an empty list', () => {
        expect(distributeValueTypes([])).toEqual([]);
    });

    it('keeps a single non-tuple as it is', () => {
        expect(printed([NUMBER_TYPE])).toEqual(['number']);
    });

    it('expands a tuple in final position', () => {
        expect(printed([TRIPLE])).toEqual(['number', 'string', 'boolean']);
    });

    it('narrows a tuple in non-final position to its first element', () => {
        expect(printed([TRIPLE, STRING_TYPE])).toEqual(['number', 'string']);
    });

    it('narrows an earlier tuple and expands the last one', () => {
        expect(printed([PAIR, TRIPLE])).toEqual(['number', 'number', 'string', 'boolean']);
    });

    it('keeps a value list longer than a tuple it starts with', () => {
        expect(printed([TRIPLE, NUMBER_TYPE, NIL_TYPE])).toEqual(['number', 'number', 'nil']);
    });

    it('narrows an empty tuple in non-final position to nil', () => {
        expect(printed([{ kind: 'tuple', elements: [] }, NUMBER_TYPE])).toEqual(['nil', 'number']);
    });
});

describe('the checker reads the shared distribution', () => {
    it('gives each name of a destructured call its own type', () => {
        const source = [
            'function triple(): (number, string, boolean)',
            '    return 1, "a", true',
            'end',
            '',
            'local a: number, b: string, c: boolean = triple()',
        ].join('\n');

        expect(codes(source)).toEqual([]);
    });

    it('narrows a call in non-final position to its first value', () => {
        const source = [
            'function triple(): (number, string, boolean)',
            '    return 1, "a", true',
            'end',
            '',
            'local x: number, y: number = 1, triple()',
        ].join('\n');

        expect(codes(source)).toEqual([]);
    });

    it('narrows a single name to the first value of the call', () => {
        const source = [
            'function triple(): (number, string, boolean)',
            '    return 1, "a", true',
            'end',
            '',
            'local only: number = triple()',
        ].join('\n');

        expect(codes(source)).toEqual([]);
    });
});
