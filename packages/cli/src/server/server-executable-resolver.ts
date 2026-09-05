import { accessSync, constants, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

export interface ServerExecutableOptions {
    serverRoot: string;
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

function runnable(path: string): boolean {
    try {
        accessSync(path, constants.X_OK);

        return true;
    } catch {
        return false;
    }
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
    const serverRoot = resolve(options.serverRoot);
    const platform = options.platform ?? process.platform;
    const names = options.configured === null ? candidates(platform) : [options.configured];
    const attempted: string[] = [];
    const blocked: string[] = [];

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

            if (platform !== 'win32' && !runnable(path)) {
                blocked.push(path);

                continue;
            }

            return { executable: path, serverRoot };
        } catch (error: unknown) {
            if (error instanceof Error && error.message.startsWith('MTA server executable resolves outside')) {
                throw error;
            }
        }
    }

    if (blocked.length > 0) {
        const list = blocked.map((path) => `"${path}"`).join(', ');

        throw new Error(`The MTA server executable is missing the execute permission: ${list}. Run "chmod +x" on it and start the server again.`);
    }

    throw new Error(`Could not find an MTA server executable. Tried: ${attempted.map((path) => `"${path}"`).join(', ')}.`);
}
