import { window, workspace, type Terminal } from 'vscode';

import { readSettings, type LuamSettings } from '@vscode-extension/config/settings';

export const TERMINAL_NAME = 'Luam Ensure';

export const NO_FOLDER_MESSAGE = 'Open a folder that contains a "luam.json" before running the ensure command.';

export function ensureCommandLine(settings: LuamSettings): string {
    return settings.ensureWatch ? `${settings.cliPath} ensure --watch` : `${settings.cliPath} ensure`;
}

function resolveTerminal(cwd: string): Terminal {
    const existing = window.terminals.find((terminal) => terminal.name === TERMINAL_NAME);

    return existing ?? window.createTerminal({ name: TERMINAL_NAME, cwd });
}

export function runEnsureCommand(): void {
    const folder = workspace.workspaceFolders?.[0];

    if (folder === undefined) {
        void window.showErrorMessage(NO_FOLDER_MESSAGE);

        return;
    }

    const terminal = resolveTerminal(folder.uri.fsPath);

    terminal.show(true);
    terminal.sendText(ensureCommandLine(readSettings()));
}
