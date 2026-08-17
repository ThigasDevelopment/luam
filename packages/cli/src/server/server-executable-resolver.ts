import { realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

export interface ServerExecutableOptions {
    root: string;
    serverPath: string;
    configured: string | null;
    platform?: NodeJS.Platform | undefined;
}

export interface ResolvedServerExecutable {
    executable: string;
    serverRoot: string;
}

function isInside(root: string, path: string): boolean {
    const pathFromRoot = relative(root, path);

    return pathFromRoot.length === 0 || (!pathFromRoot.startsWith('..') && !isAbsolute(pathFromRoot));
}

function candidates(platform: NodeJS.Platform): readonly string[] {
    if (platform === 'win32') {
        return ['MTA Server.exe'];
    }

    if (platform === 'linux') {
        return ['mta-server64', 'mta-server'];
    }

    throw new Error(`Local MTA server startup is not supported on platform "${platform}". Use Windows or Linux.`);
}

export function resolveServerExecutable(options: ServerExecutableOptions): ResolvedServerExecutable {
    const serverRoot = resolve(options.root, options.serverPath);
    const names = options.configured === null ? candidates(options.platform ?? process.platform) : [options.configured];
    const attempted: string[] = [];

    if (options.configured !== null && (isAbsolute(options.configured) || !isInside(serverRoot, resolve(serverRoot, options.configured)))) {
        throw new Error(`Configured development.server.executable must stay inside serverPath but received "${options.configured}".`);
    }

    for (const name of names) {
        const path = resolve(serverRoot, name);

        attempted.push(path);

        try {
            if (!statSync(path).isFile()) {
                continue;
            }

            const realRoot = realpathSync(serverRoot);
            const realExecutable = realpathSync(path);

            if (!isInside(realRoot, realExecutable)) {
                throw new Error(`MTA server executable resolves outside serverPath: "${path}".`);
            }

            return { executable: path, serverRoot };
        } catch (error: unknown) {
            if (error instanceof Error && error.message.startsWith('MTA server executable resolves outside')) {
                throw error;
            }
        }
    }

    throw new Error(`Could not find an MTA server executable. Tried: ${attempted.map((path) => `"${path}"`).join(', ')}.`);
}
