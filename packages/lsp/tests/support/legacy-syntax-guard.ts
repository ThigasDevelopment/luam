import type { Diagnostic } from '@compiler/diagnostics/diagnostic';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { WorkspaceIndex } from '@lsp/workspace/workspace-index';

const REMOVED_FORMS: ReadonlySet<string> = new Set(['parse-class-method-form', 'check-native-constructor']);

function describeDiagnostic(diagnostic: Diagnostic): string {
    return `${diagnostic.code} (${diagnostic.position.line}:${diagnostic.position.column}): ${diagnostic.message}`;
}

function assertCurrentSyntax(analysis: DocumentAnalysis): void {
    const removed = analysis.diagnostics.filter((diagnostic) => REMOVED_FORMS.has(diagnostic.code));

    if (removed.length === 0) {
        return;
    }

    const detail = removed.map(describeDiagnostic).join('\n');

    throw new Error(`A test fixture uses a form the language removed. Rewrite it in the current syntax.\n\n${detail}\n\n${analysis.text}`);
}

const analyze = WorkspaceIndex.prototype.analyze;

const load = WorkspaceIndex.prototype.load;

WorkspaceIndex.prototype.analyze = function guardedAnalyze(this: WorkspaceIndex, uri: string, version: number, text: string): DocumentAnalysis[] {
    const affected = analyze.call(this, uri, version, text);

    affected.forEach(assertCurrentSyntax);

    return affected;
};

WorkspaceIndex.prototype.load = function guardedLoad(this: WorkspaceIndex, roots: readonly string[]): void {
    load.call(this, roots);

    for (const analysis of this.all()) {
        assertCurrentSyntax(analysis);
    }
};
