import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('an optional parameter in a fun type', () => {
    it('accepts the named optional form', () => {
        expect(codes('local handler: fun(reason?: string): void = print\n\nhandler()\n')).toEqual([]);
    });

    it('accepts a call that supplies the optional parameter', () => {
        expect(codes("local handler: fun(reason?: string): void = print\n\nhandler('a')\n")).toEqual([]);
    });

    it('still reports a missing required parameter', () => {
        expect(codes("local handler: fun(a: string, b: string): void = print\n\nhandler('a')\n")).toEqual(['check-argument-count']);
    });

    it('accepts an optional parameter after a required one', () => {
        expect(codes("local handler: fun(a: string, b?: string): void = print\n\nhandler('a')\n")).toEqual([]);
    });

    it('parses the nested reproduction', () => {
        const source =
            'interface Promise {\n    id: number\n}\n\nlocal newPromise?: fun(executor: fun(resolve: fun(v: any): void, reject: fun(reason?: any): void): void): Promise = nil\n\nprint(newPromise)\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports a redundant marker on both the name and the type', () => {
        expect(codes('local handler: fun(reason?: string?): void = print\n')).toEqual(['parse-redundant-optional']);
    });

    it('keeps the unnamed optional spelling working', () => {
        expect(codes('local handler: fun(string?): void = print\n\nhandler()\n')).toEqual([]);
    });

    it('accepts the form in an alias body', () => {
        expect(codes('type Handler = fun(reason?: string): void\n\nlocal handler: Handler = print\n\nhandler()\n')).toEqual([]);
    });

    it('accepts the form as a class member type', () => {
        const source = 'class Holder {\n    handler: fun(reason?: string): void = print\n}\n';

        expect(codes(source)).toEqual([]);
    });

    it('accepts the form in a declaration file', () => {
        const source = 'interface Promise {\n    id: number\n}\n\ndeclare newPromise: fun(reject?: fun(reason?: any): void): Promise\n';

        expect(compile(source, { filePath: 'src/server/declarations.d.luam' }).diagnostics.map((diagnostic) => diagnostic.code)).toEqual([]);
    });
});
