import { beforeAll, describe, expect, it } from 'vitest';

import type { IGrammar } from 'vscode-textmate';

import { fixtureText, loadGrammar, tokenize, type TokenRecord } from './support/tokenizer';

let source: IGrammar;
let manifest: IGrammar;

function lines(records: readonly TokenRecord[]): string {
    return records
        .map((record) => `${record.text} | ${record.scopes.join(' ')} | ${record.role ?? 'none'} ${record.colour ?? ''}${record.fontStyle ?? ''}`)
        .join('\n');
}

function roleOfText(records: readonly TokenRecord[], text: string): string | null {
    return records.find((record) => record.text === text)?.role ?? null;
}

function lastRoleOfText(records: readonly TokenRecord[], text: string): string | null {
    return [...records].reverse().find((record) => record.text === text)?.role ?? null;
}

beforeAll(async () => {
    source = await loadGrammar('source.luam');
    manifest = await loadGrammar('source.luam-manifest');
});

describe('tokenization', () => {
    it('records what the dark theme paints on a luam file', () => {
        expect(lines(tokenize(source, fixtureText('theme-sample.luam'), 'dark'))).toMatchSnapshot();
    });

    it('records what the dark theme paints on a manifest', () => {
        expect(lines(tokenize(manifest, fixtureText('theme-sample.luam.manifest'), 'dark'))).toMatchSnapshot();
    });

    it('paints every token the grammars produce', () => {
        for (const fixture of ['theme-sample.luam', 'theme-sample.luam.manifest'] as const) {
            const grammar = fixture === 'theme-sample.luam' ? source : manifest;

            for (const record of tokenize(grammar, fixtureText(fixture), 'dark')) {
                expect(record.role, `${fixture}: ${record.text} (${record.scopes.join(' ')})`).not.toBeNull();
            }
        }
    });

    it('separates the environment directive from the strictness directive', () => {
        const records = tokenize(source, fixtureText('theme-sample.luam'), 'dark');

        expect(roleOfText(records, 'server')).toBe('directive.environment');
        expect(roleOfText(records, 'strict')).toBe('directive.strictness');
    });

    it('separates a bare call, a method call, and a lua library call', () => {
        const records = tokenize(source, fixtureText('theme-sample.luam'), 'dark');

        expect(lastRoleOfText(records, 'describe')).toBe('call.method');
        expect(roleOfText(records, 'outputChatBox')).toBe('call.function');
        expect(roleOfText(records, 'string.format')).toBe('call.library');
        expect(roleOfText(records, 'Round')).toBe('name.type');
    });

    it('dims the ambient punctuation and keeps the type layer cyan', () => {
        const records = tokenize(source, fixtureText('theme-sample.luam'), 'dark');
        const punctuation = records.filter((record) => record.role === 'punctuation');
        const types = records.filter((record) => record.role === 'type.primitive');

        expect(punctuation.length).toBeGreaterThan(10);
        expect(types.length).toBeGreaterThan(1);
        expect(new Set(punctuation.map((record) => record.colour)).size).toBe(1);
    });

    it('reads every manifest key as a key, environment named or not', () => {
        const records = tokenize(manifest, fixtureText('theme-sample.luam.manifest'), 'dark');

        for (const key of ['name', 'server', 'client', 'shared', 'engine', 'minVersion']) {
            expect(roleOfText(records, key), key).toBe('identifier.member');
        }

        expect(new Set(['name', 'server', 'client', 'shared'].map((key) => records.find((r) => r.text === key)?.colour)).size).toBe(1);
    });

    it('spends the environment tint only on the directive it was reserved for', () => {
        const records = tokenize(source, fixtureText('theme-sample.luam'), 'dark');
        const tinted = records.filter((record) => record.role === 'directive.environment');

        expect(tinted).toHaveLength(1);
        expect(tinted[0]?.text).toBe('server');
    });
});
