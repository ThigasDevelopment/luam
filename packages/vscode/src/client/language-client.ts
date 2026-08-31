import { join } from 'node:path';

import { workspace, type ExtensionContext } from 'vscode';
import { LanguageClient, TransportKind, type LanguageClientOptions, type Middleware, type ServerOptions } from 'vscode-languageclient/node';

import { readInlayHints, readSettings } from '@vscode-extension/config/settings';

export const CLIENT_ID = 'luam';

export const CLIENT_NAME = 'Luam Language Server';

export const LANGUAGE_ID = 'luam';

export const MANIFEST_LANGUAGE_ID = 'luam-manifest';

export const FORMATTER_LANGUAGE_ID = 'luam-formatter';

export const SERVER_MODULE = join('dist', 'server', 'luam-lsp.cjs');

export const SOURCE_PATTERN = '**/*.luam';

export const MANIFEST_PATTERN = '**/.luam.manifest';

export const FORMATTER_PATTERN = '**/.luam.formatter';

export const ENVIRONMENT_PATTERN = '**/.env*';

export function serverModulePath(context: ExtensionContext): string {
    return context.asAbsolutePath(SERVER_MODULE);
}

export function createServerOptions(modulePath: string): ServerOptions {
    return {
        run: { module: modulePath, transport: TransportKind.ipc },
        debug: { module: modulePath, transport: TransportKind.ipc, options: { execArgv: ['--nolazy', '--inspect=6009'] } },
    };
}

function semanticTokensMiddleware(): Middleware {
    return {
        provideDocumentSemanticTokens: (document, token, next) => (readSettings().semanticHighlighting ? next(document, token) : undefined),
        provideDocumentRangeSemanticTokens: (document, range, token, next) =>
            readSettings().semanticHighlighting ? next(document, range, token) : undefined,
    };
}

function formattingMiddleware(): Middleware {
    return {
        provideDocumentFormattingEdits: (document, options, token, next) => (readSettings().formatting ? next(document, options, token) : []),
        provideDocumentRangeFormattingEdits: (document, range, options, token, next) =>
            readSettings().formatting ? next(document, range, options, token) : [],
    };
}

export function createClientOptions(): LanguageClientOptions {
    return {
        initializationOptions: { inlayHints: readInlayHints() },
        middleware: { ...semanticTokensMiddleware(), ...formattingMiddleware() },
        documentSelector: [
            { scheme: 'file', language: LANGUAGE_ID },
            { scheme: 'file', language: MANIFEST_LANGUAGE_ID },
            { scheme: 'file', language: FORMATTER_LANGUAGE_ID },
        ],
        synchronize: {
            fileEvents: [
                workspace.createFileSystemWatcher(SOURCE_PATTERN),
                workspace.createFileSystemWatcher(MANIFEST_PATTERN),
                workspace.createFileSystemWatcher(FORMATTER_PATTERN),
                workspace.createFileSystemWatcher(ENVIRONMENT_PATTERN),
            ],
        },
    };
}

export function createLanguageClient(context: ExtensionContext): LanguageClient {
    return new LanguageClient(CLIENT_ID, CLIENT_NAME, createServerOptions(serverModulePath(context)), createClientOptions());
}
