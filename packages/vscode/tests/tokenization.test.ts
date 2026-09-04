import { beforeAll, describe, expect, it } from 'vitest';

import type { IGrammar } from 'vscode-textmate';

import { fixtureText, loadGrammar, tokenize, type TokenRecord } from './support/tokenizer';

let source: IGrammar;
let manifest: IGrammar;
let formatter: IGrammar;

let server: IGrammar;

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
    formatter = await loadGrammar('source.luam-formatter');
    server = await loadGrammar('source.luam-server');
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

    it('paints async and await as keywords wherever they appear', () => {
        const records = tokenize(source, 'async function load()\n    await other()\nend\n', 'dark');

        expect(roleOfText(records, 'async')).toBe('keyword.modifier');
        expect(roleOfText(records, 'await')).toBe('keyword');
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

describe('the server file grammar', () => {
    it('paints a server file exactly as the manifest grammar would', () => {
        const text = fixtureText('theme-sample.luam.server');

        expect(lines(tokenize(server, text, 'dark'))).toBe(lines(tokenize(manifest, text, 'dark')));
    });

    it('reads every server field as a key, and its value by kind', () => {
        const records = tokenize(server, fixtureText('theme-sample.luam.server'), 'dark');
        const roleOf = (text: string): string | null => roleOfText(records, text);

        for (const key of ['serverPath', 'resourcesDir', 'executable', 'logs', 'enabled', 'maxMessageLength', 'rateLimit', 'rateWindowMs']) {
            expect(roleOf(key), key).toBe('identifier.member');
        }

        expect(roleOf('mta-server')).toBe('literal.string');
        expect(roleOf('true')).toBe('literal.constant');
        expect(roleOf('512')).toBe('literal.constant');
    });
});

describe('the formatter file grammar', () => {
    it('paints a formatter file exactly as the manifest grammar would', () => {
        const text = fixtureText('theme-sample.luam.formatter');

        expect(lines(tokenize(formatter, text, 'dark'))).toBe(lines(tokenize(manifest, text, 'dark')));
    });

    it('reads every formatter field as a key, and its value by kind', () => {
        const records = tokenize(formatter, fixtureText('theme-sample.luam.formatter'), 'dark');
        const roleOf = (text: string): string | null => roleOfText(records, text);

        for (const key of ['indent', 'indentWidth', 'keywordParenSpace', 'maxBlankLines', 'lineEnding']) {
            expect(roleOf(key), key).toBe('identifier.member');
        }

        expect(roleOf('tab')).toBe('literal.string');
        expect(roleOf('crlf')).toBe('literal.string');
        expect(roleOf('false')).toBe('literal.constant');
        expect(roleOf('2')).toBe('literal.constant');
    });
});
