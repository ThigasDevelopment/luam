import { chrome, resolve } from '@theme/resolve';
import { ROLES } from '@theme/roles';
import { fallbackScope, scopesFor } from '@theme/targets/textmate';
import { SEMANTIC_SELECTORS } from '@theme/targets/semantic';
import { workbenchColors } from '@theme/targets/workbench';
import type { Mode } from '@theme/palette';

export interface TokenColor {
    name: string;
    scope: readonly string[];
    settings: { foreground: string; fontStyle?: string };
}

export interface VsCodeTheme {
    $schema: string;
    name: string;
    type: Mode;
    semanticHighlighting: boolean;
    colors: Record<string, string>;
    semanticTokenColors: Record<string, { foreground: string; fontStyle: string }>;
    tokenColors: readonly TokenColor[];
}

export const THEME_LABELS: Readonly<Record<Mode, string>> = {
    dark: 'Luam Dark',
    light: 'Luam Light',
};

function settingsFor(role: string, mode: Mode): { foreground: string; fontStyle?: string } {
    const resolved = resolve(role, mode);

    return resolved.fontStyle === 'none' ? { foreground: resolved.foreground } : { foreground: resolved.foreground, fontStyle: resolved.fontStyle };
}

function tokenColors(mode: Mode): TokenColor[] {
    return ROLES.flatMap((role) => {
        const scope = scopesFor(role.id);

        return scope.length === 0 ? [] : [{ name: role.id, scope, settings: settingsFor(role.id, mode) }];
    });
}

function semanticSettings(role: string, mode: Mode): { foreground: string; fontStyle: string } {
    const resolved = resolve(role, mode);

    return { foreground: resolved.foreground, fontStyle: resolved.fontStyle === 'none' ? '' : resolved.fontStyle };
}

function semanticTokenColors(mode: Mode): Record<string, { foreground: string; fontStyle: string }> {
    return Object.fromEntries(SEMANTIC_SELECTORS.map((entry) => [entry.selector, semanticSettings(entry.role, mode)]));
}

export function buildVsCodeTheme(mode: Mode): VsCodeTheme {
    return {
        $schema: 'vscode://schemas/color-theme',
        name: THEME_LABELS[mode],
        type: mode,
        semanticHighlighting: true,
        colors: workbenchColors(chrome(mode), mode, resolve('punctuation', mode).foreground),
        semanticTokenColors: semanticTokenColors(mode),
        tokenColors: tokenColors(mode),
    };
}

export function semanticTokenScopes(): Record<string, string[]> {
    return Object.fromEntries(SEMANTIC_SELECTORS.map((entry) => [entry.selector, [fallbackScope(entry.role)]]));
}
