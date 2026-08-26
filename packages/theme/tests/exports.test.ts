import { describe, expect, it } from 'vitest';

import { HUES, MODES, SURFACES, tone } from '@theme/palette';
import { chrome, resolve } from '@theme/resolve';
import { STEPS } from '@theme/ramp';
import { buildNeovimTheme } from '@theme/targets/neovim';
import { buildTmTheme } from '@theme/targets/tmtheme';
import { buildZedTheme } from '@theme/targets/zed';
import { CUSTOM_MODIFIERS, SEMANTIC_SELECTORS } from '@theme/targets/semantic';

interface ZedFamily {
    themes: { name: string; appearance: string; style: { syntax: Record<string, { color: string }> } }[];
}

describe('cross editor exports', () => {
    it('gives zed both appearances from the same role table', () => {
        const family = buildZedTheme() as unknown as ZedFamily;

        expect(family.themes.map((theme) => theme.appearance)).toEqual([...MODES]);

        for (const theme of family.themes) {
            const mode = theme.appearance === 'dark' ? 'dark' : 'light';

            expect(theme.style.syntax['function']?.color).toBe(resolve('call.function', mode).foreground);
        }
    });

    it('colours every custom modifier in the zed export', () => {
        const family = buildZedTheme() as unknown as ZedFamily;
        const keys = Object.keys(family.themes[0]?.style.syntax ?? {});

        for (const modifier of CUSTOM_MODIFIERS) {
            expect(keys.some((key) => key.split('.').includes(modifier)), modifier).toBe(true);
        }
    });

    it('colours every custom modifier in the neovim export', () => {
        const scheme = buildNeovimTheme();

        for (const modifier of CUSTOM_MODIFIERS) {
            expect(scheme.includes(`@lsp.typemod.`) && scheme.includes(modifier), modifier).toBe(true);
        }

        expect(scheme).toContain('@lsp.mod.generated');
        expect(scheme).toContain('no Tree-sitter grammar');
    });

    it('names every semantic selector in the neovim export', () => {
        const scheme = buildNeovimTheme();

        for (const entry of SEMANTIC_SELECTORS) {
            const segments = entry.selector.split('.');
            const group = segments[0] === '*' ? `@lsp.mod.${segments[segments.length - 1]}` : `@lsp.typemod.${segments[0]}.${segments[segments.length - 1]}`;

            expect(scheme, entry.selector).toContain(segments.length < 2 ? `@lsp.type.${segments[0]}` : group);
        }
    });

    it('writes a tmtheme plist with a rule for every scoped role', () => {
        for (const mode of MODES) {
            const plist = buildTmTheme(mode);

            expect(plist.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
            expect(plist).toContain('<key>scope</key>');
            expect(plist).toContain(resolve('call.function', mode).foreground);
            expect(plist.trimEnd().endsWith('</plist>')).toBe(true);
        }
    });

    it('contains no colour outside the palette and the chrome', () => {
        const allowed = new Set(
            MODES.flatMap((mode) => [
                ...HUES.flatMap((hue) => STEPS.map((step) => tone(mode, hue, step))),
                ...Object.values(chrome(mode)).filter((value): value is string => typeof value === 'string'),
                ...Object.values(chrome(mode).ansi),
                SURFACES[mode].background,
                SURFACES[mode].surface,
                SURFACES[mode].elevated,
                SURFACES[mode].line,
                SURFACES[mode].lineStrong,
            ]),
        );

        for (const source of [buildNeovimTheme(), buildTmTheme('dark'), buildTmTheme('light'), JSON.stringify(buildZedTheme())]) {
            for (const found of source.match(/#[0-9a-fA-F]{6}/g) ?? []) {
                expect(allowed.has(found), found).toBe(true);
            }
        }
    });
});
