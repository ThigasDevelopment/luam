import { describe, expect, it } from 'vitest';

import type { Expression, LocalStatement, Statement } from '@compiler/parser/ast';
import { parse } from '@compiler/parser/parser';

function statements(source: string): Statement[] {
    const result = parse(source);

    expect(result.diagnostics).toEqual([]);

    return result.program.body;
}

function kinds(source: string): string[] {
    return statements(source).map((statement) => statement.kind);
}

function codes(source: string): string[] {
    return parse(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function shape(expression: Expression): string {
    if (expression.kind === 'binary-expression') {
        return `(${shape(expression.left)} ${expression.operator} ${shape(expression.right)})`;
    }

    if (expression.kind === 'unary-expression') {
        return `(${expression.operator} ${shape(expression.operand)})`;
    }

    if (expression.kind === 'group-expression') {
        return shape(expression.expression);
    }

    if (expression.kind === 'number-literal') {
        return expression.raw;
    }

    return expression.kind === 'identifier' ? expression.name : expression.kind;
}

function firstValue(source: string): Expression {
    const [statement] = statements(source);
    const value = (statement as LocalStatement).values[0];

    if (value === undefined) {
        throw new Error('Expected a value expression.');
    }

    return value;
}

describe('parser', () => {
    it('parses a local declaration with a type annotation', () => {
        expect(statements("local name: string = 'Thigas'")).toMatchSnapshot();
    });

    it('parses a function declaration with parameter and return annotations', () => {
        const [statement] = statements('function greet(name: string, tag: string?): string\n    return name\nend');

        expect(statement?.kind).toBe('function-declaration');
        expect(statement).toMatchSnapshot();
    });

    it('parses local functions and anonymous functions', () => {
        expect(kinds('local function double(value) return value * 2 end')).toEqual(['function-declaration']);
        expect(firstValue('local handler = function() return 1 end').kind).toBe('function-expression');
    });

    it('parses method declarations with an implicit receiver', () => {
        const [statement] = statements('function player:rename(name: string): void\nend');

        expect(statement).toMatchObject({ kind: 'function-declaration', isMethod: true });
    });

    it('parses if, elseif, and else clauses', () => {
        const [statement] = statements('if a then\n    b()\nelseif c then\n    d()\nelse\n    e()\nend');

        expect(statement).toMatchObject({ kind: 'if-statement' });
        expect(statement?.kind === 'if-statement' && statement.clauses.length).toBe(2);
        expect(statement?.kind === 'if-statement' && statement.alternate?.length).toBe(1);
    });

    it('parses while, repeat, and do blocks', () => {
        expect(kinds('while a do b() end')).toEqual(['while-statement']);
        expect(kinds('repeat b() until a')).toEqual(['repeat-statement']);
        expect(kinds('do b() end')).toEqual(['do-statement']);
    });

    it('parses numeric and generic for loops', () => {
        expect(kinds('for index = 1, 10, 2 do print(index) end')).toEqual(['numeric-for-statement']);
        expect(kinds('for key, value in pairs(items) do print(key) end')).toEqual(['generic-for-statement']);
    });

    it('parses compound assignment operators', () => {
        const [statement] = statements('total += 1');

        expect(statement).toMatchObject({ kind: 'assignment-statement', operator: '+=' });
        expect(kinds('total ..= "x"')).toEqual(['assignment-statement']);
    });

    it('applies Lua operator precedence', () => {
        expect(shape(firstValue('local a = 1 + 2 * 3'))).toBe('(1 + (2 * 3))');
        expect(shape(firstValue('local a = 1 * 2 + 3'))).toBe('((1 * 2) + 3)');
        expect(shape(firstValue('local a = not b and c'))).toBe('((not b) and c)');
        expect(shape(firstValue('local a = -b ^ 2'))).toBe('(- (b ^ 2))');
    });

    it('treats concatenation and exponentiation as right associative', () => {
        expect(shape(firstValue("local a = 'x' .. 'y' .. 'z'"))).toBe('(string-literal .. (string-literal .. string-literal))');
        expect(shape(firstValue('local a = 2 ^ 3 ^ 2'))).toBe('(2 ^ (3 ^ 2))');
    });

    it('preserves explicit grouping', () => {
        expect(firstValue('local a = (1 + 2) * 3')).toMatchObject({ kind: 'binary-expression', left: { kind: 'group-expression' } });
    });

    it('parses member access, index access, and method calls', () => {
        expect(firstValue('local a = player.name').kind).toBe('member-expression');
        expect(firstValue("local a = players['first']").kind).toBe('index-expression');
        expect(firstValue('local a = player:getName()')).toMatchObject({ kind: 'call-expression', method: 'getName' });
    });

    it('parses call sugar for string and table arguments', () => {
        expect(kinds("require 'module'")).toEqual(['call-statement']);
        expect(kinds('build { name = 1 }')).toEqual(['call-statement']);
    });

    it('parses table constructors with positional, named, and computed fields', () => {
        expect(firstValue("local a = { 1, name = 'x', [2] = 'y' }")).toMatchSnapshot();
    });

    it('parses function type annotations', () => {
        expect(statements('local callback: function(string): void = print')).toMatchSnapshot();
        expect(kinds('local reducer: function(total: number, value: number): number = nil')).toEqual(['local-statement']);
        expect(kinds('local logger: function(...): void = print')).toEqual(['local-statement']);
        expect(kinds('local untyped: function = print')).toEqual(['local-statement']);
        expect(kinds('local unknownReturn: function(string) = print')).toEqual(['local-statement']);
        expect(kinds('local maybe: (function(string): void)? = nil')).toEqual(['local-statement']);
        expect(kinds('local handlers: (function(string): void)[] = {}')).toEqual(['local-statement']);
    });

    it('parses a function type as a parameter and as a return annotation', () => {
        expect(kinds('function on(handler: function(string): void, times: number): void\nend')).toEqual(['function-declaration']);
        expect(kinds('function make(): function(string): void\n    return print\nend')).toEqual(['function-declaration']);
    });

    it('reports a parenthesized type that holds more than one type', () => {
        expect(codes('local broken: (string, number) = nil')).toEqual(['parse-invalid-type']);
    });

    it('parses type aliases with generic parameters', () => {
        expect(statements('type Result<T> = T | string')).toMatchSnapshot();
    });

    it('parses every Lua block form without braces', () => {
        const source = 'if a then\n    b()\nend\nwhile a do\n    b()\nend\nfor i = 1, 2 do\n    b()\nend\nrepeat\n    b()\nuntil a\n';

        expect(kinds(source)).toEqual(['if-statement', 'while-statement', 'numeric-for-statement', 'repeat-statement']);
    });

    it('reports a missing end with a position', () => {
        const [diagnostic] = parse('if a then\n    b()\n').diagnostics;

        expect(diagnostic?.code).toBe('parse-unexpected-token');
        expect(diagnostic?.message).toContain('end');
    });

    it('reports an unexpected end', () => {
        expect(codes('local a = 1\nend\n')).toEqual(['parse-unexpected-token']);
    });

    it('reports a statement that is neither a call nor an assignment', () => {
        expect(codes('local a = 1\na + 1\n')).toEqual(['parse-invalid-statement']);
    });

    it('recovers after a syntax error and keeps parsing', () => {
        const result = parse('local a = 1\na + 1\nlocal b = 2\n');

        expect(result.diagnostics).toHaveLength(1);
        expect(result.program.body.map((statement) => statement.kind)).toEqual(['local-statement', 'local-statement']);
    });

    it('matches the program snapshot for a typed program', () => {
        expect(parse('--!strict\nlocal total: number = 0\nfor index = 1, 10 do\n    total += index\nend\n').program).toMatchSnapshot();
    });
});
