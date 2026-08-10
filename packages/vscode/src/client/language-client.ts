import { join } from 'node:path';

import { workspace, type ExtensionContext } from 'vscode';
import { LanguageClient, TransportKind, type LanguageClientOptions, type ServerOptions } from 'vscode-languageclient/node';

export const CLIENT_ID = 'luam';

export const CLIENT_NAME = 'Luam Language Server';

export const LANGUAGE_ID = 'luam';

export const SERVER_MODULE = join('dist', 'server', 'luam-lsp.cjs');

export const SOURCE_PATTERN = '**/*.luam';

export const CONFIG_PATTERN = '**/luam.json';

export function serverModulePath(context: ExtensionContext): string {
    return context.asAbsolutePath(SERVER_MODULE);
}

export function createServerOptions(modulePath: string): ServerOptions {
    return {
        run: { module: modulePath, transport: TransportKind.ipc },
        debug: { module: modulePath, transport: TransportKind.ipc, options: { execArgv: ['--nolazy', '--inspect=6009'] } },
    };
}

export function createClientOptions(): LanguageClientOptions {
    return {
        documentSelector: [{ scheme: 'file', language: LANGUAGE_ID }],
        synchronize: { fileEvents: [workspace.createFileSystemWatcher(SOURCE_PATTERN), workspace.createFileSystemWatcher(CONFIG_PATTERN)] },
    };
}

export function createLanguageClient(context: ExtensionContext): LanguageClient {
    return new LanguageClient(CLIENT_ID, CLIENT_NAME, createServerOptions(serverModulePath(context)), createClientOptions());
}
