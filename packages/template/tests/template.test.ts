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

    it('ships the starter manifest as one table of sections', () => {
        const source = read('luam.manifest');

        expect(source).not.toContain('export default');
        expect(source.trimStart().startsWith('{')).toBe(true);
        expect(source.trimEnd().endsWith('}')).toBe(true);
        expect(source).not.toContain('name = ');
        expect(source).toContain("output = 'build'");
    });

    it('declares the scripts and files a new project builds from', () => {
        const source = read('luam.manifest');

        expect(source).toContain("{ path = 'src/shared/**/*.luam', type = 'shared' },");
        expect(source).toContain("{ path = 'src/server/**/*.luam', type = 'server' },");
        expect(source).toContain("{ path = 'src/client/**/*.luam', type = 'client' },");
        expect(source).toContain("#     'assets/**/*.png',");
        expect(source).not.toContain('transport');
    });
});
