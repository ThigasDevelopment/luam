import { isAbsolute, resolve } from 'node:path';

import type { LuamConfig } from '@cli/config/config-schema';

export interface ResourceTargets {
    outDir: string;
    serverDir: string | null;
}

export function resolveTargets(root: string, config: LuamConfig): ResourceTargets {
    const outDir = resolve(root, config.outDir, config.name);

    if (config.serverPath === null) {
        return { outDir, serverDir: null };
    }

    const serverRoot = isAbsolute(config.serverPath) ? config.serverPath : resolve(root, config.serverPath);

    return { outDir, serverDir: resolve(serverRoot, config.resourcesDir, config.name) };
}
