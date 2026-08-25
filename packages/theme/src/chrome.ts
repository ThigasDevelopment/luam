import { withAlpha } from '@theme/color';
import { SURFACES, tone, type Mode } from '@theme/palette';

export interface Ansi {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
}

export interface Chrome {
    background: string;
    surface: string;
    elevated: string;
    line: string;
    lineStrong: string;
    foreground: string;
    dimForeground: string;
    cursor: string;
    accent: string;
    gutter: string;
    gutterActive: string;
    lineHighlight: string;
    selection: string;
    selectionInactive: string;
    matchingBracket: string;
    indentGuide: string;
    indentGuideActive: string;
    inlayHint: string;
    inlayHintBackground: string;
    error: string;
    warning: string;
    info: string;
    hint: string;
    added: string;
    modified: string;
    removed: string;
    ansi: Ansi;
}

function ansiFor(mode: Mode): Ansi {
    return {
        black: mode === 'dark' ? SURFACES[mode].elevated : tone(mode, 'ink', 'strong'),
        red: tone(mode, 'rose', 'base'),
        green: tone(mode, 'blue', 'base'),
        yellow: tone(mode, 'gold', 'base'),
        blue: tone(mode, 'ink', 'base'),
        magenta: tone(mode, 'ink', 'strong'),
        cyan: tone(mode, 'blue', 'strong'),
        white: mode === 'dark' ? tone(mode, 'ink', 'base') : tone(mode, 'ink', 'muted'),
        brightBlack: tone(mode, 'ink', 'faint'),
        brightRed: tone(mode, 'rose', 'strong'),
        brightGreen: tone(mode, 'blue', 'strong'),
        brightYellow: tone(mode, 'gold', 'strong'),
        brightBlue: tone(mode, 'ink', 'strong'),
        brightMagenta: tone(mode, 'ink', 'muted'),
        brightCyan: tone(mode, 'blue', 'muted'),
        brightWhite: tone(mode, 'ink', 'strong'),
    };
}

export function chromeFor(mode: Mode): Chrome {
    const surfaces = SURFACES[mode];
    const highlight = mode === 'dark' ? 0.55 : 0.6;

    return {
        background: surfaces.background,
        surface: surfaces.surface,
        elevated: surfaces.elevated,
        line: surfaces.line,
        lineStrong: surfaces.lineStrong,
        foreground: tone(mode, 'ink', 'base'),
        dimForeground: tone(mode, 'ink', 'muted'),
        cursor: tone(mode, 'ink', 'strong'),
        accent: tone(mode, 'ink', 'strong'),
        gutter: tone(mode, 'ink', 'faint'),
        gutterActive: tone(mode, 'ink', 'base'),
        lineHighlight: withAlpha(surfaces.surface, highlight),
        selection: withAlpha(surfaces.lineStrong, 0.7),
        selectionInactive: withAlpha(surfaces.lineStrong, 0.42),
        matchingBracket: withAlpha(surfaces.lineStrong, 0.9),
        indentGuide: surfaces.line,
        indentGuideActive: surfaces.lineStrong,
        inlayHint: tone(mode, 'ink', 'faint'),
        inlayHintBackground: withAlpha(surfaces.elevated, 0.75),
        error: tone(mode, 'rose', 'base'),
        warning: tone(mode, 'gold', 'base'),
        info: tone(mode, 'blue', 'base'),
        hint: tone(mode, 'ink', 'base'),
        added: tone(mode, 'blue', 'muted'),
        modified: tone(mode, 'gold', 'muted'),
        removed: tone(mode, 'rose', 'muted'),
        ansi: ansiFor(mode),
    };
}

export const CHROME: Readonly<Record<Mode, Chrome>> = {
    dark: chromeFor('dark'),
    light: chromeFor('light'),
};

export const DIAGNOSTIC_KEYS: readonly (keyof Chrome)[] = ['error', 'warning', 'info', 'hint'];
