import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { parse } from '@compiler/parser/parser';
import type { LocalStatement, TypeAnnotation } from '@compiler/parser/ast';

const SERVER_FILE = 'src/server/main.luam';

function codes(source: string): string[] {
    return compile(source, { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => diagnostic.code);
}

function first(source: string): { code: string; line: number; column: number } | null {
    const [diagnostic] = compile(source, { filePath: SERVER_FILE }).diagnostics;

    return diagnostic === undefined ? null : { code: diagnostic.code, line: diagnostic.position.line, column: diagnostic.position.column };
}

function localAnnotation(source: string): TypeAnnotation | null {
    const statement = parse(source).program.body[0] as LocalStatement | undefined;

    return statement?.kind === 'local-statement' ? (statement.declarations[0]?.annotation ?? null) : null;
}

const SPELLINGS: readonly (readonly [string, string, string])[] = [
    ['a local', 'local tag: string? = nil\n', 'local tag?: string? = nil\n'],
    ['a class field', 'class Slot {\n    tag: string? = nil\n}\n', 'class Slot {\n    tag?: string? = nil\n}\n'],
    ['an interface field', 'interface Slot {\n    tag: string?\n}\n', 'interface Slot {\n    tag?: string?\n}\n'],
    ['an object type key', 'type Slot = { tag: string? }\n', 'type Slot = { tag?: string? }\n'],
    ['a parameter', 'function open(tag: string?): void\nend\n', 'function open(tag?: string?): void\nend\n'],
];

describe('the optional marker', () => {
    for (const [position, misplaced, redundant] of SPELLINGS) {
        it(`reports a misplaced marker on ${position}`, () => {
            expect(codes(misplaced)).toEqual(['parse-optional-position']);
        });

        it(`reports a redundant marker on ${position}`, () => {
            expect(codes(redundant)).toEqual(['parse-redundant-optional']);
        });
    }

    it('reports nothing for the canonical spelling', () => {
        expect(codes('local tag?: string = nil\n')).toEqual([]);
        expect(codes('function open(tag?: string): void\nend\n')).toEqual([]);
    });

    it('keeps the misplaced message unchanged', () => {
        const [message] = compile('local tag: string? = nil\n', { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => diagnostic.message);

        expect(message).toBe('Write optional locals as "name?: Type", not "name: Type?".');
    });

    it('points the redundant marker at the question mark after the type', () => {
        expect(first('local tag?: string? = nil\n')).toEqual({ code: 'parse-redundant-optional', line: 1, column: 19 });
    });

    it('carries exactly one optional node for the redundant spelling', () => {
        const annotation = localAnnotation('local tag?: string? = nil\n');

        expect(annotation?.kind).toBe('type-optional');
        expect(annotation?.kind === 'type-optional' ? annotation.element.kind : null).toBe('type-name');
    });

    it('resolves the redundant spelling to the type the canonical one resolves to', () => {
        expect(codes('local tag?: string? = nil\ntag = 1\n')).toEqual(['parse-redundant-optional', 'check-type-mismatch']);
        expect(codes('local tag?: string = nil\ntag = 1\n')).toEqual(['check-type-mismatch']);
    });

    it('leaves an optional suffix inside a type expression alone', () => {
        expect(codes('function find(id: number): string?\n    return nil\nend\n')).toEqual([]);
        expect(codes('local handlers: (fun(string): void)[] = {}\n')).toEqual([]);
    });

    it('still throws for a marker with no annotation', () => {
        expect(codes('local tag? = nil\n')).toContain('parse-invalid-optional');
    });

    it('erases the marker and the annotation for every spelling', () => {
        const redundant = 'local tag?: string? = nil\n';
        const canonical = 'local tag?: string = nil\n';

        expect(parse(redundant).erasures.map((span) => redundant.slice(span.start, span.end))).toContain('?: string?');
        expect(parse(canonical).erasures.map((span) => canonical.slice(span.start, span.end))).toContain('?: string');
        expect(compile(canonical, { filePath: SERVER_FILE }).code).toBe('local tag = nil\n');
    });
});
