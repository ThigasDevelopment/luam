import type { Environment } from '@compiler/environment/environment';
import type {
    CodeAction,
    CompletionItem,
    Diagnostic,
    DocumentSymbol,
    Hover,
    Location,
    Position,
    Range,
    SemanticTokens,
    SignatureHelp,
    TextEdit,
    WorkspaceEdit,
    WorkspaceSymbol,
} from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { completionAt } from '@lsp/features/completion';
import { codeActionsAt } from '@lsp/features/code-actions';
import { collectDiagnostics } from '@lsp/features/diagnostics';
import { documentSymbols } from '@lsp/features/document-symbols';
import { formatDocument, formatDocumentRange } from '@lsp/features/formatting';
import { hoverAt } from '@lsp/features/hover';
import { definitionAt, referencesAt, renameAt } from '@lsp/features/navigation';
import { semanticTokens } from '@lsp/features/semantic-tokens';
import { signatureHelpAt } from '@lsp/features/signature-help';
import { workspaceSymbols } from '@lsp/features/workspace-symbols';
import { offsetAt } from '@lsp/support/source-text';
import { WorkspaceIndex, type RescanResult } from '@lsp/workspace/workspace-index';

export class LanguageService {
    private readonly workspace = new WorkspaceIndex();

    private snippets = true;

    loadWorkspace(roots: readonly string[]): void {
        this.workspace.load(roots);
    }

    update(uri: string, version: number, text: string): DocumentAnalysis[] {
        return this.workspace.analyze(uri, version, text);
    }

    close(uri: string): void {
        this.workspace.remove(uri);
    }

    refresh(): DocumentAnalysis[] {
        return this.workspace.refresh();
    }

    rescan(): RescanResult {
        return this.workspace.rescan();
    }

    reload(): RescanResult {
        return this.workspace.reload();
    }

    reloadSettings(): DocumentAnalysis[] {
        return this.workspace.reloadSettings();
    }

    isEnvironmentFile(path: string): boolean {
        return this.workspace.isEnvironmentFile(path);
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

    semanticTokens(uri: string, range: Range | null = null): SemanticTokens {
        const analysis = this.workspace.get(uri);

        return analysis === null ? { data: [] } : semanticTokens(analysis, range);
    }

    documentSymbols(uri: string): DocumentSymbol[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : documentSymbols(analysis);
    }

    codeActions(uri: string, range: Range): CodeAction[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : codeActionsAt(analysis, range);
    }

    workspaceSymbols(query: string): WorkspaceSymbol[] {
        return workspaceSymbols(this.workspace.all(), query);
    }

    formatting(uri: string): TextEdit[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : formatDocument(analysis);
    }

    rangeFormatting(uri: string, range: Range): TextEdit[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : formatDocumentRange(analysis, range);
    }

    completion(uri: string, position: Position): CompletionItem[] {
        const analysis = this.workspace.get(uri);

        return analysis === null ? [] : completionAt(analysis, this.offset(analysis, position), this.workspace.others(uri), this.snippets);
    }

    useSnippets(supported: boolean): void {
        this.snippets = supported;
    }

    signatureHelp(uri: string, position: Position): SignatureHelp | null {
        const analysis = this.workspace.get(uri);

        return analysis === null ? null : signatureHelpAt(analysis, this.offset(analysis, position));
    }

    hover(uri: string, position: Position): Hover | null {
        const analysis = this.workspace.get(uri);

        return analysis === null ? null : hoverAt(analysis, this.offset(analysis, position), this.workspace.others(uri));
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
