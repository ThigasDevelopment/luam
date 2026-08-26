import { describe, expect, it } from 'vitest';

import { chrome, resolve } from '@theme/resolve';
import { HUES, MODES, SURFACES, tone } from '@theme/palette';
import { STEPS } from '@theme/ramp';
import { buildVsCodeTheme } from '@theme/targets/vscode';
import { FALLBACK_SCOPES } from '@theme/targets/textmate';
import { roleOf } from '@theme/roles';

const COLORIZED_BY_DEFAULT: readonly string[] = [
    'editorBracketHighlight.foreground1',
    'editorBracketHighlight.foreground2',
    'editorBracketHighlight.foreground3',
    'editorBracketHighlight.foreground4',
    'editorBracketHighlight.foreground5',
    'editorBracketHighlight.foreground6',
    'editorBracketHighlight.unexpectedBracket.foreground',
    'editorBracketPairGuide.background1',
    'editorBracketPairGuide.activeBackground1',
    'editorStickyScroll.background',
    'editor.foldBackground',
    'editor.rangeHighlightBackground',
];

function palette(mode: (typeof MODES)[number]): Set<string> {
    const surfaces = SURFACES[mode];

    return new Set([
        ...HUES.flatMap((hue) => STEPS.map((step) => tone(mode, hue, step))),
        ...Object.values(chrome(mode)).filter((value): value is string => typeof value === 'string'),
        ...Object.values(chrome(mode).ansi),
        surfaces.background,
        surfaces.surface,
        surfaces.elevated,
        surfaces.line,
        surfaces.lineStrong,
    ]);
}

describe('workbench', () => {
    it('leaves no colour vs code would otherwise pick for itself', () => {
        for (const mode of MODES) {
            const colors = buildVsCodeTheme(mode).colors;

            for (const key of COLORIZED_BY_DEFAULT) {
                expect(colors[key], `${mode} ${key}`).toBeDefined();
            }
        }
    });

    it('keeps a bracket ambient instead of colouring it by nesting level', () => {
        for (const mode of MODES) {
            const colors = buildVsCodeTheme(mode).colors;
            const levels = COLORIZED_BY_DEFAULT.filter((key) => /editorBracketHighlight\.foreground\d/.test(key));

            for (const key of levels) {
                expect(colors[key], `${mode} ${key}`).toBe(resolve('punctuation', mode).foreground);
            }

            expect(colors['editorBracketHighlight.unexpectedBracket.foreground']).toBe(chrome(mode).error);
        }
    });

    it('never lets a semantic rule inherit a style from its fallback scope', () => {
        for (const mode of MODES) {
            for (const [selector, settings] of Object.entries(buildVsCodeTheme(mode).semanticTokenColors)) {
                expect(typeof settings.fontStyle, `${mode} ${selector}`).toBe('string');
            }
        }
    });

    it('never lets a fallback scope lend a style the role does not have', () => {
        for (const mode of MODES) {
            const rules = new Map(buildVsCodeTheme(mode).tokenColors.flatMap((rule) => rule.scope.map((scope) => [scope, rule.settings])));

            for (const [role, scope] of Object.entries(FALLBACK_SCOPES)) {
                if (roleOf(role).style !== 'none') {
                    continue;
                }

                expect(rules.get(scope)?.fontStyle ?? '', `${mode} ${role} falls back to ${scope}`).toBe('');
            }
        }
    });

    it('draws every workbench colour from the palette', () => {
        for (const mode of MODES) {
            const allowed = palette(mode);

            for (const [key, value] of Object.entries(buildVsCodeTheme(mode).colors)) {
                expect(allowed.has(value.slice(0, 7)), `${mode} ${key} is ${value}`).toBe(true);
            }
        }
    });
});
