import { describe, expect, it } from 'vitest';

import { check } from '@compiler/checker/checker';
import { type FunctionType } from '@compiler/checker/types';
import { compile } from '@compiler/index';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';
import { type Expression } from '@compiler/parser/ast';
import { parse } from '@compiler/parser/parser';

function callbackType(source: string, argument = 0): FunctionType {
    const parsed = parse(source);
    const checked = check(parsed.program, 'strict');
    const statement = parsed.program.body.at(-1);

    if (statement?.kind !== 'call-statement') {
        throw new Error('Expected the source to end with a call statement.');
    }

    let expression: Expression | undefined = statement.expression.args[argument];

    while (expression?.kind === 'group-expression') {
        expression = expression.expression;
    }

    if (expression?.kind !== 'function-expression') {
        throw new Error('Expected the selected argument to be a function expression.');
    }

    const type = checked.types.get(expression);

    if (type?.kind !== 'function') {
        throw new Error('Expected the checker to record a function type.');
    }

    return type;
}

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('contextual callback typing', () => {
    it('types unannotated parameters passed to a global project function', () => {
        const source = [
            'interface Player { name: string kick(reason: string): void }',
            'function register(handler: fun(Player, string): void): void end',
            'register(function(player, command)',
            '    local name: string = player.name',
            '    player:kick(command)',
            'end)',
        ].join('\n');

        expect(codes(source)).toEqual([]);
        expect(callbackType(source).parameters.map((type) => type.kind === 'named' ? type.name : type.kind)).toEqual(['Player', 'string']);
    });

    it('types unannotated parameters from a generated MTA callback', () => {
        const source = [
            "addCommandHandler('status', function(player, command)",
            '    local name: string = player.name',
            '    local normalized: string = command.trim',
            'end)',
        ].join('\n');
        const result = compile(source, { environment: 'server', compilerOptions: compilerOptions({ oop: true }) });

        expect(result.diagnostics).toEqual([]);
    });

    it('uses contextual parameters for local and grouped calls', () => {
        const direct = 'local function register(handler: fun(number): void): void end\nregister(function(value) local total: number = value end)';
        const grouped = 'local function register(handler: fun(number): void): void end\nregister((function(value) local total: number = value end))';

        expect(codes(direct)).toEqual([]);
        expect(codes(grouped)).toEqual([]);
        expect(callbackType(grouped).parameters[0]?.kind).toBe('number');
    });

    it('uses contextual parameters for user methods, constructors, new, and super', () => {
        const method = [
            'class Registry { use = function(handler: fun(number): void): void end }',
            'local registry = new Registry()',
            'registry:use(function(value) local total: number = value end)',
        ].join('\n');
        const constructor = [
            'class Registry { constructor = function(handler: fun(number): void) end }',
            'local registry = new Registry(function(value) local total: number = value end)',
        ].join('\n');
        const superCall = [
            'class Parent { use = function(handler: fun(number): void): void end }',
            'class Child extends Parent {',
            '    use = function(handler: fun(number): void): void',
            '        super(function(value) local total: number = value end)',
            '    end',
            '}',
        ].join('\n');

        expect(codes(method)).toEqual([]);
        expect(codes(constructor)).toEqual([]);
        expect(codes(superCall)).toEqual([]);
    });

    it('unwraps optional callbacks and merges unambiguous callable unions', () => {
        const optional = 'local function register(handler?: fun(number): void): void end\nregister(function(value) local total: number = value end)';
        const union = [
            'local function register(handler: (fun(number): void) | (fun(number): string)): void end',
            'register(function(value) local total: number = value end)',
        ].join('\n');

        expect(codes(optional)).toEqual([]);
        expect(codes(union)).toEqual([]);
        expect(callbackType(optional).parameters[0]?.kind).toBe('number');
        expect(callbackType(union).parameters[0]?.kind).toBe('number');
    });

    it('keeps ambiguous, extra, and unavailable parameter context permissive', () => {
        const ambiguous = [
            'local function register(handler: (fun(number, string): void) | (fun(number, boolean): void)): void end',
            'register(function(value, uncertain) local total: number = value local text: string = uncertain end)',
        ].join('\n');
        const extra = 'local function register(handler: fun(number): void): void end\nregister(function(value, extra) local text: string = extra end)';
        const unavailable = 'local register: any\nregister(function(value) local text: string = value end)';

        expect(codes(ambiguous)).toEqual([]);
        expect(codes(extra)).toEqual([]);
        expect(codes(unavailable)).toEqual([]);
        expect(callbackType(ambiguous).parameters.map((type) => type.kind)).toEqual(['number', 'any']);
        expect(callbackType(extra).parameters.map((type) => type.kind)).toEqual(['number', 'any']);
        expect(callbackType(unavailable).parameters[0]?.kind).toBe('any');
    });

    it('keeps authored parameter and inferred return types authoritative', () => {
        const parameter = 'local function register(handler: fun(number): void): void end\nregister(function(value: string): void end)';
        const result = 'local function register(handler: fun(number): string): void end\nregister(function(value) return value end)';

        expect(codes(parameter)).toEqual(['check-type-mismatch']);
        expect(codes(result)).toEqual(['check-type-mismatch']);
        expect(compile(parameter).code).toBeNull();
        expect(compile(result).code).toBeNull();
    });

    it('applies contextual callback types in nonstrict mode', () => {
        const source = '#!nonstrict\nlocal function register(handler: fun(number): void): void end\nregister(function(value) local text: string = value end)';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('checks callback bodies after binding contextual parameters', () => {
        const source = [
            'interface Player { name: string }',
            'local function register(handler: fun(Player): void): void end',
            'register(function(player) print(player.missing) end)',
        ].join('\n');
        const result = compile(source);

        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['check-unknown-member']);
        expect(result.code).toBeNull();
    });

    it('does not change emitted Lua when callback annotations are inferred', () => {
        const prefix = 'local function register(handler: fun(number): void): void end\n';
        const inferred = compile(`${prefix}register(function(value) print(value) end)`);
        const authored = compile(`${prefix}register(function(value: number) print(value) end)`);

        expect(inferred.diagnostics).toEqual([]);
        expect(authored.diagnostics).toEqual([]);
        expect(inferred.code).toBe(authored.code);
    });
});
