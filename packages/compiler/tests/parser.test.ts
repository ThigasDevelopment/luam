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
    it('parses unions of string literal types', () => {
        const [statement] = statements("type PenisString = 'Marcio' | 'Penis Largo'\n");

        expect(statement).toMatchObject({
            kind: 'type-alias-statement',
            annotation: {
                kind: 'type-union',
                options: [
                    { kind: 'type-string-literal', value: 'Marcio' },
                    { kind: 'type-string-literal', value: 'Penis Largo' },
                ],
            },
        });
    });

    it('attaches decorators to classes and members in source order', () => {
        const [statement] = statements('@Getter\nclass Player {\n    @Getter\n    @Setter\n    name: string\n}\n');

        expect(statement).toMatchObject({
            kind: 'class-declaration',
            decorators: [{ name: 'Getter' }],
            members: [{ kind: 'class-field', decorators: [{ name: 'Getter' }, { name: 'Setter' }] }],
        });
    });

    it('parses optional class and interface fields with the marker on the name', () => {
        const classField = statements('class Player {\n    name?: string\n}\n')[0];
        const interfaceField = statements('interface Named {\n    name?: string\n}\n')[0];
        const classMember = classField?.kind === 'class-declaration' ? classField.members[0] : undefined;
        const interfaceMember = interfaceField?.kind === 'interface-declaration' ? interfaceField.members[0] : undefined;

        expect(classMember?.kind === 'class-field' && classMember.annotation?.kind).toBe('type-optional');
        expect(interfaceMember?.kind === 'interface-field' && interfaceMember.annotation.kind).toBe('type-optional');
    });

    it('parses multiple parent interfaces', () => {
        const [statement] = statements('interface Child extends Parent, Named {\n    value: string\n}\n');

        expect(statement).toMatchObject({
            kind: 'interface-declaration',
            name: 'Child',
            superInterfaces: ['Parent', 'Named'],
            members: [{ name: 'value' }],
        });
    });

    it('rejects a field optional marker placed on the type', () => {
        expect(codes('class Player {\n    name: string?\n}\n')).toEqual(['parse-optional-position']);
        expect(codes('interface Named {\n    name: string?\n}\n')).toEqual(['parse-optional-position']);
    });

    it('reports decorator arguments while retaining the class', () => {
        const result = parse('@Getter(true)\nclass Player {\n}\n');

        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['parse-decorator-arguments']);
        expect(result.program.body.map((statement) => statement.kind)).toEqual(['class-declaration']);
    });

    it('reports unsupported decorator targets and retains the declaration', () => {
        const result = parse('@Getter\nlocal value = 1\n');

        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['parse-unexpected-decorator']);
        expect(result.program.body.map((statement) => statement.kind)).toEqual(['local-statement']);
    });

    it('recovers after a broken decorator inside a class', () => {
        const result = parse('class Player {\n    @\n    broken: string\n    health: number\n}\n');
        const statement = result.program.body[0];

        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain('parse-unexpected-decorator');
        expect(statement?.kind === 'class-declaration' && statement.members.map((member) => member.name)).toContain('health');
    });

    it('parses a local declaration with a type annotation', () => {
        expect(statements("local name: string = 'Thigas'")).toMatchSnapshot();
    });

    it('parses a function declaration with parameter and return annotations', () => {
        const [statement] = statements('function greet(name: string, tag?: string): string\n    return name\nend');

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

    it('parses increment and decrement statements', () => {
        const [statement] = statements('total++');

        expect(statement).toMatchObject({ kind: 'assignment-statement', operator: '++', values: [] });
        expect(kinds('total--')).toEqual(['assignment-statement']);
        expect(kinds('self.count++')).toEqual(['assignment-statement']);
        expect(kinds('items[1]--')).toEqual(['assignment-statement']);
    });

    it('rejects increment on multiple targets and on calls', () => {
        expect(codes('a, b++')).toEqual(['parse-invalid-increment']);
        expect(codes('next()++')).toEqual(['parse-invalid-increment']);
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
        expect(statements('local callback: fun(string): void = print')).toMatchSnapshot();
        expect(kinds('local reducer: fun(total: number, value: number): number = nil')).toEqual(['local-statement']);
        expect(kinds('local logger: fun(...): void = print')).toEqual(['local-statement']);
        expect(kinds('local untyped: fun = print')).toEqual(['local-statement']);
        expect(kinds('local unknownReturn: fun(string) = print')).toEqual(['local-statement']);
        expect(kinds('local maybe?: fun(string): void = nil')).toEqual(['local-statement']);
        expect(kinds('local handlers: (fun(string): void)[] = {}')).toEqual(['local-statement']);
    });

    it('parses a function type as a parameter and as a return annotation', () => {
        expect(kinds('function on(handler: fun(string): void, times: number): void\nend')).toEqual(['function-declaration']);
        expect(kinds('function make(): fun(string): void\n    return print\nend')).toEqual(['function-declaration']);
    });

    it('parses a tuple return annotation', () => {
        const [statement] = statements('function describe(): (string, boolean)\n    return "name", true\nend\n');

        expect(statement).toMatchObject({
            kind: 'function-declaration',
            returnAnnotation: { kind: 'type-tuple', elements: [{ name: 'string' }, { name: 'boolean' }] },
        });
    });

    it('parses tuple annotations outside return positions', () => {
        const [statement] = statements('local result: (string, number) = nil');

        expect(statement).toMatchObject({ declarations: [{ annotation: { kind: 'type-tuple' } }] });
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
        expect(parse('#!strict\nlocal total: number = 0\nfor index = 1, 10 do\n    total += index\nend\n').program).toMatchSnapshot();
    });
});
