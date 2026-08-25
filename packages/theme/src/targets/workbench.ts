import { withAlpha } from '@theme/color';
import type { Chrome } from '@theme/chrome';
import type { Mode } from '@theme/palette';

function terminal(chrome: Chrome): Record<string, string> {
    const ansi = chrome.ansi;

    return {
        'terminal.background': chrome.background,
        'terminal.foreground': chrome.foreground,
        'terminalCursor.foreground': chrome.cursor,
        'terminal.ansiBlack': ansi.black,
        'terminal.ansiRed': ansi.red,
        'terminal.ansiGreen': ansi.green,
        'terminal.ansiYellow': ansi.yellow,
        'terminal.ansiBlue': ansi.blue,
        'terminal.ansiMagenta': ansi.magenta,
        'terminal.ansiCyan': ansi.cyan,
        'terminal.ansiWhite': ansi.white,
        'terminal.ansiBrightBlack': ansi.brightBlack,
        'terminal.ansiBrightRed': ansi.brightRed,
        'terminal.ansiBrightGreen': ansi.brightGreen,
        'terminal.ansiBrightYellow': ansi.brightYellow,
        'terminal.ansiBrightBlue': ansi.brightBlue,
        'terminal.ansiBrightMagenta': ansi.brightMagenta,
        'terminal.ansiBrightCyan': ansi.brightCyan,
        'terminal.ansiBrightWhite': ansi.brightWhite,
    };
}

const BRACKET_LEVELS: readonly number[] = [1, 2, 3, 4, 5, 6];

function brackets(chrome: Chrome, punctuation: string): Record<string, string> {
    const levels = BRACKET_LEVELS.flatMap((level) => [
        [`editorBracketHighlight.foreground${level}`, punctuation] as const,
        [`editorBracketPairGuide.background${level}`, chrome.indentGuide] as const,
        [`editorBracketPairGuide.activeBackground${level}`, chrome.indentGuideActive] as const,
    ]);

    return {
        ...Object.fromEntries(levels),
        'editorBracketHighlight.unexpectedBracket.foreground': chrome.error,
    };
}

function editor(chrome: Chrome): Record<string, string> {
    return {
        'editor.background': chrome.background,
        'editor.foreground': chrome.foreground,
        'editorCursor.foreground': chrome.cursor,
        'editorLineNumber.foreground': chrome.gutter,
        'editorLineNumber.activeForeground': chrome.gutterActive,
        'editor.lineHighlightBackground': chrome.lineHighlight,
        'editor.selectionBackground': chrome.selection,
        'editor.inactiveSelectionBackground': chrome.selectionInactive,
        'editor.selectionHighlightBackground': chrome.selectionInactive,
        'editor.wordHighlightBackground': chrome.selectionInactive,
        'editor.findMatchBackground': chrome.selection,
        'editor.findMatchHighlightBackground': chrome.selectionInactive,
        'editorBracketMatch.background': chrome.matchingBracket,
        'editorBracketMatch.border': chrome.lineStrong,
        'editorIndentGuide.background1': chrome.indentGuide,
        'editorIndentGuide.activeBackground1': chrome.indentGuideActive,
        'editorWhitespace.foreground': chrome.line,
        'editorRuler.foreground': chrome.line,
        'editor.foldBackground': chrome.selectionInactive,
        'editor.rangeHighlightBackground': chrome.selectionInactive,
        'editorStickyScroll.background': chrome.surface,
        'editorStickyScrollHover.background': chrome.elevated,
        'editorInlayHint.foreground': chrome.inlayHint,
        'editorInlayHint.background': chrome.inlayHintBackground,
        'editorCodeLens.foreground': chrome.inlayHint,
        'editorGutter.background': chrome.background,
        'editorGutter.addedBackground': chrome.added,
        'editorGutter.modifiedBackground': chrome.modified,
        'editorGutter.deletedBackground': chrome.removed,
        'editorOverviewRuler.border': chrome.line,
    };
}

function diagnostics(chrome: Chrome): Record<string, string> {
    return {
        'editorError.foreground': chrome.error,
        'editorWarning.foreground': chrome.warning,
        'editorInfo.foreground': chrome.info,
        'editorHint.foreground': chrome.hint,
        'list.errorForeground': chrome.error,
        'list.warningForeground': chrome.warning,
        'problemsErrorIcon.foreground': chrome.error,
        'problemsWarningIcon.foreground': chrome.warning,
        'problemsInfoIcon.foreground': chrome.info,
        'inputValidation.errorBorder': chrome.error,
        'inputValidation.warningBorder': chrome.warning,
        'inputValidation.infoBorder': chrome.info,
        'notificationsErrorIcon.foreground': chrome.error,
        'notificationsWarningIcon.foreground': chrome.warning,
        'notificationsInfoIcon.foreground': chrome.info,
    };
}

function shell(chrome: Chrome): Record<string, string> {
    return {
        foreground: chrome.foreground,
        focusBorder: chrome.accent,
        'widget.border': chrome.line,
        'sideBar.background': chrome.surface,
        'sideBar.foreground': chrome.foreground,
        'sideBar.border': chrome.line,
        'sideBarSectionHeader.background': chrome.surface,
        'sideBarSectionHeader.foreground': chrome.dimForeground,
        'sideBarTitle.foreground': chrome.dimForeground,
        'activityBar.background': chrome.surface,
        'activityBar.foreground': chrome.foreground,
        'activityBar.inactiveForeground': chrome.gutter,
        'activityBar.border': chrome.line,
        'activityBarBadge.background': chrome.accent,
        'activityBarBadge.foreground': chrome.background,
        'statusBar.background': chrome.surface,
        'statusBar.foreground': chrome.foreground,
        'statusBar.border': chrome.line,
        'statusBar.noFolderBackground': chrome.surface,
        'statusBar.debuggingBackground': chrome.elevated,
        'statusBar.debuggingForeground': chrome.foreground,
        'statusBarItem.remoteBackground': chrome.elevated,
        'statusBarItem.remoteForeground': chrome.foreground,
        'titleBar.activeBackground': chrome.surface,
        'titleBar.activeForeground': chrome.foreground,
        'titleBar.inactiveBackground': chrome.surface,
        'titleBar.inactiveForeground': chrome.dimForeground,
        'titleBar.border': chrome.line,
    };
}

function tabs(chrome: Chrome): Record<string, string> {
    return {
        'editorGroupHeader.tabsBackground': chrome.surface,
        'editorGroupHeader.tabsBorder': chrome.line,
        'editorGroup.border': chrome.line,
        'tab.activeBackground': chrome.background,
        'tab.activeForeground': chrome.foreground,
        'tab.activeBorderTop': chrome.accent,
        'tab.inactiveBackground': chrome.surface,
        'tab.inactiveForeground': chrome.dimForeground,
        'tab.border': chrome.line,
        'tab.hoverBackground': chrome.elevated,
        'breadcrumb.foreground': chrome.dimForeground,
        'breadcrumb.focusForeground': chrome.foreground,
        'breadcrumb.background': chrome.background,
    };
}

function panels(chrome: Chrome): Record<string, string> {
    return {
        'panel.background': chrome.surface,
        'panel.border': chrome.line,
        'panelTitle.activeForeground': chrome.foreground,
        'panelTitle.inactiveForeground': chrome.dimForeground,
        'panelTitle.activeBorder': chrome.accent,
        'peekView.border': chrome.accent,
        'peekViewEditor.background': chrome.surface,
        'peekViewResult.background': chrome.surface,
        'peekViewTitle.background': chrome.elevated,
        'peekViewResult.selectionBackground': chrome.selectionInactive,
        'editorWidget.background': chrome.elevated,
        'editorWidget.border': chrome.line,
        'editorSuggestWidget.background': chrome.elevated,
        'editorSuggestWidget.border': chrome.line,
        'editorSuggestWidget.selectedBackground': chrome.selectionInactive,
        'editorHoverWidget.background': chrome.elevated,
        'editorHoverWidget.border': chrome.line,
        'dropdown.background': chrome.elevated,
        'dropdown.border': chrome.line,
        'input.background': chrome.elevated,
        'input.border': chrome.line,
        'input.foreground': chrome.foreground,
        'list.hoverBackground': chrome.elevated,
        'list.activeSelectionBackground': chrome.selectionInactive,
        'list.activeSelectionForeground': chrome.foreground,
        'list.inactiveSelectionBackground': chrome.elevated,
        'list.highlightForeground': chrome.accent,
        'scrollbarSlider.background': withAlpha(chrome.lineStrong, 0.5),
        'scrollbarSlider.hoverBackground': withAlpha(chrome.lineStrong, 0.72),
        'scrollbarSlider.activeBackground': withAlpha(chrome.lineStrong, 0.9),
        'badge.background': chrome.accent,
        'badge.foreground': chrome.background,
        'button.background': chrome.accent,
        'button.foreground': chrome.background,
    };
}

function git(chrome: Chrome): Record<string, string> {
    return {
        'gitDecoration.addedResourceForeground': chrome.added,
        'gitDecoration.modifiedResourceForeground': chrome.modified,
        'gitDecoration.deletedResourceForeground': chrome.removed,
        'gitDecoration.untrackedResourceForeground': chrome.added,
        'gitDecoration.ignoredResourceForeground': chrome.gutter,
        'gitDecoration.conflictingResourceForeground': chrome.warning,
        'diffEditor.insertedTextBackground': withAlpha(chrome.added, 0.14),
        'diffEditor.removedTextBackground': withAlpha(chrome.removed, 0.14),
    };
}

export function workbenchColors(chrome: Chrome, mode: Mode, punctuation: string): Record<string, string> {
    return {
        ...shell(chrome),
        ...editor(chrome),
        ...brackets(chrome, punctuation),
        ...tabs(chrome),
        ...panels(chrome),
        ...diagnostics(chrome),
        ...git(chrome),
        ...terminal(chrome),
        'menu.background': mode === 'dark' ? chrome.elevated : chrome.surface,
        'menu.foreground': chrome.foreground,
    };
}
