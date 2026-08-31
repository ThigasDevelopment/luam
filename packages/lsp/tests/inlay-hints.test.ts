import { InlayHintKind, type Range } from 'vscode-languageserver';
import { describe, expect, it } from 'vitest';

import { DEFAULT_INLAY_HINT_SETTINGS, readInlayHintSettings, type InlayHintSettings } from '@lsp/features/inlay-hint-settings';
import { capabilitiesFor } from '@lsp/server/capabilities';
import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const MANIFEST_FILE = pathToUri('/project/.luam.manifest');

const EVERY_KIND: InlayHintSettings = { localTypes: true, returnTypes: true, callbackParameterTypes: true, parameterNames: true };

const NO_KIND: InlayHintSettings = { localTypes: false, returnTypes: false, callbackParameterTypes: false, parameterNames: false };

function wholeDocument(text: string): Range {
    const lines = text.split('\n');

    return { start: { line: 0, character: 0 }, end: { line: lines.length - 1, character: lines[lines.length - 1]?.length ?? 0 } };
}

function service(text: string, settings: InlayHintSettings = DEFAULT_INLAY_HINT_SETTINGS, uri: string = SERVER_FILE): LanguageService {
    const created = new LanguageService();

    created.useInlayHints(settings);
    created.update(uri, 1, text);

    return created;
}

function labels(text: string, settings: InlayHintSettings = DEFAULT_INLAY_HINT_SETTINGS): string[] {
    return service(text, settings)
        .inlayHints(SERVER_FILE, wholeDocument(text))
        .map((hint) => String(hint.label));
}

function hoverText(created: LanguageService, text: string, anchor: string, word: string): string {
    const contents = created.hover(SERVER_FILE, positionOf(text, anchor, word))?.contents;

    return contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;
}

describe('the inlay hint provider', () => {
    it('is declared', () => {
        expect(capabilitiesFor(false).inlayHintProvider).toEqual({ resolveProvider: false });
    });

    it('shows an inferred local type and stays quiet on an annotated one', () => {
        const text = ['local count = 1', 'local named: string = "a"'].join('\n');
        const hints = service(text).inlayHints(SERVER_FILE, wholeDocument(text));

        expect(hints).toHaveLength(1);
        expect(hints[0]?.label).toBe(': number');
        expect(hints[0]?.kind).toBe(InlayHintKind.Type);
        expect(hints[0]?.position).toEqual({ line: 0, character: 11 });
    });

    it('shows an inferred return type and stays quiet on an annotated one', () => {
        const text = ['function total()', '    return 1 + 2', 'end', 'function named(): void', 'end'].join('\n');
        const hints = service(text).inlayHints(SERVER_FILE, wholeDocument(text));

        expect(hints.map((hint) => String(hint.label))).toEqual([': number']);
        expect(hints[0]?.position).toEqual({ line: 0, character: 16 });
    });

    it('shows a contextually typed callback parameter', () => {
        const text = ['function withName(handler: fun(string): void): void', 'end', 'withName(function (value)', 'end)'].join('\n');

        expect(labels(text)).toEqual([': string', ': void']);
    });

    it('shows a parameter name on a literal argument and nowhere else', () => {
        const text = ['function move(x: number, y: number): void', 'end', 'local step = 2', 'move(1, step)'].join('\n');
        const hints = service(text, EVERY_KIND).inlayHints(SERVER_FILE, wholeDocument(text));
        const names = hints.filter((hint) => hint.kind === InlayHintKind.Parameter);

        expect(names.map((hint) => String(hint.label))).toEqual(['x:']);
        expect(names[0]?.paddingRight).toBe(true);
    });

    it('names the arguments of a catalog function', () => {
        const text = ['function tick(): void', 'end', 'setTimer(tick, 1000, 0)'].join('\n');
        const hints = service(text, EVERY_KIND).inlayHints(SERVER_FILE, wholeDocument(text));
        const names = hints.filter((hint) => hint.kind === InlayHintKind.Parameter);

        expect(names.map((hint) => String(hint.label))).toEqual(['timeInterval:', 'timesToExecute:']);
    });

    it('never renders any', () => {
        const text = ['local guessed = missingGlobal', 'function opaque(value)', '    return value', 'end'].join('\n');

        expect(labels(text, EVERY_KIND).some((label) => label.includes('any'))).toBe(false);
    });

    it('turns each kind off on its own', () => {
        const text = ['function move(x: number, y: number): void', 'end', 'local step = 1', 'move(1, 2)'].join('\n');

        expect(labels(text, { ...EVERY_KIND, localTypes: false })).not.toContain(': number');
        expect(labels(text, { ...EVERY_KIND, parameterNames: false }).some((label) => label.endsWith(':'))).toBe(false);
        expect(labels(text, NO_KIND)).toEqual([]);
    });

    it('yields no hints for a file that fails to parse', () => {
        expect(labels('local count = ', EVERY_KIND)).toEqual([]);
        expect(labels('function broken(', EVERY_KIND)).toEqual([]);
    });

    it('yields no hints for a manifest', () => {
        const text = "name = 'demo'\n";
        const created = service(text, EVERY_KIND, MANIFEST_FILE);

        expect(created.inlayHints(MANIFEST_FILE, wholeDocument(text))).toEqual([]);
    });

    it('renders the same type a hover renders', () => {
        const text = ['local count = 1', 'function total()', '    return count', 'end'].join('\n');
        const created = service(text);
        const hints = created.inlayHints(SERVER_FILE, wholeDocument(text));

        expect(hints.map((hint) => String(hint.label))).toEqual([': number', ': number']);
        expect(hoverText(created, text, 'local count', 'count')).toContain('local count: number');
        expect(hoverText(created, text, 'function total', 'total')).toContain('): number');
    });

    it('answers only for the requested range', () => {
        const text = ['local first = 1', 'local second = "a"'].join('\n');
        const hints = service(text).inlayHints(SERVER_FILE, { start: { line: 1, character: 0 }, end: { line: 1, character: 18 } });

        expect(hints.map((hint) => String(hint.label))).toEqual([': string']);
    });

    it('answers a range from the analysis it already holds', () => {
        const text = Array.from({ length: 400 }, (unused, index) => `local value${index} = ${index}`).join('\n');
        const created = service(text);
        const before = created.analysis(SERVER_FILE);
        const started = performance.now();
        const hints = created.inlayHints(SERVER_FILE, wholeDocument(text));
        const elapsed = performance.now() - started;

        expect(hints).toHaveLength(400);
        expect(created.analysis(SERVER_FILE)).toBe(before);
        expect(elapsed).toBeLessThan(50);
    });
});

describe('the inlay hint settings', () => {
    it('default to the three type kinds', () => {
        expect(DEFAULT_INLAY_HINT_SETTINGS).toEqual({ localTypes: true, returnTypes: true, callbackParameterTypes: true, parameterNames: false });
    });

    it('read what a client sends and keep the default for the rest', () => {
        expect(readInlayHintSettings(undefined)).toEqual(DEFAULT_INLAY_HINT_SETTINGS);
        expect(readInlayHintSettings({})).toEqual(DEFAULT_INLAY_HINT_SETTINGS);
        expect(readInlayHintSettings({ inlayHints: { localTypes: false, parameterNames: true } })).toEqual({
            localTypes: false,
            returnTypes: true,
            callbackParameterTypes: true,
            parameterNames: true,
        });
        expect(readInlayHintSettings({ inlayHints: { localTypes: 'yes' } })).toEqual(DEFAULT_INLAY_HINT_SETTINGS);
    });
});
