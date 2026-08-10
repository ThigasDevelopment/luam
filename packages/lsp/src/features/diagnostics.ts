import type { Diagnostic as CompilerDiagnostic } from '@compiler/diagnostics/diagnostic';
import { DiagnosticSeverity, type Diagnostic } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { diagnosticRange } from '@lsp/features/diagnostic-range';
import { lineStarts } from '@lsp/support/source-text';

const SOURCE = 'luam';

function severityOf(diagnostic: CompilerDiagnostic): DiagnosticSeverity {
    return diagnostic.severity === 'warning' ? DiagnosticSeverity.Warning : DiagnosticSeverity.Error;
}

export function toLspDiagnostic(text: string, diagnostic: CompilerDiagnostic, starts: readonly number[] = lineStarts(text)): Diagnostic {
    return {
        severity: severityOf(diagnostic),
        range: diagnosticRange(text, starts, diagnostic),
        message: diagnostic.message,
        code: diagnostic.code,
        source: SOURCE,
    };
}

export function collectDiagnostics(analysis: DocumentAnalysis): Diagnostic[] {
    return analysis.diagnostics.map((diagnostic) => toLspDiagnostic(analysis.text, diagnostic, analysis.starts));
}
