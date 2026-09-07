import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveFiles } from '@cli/build/file-resolution';
import { cliError, cliWarning, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { FileEntry } from '@compiler/manifest/manifest-contract';
import { DEFAULT_ENVIRONMENT_FILE } from '@compiler/manifest/manifest-defaults';
import { parseEnvFile, type EnvFile } from '@compiler/project/env-file';
import type { ManifestFile } from '@compiler/project/manifest';
import type { ResourceAsset, ResourceConfiguration } from '@compiler/project/resource';

export interface ProjectInputs {
    configuration: ResourceConfiguration | null;
    assets: ResourceAsset[];
    elements: ManifestFile[];
    declared: EnvFile | null;
    deployed: EnvFile | null;
    diagnostics: CliDiagnostic[];
}

export interface ProjectInputOptions {
    files: readonly FileEntry[];
    secret: string;
    excluded?: readonly string[];
}

export const CONFIGURATION_FILE = 'config.lua';

export { DEFAULT_ENVIRONMENT_FILE as ENVIRONMENT_FILE };

const MALFORMED_ENV = 'build-env-malformed';

const MISSING_ENV = 'config-missing-env-file';

function readTextFile(path: string): string | null {
    return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function readEnvironment(root: string, file: string, required: boolean, diagnostics: CliDiagnostic[]): EnvFile | null {
    const source = readTextFile(resolve(root, file));

    if (source === null) {
        if (required) {
            diagnostics.push(cliError(MISSING_ENV, `"${file}" is configured as "environment.secret" but does not exist. Create it or remove the setting.`));
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
    const resolved = resolveFiles(root, options.files, options.excluded ?? []);
    const diagnostics: CliDiagnostic[] = [...resolved.diagnostics];
    const declared = readEnvironment(root, options.secret, options.secret !== DEFAULT_ENVIRONMENT_FILE, diagnostics);

    return {
        configuration: readConfiguration(root, diagnostics),
        assets: resolved.assets,
        elements: resolved.elements,
        declared,
        deployed: declared,
        diagnostics,
    };
}
