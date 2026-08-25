import { join } from 'node:path';

import { workspace, type ExtensionContext } from 'vscode';
import { LanguageClient, TransportKind, type LanguageClientOptions, type Middleware, type ServerOptions } from 'vscode-languageclient/node';

import { readSettings } from '@vscode-extension/config/settings';

export const CLIENT_ID = 'luam';

export const CLIENT_NAME = 'Luam Language Server';

export const LANGUAGE_ID = 'luam';

export const MANIFEST_LANGUAGE_ID = 'luam-manifest';

export const SERVER_MODULE = join('dist', 'server', 'luam-lsp.cjs');

export const SOURCE_PATTERN = '**/*.luam';

export const MANIFEST_PATTERN = '**/.luam.manifest';

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

export function createClientOptions(): LanguageClientOptions {
    return {
        middleware: semanticTokensMiddleware(),
        documentSelector: [
            { scheme: 'file', language: LANGUAGE_ID },
            { scheme: 'file', language: MANIFEST_LANGUAGE_ID },
        ],
        synchronize: {
            fileEvents: [
                workspace.createFileSystemWatcher(SOURCE_PATTERN),
                workspace.createFileSystemWatcher(MANIFEST_PATTERN),
                workspace.createFileSystemWatcher(ENVIRONMENT_PATTERN),
            ],
        },
    };
}

export function createLanguageClient(context: ExtensionContext): LanguageClient {
    return new LanguageClient(CLIENT_ID, CLIENT_NAME, createServerOptions(serverModulePath(context)), createClientOptions());
}
