import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface Rule {
    name?: string;
    match?: string;
    begin?: string;
    end?: string;
    patterns?: Rule[];
    captures?: Record<string, { name?: string; patterns?: Rule[] }>;
    beginCaptures?: Record<string, { name: string }>;
    endCaptures?: Record<string, { name: string }>;
    include?: string;
}

interface Grammar {
    repository: Record<string, Rule>;
}

const grammar: Grammar = JSON.parse(readFileSync(fileURLToPath(new URL('../syntaxes/luam.tmLanguage.json', import.meta.url)), 'utf8'));

function raw(name: string): Rule {
    const rule = grammar.repository[name];

    if (rule === undefined) {
        throw new Error(`The grammar has no "${name}" rule.`);
    }

    return rule;
}

function rules(name: string): Rule[] {
    const rule = raw(name);

    return rule.patterns ?? [rule];
}

function scopeOf(name: string, sample: string, capture: string): string | null {
    for (const rule of rules(name)) {
        const source = rule.match ?? rule.begin;

        if (source !== undefined && new RegExp(source).test(sample)) {
            return rule.captures?.[capture]?.name ?? rule.beginCaptures?.[capture]?.name ?? rule.name ?? null;
        }
    }

    return null;
}

function names(name: string): string[] {
    return rules(name)
        .map((rule) => rule.name)
        .filter((value): value is string => value !== undefined);
}

describe('grammar scopes', () => {
    it('gives every environment directive its own scope', () => {
        expect(scopeOf('directive', '#!server', '2')).toBe('keyword.control.directive.environment.server.luam');
        expect(scopeOf('directive', '#!client', '2')).toBe('keyword.control.directive.environment.client.luam');
        expect(scopeOf('directive', '#!shared', '2')).toBe('keyword.control.directive.environment.shared.luam');
        expect(scopeOf('directive', '#!strict', '2')).toBe('keyword.control.directive.strictness.luam');
        expect(scopeOf('directive', '#!server', '1')).toBe('punctuation.definition.directive.luam');
    });

    it('separates a bare call from a method call', () => {
        expect(scopeOf('call', 'spawn(player)', '1')).toBe('entity.name.function.call.luam');
        expect(scopeOf('method', 'core:start()', '2')).toBe('entity.name.function.method.luam');
        expect(scopeOf('call', 'spawn(player)', '1')).not.toBe(scopeOf('method', 'core:start()', '2'));
    });

    it('keeps the lua library scopes for the lists it can prove', () => {
        expect(names('support')).toEqual(['support.function.library.luam', 'support.function.luam']);
    });

    it('scopes a constructor call apart from a class declaration head', () => {
        expect(scopeOf('declaration', 'new Vehicle(', '2')).toBe('entity.name.function.constructor.luam');
        expect(scopeOf('declaration', 'class Vehicle {', '2')).toBe('entity.name.type.class.luam');
    });

    it('scopes declared parameters through the function head', () => {
        const head = rules('function')[0];

        expect(new RegExp(head?.begin ?? '').test('function formatName(name: string): string')).toBe(true);
        expect(new RegExp(head?.begin ?? '').test('deposit = function (amount: number): void')).toBe(true);
        expect(head?.patterns?.[0]?.include).toBe('#parameterList');
        expect(scopeOf('parameterList', 'amount', '1')).toBe('variable.parameter.luam');
    });

    it('scopes enum entries only inside an enum body', () => {
        const body = raw('enumBody');

        expect(new RegExp(body?.begin ?? '').test('enum MatchState {')).toBe(true);
        expect(new RegExp(body?.begin ?? '').test('local values = {')).toBe(false);
        expect(body?.patterns?.some((rule) => rule.name === 'variable.other.enummember.luam')).toBe(true);
    });

    it('scopes a table literal key apart from the value beside it', () => {
        const literal = raw('tableLiteral');
        const key = literal?.patterns?.find((rule) => rule.captures?.['1']?.name === 'meta.object-literal.key.luam');

        expect(key).toBeDefined();
        expect(new RegExp(key?.match ?? '').test('name = value')).toBe(true);
        expect(new RegExp(key?.match ?? '').test('name == value')).toBe(false);
    });

    it('scopes a field declaration without claiming a method call statement', () => {
        const field = rules('field')[0];
        const expression = new RegExp(field?.match ?? '');

        expect(expression.test('    label: string')).toBe(true);
        expect(expression.test('    balance: number = 0')).toBe(true);
        expect(expression.test('    state: number | nil = nil')).toBe(true);
        expect(expression.test('    core:start()')).toBe(false);
        expect(expression.test('    describe(): string')).toBe(false);
        expect(field?.captures?.['1']?.name).toBe('variable.other.property.luam');
    });

    it('scopes the ambient punctuation the theme dims', () => {
        expect(names('punctuation')).toEqual([
            'punctuation.section.parens.begin.luam',
            'punctuation.section.parens.end.luam',
            'punctuation.section.brackets.begin.luam',
            'punctuation.section.brackets.end.luam',
            'punctuation.section.braces.begin.luam',
            'punctuation.section.braces.end.luam',
            'punctuation.separator.comma.luam',
            'punctuation.terminator.statement.luam',
            'punctuation.accessor.luam',
        ]);
    });

    it('scopes type punctuation apart from arithmetic', () => {
        const inside = names('typeBody');

        expect(inside).toContain('keyword.operator.type.luam');
        expect(inside).toContain('punctuation.definition.typeparameters.begin.luam');
        expect(inside).toContain('punctuation.definition.array.luam');

        const arithmetic = rules('operator').find((rule) => rule.name === 'keyword.operator.arithmetic.luam');
        const union = rules('operator').find((rule) => rule.name === 'keyword.operator.type.luam');

        expect(new RegExp(arithmetic?.match ?? '').test('|')).toBe(false);
        expect(new RegExp(union?.match ?? '').test('|')).toBe(true);
    });

    it('routes the annotation body through the type patterns', () => {
        const annotation = rules('annotation')[1];

        expect(annotation?.captures?.['2']?.name).toBe('meta.type.luam');
        expect(annotation?.captures?.['2']?.patterns?.[0]?.include).toBe('#typeBody');
    });
});
