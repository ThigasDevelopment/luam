import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { MODES } from '@theme/palette';
import { semanticTokenScopes, THEME_LABELS } from '@theme/targets/vscode';

interface Contribution {
    label: string;
    uiTheme: string;
    path: string;
}

interface Manifest {
    categories: string[];
    scripts: Record<string, string>;
    contributes: {
        themes: Contribution[];
        semanticTokenScopes: { language: string; scopes: Record<string, string[]> }[];
        configuration: { properties: Record<string, { type: string; default: unknown }> };
    };
}

function read(relative: string): string {
    return readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
}

const manifest: Manifest = JSON.parse(read('../package.json'));

const ignored: string[] = read('../.vscodeignore')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

describe('theme contribution', () => {
    it('contributes both themes with the right ui base', () => {
        expect(manifest.contributes.themes).toEqual([
            { label: THEME_LABELS.dark, uiTheme: 'vs-dark', path: './themes/luam-dark.json' },
            { label: THEME_LABELS.light, uiTheme: 'vs', path: './themes/luam-light.json' },
        ]);
        expect(manifest.categories).toContain('Themes');
    });

    it('packages the theme files', () => {
        for (const mode of MODES) {
            expect(() => read(`../themes/luam-${mode}.json`)).not.toThrow();
        }

        expect(ignored).not.toContain('themes/**');
        expect(ignored).not.toContain('themes');
    });

    it('tells a reader the theme files are generated', () => {
        for (const mode of MODES) {
            expect(read(`../themes/luam-${mode}.json`)).toContain('Do not edit by hand');
        }
    });

    it('regenerates the themes before the extension is bundled', () => {
        expect(manifest.scripts.bundle).toContain('build-theme.ts');
    });

    it('maps every semantic selector to a fallback scope', () => {
        const contributed = manifest.contributes.semanticTokenScopes[0];

        expect(contributed?.language).toBe('luam');
        expect(contributed?.scopes).toEqual(semanticTokenScopes());
    });

    it('offers the setting that turns the semantic layer off', () => {
        const setting = manifest.contributes.configuration.properties['luam.semanticHighlighting'];

        expect(setting?.type).toBe('boolean');
        expect(setting?.default).toBe(true);
    });
});
