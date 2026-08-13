import { window, workspace, type Terminal } from 'vscode';

import { readSettings } from '@vscode-extension/config/settings';

export const BUILD_TERMINAL_NAME = 'Luam Build';

export const BUILD_NO_FOLDER_MESSAGE = 'Open a folder that contains a ".luam.manifest" before running the build command.';

function resolveTerminal(cwd: string): Terminal {
    const existing = window.terminals.find((terminal) => terminal.name === BUILD_TERMINAL_NAME);

    return existing ?? window.createTerminal({ name: BUILD_TERMINAL_NAME, cwd });
}

export function runBuildCommand(): void {
    const folder = workspace.workspaceFolders?.[0];

    if (folder === undefined) {
        void window.showErrorMessage(BUILD_NO_FOLDER_MESSAGE);

        return;
    }

    const terminal = resolveTerminal(folder.uri.fsPath);

    terminal.show(true);
    terminal.sendText(`${readSettings().cliPath} build`);
}
