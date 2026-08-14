import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

const TYPES =
    "type Base = {\n    id: string\n}\n\ntype SQLite = Base & {\n    kind: 'sqlite',\n    sender: string\n}\n\ntype MySQL = Base & {\n    kind: 'mysql',\n    host: string,\n    port: number\n}\n\ntype Config = SQLite | MySQL\n\n";

function inFunction(body: string): string {
    return `${TYPES}function take(config: Config): void\n${body}end\n`;
}

describe('union member access', () => {
    it('resolves a key every member declares', () => {
        expect(codes(inFunction('    local id: string = config.id\n'))).toEqual([]);
    });

    it('rejects a key only one member declares', () => {
        const source = inFunction('    local host: string = config.host\n');

        expect(codes(source)).toEqual(['check-unknown-union-key']);
        expect(messages(source)[0]).toContain('It is missing from "SQLite"');
    });

    it('rejects a key no member declares', () => {
        expect(codes(inFunction('    local nothing: string = config.nope\n'))).toEqual(['check-unknown-union-key']);
    });

    it('stays permissive for a union of primitives', () => {
        const source = "function take(value: string | number): void\n    local length: any = value.anything\nend\n";

        expect(codes(source)).toEqual([]);
    });
});

describe('discriminated unions', () => {
    it('narrows inside a matching branch', () => {
        expect(codes(inFunction("    if config.kind == 'mysql' then\n        local host: string = config.host\n    end\n"))).toEqual([]);
    });

    it('keeps the other branch out of the narrowed type', () => {
        const body = "    if config.kind == 'mysql' then\n        local sender: string = config.sender\n    end\n";

        expect(codes(inFunction(body))).toEqual(['check-unknown-record-key']);
    });

    it('narrows the else branch to the remaining member', () => {
        const body = "    if config.kind == 'mysql' then\n        local host: string = config.host\n    else\n        local sender: string = config.sender\n    end\n";

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('narrows with the literal on the left', () => {
        expect(codes(inFunction("    if 'mysql' == config.kind then\n        local port: number = config.port\n    end\n"))).toEqual([]);
    });

    it('narrows the complement of a not-equal test', () => {
        expect(codes(inFunction("    if config.kind ~= 'mysql' then\n        local sender: string = config.sender\n    end\n"))).toEqual([]);
    });

    it('narrows the rest of the block after an early return', () => {
        const body = "    if config.kind ~= 'mysql' then\n        return\n    end\n\n    local port: number = config.port\n";

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('keeps the member type of the narrowed branch', () => {
        const body = "    if config.kind == 'mysql' then\n        local port: string = config.port\n    end\n";

        expect(codes(inFunction(body))).toEqual(['check-type-mismatch']);
    });

    it('stops narrowing at the end of the branch', () => {
        const body = "    if config.kind == 'mysql' then\n        local port: number = config.port\n    end\n\n    local host: string = config.host\n";

        expect(codes(inFunction(body))).toEqual(['check-unknown-union-key']);
    });

    it('does not narrow on an unknown discriminant value', () => {
        const body = "    if config.kind == 'oracle' then\n        local id: string = config.id\n    end\n";

        expect(codes(inFunction(body))).toEqual([]);
    });

    it('does not narrow when the key is not a literal type', () => {
        const source =
            "type A = {\n    kind: string,\n    a: string\n}\n\ntype B = {\n    kind: string,\n    b: string\n}\n\nfunction take(value: A | B): void\n    if value.kind == 'a' then\n        local a: string = value.a\n    end\nend\n";

        expect(codes(source)).toEqual(['check-unknown-union-key']);
    });

    it('narrows a union of interfaces', () => {
        const source =
            "interface Circle {\n    kind: 'circle'\n    radius: number\n}\n\ninterface Square {\n    kind: 'square'\n    side: number\n}\n\nfunction take(shape: Circle | Square): void\n    if shape.kind == 'circle' then\n        local radius: number = shape.radius\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });

    it('narrows through the optional wrapper of a union', () => {
        const body = "    if config.kind == 'sqlite' then\n        local sender: string = config.sender\n    end\n";
        const source = `${TYPES}function take(config?: Config): void\n${body}end\n`;

        expect(codes(source)).toEqual([]);
    });

    it('narrows a union of three members down to one', () => {
        const source =
            "type A = {\n    kind: 'a',\n    a: string\n}\n\ntype B = {\n    kind: 'b',\n    b: string\n}\n\ntype C = {\n    kind: 'c',\n    c: string\n}\n\nfunction take(value: A | B | C): void\n    if value.kind == 'b' then\n        local b: string = value.b\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });

    it('narrows nested tests one after the other', () => {
        const source =
            "type A = {\n    kind: 'a',\n    a: string\n}\n\ntype B = {\n    kind: 'b',\n    b: string\n}\n\ntype C = {\n    kind: 'c',\n    c: string\n}\n\nfunction take(value: A | B | C): void\n    if value.kind ~= 'a' then\n        if value.kind ~= 'b' then\n            local c: string = value.c\n        end\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });
});
