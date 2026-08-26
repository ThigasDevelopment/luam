import { TextDocumentSyncKind, type ServerCapabilities } from 'vscode-languageserver';

import { SEMANTIC_LEGEND } from '@lsp/features/semantic-legend';

export const LANGUAGE_ID = 'luam';

export const SERVER_NAME = 'luam-lsp';

export const SERVER_CAPABILITIES: ServerCapabilities = {
    textDocumentSync: TextDocumentSyncKind.Incremental,
    completionProvider: { triggerCharacters: ['.', ':', '"', "'", '@'], resolveProvider: false },
    signatureHelpProvider: { triggerCharacters: ['(', ','], retriggerCharacters: [')'] },
    hoverProvider: true,
    definitionProvider: true,
    referencesProvider: true,
    renameProvider: true,
    documentSymbolProvider: true,
    workspace: { workspaceFolders: { supported: true, changeNotifications: true } },
};

export const SEMANTIC_TOKENS_PROVIDER = {
    legend: SEMANTIC_LEGEND,
    full: true,
    range: true,
} as const;

export function capabilitiesFor(semanticTokens: boolean): ServerCapabilities {
    if (!semanticTokens) {
        return SERVER_CAPABILITIES;
    }

    return { ...SERVER_CAPABILITIES, semanticTokensProvider: SEMANTIC_TOKENS_PROVIDER };
}
