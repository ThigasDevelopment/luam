import { describe, expect, it } from 'vitest';

import { capabilitiesFor } from '@lsp/server/capabilities';
import { decodeTokens, encodeTokens, sortTokens, TOKEN_MODIFIERS, type SemanticToken } from '@lsp/features/semantic-legend';

import { openService } from './support/service-fixture';

const PATH = 'src/shared/round.luam';

const URI = `file:///${PATH}`;

const SOURCE = `#!shared

interface Describable {
    label: string
}

enum MatchState {
    LOBBY,
}

type Id = number

class Round implements Describable {
    label: string = 'round'
    state: number = MatchState.LOBBY

    describe = function (): string
        return self.label
    end
}

function report(count: number): string
    local round: Round = new Round()
    local total = count + 1

    outputChatBox('hi')
    setPlayerName(root, 'a')
    dxDrawText('b')
    print(tostring(total))
    addEventHandler('onPlayerJoin', root, function () end)

    return round:describe()
end
`;

function tokens(): SemanticToken[] {
    return decodeTokens(openService({ [PATH]: SOURCE }).semanticTokens(URI).data);
}

function at(word: string, occurrence = 0): SemanticToken {
    const lines = SOURCE.split('\n');
    const found = tokens().filter((token) => (lines[token.line] ?? '').slice(token.character, token.character + token.length) === word);
    const picked = found[occurrence];

    if (picked === undefined) {
        throw new Error(`The fixture produced no token ${occurrence} for "${word}".`);
    }

    return picked;
}

function style(token: SemanticToken): string {
    return [token.type as string, ...TOKEN_MODIFIERS.filter((modifier) => token.modifiers.includes(modifier))].join('.');
}

describe('semantic tokens', () => {
    it('advertises the provider only when the client asks for it', () => {
        expect(capabilitiesFor(false).semanticTokensProvider).toBeUndefined();
        expect(capabilitiesFor(true).semanticTokensProvider).toEqual({
            legend: { tokenTypes: expect.any(Array), tokenModifiers: [...TOKEN_MODIFIERS] },
            full: true,
            range: true,
        });
    });

    it('encodes tokens in position order', () => {
        const produced = tokens();

        expect(produced).toEqual(sortTokens(produced));

        for (let index = 1; index < produced.length; index += 1) {
            const previous = produced[index - 1] as SemanticToken;
            const current = produced[index] as SemanticToken;

            expect(current.line > previous.line || (current.line === previous.line && current.character >= previous.character)).toBe(true);
        }
    });

    it('round trips through the delta encoding', () => {
        const produced = tokens();

        expect(decodeTokens(encodeTokens(produced))).toEqual(produced);
    });

    it('produces every custom modifier from one fixture', () => {
        const produced = new Set(tokens().flatMap((token) => token.modifiers));

        for (const modifier of ['mtaNative', 'serverOnly', 'clientOnly', 'erased'] as const) {
            expect(produced.has(modifier), modifier).toBe(true);
        }
    });

    it('separates a user function, a method, an mta native, and a lua library call', () => {
        const quartet = [style(at('report')), style(at('describe', 1)), style(at('outputChatBox')), style(at('print'))];

        expect(new Set(quartet).size).toBe(quartet.length);
        expect(style(at('outputChatBox'))).toBe('function.defaultLibrary.mtaNative');
        expect(style(at('print'))).toBe('function.defaultLibrary');
    });

    it('separates a parameter from a local at both its declaration and its use', () => {
        expect(style(at('count'))).toBe('parameter.declaration');
        expect(style(at('count', 1))).toBe('parameter');
        expect(style(at('total'))).toBe('variable.declaration');
        expect(style(at('total', 1))).toBe('variable');
    });

    it('marks the environment a native belongs to inside a shared file', () => {
        expect(style(at('setPlayerName'))).toBe('function.defaultLibrary.mtaNative.serverOnly');
        expect(style(at('dxDrawText'))).toBe('function.defaultLibrary.mtaNative.clientOnly');
    });

    it('separates a type position from a value position for the same name', () => {
        expect(style(at('Round', 1))).toBe('class.erased');
        expect(style(at('Round', 2))).toBe('class');
    });

    it('marks the erased layer and the mta events', () => {
        expect(style(at('Describable'))).toBe('interface.declaration.erased');
        expect(style(at('Id'))).toBe('type.declaration.erased');
        expect(style(at("'onPlayerJoin'"))).toBe('event');
    });

    it('serves a range without re-reading the whole document', () => {
        const service = openService({ [PATH]: SOURCE });
        const full = service.semanticTokens(URI).data;
        const ranged = service.semanticTokens(URI, { start: { line: 0, character: 0 }, end: { line: 5, character: 0 } }).data;

        expect(ranged.length).toBeLessThan(full.length);
        expect(ranged.length % 5).toBe(0);
    });

    it('serves the whole fixture inside the recorded budget', () => {
        const service = openService({ [PATH]: SOURCE.repeat(20) });
        const started = process.hrtime.bigint();

        service.semanticTokens(URI);

        expect(Number(process.hrtime.bigint() - started) / 1e6).toBeLessThan(250);
    });
});
