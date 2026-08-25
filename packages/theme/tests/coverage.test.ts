import { describe, expect, it } from 'vitest';

import { CONFUSION_SET_IDS } from '@theme/constraints';
import { ROLES } from '@theme/roles';
import { roleForToken, SEMANTIC_SELECTORS, TOKEN_MODIFIERS, TOKEN_TYPES } from '@theme/targets/semantic';
import { scopesFor, TEXTMATE_MAP, UNPAINTED_SCOPES } from '@theme/targets/textmate';

import { grammarScopes, luamScopeSet, paintedScopes, winningRole } from './support/grammar-scopes';

function combinations(): { type: string; modifiers: string[] }[] {
    const singles = TOKEN_MODIFIERS.map((modifier) => [modifier]);
    const natives = [
        ['defaultLibrary', 'mtaNative'],
        ['defaultLibrary', 'mtaNative', 'serverOnly'],
        ['defaultLibrary', 'mtaNative', 'clientOnly'],
        ['defaultLibrary', 'erased'],
        ['declaration', 'erased'],
        ['declaration', 'generated'],
    ];

    return TOKEN_TYPES.flatMap((type) => [[], ...singles, ...natives].map((modifiers) => ({ type, modifiers: [...modifiers] })));
}

describe('theme coverage', () => {
    it('gives every role a confusion set', () => {
        for (const role of ROLES) {
            expect(CONFUSION_SET_IDS).toContain(role.set);
        }
    });

    it('gives every role a unique id', () => {
        expect(new Set(ROLES.map((role) => role.id)).size).toBe(ROLES.length);
    });

    it('resolves every grammar scope to the rule that would win', () => {
        for (const scope of paintedScopes()) {
            expect(winningRole(scope), scope).not.toBeNull();
        }
    });

    it('leaves the container scopes deliberately unpainted', () => {
        for (const scope of UNPAINTED_SCOPES) {
            expect(grammarScopes()).toContain(scope);
            expect(Object.values(TEXTMATE_MAP).flat()).not.toContain(scope);
        }
    });

    it('targets no luam scope the grammars do not emit', () => {
        const emitted = new Set(grammarScopes());

        for (const scope of luamScopeSet()) {
            expect(emitted.has(scope), scope).toBe(true);
        }
    });

    it('resolves every token type and modifier combination the legend can produce', () => {
        for (const entry of combinations()) {
            expect(roleForToken(entry.type, entry.modifiers), `${entry.type}.${entry.modifiers.join('.')}`).not.toBeNull();
        }
    });

    it('names only roles the table declares', () => {
        const ids = new Set(ROLES.map((role) => role.id));

        for (const entry of SEMANTIC_SELECTORS) {
            expect(ids.has(entry.role), entry.selector).toBe(true);
        }

        for (const role of Object.keys(TEXTMATE_MAP)) {
            expect(ids.has(role), role).toBe(true);
        }
    });

    it('reaches every role from at least one target', () => {
        const semantic = new Set(SEMANTIC_SELECTORS.map((entry) => entry.role));

        for (const role of ROLES) {
            expect(scopesFor(role.id).length > 0 || semantic.has(role.id), role.id).toBe(true);
        }
    });
});
