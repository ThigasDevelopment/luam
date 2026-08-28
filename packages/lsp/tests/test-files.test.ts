import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const TEST_FILE = pathToUri('/project/src/server/main.test.luam');

const SOURCE_FILE = pathToUri('/project/src/server/main.luam');

function completionIn(uri: string, text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(uri, 1, text);

    return service.completion(uri, markerAt(text, marker)).map((item) => item.label);
}

describe('test files in the editor', () => {
    it('offers the test globals inside a test file', () => {
        const items = completionIn(TEST_FILE, 'local value = te\n', '= te');

        expect(items).toContain('test');
        expect(items).toContain('describe');
        expect(items).toContain('expect');
    });

    it('reports no diagnostics for a test that uses the assertion surface', () => {
        const service = new LanguageService();
        const text = ["test('adds', function()", '    expect(1 + 1).toBe(2)', 'end)', ''].join('\n');

        service.update(TEST_FILE, 1, text);

        expect(service.diagnostics(TEST_FILE).map((diagnostic) => diagnostic.message)).toEqual([]);
    });

    it('keeps the test globals out of a file that is not a test', () => {
        const items = completionIn(SOURCE_FILE, 'local value = te\n', '= te');

        expect(items).not.toContain('test');
        expect(items).not.toContain('expect');
    });
});
