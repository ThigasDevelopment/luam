import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

function emit(source: string): string {
    return compile(source).code ?? '';
}

function inClass(body: string): string {
    return `class Point {\n    x: number = 0\n\n${body}}\n`;
}

describe('accepted metamethods', () => {
    it('accepts a string conversion', () => {
        expect(codes(inClass("    __tostring = function (): string\n        return 'point'\n    end\n"))).toEqual([]);
    });

    it('accepts a comparison', () => {
        expect(codes(inClass('    __eq = function (other: Point): boolean\n        return self.x == other.x\n    end\n'))).toEqual([]);
    });

    it('accepts arithmetic', () => {
        expect(codes(inClass('    __add = function (other: Point): Point\n        return other\n    end\n'))).toEqual([]);
    });

    it('accepts a length operator', () => {
        expect(codes(inClass('    __len = function (): number\n        return self.x\n    end\n'))).toEqual([]);
    });

    it('emits the metamethod as an ordinary class member', () => {
        const output = emit(inClass("    __tostring = function (): string\n        return 'point'\n    end\n"));

        expect(output).toContain('__tostring = function(self)');
    });
});

describe('rejected metamethods', () => {
    it('rejects member lookup', () => {
        const source = inClass('    __index = function (key: string): any\n        return nil\n    end\n');

        expect(codes(source)).toEqual(['check-blocked-metamethod']);
        expect(messages(source)[0]).toContain('replaces member lookup');
    });

    it('rejects a field write hook', () => {
        expect(codes(inClass('    __newindex = function (key: string, value: any): void\n    end\n'))).toEqual(['check-blocked-metamethod']);
    });

    it('rejects a callable instance', () => {
        expect(codes(inClass('    __call = function (): void\n    end\n'))).toEqual(['check-blocked-metamethod']);
    });

    it('rejects a metatable hook', () => {
        expect(codes(inClass('    __metatable = function (): any\n        return nil\n    end\n'))).toEqual(['check-blocked-metamethod']);
    });

    it('rejects a misspelled metamethod', () => {
        const source = inClass("    __tostrng = function (): string\n        return 'point'\n    end\n");

        expect(codes(source)).toEqual(['check-blocked-metamethod']);
        expect(messages(source)[0]).toContain('is not a metamethod Luam exposes');
    });

    it('leaves a field with the same prefix alone', () => {
        expect(codes('class Point {\n    __cache: number = 0\n}\n')).toEqual([]);
    });

    it('emits nothing for a rejected metamethod', () => {
        expect(emit(inClass('    __index = function (key: string): any\n        return nil\n    end\n'))).toBe('');
    });
});

describe('metamethod signatures', () => {
    it('reports the wrong return type', () => {
        const source = inClass('    __tostring = function (): number\n        return 1\n    end\n');

        expect(codes(source)).toEqual(['check-invalid-metamethod']);
        expect(messages(source)[0]).toContain('must return "string"');
    });

    it('reports an extra parameter', () => {
        const source = inClass("    __tostring = function (other: Point): string\n        return 'point'\n    end\n");

        expect(codes(source)).toEqual(['check-invalid-metamethod']);
        expect(messages(source)[0]).toContain('takes 0 parameters beside "self"');
    });

    it('reports a missing parameter', () => {
        expect(codes(inClass('    __eq = function (): boolean\n        return true\n    end\n'))).toEqual(['check-invalid-metamethod']);
    });

    it('reports a comparison that does not answer a boolean', () => {
        expect(codes(inClass('    __lt = function (other: Point): number\n        return 1\n    end\n'))).toEqual(['check-invalid-metamethod']);
    });
});

describe('metamethods and members', () => {
    it('keeps a metamethod out of the member surface', () => {
        const source = inClass("    __tostring = function (): string\n        return 'point'\n    end\n\n    describe = function (): string\n        return 'point'\n    end\n");
        const members = [...(compile(source).declarations.classes[0]?.members.keys() ?? [])];

        expect(members).toContain('describe');
        expect(members).not.toContain('__tostring');
    });

    it('leaves ordinary members untouched', () => {
        const source = `${inClass("    __tostring = function (): string\n        return 'point'\n    end\n\n    describe = function (): string\n        return 'point'\n    end\n")}local point = new Point()\nlocal text: string = point:describe()\nlocal value: number = point.x\n`;

        expect(codes(source)).toEqual([]);
    });
});
