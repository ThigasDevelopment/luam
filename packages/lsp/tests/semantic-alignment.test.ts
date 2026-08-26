import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { decodeTokens, type SemanticToken } from '@lsp/features/semantic-legend';

import { openService } from './support/service-fixture';

const WORD = /[A-Za-z0-9_]/;

const FIXTURE = readFileSync(fileURLToPath(new URL('../../vscode/tests/fixtures/theme-sample.luam', import.meta.url)), 'utf8').replace(/\r\n/g, '\n');

const DECORATED = `#!shared

class Profile {
    @Getter
    id: number = 1

    @Setter
    nickname: string = 'Luam'
}

function use(): string
    local profile: Profile = new Profile()

    profile:setNickname('Thigas')

    return tostring(profile:getId())
end
`;

function tokensOf(text: string, path: string): { token: SemanticToken; text: string; before: string; after: string }[] {
    const service = openService({ [path]: text });
    const lines = text.split('\n');

    return decodeTokens(service.semanticTokens(`file:///${path}`).data).map((token) => {
        const line = lines[token.line] ?? '';

        return {
            token,
            text: line.slice(token.character, token.character + token.length),
            before: line[token.character - 1] ?? ' ',
            after: line[token.character + token.length] ?? ' ',
        };
    });
}

describe('semantic token alignment', () => {
    it('covers a whole word and never part of one', () => {
        for (const [path, text] of [
            ['src/server/sample.luam', FIXTURE],
            ['src/shared/decorated.luam', DECORATED],
        ] as const) {
            for (const entry of tokensOf(text, path)) {
                const where = `${path} ${entry.token.line}:${entry.token.character} ${JSON.stringify(entry.text)} as ${entry.token.type}`;

                expect(entry.text.length, where).toBeGreaterThan(0);
                expect(entry.text.trim(), where).toBe(entry.text);
                expect(WORD.test(entry.before), `${where} starts inside a word`).toBe(false);
                expect(WORD.test(entry.after), `${where} ends inside a word`).toBe(false);
            }
        }
    });

    it('paints no token for a member a decorator only produced', () => {
        const declared = tokensOf(DECORATED, 'src/shared/decorated.luam').filter((entry) => entry.token.modifiers.includes('declaration'));

        expect(declared.map((entry) => entry.text)).not.toContain('getId');
        expect(declared.map((entry) => entry.text)).not.toContain('setNickname');
    });

    it('leaves a declaration head to the grammar', () => {
        const named = tokensOf(FIXTURE, 'src/server/sample.luam').filter((entry) => ['Entity', 'Describable'].includes(entry.text));

        expect(named.map((entry) => entry.text)).toEqual(['Describable']);
        expect(named[0]?.token.modifiers).toContain('declaration');
    });

    it('still marks a generated member where the user did write it', () => {
        const generated = tokensOf(DECORATED, 'src/shared/decorated.luam').filter((entry) => entry.token.modifiers.includes('generated'));

        expect(generated.map((entry) => entry.text).sort()).toEqual(['getId', 'setNickname']);
    });
});
