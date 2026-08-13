import { commands, type ExtensionContext } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

import { createLanguageClient } from '@vscode-extension/client/language-client';
import { runBuildCommand } from '@vscode-extension/commands/build-command';
import { runEnsureCommand } from '@vscode-extension/commands/ensure-command';

export const BUILD_COMMAND = 'luam.build';

export const ENSURE_COMMAND = 'luam.ensure';

export const RESTART_COMMAND = 'luam.restartServer';

let client: LanguageClient | null = null;

async function restartServer(): Promise<void> {
    await client?.restart();
}

export function activate(context: ExtensionContext): void {
    client = createLanguageClient(context);

    context.subscriptions.push(commands.registerCommand(BUILD_COMMAND, runBuildCommand));
    context.subscriptions.push(commands.registerCommand(ENSURE_COMMAND, runEnsureCommand));
    context.subscriptions.push(commands.registerCommand(RESTART_COMMAND, restartServer));

    void client.start();
}

export async function deactivate(): Promise<void> {
    const running = client;

    client = null;

    await running?.stop();
}

export function activeClient(): LanguageClient | null {
    return client;
}
