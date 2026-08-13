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

interface LanguageConfiguration {
    comments: { lineComment: string; blockComment: [string, string] };
    brackets: string[][];
    wordPattern: string;
}

const grammar: Grammar = JSON.parse(readFileSync(fileURLToPath(new URL('../syntaxes/luam-manifest.tmLanguage.json', import.meta.url)), 'utf8'));

const configuration: LanguageConfiguration = JSON.parse(
    readFileSync(fileURLToPath(new URL('../manifest-language-configuration.json', import.meta.url)), 'utf8'),
);

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

describe('manifest grammar', () => {
    it('declares its own scope instead of borrowing another language', () => {
        expect(grammar.scopeName).toBe('source.luam-manifest');
        expect(grammar.name).toBe('Luam Manifest');
        expect(JSON.stringify(grammar)).not.toContain('source.js');
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

    it('highlights luam comments and not foreign ones', () => {
        expect(matchesAny('comment', '# a note')).toBe(true);
        expect(matchesAny('comment', '#* block *#')).toBe(true);
        expect(matchesAny('comment', '-- a note')).toBe(false);
        expect(matchesAny('comment', '// a note')).toBe(false);
    });

    it('highlights strings, templates, and numbers', () => {
        expect(matchesAny('string', "'build'")).toBe(true);
        expect(matchesAny('string', '"build"')).toBe(true);
        expect(matchesAny('string', '`build-${mode}`')).toBe(true);
        expect(matchesAny('number', 'port = 22005')).toBe(true);
    });

    it('highlights a configuration field and a table key', () => {
        expect(matchesAny('field', "outDir = 'build'")).toBe(true);
        expect(matchesAny('field', "    kind = 'http',")).toBe(true);
        expect(matchesAny('field', 'mode == "production"')).toBe(false);
    });

    it('scopes a field as a property name', () => {
        expect(rulePatterns('field')[0]?.captures?.['1']?.name).toBe('support.type.property-name.luam-manifest');
    });

    it('highlights local declarations and the injected values', () => {
        expect(matchesAny('declaration', "local target = 'build'")).toBe(true);
        expect(matchesAny('injected', "outDir = 'build-' .. mode")).toBe(true);
        expect(matchesAny('injected', 'password = env.MTA_PASSWORD')).toBe(true);
        expect(matchesAny('injected', 'resourcesDir = root')).toBe(true);
    });

    it('highlights the expressions the dialect allows', () => {
        expect(matchesAny('operator', "outDir = mode == 'production' and 'dist' or 'build'")).toBe(true);
        expect(matchesAny('operator', 'port = 22000 + 5')).toBe(true);
        expect(matchesAny('operator', "name = 'luam' .. '-demo'")).toBe(true);
        expect(matchesAny('constant', 'oop = true')).toBe(true);
    });
});

describe('manifest language configuration', () => {
    it('uses luam comment markers', () => {
        expect(configuration.comments.lineComment).toBe('#');
        expect(configuration.comments.blockComment).toEqual(['#*', '*#']);
    });

    it('brackets only the pairs the dialect uses', () => {
        expect(configuration.brackets).toEqual([
            ['{', '}'],
            ['(', ')'],
        ]);
    });

    it('treats a luam identifier as a word', () => {
        expect(new RegExp(`^(?:${configuration.wordPattern})$`).test('refreshFunction')).toBe(true);
        expect(new RegExp(`^(?:${configuration.wordPattern})$`).test('$name')).toBe(false);
    });
});
