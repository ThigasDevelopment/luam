import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface GrammarRule {
    name?: string;
    match?: string;
    begin?: string;
    end?: string;
    patterns?: GrammarRule[];
    captures?: Record<string, { name: string }>;
    include?: string;
}

interface Grammar {
    name: string;
    scopeName: string;
    patterns: GrammarRule[];
    repository: Record<string, GrammarRule>;
}

const grammar: Grammar = JSON.parse(readFileSync(fileURLToPath(new URL('../syntaxes/luam.tmLanguage.json', import.meta.url)), 'utf8'));

function rulePatterns(name: string): GrammarRule[] {
    const rule = grammar.repository[name];

    if (rule === undefined) {
        throw new Error(`The grammar has no "${name}" rule.`);
    }

    return rule.patterns ?? [rule];
}

function expressions(name: string): RegExp[] {
    return rulePatterns(name).flatMap((rule) =>
        [rule.match, rule.begin].filter((value): value is string => value !== undefined).map((value) => new RegExp(value)),
    );
}

function matchesAny(name: string, sample: string): boolean {
    return expressions(name).some((expression) => expression.test(sample));
}

describe('grammar', () => {
    it('declares the luam scope', () => {
        expect(grammar.scopeName).toBe('source.luam');
        expect(grammar.name).toBe('Luam');
    });

    it('resolves every included rule', () => {
        const includes = grammar.patterns.map((pattern) => pattern.include ?? '').filter((include) => include.startsWith('#'));

        for (const include of includes) {
            expect(grammar.repository[include.slice(1)]).toBeDefined();
        }
    });

    it('compiles every pattern in the repository', () => {
        for (const name of Object.keys(grammar.repository)) {
            expect(() => expressions(name)).not.toThrow();
        }
    });

    it('highlights lua comments and environment directives', () => {
        expect(matchesAny('comment', '-- a note')).toBe(true);
        expect(matchesAny('comment', '--[[ block ]]')).toBe(true);
        expect(matchesAny('directive', '--!server')).toBe(true);
        expect(matchesAny('directive', '--!strict')).toBe(true);
    });

    it('highlights strings and template literals', () => {
        expect(matchesAny('string', "'text'")).toBe(true);
        expect(matchesAny('string', '"text"')).toBe(true);
        expect(matchesAny('string', '`Ola ${name}`')).toBe(true);
        expect(matchesAny('interpolation', '${name:Guest}')).toBe(true);
    });

    it('highlights class, interface, enum, and new declarations', () => {
        expect(matchesAny('declaration', 'class VIPPlayer extends Player {')).toBe(true);
        expect(matchesAny('declaration', 'interface Command {')).toBe(true);
        expect(matchesAny('declaration', 'enum GameState {')).toBe(true);
        expect(matchesAny('declaration', 'local vip = new VIPPlayer(')).toBe(true);
        expect(matchesAny('declaration', 'type PlayerId = number')).toBe(true);
    });

    it('highlights functions, keywords, and annotations', () => {
        expect(matchesAny('function', 'function formatName(name: string): string')).toBe(true);
        expect(matchesAny('keyword', 'if value ~= nil then')).toBe(true);
        expect(matchesAny('keyword', 'local health = 100')).toBe(true);
        expect(matchesAny('annotation', 'local player: Player? = nil')).toBe(true);
        expect(matchesAny('annotation', 'local names: string[] = {}')).toBe(true);
    });

    it('highlights build directives', () => {
        expect(matchesAny('buildDirective', 'export function getScore(player: Player): number')).toBe(true);
    });

    it('highlights decorators only at the start of a line', () => {
        const rule = rulePatterns('decorator')[0];

        expect(matchesAny('decorator', '    @Getter')).toBe(true);
        expect(matchesAny('decorator', 'local a = b @ c')).toBe(false);
        expect(rule?.captures?.['1']?.name).toBe('punctuation.definition.decorator.luam');
        expect(rule?.captures?.['2']?.name).toBe('entity.name.function.decorator.luam');
    });

    it('leaves the removed directive words unhighlighted', () => {
        expect(matchesAny('buildDirective', 'setting MAX_PLAYERS = 32')).toBe(false);
        expect(matchesAny('buildDirective', "depends 'scoreboard'")).toBe(false);
    });

    it('scopes a build directive as a modifier and leaves the name to the other rules', () => {
        const rule = rulePatterns('buildDirective')[0];

        expect(rule?.captures?.['1']?.name).toBe('storage.modifier.export.luam');
        expect(matchesAny('function', 'export function getScore(')).toBe(true);
    });

    it('leaves an ordinary identifier named after a directive alone', () => {
        expect(matchesAny('buildDirective', 'local export = 1')).toBe(false);
        expect(matchesAny('buildDirective', 'print(export)')).toBe(false);
        expect(matchesAny('buildDirective', 'setting = 1')).toBe(false);
        expect(matchesAny('buildDirective', "depends('scoreboard')")).toBe(false);
        expect(matchesAny('identifier', 'local export = 1')).toBe(true);
    });

    it('highlights numbers and lua operators', () => {
        expect(matchesAny('number', '0xFF')).toBe(true);
        expect(matchesAny('number', '10.5')).toBe(true);
        expect(matchesAny('operator', 'a ..= b')).toBe(true);
        expect(matchesAny('operator', 'a ~= b')).toBe(true);
        expect(matchesAny('operator', 'name?: string')).toBe(true);
    });
});
