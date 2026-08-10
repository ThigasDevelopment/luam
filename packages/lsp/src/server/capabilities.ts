import { TextDocumentSyncKind, type ServerCapabilities } from 'vscode-languageserver';

export const LANGUAGE_ID = 'luam';

export const SERVER_NAME = 'luam-lsp';

export const SERVER_CAPABILITIES: ServerCapabilities = {
    textDocumentSync: TextDocumentSyncKind.Incremental,
    completionProvider: { triggerCharacters: ['.', ':', '"', "'"], resolveProvider: false },
    signatureHelpProvider: { triggerCharacters: ['(', ','], retriggerCharacters: [')'] },
    hoverProvider: true,
    definitionProvider: true,
    referencesProvider: true,
    renameProvider: true,
    workspace: { workspaceFolders: { supported: true, changeNotifications: true } },
};
