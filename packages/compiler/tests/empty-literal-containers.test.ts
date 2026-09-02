import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const DECLARATIONS = 'interface Handler {\n    run(): void\n}\n\nclass Registry {\n    id: number = 0\n}\n\n';

const VALUE_TYPES: ReadonlyArray<readonly [string, string]> = [
    ['a primitive', 'number'],
    ['a record', '{ id: number }'],
    ['an interface', 'Handler'],
    ['a project class', 'Registry'],
    ['an element class', 'Player'],
    ['a union', 'number | string'],
];

const KEY_TYPES: ReadonlyArray<readonly [string, string]> = [
    ['a string', 'string'],
    ['a number', 'number'],
    ['an element class', 'Ped'],
    ['a project class', 'Registry'],
    ['a literal union', "'one' | 'two'"],
];

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function positions(annotation: string): string[] {
    return [
        `local value: ${annotation} = {}\n`,
        `class Holder {\n    slot: ${annotation} = {}\n}\n`,
        `local value: ${annotation} = {}\n\nvalue = {}\n`,
        `local function take(value: ${annotation}): void\nend\n\ntake({})\n`,
        `local function make(): ${annotation}\n    return {}\nend\n`,
    ];
}

function reportsIn(annotation: string): string[] {
    return positions(annotation).flatMap((source) => codes(DECLARATIONS + source));
}

describe('empty literal for a map', () => {
    for (const [label, value] of VALUE_TYPES) {
        it(`accepts {} for a map whose value is ${label}`, () => {
            expect(reportsIn(`table<number, ${value}>`)).toEqual([]);
        });
    }

    for (const [label, key] of KEY_TYPES) {
        it(`accepts {} for a map whose key is ${label}`, () => {
            expect(reportsIn(`table<${key}, number>`)).toEqual([]);
        });
    }
});

describe('empty literal for an array', () => {
    for (const [label, element] of VALUE_TYPES) {
        it(`accepts {} for an array of ${label}`, () => {
            expect(reportsIn(`${element}[]`)).toEqual([]);
        });
    }
});

describe('a non-empty literal still compares', () => {
    it('reports a key the map does not accept', () => {
        expect(codes("local byId: table<number, Player> = { a = 'x' }\n")).toEqual(['check-type-mismatch']);
    });

    it('reports a value the map does not accept', () => {
        expect(codes("local ages: table<string, number> = { a = 'x' }\n")).toEqual(['check-type-mismatch']);
    });

    it('reports a record target that is missing a key', () => {
        expect(codes('type Row = {\n    id: string\n}\n\nlocal row: Row = {}\n')).toEqual(['check-type-mismatch']);
    });
});
