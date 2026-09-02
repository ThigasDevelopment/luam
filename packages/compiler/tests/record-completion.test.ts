import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const UI =
    'interface ClientUI {\n    screen: number[]\n    scale: number\n    fonts: table<string, number>\n}\n\nlocal function loadFonts(scale: number): table<string, number>\n    return {}\nend\n\n';

const COMPLETE = '        self.ui = { screen = { 1920, 1080 } }\n        self.ui.scale = math.max(0.70, self.ui.screen[2] / 1080)\n        self.ui.fonts = loadFonts(self.ui.scale)\n';

const ESCAPE =
    'interface ClientUI {\n    screen: number[]\n    scale: number\n    tone: number\n}\n\nlocal function take(ui: ClientUI): void\nend\n\nclass ClientBaseAPI {\n    ui: ClientUI\n\n    constructor = function ()\n        self.ui = { screen = { 1, 2 } }\n        self.ui.scale = 1\n        take(self.ui)\n        self.ui.tone = 2\n    end\n}\n';

const EARLY_ESCAPE =
    'interface ClientUI {\n    screen: number[]\n    scale: number\n}\n\nlocal function take(ui: ClientUI): void\nend\n\nclass ClientBaseAPI {\n    ui: ClientUI\n\n    constructor = function ()\n        self.ui = { screen = { 1, 2 } }\n        take(self.ui)\n        self.ui.scale = 1\n    end\n}\n';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

function constructor(body: string): string {
    return `${UI}class ClientBaseAPI {\n    ui: ClientUI\n\n    constructor = function ()\n${body}    end\n}\n`;
}

describe('a record built over several statements', () => {
    it('accepts a literal completed by later assignments', () => {
        expect(codes(constructor(COMPLETE))).toEqual([]);
    });

    it('types a key after it is assigned', () => {
        const body = `${COMPLETE}        local held: table<string, number> = self.ui.fonts\n\n        print(held)\n`;

        expect(codes(constructor(body))).toEqual([]);
    });

    it('reports the one key that is never assigned', () => {
        const body = '        self.ui = { screen = { 1920, 1080 } }\n        self.ui.scale = math.max(0.70, self.ui.screen[2] / 1080)\n';

        expect(codes(constructor(body))).toEqual(['check-incomplete-record']);
        expect(messages(constructor(body))[0]).toContain('Key "fonts" is never assigned');
    });

    it('names the remaining keys when a partly built value escapes', () => {
        expect(codes(ESCAPE)).toEqual(['check-incomplete-record']);
        expect(messages(ESCAPE)[0]).toContain('Key "tone" is never assigned');
    });

    it('reports a value that escapes before any key is assigned', () => {
        expect(codes(EARLY_ESCAPE)).toEqual(['check-type-mismatch']);
    });

    it('checks a completing assignment against the declared member type', () => {
        const body = "        self.ui = { screen = { 1920, 1080 } }\n        self.ui.scale = 'big'\n        self.ui.fonts = loadFonts(1)\n";

        expect(codes(constructor(body))).toEqual(['check-type-mismatch']);
        expect(messages(constructor(body))[0]).toContain('Key "scale"');
    });

    it('keeps the original mismatch when nothing completes the literal', () => {
        const source = 'type Row = {\n    id: string,\n    name: string\n}\n\nlocal row: Row = {}\n\nprint(row)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('Keys "id", "name" are missing');
    });

    it('leaves the emitted Lua unchanged', () => {
        expect(compile(constructor(COMPLETE)).code).toContain('self.ui = { screen = { 1920, 1080 } }');
    });
});

describe('an inferred literal a later statement extends', () => {
    it('accepts a key added after the literal', () => {
        expect(codes("local data = { owner = 'a', plate = 'b' }\n\ndata.cacheTime = 1\n\nprint(data.cacheTime)\n")).toEqual([]);
    });

    it('keeps the keys the literal already had', () => {
        expect(codes("local data = { owner = 'a' }\n\ndata.cacheTime = 1\n\nprint(data.owner)\n")).toEqual([]);
    });

    it('still reports a read of a key nobody assigned', () => {
        expect(codes("local data = { owner = 'a' }\n\ndata.cacheTime = 1\n\nprint(data.missing)\n")).toEqual(['check-unknown-record-key']);
    });

    it('still reports an undeclared key on an annotated record', () => {
        expect(codes("type Row = {\n    id: string\n}\n\nlocal row: Row = { id = 'a' }\n\nrow.other = 1\n")).toEqual(['check-unknown-record-key']);
    });

    it('leaves the emitted Lua unchanged', () => {
        expect(compile('local data = { a = 1 }\n\ndata.b = 2\n').code).toBe('local data = { a = 1 }\n\ndata.b = 2\n');
    });
});
