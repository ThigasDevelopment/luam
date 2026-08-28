import type { Range, TextEdit } from 'vscode-languageserver';

import { formatRange, formatSource } from '@compiler/format/format';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';

function wholeDocument(text: string): Range {
    const lines = text.split('\n');

    return { start: { line: 0, character: 0 }, end: { line: lines.length - 1, character: lines[lines.length - 1]?.length ?? 0 } };
}

export function formatDocument(analysis: DocumentAnalysis): TextEdit[] {
    const formatted = formatSource(analysis.text);

    if (formatted === null || formatted === analysis.text) {
        return [];
    }

    return [{ range: wholeDocument(analysis.text), newText: formatted }];
}

export function formatDocumentRange(analysis: DocumentAnalysis, range: Range): TextEdit[] {
    const edit = formatRange(analysis.text, range.start.line + 1, range.end.line + 1);

    if (edit === null) {
        return [];
    }

    const replaced = { start: { line: edit.from - 1, character: 0 }, end: { line: edit.to, character: 0 } };
    const original = analysis.text.split('\n').slice(edit.from - 1, edit.to).join('\n');

    return edit.text === `${original}\n` ? [] : [{ range: replaced, newText: edit.text }];
}
