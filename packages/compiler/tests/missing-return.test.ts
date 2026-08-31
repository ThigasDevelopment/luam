import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

const EVERY_PATH = "    if flag then\n        return 'yes'\n    else\n        return 'no'\n    end\n";

const SOME_PATH = "    if flag then\n        return 'yes'\n    end\n";

const NO_PATH = '    print(flag)\n';

function declaration(annotation: string, body: string): string {
    const suffix = annotation.length === 0 ? '' : `: ${annotation}`;

    return `function pick(flag: boolean)${suffix}\n${body}end\n`;
}

describe('a function that can end without returning', () => {
    it('reports a concrete annotation with a partial return', () => {
        expect(codes(declaration('string', SOME_PATH))).toEqual(['check-missing-return']);
    });

    it('names the annotation and the repair', () => {
        expect(messages(declaration('string', SOME_PATH))).toEqual([
            'This function declares "string" but can end without returning a value. Add a return on every path, or declare "string?".',
        ]);
    });

    it('reports the signature, not the closing end', () => {
        const [diagnostic] = compile(declaration('string', SOME_PATH)).diagnostics;

        expect(diagnostic?.position.line).toBe(1);
    });

    it('reports a concrete annotation with no return at all', () => {
        expect(codes(declaration('number', NO_PATH))).toEqual(['check-missing-return']);
    });

    it('accepts a concrete annotation when every path returns', () => {
        expect(codes(declaration('string', EVERY_PATH))).toEqual([]);
    });

    it('accepts every annotation that tolerates falling through', () => {
        for (const annotation of ['', 'any', 'string?', 'string | nil']) {
            expect(codes(declaration(annotation, SOME_PATH))).toEqual([]);
        }
    });

    it('accepts "void" and "nil" on a body that returns no value', () => {
        const body = '    if flag then\n        return\n    end\n';

        for (const annotation of ['void', 'nil']) {
            expect(codes(declaration(annotation, body))).toEqual([]);
        }
    });

    it('reports a tuple annotation without naming an optional repair', () => {
        const source = 'function two(flag: boolean): (string, number)\n    if flag then\n        return 1, 2\n    end\nend\n';

        expect(codes(source)).toContain('check-missing-return');
        expect(messages(source)).toContain('This function declares "(string, number)" but can end without returning a value. Add a return on every path.');
    });

    it('accepts an if chain whose every branch returns', () => {
        const source = "function grade(score: number): string\n    if score > 8 then\n        return 'high'\n    elseif score > 4 then\n        return 'mid'\n    else\n        return 'low'\n    end\nend\n";

        expect(codes(source)).toEqual([]);
    });

    it('reports the same chain without its else', () => {
        const source = "function grade(score: number): string\n    if score > 8 then\n        return 'high'\n    elseif score > 4 then\n        return 'mid'\n    end\nend\n";

        expect(codes(source)).toEqual(['check-missing-return']);
    });
});

describe('a loop that never falls through', () => {
    it('accepts "while true"', () => {
        expect(codes("function loop(): string\n    while true do\n        print('tick')\n    end\nend\n")).toEqual([]);
    });

    it('accepts "repeat until false"', () => {
        expect(codes("function loop(): string\n    repeat\n        print('tick')\n    until false\nend\n")).toEqual([]);
    });

    it('reports "while true" with a break', () => {
        expect(codes('function loop(): string\n    while true do\n        break\n    end\nend\n')).toEqual(['check-missing-return']);
    });

    it('reports "repeat until false" with a break', () => {
        expect(codes('function loop(): string\n    repeat\n        break\n    until false\nend\n')).toEqual(['check-missing-return']);
    });

    it('accepts an inner loop that breaks inside an outer loop that does not', () => {
        const source = 'function loop(): string\n    while true do\n        while true do\n            break\n        end\n    end\nend\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports a loop whose condition is not a literal', () => {
        expect(codes('function loop(flag: boolean): string\n    while flag do\n        print(1)\n    end\nend\n')).toEqual(['check-missing-return']);
    });
});

describe('every construct that checks a function body', () => {
    it('reports a function expression', () => {
        expect(codes('local read = function (): number\nend\nprint(read)\n')).toEqual(['check-missing-return']);
    });

    it('reports a class method', () => {
        expect(codes('class A {\n    read = function (): string\n    end\n}\n')).toEqual(['check-missing-return']);
    });

    it('reports a static class method', () => {
        expect(codes('class A {\n    static make = function (): number\n    end\n}\n')).toEqual(['check-missing-return']);
    });

    it('reports a constructor with a declared return type', () => {
        expect(codes('class A {\n    constructor = function (): number\n    end\n}\n')).toEqual(['check-missing-return']);
    });

    it('accepts a constructor with no declared return type', () => {
        expect(codes('class A {\n    value: number = 1\n\n    constructor = function ()\n        self.value = 2\n    end\n}\n')).toEqual([]);
    });
});

describe('the known false positive', () => {
    it('reports a body that ends in "error", which is not a terminator', () => {
        const source = "function fail(): string\n    error('unreachable')\nend\n";

        expect(codes(source)).toEqual(['check-missing-return']);
    });
});
