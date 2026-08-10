import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { resolveTemplateUrl, TEMPLATE_FILES } from '@template/template';

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
        expect(TEMPLATE_FILES.map((file) => file.path)).toEqual(['luam.json']);
    });

    it('lists every entry exactly once', () => {
        const paths = TEMPLATE_FILES.map((file) => file.path);

        expect(paths.length).toBe(new Set(paths).size);
    });

    it('declares the directories a new project builds from', () => {
        const parsed: unknown = JSON.parse(read('luam.json'));

        expect(parsed).toMatchObject({ outDir: 'build', sourceDirs: ['src'], assetDirs: ['assets'] });
    });
});
