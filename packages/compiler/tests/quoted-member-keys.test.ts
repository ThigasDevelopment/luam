import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const FONTS = "interface ClientFonts {\n    ['medium:20']: string\n    ['bold:15']: string\n    plain: string\n}\n\n";

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('a quoted key in an interface', () => {
    it('accepts a key an identifier cannot spell', () => {
        expect(codes(FONTS)).toEqual([]);
    });

    it('types a read through the index form', () => {
        const source = `${FONTS}local function pick(fonts: ClientFonts): void\n    local face: string = fonts['medium:20']\n\n    print(face)\nend\n`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a key the interface does not declare', () => {
        const source = `${FONTS}local function pick(fonts: ClientFonts): void\n    print(fonts['medium:21'])\nend\n`;

        expect(codes(source)).toEqual(['check-unknown-member']);
        expect(messages(source)[0]).toContain('"medium:20"');
    });

    it('keeps a bare key readable through both forms', () => {
        const source = `${FONTS}local function pick(fonts: ClientFonts): void\n    print(fonts.plain)\n    print(fonts['plain'])\nend\n`;

        expect(codes(source)).toEqual([]);
    });

    it('reports the quoted and the bare spelling of one key as a duplicate', () => {
        expect(codes("interface A {\n    name: string\n    ['name']: string\n}\n")).toEqual(['check-duplicate-interface-member']);
    });
});

describe('a quoted key in an object type', () => {
    it('accepts and types the key', () => {
        const source = "type Fonts = {\n    ['bold:15']: string\n}\n\nlocal function pick(fonts: Fonts): void\n    local face: string = fonts['bold:15']\n\n    print(face)\nend\n";

        expect(codes(source)).toEqual([]);
    });

    it('reports a key the alias does not declare', () => {
        const source = "type Fonts = {\n    ['bold:15']: string\n}\n\nlocal function pick(fonts: Fonts): void\n    print(fonts['bold:16'])\nend\n";

        expect(codes(source)).toEqual(['check-unknown-record-key']);
    });

    it('reports the quoted and the bare spelling of one key as a duplicate', () => {
        expect(codes("type A = {\n    id: string,\n    ['id']: string\n}\n")).toEqual(['parse-duplicate-key']);
    });
});

describe('a quoted key in a class', () => {
    it('accepts a field and types it', () => {
        const source = "class Theme {\n    ['font:big']: string = 'arial'\n\n    read = function (): string\n        return self['font:big']\n    end\n}\n";

        expect(codes(source)).toEqual([]);
    });

    it('emits the key in its quoted form', () => {
        const source = "class Theme {\n    tag: string = 'a'\n    ['font:big']: string = 'arial'\n}\n";

        expect(compile(source).code).toContain("['font:big'] = 'arial'");
    });

    it('emits a quoted method key', () => {
        const source = "class Theme {\n    ['do:it'] = function (): void\n        print('x')\n    end\n}\n";

        expect(compile(source).code).toContain("['do:it'] = function(self)");
    });

    it('leaves an identifier key bare', () => {
        expect(compile("class Theme {\n    tag: string = 'a'\n}\n").code).toContain("tag = 'a'");
    });
});
