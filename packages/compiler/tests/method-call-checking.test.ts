import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';

const SERVER_FILE = 'src/server/main.luam';

interface Report {
    code: string;
    message: string;
    line: number;
    column: number;
}

function report(source: string): Report[] {
    return compile(source, { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => ({
        code: diagnostic.code,
        message: diagnostic.message,
        line: diagnostic.position.line,
        column: diagnostic.position.column,
    }));
}

function codes(source: string): string[] {
    return report(source).map((diagnostic) => diagnostic.code);
}

const COUNTER = 'type Counter = { bump: fun(step: number): number }\nlocal counter: Counter = { bump = function(step: number): number return step end }\n';

const SELF_COUNTER =
    'type Counter = { bump: fun(self: Counter, step: number): number }\n' +
    'local counter: Counter = { bump = function(self: Counter, step: number): number return step end }\n';

const WALLET =
    'class Wallet {\n' +
    '    deposit = function (amount: number): number\n        return amount\n    end\n' +
    '}\n' +
    'local wallet = new Wallet()\n';

const SHAPE =
    'interface Shape {\n    area: fun(scale: number): number\n}\n' + 'local shape: Shape = { area = function (scale: number): number return scale end }\n';

const PLAYER = 'local player = getPlayerFromName("bob")\n';

function oopCodes(source: string): string[] {
    return compile(source, { filePath: SERVER_FILE, compilerOptions: compilerOptions({ oop: true }) }).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('method calls on object types', () => {
    it('reports too many arguments', () => {
        expect(codes(`${COUNTER}counter:bump(1, 2)\n`)).toEqual(['check-argument-count']);
    });

    it('reports too few arguments', () => {
        expect(codes(`${COUNTER}counter:bump()\n`)).toEqual(['check-argument-count']);
    });

    it('reports a wrong argument type at the argument position', () => {
        const diagnostics = report(`${COUNTER}counter:bump('one')\n`);

        expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['check-type-mismatch']);
        expect(diagnostics[0]?.message).toBe('Argument 1 expects "number" but received "string".');
        expect(diagnostics[0]?.line).toBe(3);
        expect(diagnostics[0]?.column).toBe(14);
    });

    it('accepts a call that matches the declared signature', () => {
        expect(codes(`${COUNTER}local total: number = counter:bump(1)\n`)).toEqual([]);
    });

    it('reports nothing for a member the object type does not declare', () => {
        expect(codes(`${COUNTER}counter:missing(1, 2, 3)\n`)).toEqual([]);
    });
});

describe('the implicit self argument', () => {
    it('reports the same arity with and without an explicit self', () => {
        expect(codes(`${SELF_COUNTER}counter:bump(1, 2)\n`)).toEqual(codes(`${COUNTER}counter:bump(1, 2)\n`));
        expect(codes(`${SELF_COUNTER}counter:bump()\n`)).toEqual(codes(`${COUNTER}counter:bump()\n`));
    });

    it('reports the same argument message with and without an explicit self', () => {
        const explicit = report(`${SELF_COUNTER}counter:bump('one')\n`);
        const implicit = report(`${COUNTER}counter:bump('one')\n`);

        expect(explicit.map((diagnostic) => diagnostic.message)).toEqual(implicit.map((diagnostic) => diagnostic.message));
    });

    it('accepts a matching call on a method that declares self', () => {
        expect(codes(`${SELF_COUNTER}local total: number = counter:bump(1)\n`)).toEqual([]);
    });
});

describe('method calls on native library instances', () => {
    it('reports a call with too many arguments', () => {
        expect(codes('local task = new Async(100)\nlocal interval = task:getInterval(1, 2)\n')).toEqual(['check-argument-count']);
    });

    it('returns the declared return type', () => {
        expect(codes('local task = new Async(100)\nlocal interval: string = task:getInterval()\n')).toEqual(['check-type-mismatch']);
        expect(codes('local task = new Async(100)\nlocal interval: number = task:getInterval()\n')).toEqual([]);
    });

    it('checks argument types on a thread pool', () => {
        expect(codes("local pool = new Threads('concurrent', 'normal')\npool:remove('first')\n")).toEqual(['check-type-mismatch']);
    });

    it('does not widen the helper trigger', () => {
        expect([...compile("outputChatBox('hi', root)\n", { filePath: SERVER_FILE }).requiredHelpers]).toEqual([]);
    });
});

describe('method calls on other receivers', () => {
    it('keeps checking a class receiver', () => {
        expect(codes(`${WALLET}wallet:deposit(1, 2)\n`)).toEqual(['check-argument-count']);
        expect(codes(`${WALLET}wallet:deposit('one')\n`)).toEqual(['check-type-mismatch']);
        expect(codes(`${WALLET}local total: number = wallet:deposit(1)\n`)).toEqual([]);
    });

    it('keeps checking an interface receiver', () => {
        expect(codes(`${SHAPE}shape:area(1, 2)\n`)).toEqual(['check-argument-count']);
        expect(codes(`${SHAPE}shape:area('one')\n`)).toEqual(['check-type-mismatch']);
    });

    it('keeps checking an MTA element receiver', () => {
        expect(oopCodes(`${PLAYER}player:getName(1)\n`)).toEqual(['check-argument-count']);
        expect(oopCodes(`${PLAYER}local name: string = player:getName()\n`)).toEqual([]);
    });

    it('reports nothing on a receiver typed any', () => {
        expect(codes('local anything: any = nil\nanything:whatever(1, 2, 3)\n')).toEqual([]);
    });
});
