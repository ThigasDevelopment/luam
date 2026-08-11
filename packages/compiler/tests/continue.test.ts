import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function emit(source: string): string {
    const result = compile(source);

    expect(result.diagnostics).toEqual([]);

    return result.code ?? '';
}

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('continue', () => {
    it('wraps a numeric for body in "repeat until true"', () => {
        const source = 'for i = 1, 10 do\n    if i == 3 then continue end\n    print(i)\nend\n';
        const expected = 'for i = 1, 10 do\n    repeat\n        if i == 3 then\n            break\n        end\n        print(i)\n    until true\nend\n';

        expect(emit(source)).toBe(expected);
    });

    it('wraps a generic for body', () => {
        const source = 'for key, value in pairs(source) do\n    if key == 1 then continue end\nend\n';
        const expected = 'for key, value in pairs(source) do\n    repeat\n        if key == 1 then\n            break\n        end\n    until true\nend\n';

        expect(emit(source)).toBe(expected);
    });

    it('wraps a while body', () => {
        const source = 'local i: number = 0\nwhile i < 10 do\n    i++\n    if i == 3 then continue end\nend\n';
        const expected = 'local i = 0\nwhile i < 10 do\n    repeat\n        i = i + 1\n        if i == 3 then\n            break\n        end\n    until true\nend\n';

        expect(emit(source)).toBe(expected);
    });

    it('wraps a repeat body when the condition does not read a body local', () => {
        const source = 'local i: number = 0\nrepeat\n    i++\n    if i == 3 then continue end\nuntil i > 5\n';
        const expected = 'local i = 0\nrepeat\n    repeat\n        i = i + 1\n        if i == 3 then\n            break\n        end\n    until true\nuntil i > 5\n';

        expect(emit(source)).toBe(expected);
    });

    it('guards a real break with a flag when it shares the loop level', () => {
        const source = 'for i = 1, 10 do\n    if i == 3 then continue end\n    if i == 8 then break end\nend\n';
        const expected = [
            'for i = 1, 10 do',
            '    local __luam_break = false',
            '    repeat',
            '        if i == 3 then',
            '            break',
            '        end',
            '        if i == 8 then',
            '            __luam_break = true',
            '            break',
            '        end',
            '    until true',
            '    if __luam_break then break end',
            'end',
            '',
        ].join('\n');

        expect(emit(source)).toBe(expected);
    });

    it('raises the flag from a break nested in a do block', () => {
        const source = 'for i = 1, 3 do\n    do\n        if i == 1 then break end\n    end\n    if i == 2 then continue end\nend\n';

        expect(emit(source)).toContain('__luam_break = true');
    });

    it('leaves a break that belongs to an inner loop untouched', () => {
        const source = 'for i = 1, 3 do\n    while true do\n        if i == 1 then break end\n    end\n    if i == 2 then continue end\nend\n';

        expect(emit(source)).not.toContain('__luam_break');
    });

    it('keeps the output unchanged when a loop has no continue', () => {
        const source = 'for i = 1, 3 do\n    if i == 2 then break end\n    print(i)\nend\n';

        expect(emit(source)).toBe('for i = 1, 3 do\n    if i == 2 then\n        break\n    end\n    print(i)\nend\n');
    });

    it('reports a continue outside a loop', () => {
        expect(codes('continue\n')).toEqual(['check-invalid-continue']);
        expect(messages('continue\n')[0]).toBe('A "continue" can only appear inside a loop.');
    });

    it('reports a continue inside a function nested in a loop', () => {
        expect(codes('for i = 1, 3 do\n    local run = function()\n        continue\n    end\nend\n')).toEqual(['check-invalid-continue']);
    });

    it('reports a continue that is not the last statement in its block', () => {
        const source = 'for i = 1, 3 do\n    if i == 1 then continue print(i) end\nend\n';

        expect(codes(source)).toEqual(['check-invalid-continue']);
        expect(messages(source)[0]).toBe('A "continue" must be the last statement in its block. Move the statements below it above the "continue".');
    });

    it('reports a break that is not the last statement in its block', () => {
        const source = 'for i = 1, 3 do\n    if i == 1 then break print(i) end\nend\n';

        expect(codes(source)).toEqual(['check-invalid-break']);
    });

    it('reports a break outside a loop', () => {
        expect(codes('break\n')).toEqual(['check-invalid-break']);
        expect(messages('break\n')[0]).toBe('A "break" can only appear inside a loop.');
    });

    it('reports a continue that would skip a local read by the until condition', () => {
        const source = 'repeat\n    local done: boolean = false\n    if 1 == 1 then continue end\nuntil done\n';
        const expected = 'A "continue" cannot jump over local "done", which the "until" condition reads. Declare it above the loop or use "while".';

        expect(codes(source)).toEqual(['check-invalid-continue']);
        expect(messages(source)[0]).toBe(expected);
    });

    it('accepts continue in nested loops with independent flags', () => {
        const source = [
            'for outer = 1, 3 do',
            '    for inner = 1, 3 do',
            '        if inner == 1 then continue end',
            '        if inner == 2 then break end',
            '    end',
            '    if outer == 1 then continue end',
            'end',
            '',
        ].join('\n');

        expect(emit(source).match(/__luam_break/g)?.length).toBe(3);
    });
});
