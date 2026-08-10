import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments, type Connection, type InitializeParams, type InitializeResult } from 'vscode-languageserver';

import { LanguageService } from '@lsp/server/language-service';
import { SERVER_CAPABILITIES } from '@lsp/server/capabilities';
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
        service.update(event.document.uri, event.document.version, event.document.getText());
        void connection.sendDiagnostics({ uri: event.document.uri, diagnostics: service.diagnostics(event.document.uri) });
    });

    documents.onDidClose((event) => {
        void connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
    });
}

function registerFeatures(connection: Connection, service: LanguageService): void {
    connection.onCompletion((params) => service.completion(params.textDocument.uri, params.position));
    connection.onSignatureHelp((params) => service.signatureHelp(params.textDocument.uri, params.position));
    connection.onHover((params) => service.hover(params.textDocument.uri, params.position));
    connection.onDefinition((params) => service.definition(params.textDocument.uri, params.position));
    connection.onReferences((params) => service.references(params.textDocument.uri, params.position));
    connection.onRenameRequest((params) => service.rename(params.textDocument.uri, params.position, params.newName));
}

export function startServer(connection: Connection): LanguageService {
    const service = new LanguageService();
    const documents = new TextDocuments(TextDocument);

    connection.onInitialize((params: InitializeParams): InitializeResult => {
        service.loadWorkspace(workspaceRoots(params));

        return { capabilities: SERVER_CAPABILITIES };
    });

    registerDocuments(connection, documents, service);
    registerFeatures(connection, service);

    documents.listen(connection);
    connection.listen();

    return service;
}
