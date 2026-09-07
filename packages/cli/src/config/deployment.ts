import { isAbsolute, resolve } from 'node:path';

import type { PositionLookup } from '@compiler/manifest/manifest-rules';
import { DEFAULT_RESOURCES_DIR } from '@compiler/manifest/manifest-defaults';
import { SERVER_FILE_NAME } from '@compiler/workspace/workspace-fields';

import type { WorkspaceDeployment } from '@cli/config/workspace-loader';

export function missingServerPathMessage(command: string): string {
    return `luam ${command} requires a "${SERVER_FILE_NAME}" naming the MTA server this directory of resources shares.`;
}

export interface DeploymentSettings {
    serverRoot: string | null;
    resourcesDir: string;
    executable: string | null;
}

export const EMPTY_POSITIONS: PositionLookup = new Map();

export function resolveServerRoot(root: string, serverPath: string): string {
    return isAbsolute(serverPath) ? serverPath : resolve(root, serverPath);
}

export function resolveDeployment(workspace: WorkspaceDeployment | null): DeploymentSettings | null {
    if (workspace === null) {
        return null;
    }

    return { serverRoot: workspace.serverRoot, resourcesDir: workspace.resourcesDir, executable: workspace.executable };
}

export function emptyDeployment(): DeploymentSettings {
    return { serverRoot: null, resourcesDir: DEFAULT_RESOURCES_DIR, executable: null };
}
