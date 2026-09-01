import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('nil deletes a key', () => {
    it('accepts nil on a map indexed by a bracket', () => {
        expect(codes("local map: table<string, number> = {}\n\nmap['k'] = 1\nmap['k'] = nil\n")).toEqual([]);
    });

    it('accepts nil on a map indexed by a name', () => {
        expect(codes('local map: table<string, number> = {}\n\nmap.k = nil\n')).toEqual([]);
    });

    it('accepts nil on an array', () => {
        expect(codes('local pending: number[] = {}\n\npending[1] = nil\n')).toEqual([]);
    });

    it('accepts nil on a map field of a class', () => {
        const source =
            'class Network {\n    events: table<string, fun(): void> = {}\n\n    forget = function (name: string): void\n        self.events[name] = nil\n    end\n}\n';

        expect(codes(source)).toEqual([]);
    });

    it('accepts nil on a map keyed by an element class', () => {
        const source =
            'class Service {\n    timers: table<Player, number> = {}\n\n    clear = function (player: Player): void\n        self.timers[player] = nil\n    end\n}\n';

        expect(codes(source)).toEqual([]);
    });

    it('accepts nil on a table', () => {
        expect(codes("local bag: table = {}\n\nbag['k'] = nil\n")).toEqual([]);
    });

    it('still reports nil for a local', () => {
        expect(codes('local n: number = 1\n\nn = nil\n')).toEqual(['check-type-mismatch']);
    });

    it('still reports nil for a class field', () => {
        const source = 'class Counter {\n    count: number = 0\n\n    reset = function (): void\n        self.count = nil\n    end\n}\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('still reports nil for a record key', () => {
        expect(codes("type Row = {\n    id: string\n}\n\nlocal row: Row = { id = 'a' }\n\nrow.id = nil\n")).toEqual(['check-type-mismatch']);
    });

    it('still reports a wrong value on a map', () => {
        expect(codes("local map: table<string, number> = {}\n\nmap['k'] = 'a'\n")).toEqual(['check-type-mismatch']);
    });

    it('keeps the optional hint for a field', () => {
        const source = 'class Counter {\n    count: number = 0\n\n    reset = function (): void\n        self.count = nil\n    end\n}\n';

        expect(messages(source)[0]).toContain('number?');
    });

    it('keeps a map read at the value type', () => {
        const source = "local map: table<string, number> = {}\n\nmap['k'] = nil\n\nlocal taken: number = map['k']\n";

        expect(codes(source)).toEqual([]);
    });

    it('emits the assignment as written', () => {
        const output = compile("local map: table<string, number> = {}\n\nmap['k'] = nil\n").code;

        expect(output).toContain("map['k'] = nil");
    });
});
