import { CodeActionKind, type CodeAction, type Range, type TextEdit } from 'vscode-languageserver';

import type { Diagnostic as CompilerDiagnostic } from '@compiler/diagnostics/diagnostic';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { toLspDiagnostic } from '@lsp/features/diagnostics';
import { quickFixFor, type SourceEdit } from '@lsp/features/quick-fixes';
import { positionAt } from '@lsp/support/source-text';
import { toLspPosition } from '@lsp/support/lsp-position';

function toTextEdit(analysis: DocumentAnalysis, edit: SourceEdit): TextEdit {
    return {
        range: { start: toLspPosition(positionAt(analysis.starts, edit.start)), end: toLspPosition(positionAt(analysis.starts, edit.end)) },
        newText: edit.newText,
    };
}

function overlaps(range: Range, selection: Range): boolean {
    return range.end.line >= selection.start.line && range.start.line <= selection.end.line;
}

function actionFor(analysis: DocumentAnalysis, diagnostic: CompilerDiagnostic): CodeAction | null {
    const fix = quickFixFor(diagnostic, analysis.tokens);

    if (fix === null) {
        return null;
    }

    return {
        title: fix.title,
        kind: CodeActionKind.QuickFix,
        diagnostics: [toLspDiagnostic(analysis.text, diagnostic, analysis.starts)],
        edit: { changes: { [analysis.uri]: fix.edits.map((edit) => toTextEdit(analysis, edit)) } },
    };
}

export function codeActionsAt(analysis: DocumentAnalysis, selection: Range): CodeAction[] {
    const actions: CodeAction[] = [];

    for (const diagnostic of analysis.diagnostics) {
        const action = actionFor(analysis, diagnostic);

        if (action !== null && overlaps(action.diagnostics?.[0]?.range ?? selection, selection)) {
            actions.push(action);
        }
    }

    return actions;
}
