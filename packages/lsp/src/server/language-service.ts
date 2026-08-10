import type { Environment } from '@compiler/environment/environment';
import type { CompletionItem, Diagnostic, DocumentSymbol, Hover, Location, Position, SignatureHelp, WorkspaceEdit } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { completionAt } from '@lsp/features/completion';
import { collectDiagnostics } from '@lsp/features/diagnostics';
import { documentSymbols } from '@lsp/features/document-symbols';
import { hoverAt } from '@lsp/features/hover';
import { definitionAt, referencesAt, renameAt } from '@lsp/features/navigation';
import { signatureHelpAt } from '@lsp/features/signature-help';
import { offsetAt } from '@lsp/support/source-text';
import { WorkspaceIndex } from '@lsp/workspace/workspace-index';

export class LanguageService {
    private readonly workspace = new WorkspaceIndex();

    loadWorkspace(roots: readonly string[]): void {
        this.workspace.load(roots);
    }

    update(uri: string, version: number, text: string): DocumentAnalysis {
        return this.workspace.analyze(uri, version, text);
    }

    close(uri: string): void {
        this.workspace.remove(uri);
    }

    analysis(uri: string): DocumentAnalysis | null {
        return this.workspace.get(uri);
    }

    environment(uri: string): Environment | null {
        return this.workspace.get(uri)?.environment ?? null;
    }

    diagnostics(uri: string): Diagnostic[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : collectDiagnostics(analysis);
    }

    documentSymbols(uri: string): DocumentSymbol[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : documentSymbols(analysis);
    }

    completion(uri: string, position: Position): CompletionItem[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : completionAt(analysis, this.offset(analysis, position), this.workspace.others(uri));
    }

    signatureHelp(uri: string, position: Position): SignatureHelp | null {
        const analysis = this.workspace.get(uri);

        return analysis === null ? null : signatureHelpAt(analysis, this.offset(analysis, position));
    }

    hover(uri: string, position: Position): Hover | null {
        const analysis = this.workspace.get(uri);

        return analysis === null ? null : hoverAt(analysis, this.offset(analysis, position));
    }

    definition(uri: string, position: Position): Location[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : definitionAt(analysis, this.offset(analysis, position), this.workspace.others(uri));
    }

    references(uri: string, position: Position): Location[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : referencesAt(analysis, this.offset(analysis, position), this.workspace.others(uri));
    }

    rename(uri: string, position: Position, newName: string): WorkspaceEdit | null {
        const analysis = this.workspace.get(uri);

        return analysis === null ? null : renameAt(analysis, this.offset(analysis, position), this.workspace.others(uri), newName);
    }

    private offset(analysis: DocumentAnalysis, position: Position): number {
        return offsetAt(analysis.starts, position.line, position.character, analysis.text.length);
    }
}
