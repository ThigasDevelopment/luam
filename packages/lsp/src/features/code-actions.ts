import { dirname } from 'node:path';

import { CodeActionKind, type CodeAction, type Range, type TextEdit } from 'vscode-languageserver';

import type { Diagnostic as CompilerDiagnostic } from '@compiler/diagnostics/diagnostic';
import { MANIFEST_FORM } from '@compiler/manifest/manifest-legacy';
import { migrateManifestSource } from '@compiler/manifest/manifest-migration';

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

const MIGRATE_TITLE = 'Rewrite this manifest as one table of sections';

function migrationAction(analysis: DocumentAnalysis): CodeAction | null {
    const form = analysis.diagnostics.find((entry) => entry.code === MANIFEST_FORM);

    if (form === undefined) {
        return null;
    }

    const migration = migrateManifestSource(analysis.text, { mode: 'check', root: dirname(analysis.path), env: {} });

    if (migration.text === null) {
        return null;
    }

    const end = positionAt(analysis.starts, analysis.text.length);

    return {
        title: MIGRATE_TITLE,
        kind: CodeActionKind.QuickFix,
        diagnostics: [toLspDiagnostic(analysis.text, form, analysis.starts)],
        edit: { changes: { [analysis.uri]: [{ range: { start: { line: 0, character: 0 }, end: toLspPosition(end) }, newText: migration.text }] } },
    };
}

export function codeActionsAt(analysis: DocumentAnalysis, selection: Range): CodeAction[] {
    const migration = migrationAction(analysis);
    const actions: CodeAction[] = migration === null ? [] : [migration];

    for (const diagnostic of analysis.diagnostics) {
        const action = actionFor(analysis, diagnostic);

        if (action !== null && overlaps(action.diagnostics?.[0]?.range ?? selection, selection)) {
            actions.push(action);
        }
    }

    return actions;
}
