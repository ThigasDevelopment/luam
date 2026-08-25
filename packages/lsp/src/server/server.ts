import { readFileSync } from 'node:fs';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { FileChangeType, TextDocuments, type Connection, type FileEvent, type InitializeParams, type InitializeResult } from 'vscode-languageserver';

import { LanguageService } from '@lsp/server/language-service';
import { capabilitiesFor } from '@lsp/server/capabilities';
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
        const affected = service.update(event.document.uri, event.document.version, event.document.getText());

        for (const analysis of affected) {
            void connection.sendDiagnostics({ uri: analysis.uri, diagnostics: service.diagnostics(analysis.uri) });
        }
    });

    documents.onDidClose((event) => {
        void connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
    });
}

function updateWatchedDocument(documents: TextDocuments<TextDocument>, service: LanguageService, change: FileEvent): void {
    const document = documents.get(change.uri);

    if (document !== undefined) {
        service.update(change.uri, document.version, document.getText());
        return;
    }

    try {
        service.update(change.uri, 0, readFileSync(uriToPath(change.uri), 'utf8'));
    } catch {
        service.close(change.uri);
    }
}

function registerWorkspace(connection: Connection, documents: TextDocuments<TextDocument>, service: LanguageService): void {
    connection.onDidChangeWatchedFiles((params) => {
        let environmentChanged = false;

        for (const change of params.changes) {
            if (service.isEnvironmentFile(uriToPath(change.uri))) {
                environmentChanged = true;

                continue;
            }

            if (change.type === FileChangeType.Deleted) {
                service.close(change.uri);
                void connection.sendDiagnostics({ uri: change.uri, diagnostics: [] });
            }
        }

        for (const change of params.changes) {
            if (!service.isEnvironmentFile(uriToPath(change.uri)) && change.type !== FileChangeType.Deleted) {
                updateWatchedDocument(documents, service, change);
            }
        }

        const analyses = environmentChanged ? service.reloadSettings() : service.refresh();

        for (const analysis of analyses) {
            void connection.sendDiagnostics({ uri: analysis.uri, diagnostics: service.diagnostics(analysis.uri) });
        }
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
    registerSemanticTokens(connection, service);

    documents.listen(connection);
    connection.listen();

    return service;
}
