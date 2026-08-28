import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { capabilitiesFor } from '@lsp/server/capabilities';
import { pathToUri } from '@lsp/workspace/document-uri';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function service(text: string): LanguageService {
    const created = new LanguageService();

    created.update(SERVER_FILE, 1, text);

    return created;
}

describe('the formatting providers', () => {
    it('are declared', () => {
        const capabilities = capabilitiesFor(false);

        expect(capabilities.documentFormattingProvider).toBe(true);
        expect(capabilities.documentRangeFormattingProvider).toBe(true);
    });

    it('replaces the document with its formatted text', () => {
        const text = 'local function draw(): void\nif visible then\nreturn\nend\nend\n';
        const edits = service(text).formatting(SERVER_FILE);

        expect(edits).toHaveLength(1);
        expect(edits[0]?.newText).toBe('local function draw(): void\n    if visible then\n        return\n    end\nend\n');
        expect(edits[0]?.range.start).toEqual({ line: 0, character: 0 });
    });

    it('returns no edits for a document already formatted', () => {
        expect(service('local a = 1\n').formatting(SERVER_FILE)).toEqual([]);
    });

    it('returns no edits for a document that fails to parse', () => {
        expect(service('if true then\n').formatting(SERVER_FILE)).toEqual([]);
    });

    it('returns no edits for a document the workspace does not hold', () => {
        expect(new LanguageService().formatting(SERVER_FILE)).toEqual([]);
    });

    it('formats only the selected lines', () => {
        const text = 'local a = 1\nif a then\nb()\nend\nlocal c = 3\n';
        const range = { start: { line: 1, character: 0 }, end: { line: 3, character: 3 } };
        const edits = service(text).rangeFormatting(SERVER_FILE, range);

        expect(edits).toHaveLength(1);
        expect(edits[0]?.newText).toBe('if a then\n    b()\nend\n');
        expect(edits[0]?.range).toEqual({ start: { line: 1, character: 0 }, end: { line: 4, character: 0 } });
    });

    it('returns no edits when the selection is already formatted', () => {
        const text = 'local a = 1\nif a then\n    b()\nend\n';
        const range = { start: { line: 1, character: 0 }, end: { line: 3, character: 3 } };

        expect(service(text).rangeFormatting(SERVER_FILE, range)).toEqual([]);
    });
});
