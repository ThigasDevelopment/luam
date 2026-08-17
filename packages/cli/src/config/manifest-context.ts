import type { Environment } from '@cli/config/validation-context';

export const DEVELOPMENT_MODE = 'development';

export const PRODUCTION_MODE = 'production';

const DEVELOPMENT_COMMANDS: readonly string[] = ['dev', 'ensure', 'server'];

const PRODUCTION_COMMANDS: readonly string[] = ['build'];

export function manifestMode(command: string): string {
    if (DEVELOPMENT_COMMANDS.includes(command)) {
        return DEVELOPMENT_MODE;
    }

    return PRODUCTION_COMMANDS.includes(command) ? PRODUCTION_MODE : command;
}

export function manifestEnvironment(env: Environment): Record<string, string> {
    const copy: Record<string, string> = {};

    for (const [key, value] of Object.entries(env)) {
        if (value !== undefined) {
            copy[key] = value;
        }
    }

    return copy;
}
