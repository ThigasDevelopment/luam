import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

interface LanguageContribution {
    id: string;
    extensions?: string[];
    filenames?: string[];
    icon?: { light: string; dark: string };
}

interface Manifest {
    contributes: { languages: LanguageContribution[] };
}

const packageRoot = fileURLToPath(new URL('..', import.meta.url));

const manifest: Manifest = JSON.parse(readFileSync(`${packageRoot}package.json`, 'utf8'));

const language = manifest.contributes.languages.find((entry) => entry.id === 'luam');

const manifestLanguage = manifest.contributes.languages.find((entry) => entry.id === 'luam-manifest');

const formatterLanguage = manifest.contributes.languages.find((entry) => entry.id === 'luam-formatter');

const serverLanguage = manifest.contributes.languages.find((entry) => entry.id === 'luam-server');

function iconSource(relative: string): string {
    return readFileSync(`${packageRoot}${relative.replace('./', '')}`, 'utf8');
}

describe('file icon', () => {
    it('contributes a light and a dark icon for the luam language', () => {
        expect(language?.extensions).toEqual(['.luam']);
        expect(language?.icon?.light).toBe('./icons/luam-file-light.svg');
        expect(language?.icon?.dark).toBe('./icons/luam-file-dark.svg');
    });

    it('ships both icon files', () => {
        for (const relative of [language?.icon?.light ?? '', language?.icon?.dark ?? '']) {
            expect(existsSync(`${packageRoot}${relative.replace('./', '')}`), relative).toBe(true);
        }
    });

    it('draws the crescent with a mask so the cut circle is subtracted', () => {
        for (const relative of [language?.icon?.light ?? '', language?.icon?.dark ?? '']) {
            const source = iconSource(relative);

            expect(source, relative).toContain('viewBox="0 0 32 32"');
            expect(source, relative).toContain('<mask');
            expect(source, relative).toContain('mask="url(#luamCrescent');
            expect(source, relative).not.toContain('fill-rule="evenodd"');
        }
    });

    it('contributes a dedicated light and dark icon for the manifest filename', () => {
        expect(manifestLanguage?.filenames).toEqual(['.luam.manifest']);
        expect(manifestLanguage?.icon?.light).toBe('./icons/luam-manifest-light.svg');
        expect(manifestLanguage?.icon?.dark).toBe('./icons/luam-manifest-dark.svg');
    });

    it('ships both manifest icon files', () => {
        for (const relative of [manifestLanguage?.icon?.light ?? '', manifestLanguage?.icon?.dark ?? '']) {
            expect(existsSync(`${packageRoot}${relative.replace('./', '')}`), relative).toBe(true);
        }
    });

    it('gives the manifest its own icon rather than reusing the source icon', () => {
        expect(manifestLanguage?.icon?.light).not.toBe(language?.icon?.light);
        expect(manifestLanguage?.icon?.dark).not.toBe(language?.icon?.dark);

        for (const relative of [manifestLanguage?.icon?.light ?? '', manifestLanguage?.icon?.dark ?? '']) {
            const source = iconSource(relative);

            expect(source, relative).toContain('viewBox="0 0 32 32"');
            expect(source, relative).toContain('mask="url(#luamCrescentManifest');
        }
    });

    it('keeps every drawn shape inside the viewport', () => {
        const source = iconSource(language?.icon?.dark ?? '');
        const circles = [...source.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"[^>]*fill="#9B8CFF"/g)];

        expect(circles.length).toBe(1);

        for (const circle of circles) {
            const [x, y, radius] = [Number(circle[1]), Number(circle[2]), Number(circle[3])];

            expect(x - radius).toBeGreaterThanOrEqual(0);
            expect(y - radius).toBeGreaterThanOrEqual(0);
            expect(x + radius).toBeLessThanOrEqual(32);
            expect(y + radius).toBeLessThanOrEqual(32);
        }
    });
});

describe('server file icon', () => {
    it('contributes a dedicated light and dark icon for the server filename', () => {
        expect(serverLanguage?.filenames).toEqual(['.luam.server']);
        expect(serverLanguage?.icon?.light).toBe('./icons/luam-server-light.svg');
        expect(serverLanguage?.icon?.dark).toBe('./icons/luam-server-dark.svg');
    });

    it('ships both server icon files', () => {
        for (const relative of [serverLanguage?.icon?.light ?? '', serverLanguage?.icon?.dark ?? '']) {
            expect(existsSync(`${packageRoot}${relative.replace('./', '')}`), relative).toBe(true);
        }
    });

    it('gives the server file its own icon rather than reusing another one', () => {
        for (const theme of ['light', 'dark'] as const) {
            expect(serverLanguage?.icon?.[theme]).not.toBe(language?.icon?.[theme]);
            expect(serverLanguage?.icon?.[theme]).not.toBe(manifestLanguage?.icon?.[theme]);
            expect(serverLanguage?.icon?.[theme]).not.toBe(formatterLanguage?.icon?.[theme]);
        }
    });

    it('draws the same crescent and star as the other icons, with its own mask id', () => {
        for (const relative of [serverLanguage?.icon?.light ?? '', serverLanguage?.icon?.dark ?? '']) {
            const source = iconSource(relative);

            expect(source, relative).toContain('viewBox="0 0 32 32"');
            expect(source, relative).toContain('mask="url(#luamCrescentServer');
            expect(source, relative).not.toContain('fill-rule="evenodd"');
        }
    });

    it('keeps the stacked bars inside the viewport', () => {
        for (const relative of [serverLanguage?.icon?.light ?? '', serverLanguage?.icon?.dark ?? '']) {
            const bars = [...iconSource(relative).matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)];

            expect(bars.length, relative).toBe(2);

            for (const bar of bars) {
                expect(Number(bar[1]) + Number(bar[3]), relative).toBeLessThanOrEqual(32);
                expect(Number(bar[2]) + Number(bar[4]), relative).toBeLessThanOrEqual(32);
            }
        }
    });
});

describe('formatter file icon', () => {
    it('contributes a dedicated light and dark icon for the formatter filename', () => {
        expect(formatterLanguage?.filenames).toEqual(['.luam.formatter']);
        expect(formatterLanguage?.icon?.light).toBe('./icons/luam-formatter-light.svg');
        expect(formatterLanguage?.icon?.dark).toBe('./icons/luam-formatter-dark.svg');
    });

    it('ships both formatter icon files', () => {
        for (const relative of [formatterLanguage?.icon?.light ?? '', formatterLanguage?.icon?.dark ?? '']) {
            expect(existsSync(`${packageRoot}${relative.replace('./', '')}`), relative).toBe(true);
        }
    });

    it('gives the formatter its own icon rather than reusing the source or manifest icon', () => {
        for (const theme of ['light', 'dark'] as const) {
            expect(formatterLanguage?.icon?.[theme]).not.toBe(language?.icon?.[theme]);
            expect(formatterLanguage?.icon?.[theme]).not.toBe(manifestLanguage?.icon?.[theme]);
        }
    });

    it('draws the same crescent and star as the other icons, with its own mask id', () => {
        for (const relative of [formatterLanguage?.icon?.light ?? '', formatterLanguage?.icon?.dark ?? '']) {
            const source = iconSource(relative);

            expect(source, relative).toContain('viewBox="0 0 32 32"');
            expect(source, relative).toContain('mask="url(#luamCrescentFormatter');
            expect(source, relative).not.toContain('fill-rule="evenodd"');
        }
    });

    it('keeps the indent guide and its lines inside the viewport', () => {
        for (const relative of [formatterLanguage?.icon?.light ?? '', formatterLanguage?.icon?.dark ?? '']) {
            const bars = [...iconSource(relative).matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)];

            expect(bars.length, relative).toBe(4);

            for (const bar of bars) {
                expect(Number(bar[1]) + Number(bar[3]), relative).toBeLessThanOrEqual(32);
                expect(Number(bar[2]) + Number(bar[4]), relative).toBeLessThanOrEqual(32);
            }
        }
    });
});
