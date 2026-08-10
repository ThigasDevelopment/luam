import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { cliError, cliWarning, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import { EMPTY_ENV_FILE, mergeEnvFiles, parseEnvFile, type EnvFile } from '@compiler/project/env-file';
import type { ResourceAsset, ResourceConfiguration } from '@compiler/project/resource';
import { SOURCE_EXTENSION } from '@compiler/project/source-kind';

export interface ProjectInputs {
    configuration: ResourceConfiguration | null;
    assets: ResourceAsset[];
    declared: EnvFile | null;
    deployed: EnvFile | null;
    diagnostics: CliDiagnostic[];
}

export const CONFIGURATION_FILE = 'config.lua';

export const ENVIRONMENT_FILE = '.env';

export const LOCAL_ENVIRONMENT_FILE = '.env.local';

const MALFORMED_ENV = 'build-env-malformed';

const UNREADABLE_ASSET = 'build-asset-unreadable';

function normalize(path: string): string {
    return path.replace(/\\/g, '/');
}

function isDirectory(path: string): boolean {
    try {
        return statSync(path).isDirectory();
    } catch {
        return false;
    }
}

function readTextFile(path: string): string | null {
    return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function collectFiles(root: string, directory: string, isDownloaded: boolean, assets: ResourceAsset[]): void {
    for (const entry of readdirSync(directory, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || entry.name.endsWith(SOURCE_EXTENSION)) {
            continue;
        }

        const path = normalize(relative(root, join(entry.parentPath, entry.name)));

        assets.push({ path, source: path, isDownloaded });
    }
}

function collectAssets(root: string, directories: readonly string[], isDownloaded: boolean, assets: ResourceAsset[], diagnostics: CliDiagnostic[]): void {
    for (const directory of directories) {
        const absolute = resolve(root, directory);

        if (!isDirectory(absolute)) {
            continue;
        }

        try {
            collectFiles(root, absolute, isDownloaded, assets);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);

            diagnostics.push(cliError(UNREADABLE_ASSET, `The directory "${directory}" could not be read: ${message}`));
        }
    }
}

function readEnvironment(root: string, file: string, diagnostics: CliDiagnostic[]): EnvFile | null {
    const source = readTextFile(resolve(root, file));

    if (source === null) {
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

export function readProjectInputs(root: string, sourceDirs: readonly string[], assetDirs: readonly string[]): ProjectInputs {
    const diagnostics: CliDiagnostic[] = [];
    const assets: ResourceAsset[] = [];

    collectAssets(root, assetDirs, true, assets, diagnostics);
    collectAssets(root, sourceDirs, false, assets, diagnostics);

    const declared = readEnvironment(root, ENVIRONMENT_FILE, diagnostics);
    const local = readEnvironment(root, LOCAL_ENVIRONMENT_FILE, diagnostics);
    const deployed = declared === null ? null : mergeEnvFiles(declared, local ?? EMPTY_ENV_FILE);

    return { configuration: readConfiguration(root, diagnostics), assets, declared, deployed, diagnostics };
}
