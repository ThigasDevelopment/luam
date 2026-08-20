import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const SERVER_FILE = 'src/server/main.luam';

function diagnostics(source: string) {
    return compile(source, { filePath: SERVER_FILE }).diagnostics;
}

function codes(source: string): string[] {
    return diagnostics(source).map((diagnostic) => diagnostic.code);
}

function message(source: string): string {
    return diagnostics(source)[0]?.message ?? '';
}

describe('extension form', () => {
    it('reports a property extension that is called', () => {
        expect(codes('local count: number = 0\nprint(count.abs())\n')).toEqual(['check-extension-form']);
        expect(codes("local label: string = 'x'\nprint(label.trim())\n")).toEqual(['check-extension-form']);
        expect(codes('local items: any[] = {}\nprint(items.count())\n')).toEqual(['check-extension-form']);
    });

    it('reports a call extension that is only read', () => {
        expect(codes('local count: number = 0\nprint(count.clamp)\n')).toEqual(['check-extension-form']);
        expect(codes("local label: string = 'x'\nprint(label.startsWith)\n")).toEqual(['check-extension-form']);
    });

    it('names the form and what to write instead', () => {
        expect(message('local count: number = 0\nprint(count.abs())\n')).toBe(
            '"abs" is a property extension, so it takes no call. Remove the "()": reading "abs" already gives the value.',
        );
        expect(message('local count: number = 0\nprint(count.clamp)\n')).toBe(
            '"clamp" is a call extension, so it needs its arguments. Write "clamp(...)": reading it alone never runs it.',
        );
    });

    it('reports nothing when each form is used as declared', () => {
        expect(codes('local count: number = 0\nprint(count.abs)\n')).toEqual([]);
        expect(codes('local count: number = 0\nprint(count.clamp(0, 1))\n')).toEqual([]);
        expect(codes("local label: string = 'x'\nprint(label.trim)\n")).toEqual([]);
        expect(codes("local label: string = 'x'\nprint(label.startsWith('x'))\n")).toEqual([]);
    });

    it('emits nothing while the form is wrong', () => {
        expect(compile('local count: number = 0\nprint(count.abs())\n', { filePath: SERVER_FILE }).code).toBeNull();
    });
});

describe('calling a value that is not a function', () => {
    it('reports a call on a primitive', () => {
        expect(codes('local count: number = 0\ncount()\n')).toEqual(['check-not-callable']);
        expect(codes("local label: string = 'x'\nlabel()\n")).toEqual(['check-not-callable']);
        expect(codes('local flag: boolean = true\nflag()\n')).toEqual(['check-not-callable']);
        expect(codes('local items: number[] = { 1 }\nitems()\n')).toEqual(['check-not-callable']);
    });

    it('names the value and its type', () => {
        expect(message('local count: number = 0\ncount()\n')).toBe('"count" is a "number" and cannot be called.');
    });

    it('reports a wrong extension form once, not twice', () => {
        expect(codes('local count: number = 0\nprint(count.abs())\n')).toEqual(['check-extension-form']);
    });

    it('stays quiet where the type is open', () => {
        expect(codes('local handler\nhandler()\n')).toEqual([]);
        expect(codes('local handler: any = print\nhandler()\n')).toEqual([]);
        expect(codes('local handler: fun(): void = print\nhandler()\n')).toEqual([]);
        expect(codes('print(getPlayerName(source))\n')).toEqual([]);
    });
});
