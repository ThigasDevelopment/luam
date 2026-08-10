import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

import { CONFIG_FILE_NAME, type LuamConfig } from '@cli/config/config-schema';
import { validateConfig } from '@cli/config/config-validation';
import type { Environment } from '@cli/config/transport-validation';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';

export interface LoadedConfig {
    path: string;
    config: LuamConfig | null;
    diagnostics: CliDiagnostic[];
}

const NOT_FOUND = 'config-not-found';

const UNREADABLE = 'config-unreadable';

const INVALID_JSON = 'config-invalid-json';

function reason(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export function resolveConfigPath(root: string, explicitPath: string | null): string {
    if (explicitPath === null) {
        return resolve(root, CONFIG_FILE_NAME);
    }

    return isAbsolute(explicitPath) ? explicitPath : resolve(root, explicitPath);
}

export function loadConfig(root: string, explicitPath: string | null, env: Environment): LoadedConfig {
    const path = resolveConfigPath(root, explicitPath);

    if (!existsSync(path)) {
        const message = `No configuration file found at "${path}". Create a "${CONFIG_FILE_NAME}".`;

        return { path, config: null, diagnostics: [cliError(NOT_FOUND, message)] };
    }

    let contents: string;

    try {
        contents = readFileSync(path, 'utf8');
    } catch (error: unknown) {
        return { path, config: null, diagnostics: [cliError(UNREADABLE, `The configuration file "${path}" could not be read: ${reason(error)}`)] };
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(contents);
    } catch (error: unknown) {
        return { path, config: null, diagnostics: [cliError(INVALID_JSON, `The configuration file "${path}" is not valid JSON: ${reason(error)}`)] };
    }

    const validated = validateConfig(parsed, env);

    return { path, config: validated.config, diagnostics: validated.diagnostics };
}
