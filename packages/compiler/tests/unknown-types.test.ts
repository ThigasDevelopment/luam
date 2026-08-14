import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

import type { Diagnostic } from '@compiler/diagnostics/diagnostic';

function diagnostics(source: string): Diagnostic[] {
    return compile(source).diagnostics;
}

function codes(source: string): string[] {
    return diagnostics(source).map((diagnostic) => diagnostic.code);
}

describe('unknown types', () => {
    it('warns on a type that is never declared', () => {
        const source = 'local handle: Connection = nil\n';
        const [diagnostic] = diagnostics(source);

        expect(diagnostic?.code).toBe('check-unknown-type');
        expect(diagnostic?.severity).toBe('warning');
        expect(diagnostic?.message).toBe('Type "Connection" is not defined.');
    });

    it('still emits code, because the warning is not an error', () => {
        const result = compile('local handle: Connection = nil\n');

        expect(result.code).not.toBeNull();
    });

    it('reports each unknown name once', () => {
        expect(codes('local a: Connection = nil\nlocal b: Connection = nil\n')).toEqual(['check-unknown-type']);
    });

    it('accepts a type alias declared later in the file', () => {
        expect(codes('function take(row: Row): void\nend\n\ntype Row = {\n    id: string\n}\n')).toEqual([]);
    });

    it('accepts an interface declared later in the file', () => {
        expect(codes('function take(row: Row): void\nend\n\ninterface Row {\n    id: string\n}\n')).toEqual([]);
    });

    it('accepts a class declared later in the file', () => {
        expect(codes('function take(row: Row): void\nend\n\nclass Row {\n    id: number = 0\n}\n')).toEqual([]);
    });

    it('accepts an enum declared later in the file', () => {
        expect(codes('function take(row: Row): void\nend\n\nenum Row {\n    First\n}\n')).toEqual([]);
    });

    it('accepts a recursive type alias', () => {
        expect(codes('type Node = {\n    next?: Node\n}\n')).toEqual([]);
    });

    it('accepts a self-referencing interface', () => {
        expect(codes('interface Node {\n    next?: Node\n}\n')).toEqual([]);
    });

    it('accepts the type parameters of a generic alias', () => {
        expect(codes('type Result<T> = T | string\n\nlocal value: Result<number> = 1\n')).toEqual([]);
    });

    it('accepts an MTA element type', () => {
        expect(codes('function take(target: Player, ride: Vehicle): void\nend\n')).toEqual([]);
    });

    it('accepts the primitive types', () => {
        const source = 'function take(a: string, b: number, c: boolean, d: table, e: thread, f: userdata, g: any, h: unknown): void\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('warns inside a nested annotation', () => {
        expect(codes('local rows: Connection[] = {}\n')).toEqual(['check-unknown-type']);
    });

    it('warns inside a union and an intersection', () => {
        expect(codes('type A = Missing | string\n')).toEqual(['check-unknown-type']);
        expect(codes('type B = Missing & {\n    id: string\n}\n')).toEqual(['check-invalid-intersection', 'check-unknown-type']);
    });

    it('warns on an unknown type argument of a map', () => {
        expect(codes('local rows: table<string, Connection> = {}\n')).toEqual(['check-unknown-type']);
    });

    it('stays silent under a nocheck directive', () => {
        expect(codes('#!nocheck\nlocal handle: Connection = nil\n')).toEqual([]);
    });
});
