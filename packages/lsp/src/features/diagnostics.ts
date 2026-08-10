import type { Diagnostic as CompilerDiagnostic } from '@compiler/diagnostics/diagnostic';
import { DiagnosticSeverity, type Diagnostic } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { toLspPosition } from '@lsp/support/lsp-position';
import { wordAt } from '@lsp/support/source-text';

const SOURCE = 'luam';

function severityOf(diagnostic: CompilerDiagnostic): DiagnosticSeverity {
    return diagnostic.severity === 'warning' ? DiagnosticSeverity.Warning : DiagnosticSeverity.Error;
}

function lengthAt(text: string, offset: number): number {
    return wordAt(text, offset)?.length ?? 1;
}

export function toLspDiagnostic(text: string, diagnostic: CompilerDiagnostic): Diagnostic {
    const start = toLspPosition(diagnostic.position);
    const length = lengthAt(text, diagnostic.position.offset);

    return {
        severity: severityOf(diagnostic),
        range: { start, end: { line: start.line, character: start.character + length } },
        message: diagnostic.message,
        code: diagnostic.code,
        source: SOURCE,
    };
}

export function collectDiagnostics(analysis: DocumentAnalysis): Diagnostic[] {
    return analysis.diagnostics.map((diagnostic) => toLspDiagnostic(analysis.text, diagnostic));
}
