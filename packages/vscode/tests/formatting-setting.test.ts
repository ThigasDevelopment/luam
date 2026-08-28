import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { createClientOptions } from '@vscode-extension/client/language-client';

import { resetMock, state } from './support/vscode-mock';

const manifestPath = fileURLToPath(new URL('../package.json', import.meta.url));

const NEXT_EDITS = [{ newText: 'formatted' }];

function middleware(): NonNullable<ReturnType<typeof createClientOptions>['middleware']> {
    const found = createClientOptions().middleware;

    if (found === undefined) {
        throw new Error('The client options declare no middleware.');
    }

    return found;
}

beforeEach(() => {
    resetMock();
});

describe('the formatting setting', () => {
    it('is contributed with a default of true', () => {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
            contributes: { configuration: { properties: Record<string, { type: string; default: unknown; description: string }> } };
        };
        const setting = manifest.contributes.configuration.properties['luam.formatting'];

        expect(setting?.type).toBe('boolean');
        expect(setting?.default).toBe(true);
        expect(setting?.description).toContain('Format');
    });

    it('forwards a document format while it is on', () => {
        const provide = middleware().provideDocumentFormattingEdits;

        expect(provide?.({} as never, {} as never, {} as never, () => NEXT_EDITS as never)).toEqual(NEXT_EDITS);
    });

    it('forwards a range format while it is on', () => {
        const provide = middleware().provideDocumentRangeFormattingEdits;

        expect(provide?.({} as never, {} as never, {} as never, {} as never, () => NEXT_EDITS as never)).toEqual(NEXT_EDITS);
    });

    it('returns no edits for a document format once it is off', () => {
        state.settings.set('luam.formatting', false);

        const provide = middleware().provideDocumentFormattingEdits;

        expect(provide?.({} as never, {} as never, {} as never, () => NEXT_EDITS as never)).toEqual([]);
    });

    it('returns no edits for a range format once it is off', () => {
        state.settings.set('luam.formatting', false);

        const provide = middleware().provideDocumentRangeFormattingEdits;

        expect(provide?.({} as never, {} as never, {} as never, {} as never, () => NEXT_EDITS as never)).toEqual([]);
    });

    it('leaves semantic highlighting on its own switch', () => {
        state.settings.set('luam.formatting', false);

        const provide = middleware().provideDocumentSemanticTokens;

        expect(provide?.({} as never, {} as never, () => NEXT_EDITS as never)).toEqual(NEXT_EDITS);
    });
});
