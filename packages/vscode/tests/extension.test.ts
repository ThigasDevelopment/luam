import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { CLIENT_ID, ENVIRONMENT_PATTERN, MANIFEST_PATTERN, SERVER_MODULE, SOURCE_PATTERN } from '@vscode-extension/client/language-client';
import { BUILD_NO_FOLDER_MESSAGE, BUILD_TERMINAL_NAME } from '@vscode-extension/commands/build-command';
import { ensureCommandLine, NO_FOLDER_MESSAGE, TERMINAL_NAME } from '@vscode-extension/commands/ensure-command';
import { DEFAULT_SETTINGS, readSettings } from '@vscode-extension/config/settings';
import { activate, BUILD_COMMAND, deactivate, ENSURE_COMMAND, RESTART_COMMAND } from '@vscode-extension/extension';

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

    it('selects luam and manifest documents and watches source, manifest and environment files', () => {
        const { client } = activateExtension();
        const options = client.record.clientOptions as { documentSelector: Array<{ language: string; scheme: string }> };

        expect(options.documentSelector).toEqual([
            { scheme: 'file', language: 'luam' },
            { scheme: 'file', language: 'luam-manifest' },
        ]);
        expect(state.watchers).toEqual([SOURCE_PATTERN, MANIFEST_PATTERN, ENVIRONMENT_PATTERN]);
    });

    it('registers the build, ensure and restart commands', () => {
        const { context } = activateExtension();

        expect([...state.registered.keys()].sort()).toEqual([BUILD_COMMAND, ENSURE_COMMAND, RESTART_COMMAND].sort());
        expect(context.subscriptions).toHaveLength(3);
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

describe('build command', () => {
    it('runs the cli in a dedicated terminal', () => {
        state.settings.set('luam.cliPath', 'pnpm luam');
        activateExtension();
        state.registered.get(BUILD_COMMAND)?.();

        const terminal = state.terminals[0];

        expect(terminal?.name).toBe(BUILD_TERMINAL_NAME);
        expect(terminal?.cwd).toBe('/project');
        expect(terminal?.shown).toBe(true);
        expect(terminal?.sent).toEqual(['pnpm luam build']);
    });

    it('reuses the terminal on a second run', () => {
        activateExtension();
        state.registered.get(BUILD_COMMAND)?.();
        state.registered.get(BUILD_COMMAND)?.();

        expect(state.terminals).toHaveLength(1);
        expect(state.terminals[0]?.sent).toHaveLength(2);
    });

    it('reports an error when no folder is open', () => {
        state.folders = undefined;
        activateExtension();
        state.registered.get(BUILD_COMMAND)?.();

        expect(state.errors).toEqual([BUILD_NO_FOLDER_MESSAGE]);
        expect(state.terminals).toHaveLength(0);
    });
});

describe('ensure command', () => {
    it('builds the watch command line by default', () => {
        expect(ensureCommandLine(DEFAULT_SETTINGS)).toBe('luam ensure --watch');
    });

    it('builds a single run command line when watch is off', () => {
        expect(ensureCommandLine({ cliPath: 'pnpm luam', ensureWatch: false, semanticHighlighting: true })).toBe('pnpm luam ensure');
    });

    it('reads the configured cli path', () => {
        state.settings.set('luam.cliPath', 'node ./bin/luam.mjs');
        state.settings.set('luam.ensureWatch', false);

        expect(readSettings()).toEqual({ cliPath: 'node ./bin/luam.mjs', ensureWatch: false, semanticHighlighting: true });
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

    it('contributes the build command to the editor title', () => {
        const names = manifest.contributes.commands.map((command: { command: string }) => command.command);

        expect(names).toContain(BUILD_COMMAND);
        expect(manifest.contributes.menus['editor/title']).toContainEqual({ command: BUILD_COMMAND, when: 'editorLangId == luam', group: 'navigation' });
    });

    it('activates on source files and on a workspace manifest', () => {
        expect(manifest.activationEvents).toContain('workspaceContains:**/*.luam');
        expect(manifest.activationEvents).toContain('workspaceContains:.luam.manifest');
        expect(manifest.activationEvents).not.toContain('workspaceContains:luam.json');
    });

    it('associates the manifest filename with its own language', () => {
        const language = manifest.contributes.languages.find((entry: { id: string }) => entry.id === 'luam-manifest');

        expect(language.filenames).toEqual(['.luam.manifest']);
        expect(language.configuration).toBe('./manifest-language-configuration.json');
    });

    it('keeps the manifest grammar separate from the luam grammar', () => {
        const grammar = manifest.contributes.grammars.find((entry: { language: string }) => entry.language === 'luam-manifest');
        const luam = manifest.contributes.grammars.find((entry: { language: string }) => entry.language === 'luam');

        expect(grammar.scopeName).toBe('source.luam-manifest');
        expect(luam.scopeName).toBe('source.luam');
        expect(luam.path).toBe('./syntaxes/luam.tmLanguage.json');
    });
});
