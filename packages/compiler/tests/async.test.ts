import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { scan } from '@compiler/lexer/lexer';
import type { Expression, FunctionDeclaration, LocalStatement, Statement } from '@compiler/parser/ast';
import type { ClassDeclaration } from '@compiler/parser/declaration-nodes';
import { parse } from '@compiler/parser/parser';

const SERVER_FILE = 'src/server/main.luam';

function statements(source: string): Statement[] {
    const result = parse(source);

    expect(result.diagnostics).toEqual([]);

    return result.program.body;
}

function kinds(source: string): string[] {
    return statements(source).map((statement) => statement.kind);
}

function shape(expression: Expression): string {
    if (expression.kind === 'binary-expression') {
        return `(${shape(expression.left)} ${expression.operator} ${shape(expression.right)})`;
    }

    if (expression.kind === 'await-expression') {
        return `(await ${shape(expression.operand)})`;
    }

    if (expression.kind === 'call-expression') {
        return `${shape(expression.callee)}()`;
    }

    if (expression.kind === 'member-expression') {
        return `${shape(expression.object)}.${expression.property}`;
    }

    if (expression.kind === 'number-literal') {
        return expression.raw;
    }

    return expression.kind === 'identifier' ? expression.name : expression.kind;
}

function diagnostics(source: string): string[] {
    return parse(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function awaited(body: string): Expression {
    const declaration = statements(`async function main()\n    ${body}\nend\n`)[0] as FunctionDeclaration;
    const local = declaration.body[0] as LocalStatement;
    const value = local.values[0];

    if (value === undefined) {
        throw new Error('The fixture declares no value.');
    }

    return value;
}

function codes(source: string): string[] {
    return compile(source, { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => diagnostic.code);
}

function code(source: string): string {
    const result = compile(source, { filePath: SERVER_FILE });

    expect(result.diagnostics).toEqual([]);

    return result.code ?? '';
}

function helpers(source: string): string[] {
    return [...compile(source, { filePath: SERVER_FILE }).requiredHelpers].sort();
}

describe('the lexer', () => {
    it('reserves async and await', () => {
        const tokens = scan('async function load()\n    await other()\nend\n').tokens.filter((token) => token.kind !== 'eof');

        expect(tokens[0]).toMatchObject({ kind: 'keyword', value: 'async' });
        expect(tokens.find((token) => token.value === 'await')).toMatchObject({ kind: 'keyword' });
    });
});

describe('the parser', () => {
    it('parses async on a declaration, an expression and a method', () => {
        expect(kinds('async function load()\nend\n')).toEqual(['function-declaration']);
        expect((statements('async function load()\nend\n')[0] as FunctionDeclaration).isAsync).toBe(true);
        expect((statements('local run = async function ()\nend\n')[0] as LocalStatement).values[0]).toMatchObject({ isAsync: true });

        const declared = statements('class Session {\n    load = async function ()\n    end\n}\n')[0] as ClassDeclaration;

        expect(declared.members[0]).toMatchObject({ kind: 'class-method', isAsync: true });
    });

    it('parses a local async function', () => {
        expect((statements('local async function load()\nend\n')[0] as FunctionDeclaration)).toMatchObject({ isAsync: true, isLocal: true });
    });

    it('binds await tighter than a binary operator and looser than a call', () => {
        expect(shape(awaited('local value = await load()'))).toBe('(await load())');
        expect(shape(awaited('local value = await first.second'))).toBe('(await first.second)');
        expect(shape(awaited('local value = await first + 1'))).toBe('((await first) + 1)');
    });

    it('refuses async and await as a name', () => {
        expect(diagnostics('local async = 1\n')).toEqual(['parse-reserved-name']);
        expect(diagnostics('local await = 1\n')).toEqual(['parse-reserved-name']);
        expect(diagnostics('local function await()\nend\n')).not.toEqual([]);
    });

    it('keeps both words legal as a property name', () => {
        expect(kinds('local value = { async = 1, await = 2 }\nvalue.async = 3\nprint(value.await)\n')).toEqual([
            'local-statement',
            'assignment-statement',
            'call-statement',
        ]);
    });

    it('reads await as an operator inside a plain function nested in an async body', () => {
        const source = 'async function load()\n    local run = function ()\n        local value = await other()\n\n        return value\n    end\nend\n';

        expect(kinds(source)).toEqual(['function-declaration']);
        expect(codes(source)).toEqual(['check-await-outside-async']);
    });

    it('erases the async token from the preserved source', () => {
        expect(code('async function load()\nend\n')).not.toContain('async');
    });
});

describe('the checker', () => {
    it('binds a local to the type the awaited function declares', () => {
        expect(codes('async function load(): number\n    return 1\nend\n\nasync function main()\n    local value: number = await load()\nend\n')).toEqual([]);
        expect(codes('async function load(): number\n    return 1\nend\n\nasync function main()\n    local value: string = await load()\nend\n')).toEqual([
            'check-type-mismatch',
        ]);
    });

    it('reports await outside an async function', () => {
        expect(codes('function plain()\n    local value = await other()\n\n    return value\nend\n')).toEqual(['check-await-outside-async']);
        expect(codes('local value = await other()\n')).toEqual(['check-await-outside-async']);
    });

    it('reports an await on a value that is not a promise', () => {
        expect(codes('async function main()\n    local value = await 1\nend\n')).toEqual(['check-await-non-promise']);
    });

    it('reports an async function annotated with the promise itself', () => {
        expect(codes('async function load(): Promise\n    return 1\nend\n')).toEqual(['check-async-return-annotation']);
    });

    it('warns about sleep where no coroutine can be suspended', () => {
        expect(codes('sleep(100)\n')).toEqual(['check-sleep-outside-async']);
        expect(codes('function slow()\n    sleep(100)\nend\n')).toEqual(['check-sleep-outside-async']);
        expect(codes('async function slow()\n    sleep(100)\nend\n')).toEqual([]);
        expect(codes("local pool = new Threads('concurrent', 'normal')\n\npool:add(function ()\n    sleep(100)\nend)\n")).toEqual([]);
        expect(codes('function sleep(milliseconds: number): void\nend\n\nsleep(100)\n')).toEqual(['check-shadowed-api']);
    });

    it('constructs a promise with new and rejects the static form', () => {
        expect(codes('local pending = new Promise(function (resolve, reject) end)\n')).toEqual([]);
        expect(codes('local pending = Promise.new(function (resolve, reject) end)\n')).toEqual(['check-native-constructor']);
    });

    it('reads the settle pair as a multi-return', () => {
        expect(codes('async function main()\n    local ok, reason = Promise.settle(Promise.resolve(1))\nend\n')).toEqual([]);
    });

    it('keeps a module that declares its own Promise interface compiling', () => {
        expect(codes('interface Promise {\n    state: string\n}\n\nlocal function take(value: Promise): void\n    print(value.state)\nend\n')).toEqual([]);
    });
});

describe('the emitter', () => {
    it('wraps a declaration, an expression and a method in a spawn', () => {
        expect(code('async function load(id: number)\n    print(id)\nend\n')).toBe(
            'function load(id) return Promise.spawn(function(id)\n    print(id)\nend, id) end\n',
        );
        expect(code('local run = async function (id: number)\n    print(id)\nend\n')).toBe(
            'local run = function(id) return Promise.spawn(function(id)\n    print(id)\nend, id) end\n',
        );
        expect(code('async function Session:load(id: number)\n    print(id)\nend\n')).toBe(
            'function Session:load(id) return Promise.spawn(function(self, id)\n    print(id)\nend, self, id) end\n',
        );
    });

    it('forwards the varargs of a variadic async function', () => {
        expect(code('async function report(...)\n    print(...)\nend\n')).toBe(
            'function report(...) return Promise.spawn(function(...)\n    print(...)\nend, ...) end\n',
        );
    });

    it('rewrites only the head of a construction and keeps the layout around it', () => {
        const source = "#!server\nlocal pending: Promise<string> = new Promise(\n    function (resolve, reject)\n\n        resolve('done')\n    end\n);\n";
        const generated = compile(source, { filePath: SERVER_FILE, development: true }).code ?? '';

        expect(generated.split('\n').length).toBe(source.split('\n').length);
        expect(generated).toContain('local pending = Promise.new(');
        expect(generated).toContain('    function (resolve, reject)');
    });

    it('keeps an async declaration inside the lines its author wrote', () => {
        const source = '#!server\nasync function first()\n\nend\n\nasync function second()\n    await first()\nend\n';
        const generated = compile(source, { filePath: SERVER_FILE, development: true }).code ?? '';

        expect(generated.split('\n').length).toBe(source.split('\n').length);
        expect(generated.startsWith('--!server\n')).toBe(true);
    });

    it('emits await as a plain call and leaves the statement alone', () => {
        expect(code('async function main()\n    local value = await load()\nend\n')).toContain('local value = Promise.await(load())');
    });

    it('ships the promise helper for a bare async function and the whole chain for a pool', () => {
        expect(helpers('async function load()\nend\n')).toEqual(['promise']);
        expect(helpers("local pool = new Threads('concurrent', 'normal')\n")).toEqual(['promise', 'threads']);
        expect(helpers('local task = new Async(100)\n')).toEqual(['async', 'promise', 'threads']);
        expect(helpers('function sleep(milliseconds: number): void\nend\n\nsleep(10)\n')).toEqual([]);
    });
});
