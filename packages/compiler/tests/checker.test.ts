import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('checker', () => {
    it('accepts a fully annotated program', () => {
        expect(codes("local name: string = 'Thigas'\nlocal total: number = 1 + 2\n")).toEqual([]);
    });

    it('reports an incompatible local initializer', () => {
        expect(codes("local total: number = 'text'")).toEqual(['check-type-mismatch']);
        expect(messages("local total: number = 'text'")[0]).toBe('Variable "total" expects "number" but received "string".');
    });

    it('reports an incompatible assignment', () => {
        expect(codes("local total: number = 1\ntotal = 'text'\n")).toEqual(['check-type-mismatch']);
    });

    it('reports an argument type mismatch', () => {
        expect(codes("local function take(value: number): void\nend\ntake('text')\n")).toEqual(['check-type-mismatch']);
    });

    it('reports too few arguments', () => {
        expect(codes('local function take(value: number): void\nend\ntake()\n')).toEqual(['check-argument-count']);
        expect(messages('local function take(value: number): void\nend\ntake()\n')[0]).toBe('This call expects at least 1 argument but received 0.');
    });

    it('reports too many arguments', () => {
        expect(codes('local function take(value: number): void\nend\ntake(1, 2)\n')).toEqual(['check-argument-count']);
        expect(messages('local function take(value: number): void\nend\ntake(1, 2)\n')[0]).toBe('This call expects at most 1 argument but received 2.');
    });

    it('counts arguments in the plural when there is more than one', () => {
        const source = 'local function take(first: number, second: number): void\nend\ntake()\n';

        expect(messages(source)[0]).toBe('This call expects at least 2 arguments but received 0.');
    });

    it('accepts a call that omits an optional parameter', () => {
        expect(codes("local function take(value?: string): void\nend\ntake()\n")).toEqual([]);
    });

    it('reports a return type mismatch', () => {
        expect(codes("local function value(): number\n    return 'text'\nend\n")).toEqual(['check-type-mismatch']);
    });

    it('infers the return type of an unannotated function declaration', () => {
        const source = 'local function value()\n    return 42\nend\nlocal label: string = value()\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('received "number"');
    });

    it('infers the return type of an unannotated function expression', () => {
        const source = 'local value = function()\n    return true\nend\nlocal total: number = value()\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('received "boolean"');
    });

    it('unifies alternative inferred return types', () => {
        const source = 'local function value(flag: boolean)\n    if flag then\n        return 1\n    end\n    return "one"\nend\nlocal enabled: boolean = value(true)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('received "number | string"');
    });

    it('reports a value returned from a void function', () => {
        expect(codes('local function value(): void\n    return 1\nend\n')).toEqual(['check-return-mismatch']);
    });

    it('accepts nil for an optional annotation', () => {
        expect(codes('local name?: string = nil')).toEqual([]);
    });

    it('rejects nil for a required annotation in strict mode', () => {
        expect(codes('local name: string = nil')).toEqual(['check-type-mismatch']);
    });

    it('points a strict nil mismatch at the two ways out', () => {
        const message = messages('local name: string = nil')[0];

        expect(message).toContain('Variable "name" expects "string" but received "nil".');
        expect(message).toContain('Annotate it "string?" to allow "nil", or put "#!nonstrict" at the top of the file.');
    });

    it('keeps the nil hint out of an unrelated mismatch', () => {
        expect(messages("local total: number = 'text'")[0]).toBe('Variable "total" expects "number" but received "string".');
        expect(messages('#!nonstrict\nlocal total: number = false\n')[0]).toBe('Variable "total" expects "number" but received "boolean".');
    });

    it('accepts any member of a union annotation', () => {
        expect(codes("local value: string | number = 'text'\nlocal other: string | number = 1\n")).toEqual([]);
    });

    it('rejects a value outside a union annotation', () => {
        expect(codes('local value: string | number = true')).toEqual(['check-type-mismatch']);
    });

    it('resolves type aliases before checking', () => {
        expect(codes('type PlayerId = number\nlocal id: PlayerId = 7\n')).toEqual([]);
        expect(codes("type PlayerId = number\nlocal id: PlayerId = 'seven'\n")).toEqual(['check-type-mismatch']);
    });

    it('accepts a function that matches a function type annotation', () => {
        const source = 'local double: fun(value: number): number = function(value: number): number\n    return value * 2\nend\n';

        expect(codes(source)).toEqual([]);
        expect(codes('local logger: fun(...): void = print')).toEqual([]);
    });

    it('rejects a function whose parameter type does not match the annotation', () => {
        const source = 'local double: fun(value: string): number = function(value: number): number\n    return value\nend\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('rejects a function whose return type does not match the annotation', () => {
        const source = 'local label: fun(value: number): string = function(value: number): number\n    return value\nend\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('rejects a non-function assigned to a function type annotation', () => {
        expect(codes('local double: fun(value: number): number = 1')).toEqual(['check-type-mismatch']);
    });

    it('treats the bare function type as the loose form of the same rule', () => {
        expect(codes('local loose: fun = print')).toEqual([]);
        expect(codes('local loose: fun = 1')).toEqual(['check-type-mismatch']);
        expect(codes('local anyReturn: fun(string) = print')).toEqual([]);
    });

    it('names function types in diagnostics using the source syntax', () => {
        expect(messages('local double: fun(value: number): number = 1')[0]).toBe(
            'Variable "double" expects "fun(number): number" but received "number".',
        );
        expect(messages('local loose: fun = 1')[0]).toBe('Variable "loose" expects "fun(...): any" but received "number".');
    });

    it('points at "fun" when a function type is written with the keyword', () => {
        expect(codes('local callback: function(string): void = print')).toEqual(['parse-invalid-type']);
        expect(messages('local callback: function(string): void = print')[0]).toContain('Use "fun" for function types.');
    });

    it('requires a numeric target for increment and decrement', () => {
        expect(codes('local total: number = 0\ntotal++\n')).toEqual([]);
        expect(codes('local total: number = 0\ntotal--\n')).toEqual([]);
        expect(codes("local label: string = 'x'\nlabel++\n")).toEqual(['check-invalid-operand']);
        expect(messages("local label: string = 'x'\nlabel++\n")[0]).toBe('Operator "++" cannot be applied to "string".');
    });

    it('accepts arrays where a table is expected', () => {
        expect(codes('local values: table = { 1, 2 }')).toEqual([]);
    });

    it('reports an unknown template interpolation root', () => {
        expect(codes('local greeting = `Ola ${missing}`')).toEqual(['check-unknown-template-root']);
    });

    it('accepts an in-scope template interpolation root', () => {
        expect(codes("local name: string = 'Thigas'\nlocal greeting = `Ola ${name:Guest}`\n")).toEqual([]);
    });

    it('shows the accepted interpolation forms when one is empty', () => {
        expect(codes('local greeting = `Ola ${}`')).toEqual(['check-empty-interpolation']);
        expect(messages('local greeting = `Ola ${}`')[0]).toContain('Write "${name}", "${object.field}", or "${name:fallback}".');
    });

    it('reports arithmetic applied to a string', () => {
        expect(codes("local name: string = 'Thigas'\nlocal total = name * 2\n")).toEqual(['check-invalid-operand']);
    });

    it('reports concatenation applied to a boolean', () => {
        expect(codes("local enabled: boolean = true\nlocal text = enabled .. 'x'\n")).toEqual(['check-invalid-operand']);
    });

    it('reports a compound assignment applied to a string', () => {
        expect(codes("local name: string = 'Thigas'\nname += 1\n")).toEqual(['check-invalid-operand']);
        expect(codes("local total: number = 1\ntotal ..= true\n")).toEqual(['check-invalid-operand']);
    });

    it('reports diagnostics with the position of the offending expression', () => {
        const [diagnostic] = compile("local total: number = 'text'").diagnostics;

        expect(diagnostic?.position).toEqual({ line: 1, column: 23, offset: 22 });
        expect(diagnostic?.stage).toBe('checker');
    });

    it('defaults to strict mode', () => {
        expect(compile('local a = 1').mode).toBe('strict');
    });

    it('reports nothing in nocheck mode', () => {
        const result = compile("#!nocheck\nlocal total: number = 'text'\n");

        expect(result.mode).toBe('nocheck');
        expect(result.diagnostics).toEqual([]);
        expect(result.code).toBe("local total = 'text'\n");
    });

    it('allows nil in nonstrict mode where strict rejects it', () => {
        expect(compile('#!nonstrict\nlocal name: string = nil\n').diagnostics).toEqual([]);
        expect(codes('#!strict\nlocal name: string = nil\n')).toEqual(['check-type-mismatch']);
    });

    it('widens unannotated locals to any in nonstrict mode', () => {
        expect(codes('#!nonstrict\nlocal total = 1\nlocal name: string = total\n')).toEqual([]);
        expect(codes('#!strict\nlocal total = 1\nlocal name: string = total\n')).toEqual(['check-type-mismatch']);
    });

    it('still reports a definite mismatch in nonstrict mode', () => {
        expect(codes("#!nonstrict\nlocal total: number = 'text'\n")).toEqual(['check-type-mismatch']);
    });

    it('still reports a call and a template error in nonstrict mode', () => {
        expect(codes('#!nonstrict\nlocal function take(value: number): void\nend\ntake()\n')).toEqual(['check-argument-count']);
        expect(codes('#!nonstrict\nlocal greeting = `Ola ${missing}`\n')).toEqual(['check-unknown-template-root']);
    });

    it('loses an extension rewrite when nonstrict widens the receiver', () => {
        const source = 'local items = {}\nprint(items.count)\n';

        expect(compile(`#!strict\n${source}`).code).toBe('local items = {}\nprint(table.size(items))\n');
        expect(compile(`#!nocheck\n${source}`).code).toBe('local items = {}\nprint(table.size(items))\n');
        expect(compile(`#!nonstrict\n${source}`).code).toBe('local items = {}\nprint(items.count)\n');
        expect(compile('#!nonstrict\nlocal items: any[] = {}\nprint(items.count)\n').code).toBe('local items = {}\nprint(table.size(items))\n');
    });

    it('never lets nocheck silence a syntax error', () => {
        const result = compile('#!nocheck\nlocal a = \n');

        expect(result.diagnostics.map((diagnostic) => diagnostic.stage)).toEqual(['parser']);
        expect(result.code).toBeNull();
    });
});
