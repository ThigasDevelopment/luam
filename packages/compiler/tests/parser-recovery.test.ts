import { describe, expect, it } from 'vitest';

import { parse } from '@compiler/parser/parser';

function kinds(source: string): string[] {
    return parse(source).program.body.map((statement) => statement.kind);
}

function codes(source: string): string[] {
    return parse(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('parser recovery', () => {
    it('keeps the function when a statement in its body does not parse', () => {
        const source = 'function take(name: string): void\n    name.\nend\n';

        expect(kinds(source)).toEqual(['function-declaration']);
        expect(codes(source)).toEqual(['parse-unexpected-token']);
    });

    it('keeps the statements around the one that failed', () => {
        const source = 'function take(): void\n    print(1)\n    local 1 = 2\n    print(2)\nend\n';
        const body = parse(source).program.body[0];

        expect(body?.kind).toBe('function-declaration');
        expect(body?.kind === 'function-declaration' ? body.body.map((statement) => statement.kind) : []).toEqual(['call-statement', 'call-statement']);
        expect(codes(source)).toEqual(['parse-unexpected-token']);
    });

    it('recovers inside a nested block without losing the outer one', () => {
        const source = 'function take(): void\n    if true then\n        a.\n    end\n    print(2)\nend\n';

        expect(kinds(source)).toEqual(['function-declaration']);
        expect(codes(source)).toEqual(['parse-unexpected-token']);
    });

    it('recovers inside a loop body', () => {
        expect(kinds('function take(): void\n    repeat\n        a.\n    until true\nend\n')).toEqual(['function-declaration']);
        expect(kinds('function take(): void\n    while true do\n        a.\n    end\nend\n')).toEqual(['function-declaration']);
        expect(kinds('function take(): void\n    for i = 1, 2 do\n        a.\n    end\nend\n')).toEqual(['function-declaration']);
    });

    it('keeps the class when a statement in a method body does not parse', () => {
        const source = 'class Player {\n    greet = function (): void\n        self.\n    end\n}\n';

        expect(kinds(source)).toEqual(['class-declaration']);
        expect(codes(source)).toEqual(['parse-unexpected-token']);
    });

    it('reports a stray brace once and still closes the function', () => {
        const source = 'function take(): void\n    }\nend\n';

        expect(kinds(source)).toEqual(['function-declaration']);
        expect(codes(source)).toEqual(['parse-unexpected-token']);
    });

    it('stops at the end of the file instead of looping', () => {
        expect(kinds('function take(): void\n    a.\n')).toEqual([]);
        expect(codes('function take(): void\n    a.\n').length).toBeGreaterThan(0);
    });

    it('still reports a broken statement outside any block', () => {
        expect(codes('a.\n')).toEqual(['parse-unexpected-token']);
    });
});
