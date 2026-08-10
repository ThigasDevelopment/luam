import { describe, expect, it } from 'vitest';

import { escapeStringLiteral } from '@compiler/emitter/escape';
import { compile } from '@compiler/index';

function emit(source: string): string {
    const result = compile(source);

    expect(result.diagnostics).toEqual([]);

    return result.code ?? '';
}

function helpers(source: string): string[] {
    return compile(source).requiredHelpers;
}

describe('emitter', () => {
    it('erases type annotations', () => {
        expect(emit("local name: string = 'Thigas'")).toBe("local name = 'Thigas'\n");
    });

    it('erases function type annotations', () => {
        expect(emit('local callback: fun(string): void = print')).toBe('local callback = print\n');
        expect(emit('function make(): fun(string): void\n    return print\nend\n')).toBe('function make()\n    return print\nend\n');
    });

    it('erases type aliases', () => {
        expect(emit('type PlayerId = number\nlocal id: PlayerId = 7\n')).toBe('local id = 7\n');
    });

    it('lowers increment and decrement statements', () => {
        expect(emit('local total: number = 0\ntotal++\ntotal--\n')).toBe('local total = 0\ntotal = total + 1\ntotal = total - 1\n');
    });

    it('lowers arithmetic compound assignment', () => {
        expect(emit('local total: number = 0\ntotal += 1\ntotal -= 2\ntotal *= 3\ntotal /= 4\n')).toBe(
            'local total = 0\ntotal = total + 1\ntotal = total - 2\ntotal = total * 3\ntotal = total / 4\n',
        );
    });

    it('lowers concatenation compound assignment', () => {
        expect(emit("local text: string = 'a'\ntext ..= 'b'\n")).toBe("local text = 'a'\ntext = text .. 'b'\n");
    });

    it('parenthesizes a compound assignment value when precedence requires it', () => {
        expect(emit('local total: number = 1\ntotal *= 2 + 3\n')).toBe('local total = 1\ntotal = total * (2 + 3)\n');
    });

    it('lowers template strings to string.template with a context table', () => {
        const source = "local name: string = 'Thigas'\nlocal greeting = `Ola ${name:Guest}, tudo bem?`\n";

        expect(emit(source)).toBe("local name = 'Thigas'\nlocal greeting = string.template('Ola ${name:Guest}, tudo bem?', { name = name })\n");
    });

    it('passes the root variable for a nested interpolation path', () => {
        const source = 'local user: table = {}\nlocal text = `Bem-vindo ${user.name}`\n';

        expect(emit(source)).toContain("string.template('Bem-vindo ${user.name}', { user = user })");
    });

    it('keeps a template without interpolation as a plain string', () => {
        expect(emit('local text = `plain text`')).toBe("local text = 'plain text'\n");
        expect(helpers('local text = `plain text`')).toEqual([]);
    });

    it('rewrites table property extensions to runtime helpers', () => {
        expect(emit('local items: any[] = {}\nprint(items.count)\n')).toBe('local items = {}\nprint(table.size(items))\n');
        expect(emit('local items: any[] = {}\nprint(items.isEmpty)\n')).toContain('table.isEmpty(items)');
    });

    it('rewrites string property extensions to runtime helpers', () => {
        expect(emit("local label: string = ' x '\nprint(label.trim)\n")).toBe("local label = ' x '\nprint(string.trim(label))\n");
    });

    it('rewrites extension calls and forwards the receiver', () => {
        expect(emit("local items: any[] = {}\nprint(items.includes('a'))\n")).toContain("table.includes(items, 'a')");
        expect(emit("local label: string = 'x'\nprint(label.startsWith('x'))\n")).toContain("string.startsWith(label, 'x')");
    });

    it('rewrites number property extensions to the math library', () => {
        expect(emit('local ratio: number = -1.75\nprint(ratio.floor)\n')).toBe('local ratio = -1.75\nprint(math.floor(ratio))\n');
        expect(emit('local ratio: number = 1\nprint(ratio.max(2))\n')).toBe('local ratio = 1\nprint(math.max(ratio, 2))\n');
    });

    it('requires no runtime helper for rewrites that reach the Lua 5.1 standard library', () => {
        expect(helpers('local ratio: number = 1\nprint(ratio.floor)\n')).toEqual([]);
        expect(helpers("local label: string = 'x'\nprint(label.upper)\n")).toEqual([]);
    });

    it('requires the math helper only for extensions Lua 5.1 does not provide', () => {
        expect(emit('local ratio: number = 5\nprint(ratio.clamp(0, 1))\n')).toContain('math.clamp(ratio, 0, 1)');
        expect(helpers('local ratio: number = 5\nprint(ratio.clamp(0, 1))\n')).toEqual(['math']);
    });

    it('never rewrites an index access', () => {
        expect(emit("local items: table = {}\nprint(items['count'])\n")).toBe("local items = {}\nprint(items['count'])\n");
    });

    it('never rewrites a property on an unrelated type', () => {
        expect(emit('local value: number = 1\nprint(value.count)\n')).toBe('local value = 1\nprint(value.count)\n');
    });

    it('tracks the runtime helpers the generated code requires', () => {
        expect(helpers('local a = 1')).toEqual([]);
        expect(helpers('local items: any[] = {}\nprint(items.count)\n')).toEqual(['table']);
        expect(helpers("local label: string = 'x'\nprint(label.trim)\n")).toEqual(['string']);
        expect(helpers("local name: string = 'x'\nlocal text = `Ola ${name}`\n")).toEqual(['string']);
    });

    it('tracks every helper used by the generated code', () => {
        const source = "local items: any[] = {}\nlocal label: string = 'x'\nprint(items.count, label.trim)\n";

        expect(helpers(source)).toEqual(['string', 'table']);
    });

    it('emits if, elseif, and else blocks with end', () => {
        const source = 'local a: number = 1\nif a > 2 then\n    print(1)\nelseif a > 1 then\n    print(2)\nelse\n    print(3)\nend\n';

        expect(emit(source)).toBe('local a = 1\nif a > 2 then\n    print(1)\nelseif a > 1 then\n    print(2)\nelse\n    print(3)\nend\n');
    });

    it('emits numeric and generic for blocks', () => {
        expect(emit('for index = 1, 10, 2 do\n    print(index)\nend\n')).toBe('for index = 1, 10, 2 do\n    print(index)\nend\n');
        expect(emit('for key in pairs({}) do\n    print(key)\nend\n')).toBe('for key in pairs({}) do\n    print(key)\nend\n');
    });

    it('emits while and repeat blocks', () => {
        expect(emit('local a: number = 1\nwhile a > 0 do\n    a -= 1\nend\n')).toContain('while a > 0 do\n    a = a - 1\nend');
        expect(emit('local a: number = 1\nrepeat\n    a += 1\nuntil a > 3\n')).toContain('repeat\n    a = a + 1\nuntil a > 3');
    });

    it('emits function declarations, local functions, and methods', () => {
        expect(emit('function greet(name: string): void\nend\n')).toBe('function greet(name)\nend\n');
        expect(emit('local function greet(): void\nend\n')).toBe('local function greet()\nend\n');
        expect(emit('local player: table = {}\nfunction player:rename(name: string): void\nend\n')).toContain('function player:rename(name)');
        expect(emit('local player: table = {}\nfunction player.describe(): void\nend\n')).toContain('function player.describe()');
    });

    it('emits variadic parameters', () => {
        expect(emit('local function log(...)\n    print(...)\nend\n')).toBe('local function log(...)\n    print(...)\nend\n');
    });

    it('preserves operator precedence and explicit grouping', () => {
        expect(emit('local a = 1 + 2 * 3')).toBe('local a = 1 + 2 * 3\n');
        expect(emit('local a = (1 + 2) * 3')).toBe('local a = (1 + 2) * 3\n');
        expect(emit('local a = 2 ^ 3 ^ 2')).toBe('local a = 2 ^ 3 ^ 2\n');
        expect(emit('local a = not true')).toBe('local a = not true\n');
    });

    it('escapes special characters in emitted strings', () => {
        expect(emit("local text = 'line\\nbreak'")).toBe("local text = 'line\\nbreak'\n");
        expect(emit('local text = "it\'s"')).toBe("local text = 'it\\'s'\n");
    });

    it('escapes control characters that would truncate the emitted literal', () => {
        expect(escapeStringLiteral(`a${String.fromCharCode(0)}b`)).toBe('a\\000b');
        expect(escapeStringLiteral(`a${String.fromCharCode(27)}b`)).toBe('a\\027b');
        expect(escapeStringLiteral(`a${String.fromCharCode(127)}b`)).toBe('a\\127b');
        expect(escapeStringLiteral(`${String.fromCharCode(11)}0`)).toBe('\\0110');
        expect(escapeStringLiteral("it's a \\ backslash")).toBe("it\\'s a \\\\ backslash");
        expect(escapeStringLiteral('acentuação')).toBe('acentuação');
    });

    it('emits table constructors with positional, named, and computed fields', () => {
        expect(emit("local map = { 1, name = 'x', [2] = 'y' }")).toBe("local map = { 1, name = 'x', [2] = 'y' }\n");
        expect(emit('local empty = {}')).toBe('local empty = {}\n');
    });

    it('emits nested function bodies with increasing indentation', () => {
        const source = 'local function outer(): void\n    local inner = function()\n        print(1)\n    end\n\n    inner()\nend\n';

        expect(emit(source)).toBe('local function outer()\n    local inner = function()\n        print(1)\n    end\n    inner()\nend\n');
    });

    it('emits nothing for an empty program', () => {
        expect(emit('')).toBe('');
        expect(emit('# only a comment\n')).toBe('');
    });
});
