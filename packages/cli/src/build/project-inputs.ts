import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveAssets } from '@cli/build/asset-resolution';
import { cliError, cliWarning, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { AssetMapping, EnvironmentFiles } from '@compiler/manifest/manifest-contract';
import { DEFAULT_ENVIRONMENT_FILE, DEFAULT_LOCAL_ENVIRONMENT_FILE } from '@compiler/manifest/manifest-defaults';
import { EMPTY_ENV_FILE, mergeEnvFiles, parseEnvFile, type EnvFile } from '@compiler/project/env-file';
import type { ResourceAsset, ResourceConfiguration } from '@compiler/project/resource';

export interface ProjectInputs {
    configuration: ResourceConfiguration | null;
    assets: ResourceAsset[];
    declared: EnvFile | null;
    deployed: EnvFile | null;
    diagnostics: CliDiagnostic[];
}

export interface ProjectInputOptions {
    assets: readonly AssetMapping[];
    environment: EnvironmentFiles;
    excluded?: readonly string[];
}

export const CONFIGURATION_FILE = 'config.lua';

export { DEFAULT_ENVIRONMENT_FILE as ENVIRONMENT_FILE, DEFAULT_LOCAL_ENVIRONMENT_FILE as LOCAL_ENVIRONMENT_FILE };

const MALFORMED_ENV = 'build-env-malformed';

const MISSING_ENV = 'config-missing-env-file';

function readTextFile(path: string): string | null {
    return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function readEnvironment(root: string, file: string, required: boolean, diagnostics: CliDiagnostic[]): EnvFile | null {
    const source = readTextFile(resolve(root, file));

    if (source === null) {
        if (required) {
            diagnostics.push(cliError(MISSING_ENV, `"${file}" is configured under "environment" but does not exist. Create it or remove the setting.`));
        }

        return null;
    }

    const parsed = parseEnvFile(source);

    for (const error of parsed.errors) {
        diagnostics.push(cliError(MALFORMED_ENV, `"${file}" is malformed: ${error.message}`));
    }

    return parsed;
}

function readConfiguration(root: string, diagnostics: CliDiagnostic[]): ResourceConfiguration | null {
    const content = readTextFile(resolve(root, CONFIGURATION_FILE));

    if (content === null) {
        return null;
    }

    if (content.trim().length === 0) {
        diagnostics.push(cliWarning('build-empty-configuration', `"${CONFIGURATION_FILE}" is empty, so the resource ships an empty configuration.`));
    }

    return { path: CONFIGURATION_FILE, source: CONFIGURATION_FILE, content };
}

export function readProjectInputs(root: string, options: ProjectInputOptions): ProjectInputs {
    const resolved = resolveAssets(root, options.assets, options.excluded ?? []);
    const diagnostics: CliDiagnostic[] = [...resolved.diagnostics];
    const base = readEnvironment(root, options.environment.file, options.environment.file !== DEFAULT_ENVIRONMENT_FILE, diagnostics);
    const local = readEnvironment(root, options.environment.localFile, false, diagnostics);
    const declared = base === null ? null : mergeEnvFiles(base, local ?? EMPTY_ENV_FILE);

    return { configuration: readConfiguration(root, diagnostics), assets: resolved.assets, declared, deployed: base, diagnostics };
}
