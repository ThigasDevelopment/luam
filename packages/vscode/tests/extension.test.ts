import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { CLIENT_ID, CONFIG_PATTERN, SERVER_MODULE, SOURCE_PATTERN } from '@vscode-extension/client/language-client';
import { ensureCommandLine, NO_FOLDER_MESSAGE, TERMINAL_NAME } from '@vscode-extension/commands/ensure-command';
import { DEFAULT_SETTINGS, readSettings } from '@vscode-extension/config/settings';
import { activate, deactivate, ENSURE_COMMAND, RESTART_COMMAND } from '@vscode-extension/extension';

import { clients, resetClients, type LanguageClient } from './support/language-client-mock';
import { resetMock, state } from './support/vscode-mock';

interface ExtensionContextLike {
    subscriptions: Array<{ dispose: () => void }>;
    asAbsolutePath: (relative: string) => string;
}

function createContext(): ExtensionContextLike {
    return { subscriptions: [], asAbsolutePath: (relative: string): string => `/extension/${relative}` };
}

function activateExtension(): { context: ExtensionContextLike; client: LanguageClient } {
    const context = createContext();

    activate(context as never);

    const client = clients[clients.length - 1];

    if (client === undefined) {
        throw new Error('The extension did not create a language client.');
    }

    return { context, client };
}

beforeEach(() => {
    resetMock();
    resetClients();
});

describe('activation', () => {
    it('starts the language client', () => {
        const { client } = activateExtension();

        expect(client.started).toBe(1);
        expect(client.record.id).toBe(CLIENT_ID);
    });

    it('points the client at the bundled server module', () => {
        const { client } = activateExtension();
        const options = client.record.serverOptions as { run: { module: string; transport: number } };

        expect(options.run.module).toBe(`/extension/${SERVER_MODULE}`);
        expect(options.run.transport).toBe(1);
    });

    it('selects luam documents and watches source and configuration files', () => {
        const { client } = activateExtension();
        const options = client.record.clientOptions as { documentSelector: Array<{ language: string; scheme: string }> };

        expect(options.documentSelector).toEqual([{ scheme: 'file', language: 'luam' }]);
        expect(state.watchers).toEqual([SOURCE_PATTERN, CONFIG_PATTERN]);
    });

    it('registers the ensure and restart commands', () => {
        const { context } = activateExtension();

        expect([...state.registered.keys()].sort()).toEqual([ENSURE_COMMAND, RESTART_COMMAND].sort());
        expect(context.subscriptions).toHaveLength(2);
    });

    it('stops the client on deactivate', async () => {
        const { client } = activateExtension();

        await deactivate();

        expect(client.stopped).toBe(1);
    });

    it('restarts the client through its command', async () => {
        const { client } = activateExtension();

        await state.registered.get(RESTART_COMMAND)?.();

        expect(client.restarted).toBe(1);
    });
});

describe('ensure command', () => {
    it('builds the watch command line by default', () => {
        expect(ensureCommandLine(DEFAULT_SETTINGS)).toBe('luam ensure --watch');
    });

    it('builds a single run command line when watch is off', () => {
        expect(ensureCommandLine({ cliPath: 'pnpm luam', ensureWatch: false })).toBe('pnpm luam ensure');
    });

    it('reads the configured cli path', () => {
        state.settings.set('luam.cliPath', 'node ./bin/luam.mjs');
        state.settings.set('luam.ensureWatch', false);

        expect(readSettings()).toEqual({ cliPath: 'node ./bin/luam.mjs', ensureWatch: false });
    });

    it('runs the cli in a dedicated terminal', () => {
        activateExtension();
        state.registered.get(ENSURE_COMMAND)?.();

        const terminal = state.terminals[0];

        expect(terminal?.name).toBe(TERMINAL_NAME);
        expect(terminal?.cwd).toBe('/project');
        expect(terminal?.shown).toBe(true);
        expect(terminal?.sent).toEqual(['luam ensure --watch']);
    });

    it('reuses the terminal on a second run', () => {
        activateExtension();
        state.registered.get(ENSURE_COMMAND)?.();
        state.registered.get(ENSURE_COMMAND)?.();

        expect(state.terminals).toHaveLength(1);
        expect(state.terminals[0]?.sent).toHaveLength(2);
    });

    it('reports an error when no folder is open', () => {
        state.folders = undefined;
        activateExtension();
        state.registered.get(ENSURE_COMMAND)?.();

        expect(state.errors).toEqual([NO_FOLDER_MESSAGE]);
        expect(state.terminals).toHaveLength(0);
    });
});

describe('manifest', () => {
    const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'));

    it('registers the luam language and the .luam extension', () => {
        const language = manifest.contributes.languages[0];

        expect(language.id).toBe('luam');
        expect(language.extensions).toEqual(['.luam']);
        expect(language.configuration).toBe('./language-configuration.json');
    });

    it('declares the grammar for the language', () => {
        const grammar = manifest.contributes.grammars[0];

        expect(grammar.language).toBe('luam');
        expect(grammar.scopeName).toBe('source.luam');
    });

    it('contributes the ensure command', () => {
        const names = manifest.contributes.commands.map((command: { command: string }) => command.command);

        expect(names).toContain(ENSURE_COMMAND);
    });

    it('activates on source files', () => {
        expect(manifest.activationEvents).toContain('workspaceContains:**/*.luam');
    });
});
