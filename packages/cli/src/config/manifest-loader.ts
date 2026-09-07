import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, resolve } from 'node:path';

import { createPosition, hasErrors, sortDiagnostics, type Diagnostic } from '@compiler/diagnostics/diagnostic';
import { analyzeManifest } from '@compiler/manifest/manifest-analysis';
import { manifestError } from '@compiler/manifest/manifest-diagnostics';
import { legacyName, resourceNameWarning } from '@compiler/manifest/manifest-legacy';
import { isValidResourceName } from '@compiler/manifest/manifest-rules';
import { isValidElementName } from '@compiler/project/manifest';

import { MANIFEST_FILE_NAME, type LuamConfig } from '@cli/config/config-schema';
import { validateConfig } from '@cli/config/config-validation';
import { resolveDeployment, EMPTY_POSITIONS, type DeploymentSettings } from '@cli/config/deployment';
import { manifestEnvironment } from '@cli/config/manifest-context';
import type { Environment } from '@cli/config/validation-context';
import type { LoadedWorkspace } from '@cli/config/workspace-loader';

import type { PositionLookup } from '@compiler/manifest/manifest-rules';

export interface LoadedManifest {
    path: string;
    source: string;
    config: LuamConfig | null;
    positions: PositionLookup;
    deployment: DeploymentSettings | null;
    diagnostics: Diagnostic[];
}

export interface ManifestOptions {
    path?: string | null;
    mode?: string;
    env?: Environment;
    workspace?: LoadedWorkspace | null;
}

const NOT_FOUND = 'config-not-found';

const UNSUPPORTED = 'config-unsupported-manifest';

const UNREADABLE = 'config-unreadable-manifest';

const INVALID_RESOURCE_FOLDER = 'config-invalid-resource-folder';

const DEFAULT_MODE = 'check';

const START = createPosition(1, 1, 0);

export function isManifestPath(path: string): boolean {
    return basename(path).endsWith(MANIFEST_FILE_NAME);
}

export function resolveManifestPath(root: string, explicitPath: string | null): string {
    if (explicitPath === null) {
        return resolve(root, MANIFEST_FILE_NAME);
    }

    return isAbsolute(explicitPath) ? explicitPath : resolve(root, explicitPath);
}

export function resourceNameFor(manifestPath: string): string {
    return basename(dirname(resolve(manifestPath)));
}

function failure(path: string, code: string, message: string): LoadedManifest {
    return { path, source: '', config: null, positions: EMPTY_POSITIONS, deployment: null, diagnostics: [manifestError(code, message, START)] };
}

function promote(diagnostics: readonly Diagnostic[], promoteWarnings: boolean): Diagnostic[] {
    return promoteWarnings ? diagnostics.map((entry) => (entry.severity === 'warning' ? { ...entry, severity: 'error' } : entry)) : [...diagnostics];
}

function readManifest(path: string): string | null {
    try {
        return readFileSync(path, 'utf8');
    } catch {
        return null;
    }
}

function folderProblem(name: string): string | null {
    if (name.length === 0) {
        return 'has no name';
    }

    if (!isValidResourceName(name)) {
        return 'is not a valid MTA resource name. A resource name holds letters, digits, dots, dashes, and underscores, and starts with a letter or a digit';
    }

    return isValidElementName(name) ? null : 'is not a valid XML element name, which the generated file needs because its root element is the resource name';
}

export function loadManifest(root: string, options: ManifestOptions = {}): LoadedManifest {
    const path = resolveManifestPath(root, options.path ?? null);

    if (!isManifestPath(path)) {
        return failure(path, UNSUPPORTED, `The manifest "${path}" is not a "${MANIFEST_FILE_NAME}" file. Point "--manifest" at a "${MANIFEST_FILE_NAME}" file.`);
    }

    if (!existsSync(path)) {
        return failure(path, NOT_FOUND, `No manifest found at "${path}". Create a "${MANIFEST_FILE_NAME}" file or run "luam init".`);
    }

    const source = readManifest(path);

    if (source === null) {
        return failure(path, UNREADABLE, `The manifest "${path}" could not be read.`);
    }

    const name = resourceNameFor(path);
    const problem = folderProblem(name);

    if (problem !== null) {
        return failure(path, INVALID_RESOURCE_FOLDER, `The folder "${name}" holding "${path}" ${problem}. Rename the folder.`);
    }

    const env = options.env ?? {};
    const analysis = analyzeManifest(source, { mode: options.mode ?? DEFAULT_MODE, root, env: manifestEnvironment(env) });
    const validated = validateConfig(name, analysis.value, analysis.positions, analysis.groups);
    const deployment = options.workspace?.deployment ?? null;
    const declared = analysis.legacy === undefined ? null : legacyName(analysis.legacy);
    const renamed = declared === null || declared === name ? null : resourceNameWarning(declared, name, analysis.positions.get('name') ?? START);
    const notices = renamed === null ? [] : [renamed];
    const diagnostics = sortDiagnostics(promote([...analysis.diagnostics, ...validated.diagnostics, ...notices], validated.config?.compilerOptions.warningsAsErrors === true));
    const config = hasErrors(diagnostics) ? null : validated.config;

    return {
        path,
        source,
        config,
        positions: analysis.positions,
        deployment: config === null ? null : resolveDeployment(deployment),
        diagnostics,
    };
}
