import { isAbsolute, resolve } from 'node:path';

import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import { manifestWarning } from '@compiler/manifest/manifest-diagnostics';
import { positionAt, type PositionLookup } from '@compiler/manifest/manifest-rules';

import type { DevelopmentLogsConfig, LuamConfig } from '@cli/config/config-schema';
import type { WorkspaceDeployment } from '@cli/config/workspace-loader';

export const DEPLOYMENT_MOVED = 'config-deployment-moved';

export function missingServerPathMessage(command: string): string {
    return `luam ${command} requires "serverPath" in ".luam.manifest", or a ".luam.server" naming the MTA server this directory of resources shares.`;
}

export interface DeploymentSettings {
    serverRoot: string | null;
    resourcesDir: string;
    executable: string | null;
    logs: DevelopmentLogsConfig;
}

const MANIFEST_DEPLOYMENT_FIELDS: readonly string[] = ['serverPath', 'resourcesDir', 'development.server'];

const LOGS_FIELD = 'development.logs';

export const EMPTY_POSITIONS: PositionLookup = new Map();

function assignedUnder(positions: PositionLookup, prefix: string): boolean {
    for (const key of positions.keys()) {
        if (key === prefix || key.startsWith(`${prefix}.`)) {
            return true;
        }
    }

    return false;
}

export function resolveServerRoot(root: string, serverPath: string): string {
    return isAbsolute(serverPath) ? serverPath : resolve(root, serverPath);
}

export function resolveServerRootFromManifest(root: string, serverPath: string | null): string | null {
    return serverPath === null ? null : resolveServerRoot(root, serverPath);
}

export function manifestDeployment(root: string, config: LuamConfig): DeploymentSettings {
    return {
        serverRoot: resolveServerRootFromManifest(root, config.serverPath),
        resourcesDir: config.resourcesDir,
        executable: config.development.server.executable,
        logs: config.development.logs,
    };
}

export function resolveDeployment(root: string, config: LuamConfig, workspace: WorkspaceDeployment | null, positions: PositionLookup = EMPTY_POSITIONS): DeploymentSettings {
    if (workspace === null) {
        return manifestDeployment(root, config);
    }

    return {
        serverRoot: workspace.serverRoot,
        resourcesDir: workspace.resourcesDir,
        executable: workspace.executable,
        logs: assignedUnder(positions, LOGS_FIELD) ? config.development.logs : workspace.logs,
    };
}

export function overriddenDeploymentFields(positions: PositionLookup): string[] {
    return MANIFEST_DEPLOYMENT_FIELDS.filter((name) => assignedUnder(positions, name));
}

function quoteAll(names: readonly string[]): string {
    const quoted = names.map((name) => `"${name}"`);
    const last = quoted.pop() ?? '';

    return quoted.length === 0 ? last : `${quoted.join(', ')} and ${last}`;
}

export function deploymentMovedWarning(positions: PositionLookup, serverFilePath: string): Diagnostic | null {
    const overridden = overriddenDeploymentFields(positions);
    const [first] = overridden;

    if (first === undefined) {
        return null;
    }

    const subject = overridden.length === 1 ? 'field belongs' : 'fields belong';
    const message = `${quoteAll(overridden)} ${subject} in "${serverFilePath}", which answers them for this directory and wins here. Delete ${overridden.length === 1 ? 'the line' : 'the lines'} from the manifest.`;

    return manifestWarning(DEPLOYMENT_MOVED, message, positionAt(positions, first));
}
