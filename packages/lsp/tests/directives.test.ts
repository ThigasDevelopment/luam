import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt, positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const SHARED_FILE = pathToUri('/project/src/shared/util.luam');

function labels(uri: string, text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(uri, 1, text);

    return service.completion(uri, markerAt(text, marker)).map((item) => item.label);
}

function hoverText(uri: string, text: string, anchor: string, word: string): string {
    const service = new LanguageService();

    service.update(uri, 1, text);

    const contents = service.hover(uri, positionOf(text, anchor, word))?.contents;

    if (contents === undefined || typeof contents === 'string' || Array.isArray(contents)) {
        return '';
    }

    return contents.value;
}

function codes(uri: string, text: string): string[] {
    const service = new LanguageService();

    service.update(uri, 1, text);

    return service.diagnostics(uri).map((diagnostic) => String(diagnostic.code));
}

describe('build directive completion', () => {
    it('offers every directive at the start of a statement', () => {
        const found = labels(SERVER_FILE, 'local health = 100\nex\n', 'ex');

        expect(found).toContain('export');
    });

    it('offers no completion for the removed directives', () => {
        const found = labels(SERVER_FILE, 'local health = 100\nse\n', 'se');

        expect(found).not.toContain('setting');
        expect(found).not.toContain('depends');
    });

    it('offers a directive after leading indentation', () => {
        expect(labels(SERVER_FILE, 'function outer()\n    ex\nend\n', '    ex')).toContain('export');
    });

    it('does not offer a directive after "local"', () => {
        expect(labels(SERVER_FILE, 'local ex\n', 'local ex')).not.toContain('export');
    });

    it('does not offer a directive inside an argument list', () => {
        expect(labels(SERVER_FILE, 'print(ex\n', 'print(ex')).not.toContain('export');
    });

    it('does not offer a directive after a member access', () => {
        expect(labels(SERVER_FILE, 'local api = {}\napi.ex\n', 'api.ex')).not.toContain('export');
    });
});

describe('build directive hover', () => {
    it('reports that a server function is exported', () => {
        const text = 'export function score(): number\n    return 1\nend\n\nprint(score())\n';

        expect(hoverText(SERVER_FILE, text, 'print', 'score')).toContain('exported to other resources (server)');
    });

    it('reports both sides for an exported shared function', () => {
        const text = 'export function score(): number\n    return 1\nend\n\nprint(score())\n';

        expect(hoverText(SHARED_FILE, text, 'print', 'score')).toContain('exported to other resources (server and client)');
    });

    it('says nothing about an ordinary function', () => {
        const text = 'function score(): number\n    return 1\nend\n\nprint(score())\n';

        expect(hoverText(SERVER_FILE, text, 'print', 'score')).not.toContain('exported');
    });
});

describe('build directive diagnostics', () => {
    it('publishes parse-export-local', () => {
        expect(codes(SERVER_FILE, 'export local function score()\n    return 1\nend\n')).toEqual(['parse-export-local']);
    });

    it('publishes check-export-member', () => {
        expect(codes(SERVER_FILE, 'local api: table = {}\n\nexport function api.score()\n    return 1\nend\n')).toEqual(['check-export-member']);
    });

    it('publishes nothing for a valid directive', () => {
        expect(codes(SERVER_FILE, 'export function score(): number\n    return 1\nend\n')).toEqual([]);
    });

    it('publishes nothing for the removed directive words used as identifiers', () => {
        expect(codes(SERVER_FILE, 'local setting = 32\nlocal depends = 1\n\nprint(setting + depends)\n')).toEqual([]);
    });
});
