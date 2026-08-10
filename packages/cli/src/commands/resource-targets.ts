import { isAbsolute, resolve } from 'node:path';

import type { LuamConfig } from '@cli/config/config-schema';

export function resolveBuildTarget(root: string, config: LuamConfig): string {
    return resolve(root, config.outDir, config.name);
}

export function resolveServerTarget(root: string, config: LuamConfig): string | null {
    if (config.serverPath === null) {
        return null;
    }

    const serverRoot = isAbsolute(config.serverPath) ? config.serverPath : resolve(root, config.serverPath);

    return resolve(serverRoot, config.resourcesDir, config.name);
}
