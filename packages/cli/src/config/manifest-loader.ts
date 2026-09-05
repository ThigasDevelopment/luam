import { existsSync, readFileSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';

import { createPosition, hasErrors, sortDiagnostics, type Diagnostic } from '@compiler/diagnostics/diagnostic';
import { analyzeManifest } from '@compiler/manifest/manifest-analysis';
import { manifestError } from '@compiler/manifest/manifest-diagnostics';

import { MANIFEST_FILE_NAME, type LuamConfig } from '@cli/config/config-schema';
import { validateConfig } from '@cli/config/config-validation';
import { deploymentMovedWarning, resolveDeployment, EMPTY_POSITIONS, type DeploymentSettings } from '@cli/config/deployment';
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

function failure(path: string, code: string, message: string): LoadedManifest {
    return { path, source: '', config: null, positions: EMPTY_POSITIONS, deployment: null, diagnostics: [manifestError(code, message, START)] };
}

function promoteWarning(diagnostic: Diagnostic, promote: boolean): Diagnostic {
    return promote ? { ...diagnostic, severity: 'error' } : diagnostic;
}

function readManifest(path: string): string | null {
    try {
        return readFileSync(path, 'utf8');
    } catch {
        return null;
    }
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

    const env = options.env ?? {};
    const analysis = analyzeManifest(source, { mode: options.mode ?? DEFAULT_MODE, root, env: manifestEnvironment(env) });
    const validated = validateConfig(analysis.value, analysis.positions);
    const workspace = options.workspace ?? null;
    const deployment = workspace === null ? null : workspace.deployment;
    const moved = workspace === null || deployment === null ? null : deploymentMovedWarning(analysis.positions, workspace.path);
    const promoted = moved === null ? null : promoteWarning(moved, validated.config?.compilerOptions.warningsAsErrors === true);
    const diagnostics = sortDiagnostics([...analysis.diagnostics, ...validated.diagnostics, ...(promoted === null ? [] : [promoted])]);
    const config = hasErrors(diagnostics) ? null : validated.config;

    return {
        path,
        source,
        config,
        positions: analysis.positions,
        deployment: config === null ? null : resolveDeployment(root, config, deployment, analysis.positions),
        diagnostics,
    };
}
