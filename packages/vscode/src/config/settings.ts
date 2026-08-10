import { workspace } from 'vscode';

export const CONFIGURATION_SECTION = 'luam';

export interface LuamSettings {
    cliPath: string;
    ensureWatch: boolean;
}

export const DEFAULT_SETTINGS: LuamSettings = { cliPath: 'luam', ensureWatch: true };

export function readSettings(): LuamSettings {
    const configuration = workspace.getConfiguration(CONFIGURATION_SECTION);

    return {
        cliPath: configuration.get<string>('cliPath') ?? DEFAULT_SETTINGS.cliPath,
        ensureWatch: configuration.get<boolean>('ensureWatch') ?? DEFAULT_SETTINGS.ensureWatch,
    };
}
