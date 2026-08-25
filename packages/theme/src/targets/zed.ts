import { withAlpha } from '@theme/color';
import { chrome, resolve } from '@theme/resolve';
import { MODES, type Mode } from '@theme/palette';
import { SEMANTIC_SELECTORS } from '@theme/targets/semantic';
import { THEME_LABELS } from '@theme/targets/vscode';

interface ZedStyle {
    color: string;
    font_style: string | null;
    font_weight: number | null;
}

const SYNTAX_ROLES: Readonly<Record<string, string>> = {
    attribute: 'call.decorator',
    boolean: 'literal.string',
    comment: 'comment',
    'comment.doc': 'comment',
    constant: 'identifier.member',
    constructor: 'call.constructor',
    embedded: 'identifier.local',
    enum: 'identifier.local',
    function: 'call.function',
    'function.builtin': 'call.library',
    'function.method': 'call.method',
    keyword: 'keyword',
    number: 'literal.string',
    operator: 'punctuation',
    'operator.logical': 'operator.logical',
    property: 'identifier.member',
    punctuation: 'punctuation',
    'punctuation.bracket': 'punctuation',
    'punctuation.delimiter': 'punctuation',
    'punctuation.special': 'punctuation.interpolation',
    string: 'literal.string',
    'string.escape': 'literal.constant',
    'string.special': 'literal.string',
    'string.special.symbol': 'literal.string',
    tag: 'name.type',
    type: 'type.name',
    'type.builtin': 'type.primitive',
    variable: 'identifier.local',
    'variable.parameter': 'identifier.parameter',
    'variable.special': 'identifier.language',
};

function styleFor(role: string, mode: Mode): ZedStyle {
    const resolved = resolve(role, mode);

    return {
        color: resolved.foreground,
        font_style: resolved.fontStyle === 'italic' ? 'italic' : null,
        font_weight: resolved.fontStyle === 'bold' ? 700 : null,
    };
}

function syntaxFor(mode: Mode): Record<string, ZedStyle> {
    const keys = Object.keys(SYNTAX_ROLES).sort();
    const base = keys.map((key) => [key, styleFor(SYNTAX_ROLES[key] as string, mode)] as const);
    const semantic = SEMANTIC_SELECTORS.map((entry) => [`lsp.${entry.selector}`, styleFor(entry.role, mode)] as const);

    return Object.fromEntries([...base, ...semantic]);
}

function playersFor(mode: Mode): { cursor: string; background: string; selection: string }[] {
    const surface = chrome(mode);

    return [
        { cursor: surface.cursor, background: surface.cursor, selection: surface.selection },
        { cursor: resolve('call.constructor', mode).foreground, background: resolve('call.constructor', mode).foreground, selection: surface.selectionInactive },
        { cursor: resolve('literal.string', mode).foreground, background: resolve('literal.string', mode).foreground, selection: surface.selectionInactive },
        { cursor: surface.error, background: surface.error, selection: surface.selectionInactive },
    ];
}

function styleOf(mode: Mode): Record<string, unknown> {
    const surface = chrome(mode);

    return {
        background: surface.background,
        'editor.background': surface.background,
        'editor.foreground': surface.foreground,
        'editor.gutter.background': surface.background,
        'editor.line_number': surface.gutter,
        'editor.active_line_number': surface.gutterActive,
        'editor.active_line.background': withAlpha(surface.surface, 0.55),
        'editor.highlighted_line.background': surface.elevated,
        'editor.document_highlight.read_background': surface.selectionInactive,
        'editor.indent_guide': surface.indentGuide,
        'editor.indent_guide_active': surface.indentGuideActive,
        'element.background': surface.surface,
        'element.hover': surface.elevated,
        'element.selected': surface.elevated,
        border: surface.line,
        'border.variant': surface.line,
        'border.focused': surface.accent,
        'surface.background': surface.surface,
        'elevated_surface.background': surface.elevated,
        'panel.background': surface.surface,
        'status_bar.background': surface.surface,
        'tab_bar.background': surface.surface,
        'tab.active_background': surface.background,
        'tab.inactive_background': surface.surface,
        'title_bar.background': surface.surface,
        'toolbar.background': surface.background,
        text: surface.foreground,
        'text.muted': surface.dimForeground,
        'text.placeholder': surface.gutter,
        'text.accent': surface.accent,
        'terminal.background': surface.background,
        'terminal.foreground': surface.foreground,
        'terminal.ansi.black': surface.ansi.black,
        'terminal.ansi.red': surface.ansi.red,
        'terminal.ansi.green': surface.ansi.green,
        'terminal.ansi.yellow': surface.ansi.yellow,
        'terminal.ansi.blue': surface.ansi.blue,
        'terminal.ansi.magenta': surface.ansi.magenta,
        'terminal.ansi.cyan': surface.ansi.cyan,
        'terminal.ansi.white': surface.ansi.white,
        'terminal.ansi.bright_black': surface.ansi.brightBlack,
        'terminal.ansi.bright_red': surface.ansi.brightRed,
        'terminal.ansi.bright_green': surface.ansi.brightGreen,
        'terminal.ansi.bright_yellow': surface.ansi.brightYellow,
        'terminal.ansi.bright_blue': surface.ansi.brightBlue,
        'terminal.ansi.bright_magenta': surface.ansi.brightMagenta,
        'terminal.ansi.bright_cyan': surface.ansi.brightCyan,
        'terminal.ansi.bright_white': surface.ansi.brightWhite,
        error: surface.error,
        warning: surface.warning,
        info: surface.info,
        hint: surface.hint,
        created: surface.added,
        modified: surface.modified,
        deleted: surface.removed,
        players: playersFor(mode),
        syntax: syntaxFor(mode),
    };
}

export function buildZedTheme(): Record<string, unknown> {
    return {
        $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
        name: 'Luam',
        author: 'Luam',
        themes: MODES.map((mode) => ({ name: THEME_LABELS[mode], appearance: mode, style: styleOf(mode) })),
    };
}
