import { readFileSync } from 'node:fs';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { FileChangeType, TextDocuments, type Connection, type FileEvent, type InitializeParams, type InitializeResult } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { LanguageService } from '@lsp/server/language-service';
import { capabilitiesFor, RESCAN_COMMAND } from '@lsp/server/capabilities';
import { uriToPath } from '@lsp/workspace/document-uri';

function workspaceRoots(params: InitializeParams): string[] {
    const folders = params.workspaceFolders ?? [];

    if (folders.length > 0) {
        return folders.map((folder) => uriToPath(folder.uri));
    }

    return params.rootUri === null || params.rootUri === undefined ? [] : [uriToPath(params.rootUri)];
}

function registerDocuments(connection: Connection, documents: TextDocuments<TextDocument>, service: LanguageService): void {
    documents.onDidChangeContent((event) => {
        publish(connection, service, service.update(event.document.uri, event.document.version, event.document.getText()));
    });

    documents.onDidClose((event) => {
        void connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
    });
}

function updateWatchedDocument(documents: TextDocuments<TextDocument>, service: LanguageService, change: FileEvent): DocumentAnalysis[] {
    const document = documents.get(change.uri);

    if (document !== undefined) {
        return service.update(change.uri, document.version, document.getText());
    }

    try {
        return service.update(change.uri, 0, readFileSync(uriToPath(change.uri), 'utf8'));
    } catch {
        service.close(change.uri);

        return [];
    }
}

function publish(connection: Connection, service: LanguageService, analyses: readonly DocumentAnalysis[]): void {
    for (const analysis of analyses) {
        void connection.sendDiagnostics({ uri: analysis.uri, diagnostics: service.diagnostics(analysis.uri) });
    }
}

function registerWorkspace(connection: Connection, documents: TextDocuments<TextDocument>, service: LanguageService): void {
    connection.onDidChangeWatchedFiles((params) => {
        const affected = new Map<string, DocumentAnalysis>();
        let environmentChanged = false;

        for (const change of params.changes) {
            if (service.isEnvironmentFile(uriToPath(change.uri))) {
                environmentChanged = true;

                continue;
            }

            if (change.type === FileChangeType.Deleted) {
                continue;
            }

            for (const analysis of updateWatchedDocument(documents, service, change)) {
                affected.set(analysis.uri, analysis);
            }
        }

        if (environmentChanged) {
            publish(connection, service, service.reloadSettings());

            return;
        }

        const rescan = service.rescan();

        for (const uri of rescan.removed) {
            affected.delete(uri);
            void connection.sendDiagnostics({ uri, diagnostics: [] });
        }

        for (const analysis of rescan.updated) {
            affected.set(analysis.uri, analysis);
        }

        publish(connection, service, [...affected.values()]);
    });
}

function registerCommands(connection: Connection, service: LanguageService): void {
    connection.onExecuteCommand((params) => {
        if (params.command !== RESCAN_COMMAND) {
            return null;
        }

        const reloaded = service.reload();

        for (const uri of reloaded.removed) {
            void connection.sendDiagnostics({ uri, diagnostics: [] });
        }

        publish(connection, service, reloaded.updated);

        return null;
    });
}

function registerSemanticTokens(connection: Connection, service: LanguageService): void {
    connection.languages.semanticTokens.on((params) => service.semanticTokens(params.textDocument.uri));
    connection.languages.semanticTokens.onRange((params) => service.semanticTokens(params.textDocument.uri, params.range));
}

function registerFeatures(connection: Connection, service: LanguageService): void {
    connection.onCompletion((params) => service.completion(params.textDocument.uri, params.position));
    connection.onSignatureHelp((params) => service.signatureHelp(params.textDocument.uri, params.position));
    connection.onHover((params) => service.hover(params.textDocument.uri, params.position));
    connection.onDefinition((params) => service.definition(params.textDocument.uri, params.position));
    connection.onReferences((params) => service.references(params.textDocument.uri, params.position));
    connection.onRenameRequest((params) => service.rename(params.textDocument.uri, params.position, params.newName));
    connection.onDocumentSymbol((params) => service.documentSymbols(params.textDocument.uri));
    connection.onCodeAction((params) => service.codeActions(params.textDocument.uri, params.range));
    connection.onWorkspaceSymbol((params) => service.workspaceSymbols(params.query));
    connection.onDocumentFormatting((params) => service.formatting(params.textDocument.uri));
    connection.onDocumentRangeFormatting((params) => service.rangeFormatting(params.textDocument.uri, params.range));
}

export function startServer(connection: Connection): LanguageService {
    const service = new LanguageService();
    const documents = new TextDocuments(TextDocument);

    connection.onInitialize((params: InitializeParams): InitializeResult => {
        service.loadWorkspace(workspaceRoots(params));
        service.useSnippets(params.capabilities.textDocument?.completion?.completionItem?.snippetSupport === true);

        return { capabilities: capabilitiesFor(params.capabilities.textDocument?.semanticTokens !== undefined) };
    });

    registerDocuments(connection, documents, service);
    registerWorkspace(connection, documents, service);
    registerFeatures(connection, service);
    registerCommands(connection, service);
    registerSemanticTokens(connection, service);

    documents.listen(connection);
    connection.listen();

    return service;
}
