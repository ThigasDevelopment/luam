import { resolve } from 'node:path';

import type { LuamConfig } from '@cli/config/config-schema';
import type { DeploymentSettings } from '@cli/config/deployment';

export function resolveBuildTarget(root: string, config: LuamConfig): string {
    return resolve(root, config.outDir, config.name);
}

export function resolveServerTarget(deployment: DeploymentSettings, name: string): string | null {
    if (deployment.serverRoot === null) {
        return null;
    }

    return resolve(deployment.serverRoot, deployment.resourcesDir, name);
}
