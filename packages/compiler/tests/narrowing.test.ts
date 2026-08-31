import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('type guards', () => {
    it('narrows a value tested with type()', () => {
        const source = "function take(value?: table): void\n    if type(value) == 'function' then\n        local run: fun(): any = value\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });

    it('keeps the other branches unnarrowed', () => {
        const source = "function take(value?: table): void\n    if type(value) == 'function' then\n    end\n\n    local plain: table = value\nend\n";

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('drops nil after a comparison with nil', () => {
        const valid = 'local name?: string = nil\n\nif name ~= nil then\n    local text: string = name\nend\n';
        const invalid = 'local name?: string = nil\nlocal text: string = name\n';

        expect(codes(valid)).toEqual([]);
        expect(codes(invalid)).toEqual(['check-type-mismatch']);
    });

    it('drops nil inside a truthiness test', () => {
        expect(codes('local name?: string = nil\n\nif name then\n    local text: string = name\nend\n')).toEqual([]);
    });

    it('drops nil in the else branch of a nil test', () => {
        const source = 'local name?: string = nil\n\nif name == nil then\n    local missing: nil = name\nelse\n    local text: string = name\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('checks an assignment against the declared type', () => {
        const source = "function take(value?: table): void\n    if type(value) == 'function' then\n        value = {}\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });

    it('forgets the guard after the variable changes', () => {
        const source = 'local name?: string = nil\n\nif name ~= nil then\n    name = nil\n\n    local text: string = name\nend\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('applies every fact of an and chain', () => {
        const source =
            "function take(value?: string, other?: table): void\n    if value ~= nil and type(other) == 'table' then\n        local text: string = value\n        local plain: table = other\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });
});

describe('logical results', () => {
    it('drops nil from the left side of an or', () => {
        expect(codes("local amount: string = '1'\nlocal requested: number = tonumber(amount) or 100\n")).toEqual([]);
    });

    it('types the and-or idiom by its two results', () => {
        expect(codes("local ok: boolean = true\nlocal label: string = ok and 'yes' or 'no'\n")).toEqual([]);
    });

    it('keeps nil when the left side of an and can be missing', () => {
        const source = 'function take(value?: string): void\n    local total: number = value and 1\nend\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('keeps both sides of an or in the union', () => {
        const source = "function take(value?: string): void\n    local total: number = value or 'text'\nend\n";

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('narrows with the alternatives of an or', () => {
        const valid =
            "function take(value: any): void\n    if type(value) == 'string' or type(value) == 'number' then\n        local text: string = value .. ''\n    end\nend\n";
        const invalid = "function take(value: any): void\n    if type(value) == 'string' or type(value) == 'number' then\n        local text: string = value\n    end\nend\n";

        expect(codes(valid)).toEqual([]);
        expect(codes(invalid)).toEqual(['check-type-mismatch']);
    });

    it('drops nil in the else branch of an or of nil tests', () => {
        const source =
            'function take(left?: string, right?: string): void\n    if left == nil or right == nil then\n        return\n    else\n        local a: string = left\n        local b: string = right\n    end\nend\n';

        expect(codes(source)).toEqual([]);
    });
});

describe('guard clauses', () => {
    it('narrows the rest of the block after an early return', () => {
        const source = 'function take(value?: string): void\n    if value == nil then\n        return\n    end\n\n    local text: string = value\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('narrows after a negated guard', () => {
        const source = 'function take(value?: string): void\n    if not value then\n        return\n    end\n\n    local text: string = value\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('narrows every name of an or guard', () => {
        const source =
            'function take(left?: string, right?: string): void\n    if left == nil or right == nil then\n        return\n    end\n\n    local a: string = left\n    local b: string = right\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('keeps the type when the guard does not exit', () => {
        const source = 'function take(value?: string): void\n    if value == nil then\n        outputChatBox("missing")\n    end\n\n    local text: string = value\nend\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('narrows after a break inside a loop', () => {
        const source =
            'function take(value?: string): void\n    while true do\n        if value == nil then\n            break\n        end\n\n        local text: string = value\n    end\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('stops at the end of the block that holds the guard', () => {
        const source =
            'function take(value?: string): void\n    while true do\n        if value == nil then\n            break\n        end\n    end\n\n    local text: string = value\nend\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });
});
