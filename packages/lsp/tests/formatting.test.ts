import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { formatSource } from '@compiler/format/format';

import { LanguageService } from '@lsp/server/language-service';
import { capabilitiesFor } from '@lsp/server/capabilities';
import { pathToUri } from '@lsp/workspace/document-uri';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const repositoryRoot = join(fileURLToPath(new URL('..', import.meta.url)), '..', '..');

const CORPUS_ROOTS: readonly string[] = [join(repositoryRoot, 'docs', 'snippets'), join(repositoryRoot, 'packages', 'compiler', 'tests', 'fixtures')];

function corpus(): string[] {
    const files: string[] = [];

    for (const root of CORPUS_ROOTS) {
        for (const found of readdirSync(root, { recursive: true, withFileTypes: true })) {
            if (found.isFile() && found.name.endsWith('.luam')) {
                files.push(join(found.parentPath, found.name));
            }
        }
    }

    return files.sort();
}

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

    it('applies exactly the text the formatter produces across the corpus', () => {
        const files = corpus();

        expect(files.length).toBeGreaterThan(40);

        for (const file of files) {
            const name = relative(repositoryRoot, file).replace(/\\/g, '/');
            const text = readFileSync(file, 'utf8');
            const uri = pathToUri(`/project/${name}`);
            const created = new LanguageService();

            created.update(uri, 1, text);

            const expected = formatSource(text);
            const edits = created.formatting(uri);

            expect(edits.length, name).toBe(expected === null || expected === text ? 0 : 1);
            expect(edits[0]?.newText ?? text, name).toBe(expected ?? text);
        }
    });
});

describe('the formatter configuration in the editor', () => {
    const roots: string[] = [];

    function project(files: Readonly<Record<string, string>>): string {
        const root = mkdtempSync(join(tmpdir(), 'luam-lsp-'));

        roots.push(root);

        for (const [name, contents] of Object.entries(files)) {
            const path = join(root, name);

            mkdirSync(join(path, '..'), { recursive: true });
            writeFileSync(path, contents, 'utf8');
        }

        return root;
    }

    afterEach(() => {
        for (const root of roots.splice(0)) {
            rmSync(root, { force: true, recursive: true });
        }
    });

    it('applies the nearest .luam.formatter and agrees with the formatter byte for byte', () => {
        const text = 'local render = function (value: number): void\n\n\nprint(value)\nend\n';
        const style = { indent: 'tab' as const, keywordParenSpace: false, maxBlankLines: 0 };
        const configuration = ["indent = 'tab'", 'keywordParenSpace = false', 'maxBlankLines = 0', ''].join('\n');
        const root = project({ '.luam.formatter': configuration, 'src/server/main.luam': text });
        const uri = pathToUri(join(root, 'src', 'server', 'main.luam'));
        const created = new LanguageService();

        created.update(uri, 1, text);

        expect(created.formatting(uri)[0]?.newText).toBe(formatSource(text, style));
    });

    it('offers no edit when the configuration does not parse', () => {
        const text = 'local a: number =    1\n';
        const root = project({ '.luam.formatter': 'indent = \n', 'src/server/main.luam': text });
        const uri = pathToUri(join(root, 'src', 'server', 'main.luam'));
        const created = new LanguageService();

        created.update(uri, 1, text);

        expect(created.formatting(uri)).toEqual([]);
    });

    it('reports the configuration file diagnostics as manifest diagnostics do', () => {
        const root = project({ '.luam.formatter': "quoteStyle = 'double'\n" });
        const uri = pathToUri(join(root, '.luam.formatter'));
        const created = new LanguageService();

        created.update(uri, 1, "quoteStyle = 'double'\n");

        expect(created.diagnostics(uri).map((entry) => entry.code)).toEqual(['formatter-unknown-field']);
    });
});
