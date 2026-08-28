import { describe, expect, it } from 'vitest';

import { formatRange, formatSource } from '@compiler/format/format';

function format(source: string): string {
    const formatted = formatSource(source);

    expect(formatted).not.toBeNull();

    return formatted ?? '';
}

describe('the formatter', () => {
    it('indents a block by one level per opening line', () => {
        const source = 'local function draw(): void\nif visible then\nreturn\nend\nend\n';

        expect(format(source)).toBe('local function draw(): void\n    if visible then\n        return\n    end\nend\n');
    });

    it('indents a callback argument by one level, not two', () => {
        const source = "addEventHandler('onPlayerJoin', root, function ()\noutputChatBox('hi')\nend)\n";

        expect(format(source)).toBe("addEventHandler('onPlayerJoin', root, function ()\n    outputChatBox('hi')\nend)\n");
    });

    it('dedents else and elseif to the branch they belong to', () => {
        const source = 'if a then\nb()\nelseif c then\nd()\nelse\ne()\nend\n';

        expect(format(source)).toBe('if a then\n    b()\nelseif c then\n    d()\nelse\n    e()\nend\n');
    });

    it('keeps a keyword apart from a parenthesis and a name against one', () => {
        expect(format('local f = function (a: number): void\nend\n')).toBe('local f = function (a: number): void\nend\n');
        expect(format("local kind = type(value)\n")).toBe('local kind = type(value)\n');
    });

    it('keeps a method call and a type annotation apart', () => {
        expect(format('local total: number = counter:bump(1)\n')).toBe('local total: number = counter:bump(1)\n');
        expect(format('local total : number = counter : bump(1)\n')).toBe('local total: number = counter:bump(1)\n');
    });

    it('keeps type arguments tight and comparisons spaced', () => {
        expect(format('local pending: Nullable<string> = nil\n')).toBe('local pending: Nullable<string> = nil\n');
        expect(format('local ok = a<b\n')).toBe('local ok = a < b\n');
    });

    it('normalizes spacing inside a table literal', () => {
        expect(format('local point = {x = 0,y = 0}\n')).toBe('local point = { x = 0, y = 0 }\n');
        expect(format('local empty = {  }\n')).toBe('local empty = {}\n');
    });

    it('collapses a run of blank lines to one and ends with a newline', () => {
        expect(format('local a = 1\n\n\n\nlocal b = 2')).toBe('local a = 1\n\nlocal b = 2\n');
    });

    it('is idempotent', () => {
        const source = 'class Wallet {\nbalance: number = 0\n\ndeposit = function (amount: number): void\nself.balance += amount\nend\n}\n';
        const once = format(source);

        expect(format(once)).toBe(once);
    });

    it('returns nothing for a file that fails to parse', () => {
        expect(formatSource('local x: = \n')).toBeNull();
        expect(formatSource('if true then\n')).toBeNull();
    });
});

describe('comments', () => {
    it('keeps a comment on its own line and indents it with the block', () => {
        const source = 'if a then\n# a note\nb()\nend\n';

        expect(format(source)).toBe('if a then\n    # a note\n    b()\nend\n');
    });

    it('keeps a trailing comment on the line it documents', () => {
        expect(format('local a = 1    # why\n')).toBe('local a = 1 # why\n');
    });

    it('keeps a comment between two declarations', () => {
        const source = 'local a = 1\n\n# between\n\nlocal b = 2\n';

        expect(format(source)).toBe(source);
    });

    it('keeps a directive at the top of the file', () => {
        expect(format('#!server\n\nlocal a = 1\n')).toBe('#!server\n\nlocal a = 1\n');
    });

    it('keeps a block comment intact', () => {
        expect(format('#* one\n   two *#\nlocal a = 1\n')).toBe('#* one\n   two *#\nlocal a = 1\n');
    });
});

describe('range formatting', () => {
    const SOURCE = 'local a = 1\nif a then\nb()\nend\nlocal c = 3\n';

    it('formats only the selected lines', () => {
        const edit = formatRange(SOURCE, 2, 4);

        expect(edit).not.toBeNull();
        expect(edit?.from).toBe(2);
        expect(edit?.to).toBe(4);
        expect(edit?.text).toBe('if a then\n    b()\nend\n');
    });

    it('returns nothing for a file that fails to parse', () => {
        expect(formatRange('if true then\n', 1, 1)).toBeNull();
    });
});
