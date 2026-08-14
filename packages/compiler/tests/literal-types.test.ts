import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('boolean literal types', () => {
    it('accepts the matching value', () => {
        expect(codes('local flag: true = true\n')).toEqual([]);
    });

    it('rejects the other value', () => {
        const source = 'local flag: true = false\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('expects "true" but received "false"');
    });

    it('is assignable to boolean', () => {
        expect(codes('local flag: boolean = true\n')).toEqual([]);
    });

    it('widens when the local has no annotation', () => {
        expect(codes('local flag = true\nflag = false\n')).toEqual([]);
    });
});

describe('number literal types', () => {
    it('accepts the matching value', () => {
        expect(codes('local port: 3306 = 3306\n')).toEqual([]);
    });

    it('rejects another value', () => {
        const source = 'local port: 3306 = 5432\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('expects "3306" but received "5432"');
    });

    it('is assignable to number', () => {
        expect(codes('local port: number = 3306\n')).toEqual([]);
    });

    it('widens when the local has no annotation', () => {
        expect(codes('local port = 3306\nport = 5432\n')).toEqual([]);
    });

    it('stays numeric in arithmetic', () => {
        expect(codes('local total: number = 1 + 2\n')).toEqual([]);
    });

    it('accepts a negative literal', () => {
        expect(codes('local offset: -1 = -1\n')).toEqual([]);
    });

    it('accepts a decimal literal', () => {
        expect(codes('local ratio: 0.5 = 0.5\n')).toEqual([]);
    });
});

describe('nil literal type', () => {
    it('accepts nil', () => {
        expect(codes('local missing: nil = nil\n')).toEqual([]);
    });
});

describe('literal unions', () => {
    it('accepts any member of a boolean and number union', () => {
        const source = 'local level: 1 | 2 | 3 = 2\n';

        expect(codes(source)).toEqual([]);
    });

    it('rejects a value outside the union', () => {
        expect(codes('local level: 1 | 2 | 3 = 4\n')).toEqual(['check-type-mismatch']);
    });

    it('reports the union with its literal members', () => {
        expect(messages('local level: 1 | 2 = 4\n')[0]).toContain('expects "1 | 2"');
    });

    it('mixes literal kinds in one union', () => {
        expect(codes("local mode: 'auto' | 0 | false = 0\n")).toEqual([]);
    });
});

describe('literal discriminants', () => {
    const TYPES =
        'type Ok = {\n    ok: true,\n    value: string\n}\n\ntype Err = {\n    ok: false,\n    reason: string\n}\n\ntype Result = Ok | Err\n\n';

    it('narrows on a boolean discriminant', () => {
        const source = `${TYPES}function take(result: Result): void\n    if result.ok == true then\n        local value: string = result.value\n    end\nend\n`;

        expect(codes(source)).toEqual([]);
    });

    it('narrows the else branch of a boolean discriminant', () => {
        const body = '    if result.ok == true then\n        local value: string = result.value\n    else\n        local reason: string = result.reason\n    end\n';

        expect(codes(`${TYPES}function take(result: Result): void\n${body}end\n`)).toEqual([]);
    });

    it('keeps the other branch out of the narrowed type', () => {
        const body = '    if result.ok == true then\n        local reason: string = result.reason\n    end\n';

        expect(codes(`${TYPES}function take(result: Result): void\n${body}end\n`)).toEqual(['check-unknown-record-key']);
    });

    it('narrows on a number discriminant', () => {
        const types = 'type A = {\n    code: 1,\n    a: string\n}\n\ntype B = {\n    code: 2,\n    b: string\n}\n\n';
        const body = '    if value.code == 2 then\n        local b: string = value.b\n    end\n';

        expect(codes(`${types}function take(value: A | B): void\n${body}end\n`)).toEqual([]);
    });
});
