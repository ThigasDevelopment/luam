import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { MANIFEST_FILE_NAME, resolveTemplateUrl, TEMPLATE_FILES } from '@template/template';

function read(source: string): string {
    return readFileSync(fileURLToPath(resolveTemplateUrl(source)), 'utf8');
}

describe('template catalog', () => {
    it('points every entry at a file that exists', () => {
        for (const file of TEMPLATE_FILES) {
            expect(existsSync(fileURLToPath(resolveTemplateUrl(file.source))), file.source).toBe(true);
        }
    });

    it('scaffolds the project manifest and nothing else', () => {
        expect(TEMPLATE_FILES.map((file) => file.path)).toEqual([MANIFEST_FILE_NAME]);
        expect(TEMPLATE_FILES.map((file) => file.kind)).toEqual(['manifest']);
    });

    it('lists every entry exactly once', () => {
        const paths = TEMPLATE_FILES.map((file) => file.path);

        expect(paths.length).toBe(new Set(paths).size);
    });

    it('ships the starter manifest in the manifest dialect', () => {
        const source = read('luam.manifest');

        expect(source).not.toContain('export default');
        expect(source).toContain("name = 'luam-resource'");
        expect(source).toContain("outDir = 'build'");
    });

    it('declares the sources and assets a new project builds from', () => {
        const source = read('luam.manifest');

        expect(source).toContain("server = { 'src/server/**/*.luam' },");
        expect(source).toContain("client = { 'src/client/**/*.luam' },");
        expect(source).toContain("shared = { 'src/shared/**/*.luam' },");
        expect(source).toContain("{ from = 'assets/**/*', to = 'assets' },");
        expect(source).toContain("    kind = 'none',");
    });
});
