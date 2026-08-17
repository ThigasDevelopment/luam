import { closeSync, existsSync, openSync, readSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

export interface ServerLogFollower {
    close(): void;
}

export interface ServerLogFollowerOptions {
    signal?: AbortSignal | null | undefined;
    pollIntervalMs?: number | undefined;
}

const DEFAULT_POLL_INTERVAL_MS = 100;

export function resolveServerLogPath(root: string, serverPath: string): string {
    const server = isAbsolute(serverPath) ? serverPath : resolve(root, serverPath);

    return resolve(server, 'mods/deathmatch/logs/server.log');
}

function identity(path: string): string {
    const stats = statSync(path);

    return `${stats.dev}:${stats.ino}:${stats.birthtimeMs}`;
}

function readFrom(path: string, offset: number, size: number): Buffer {
    const length = Math.max(0, size - offset);
    const buffer = Buffer.alloc(length);
    const descriptor = openSync(path, 'r');

    try {
        const read = readSync(descriptor, buffer, 0, length, offset);

        return buffer.subarray(0, read);
    } finally {
        closeSync(descriptor);
    }
}

export function followServerLog(path: string, onLine: (line: string) => void, options: ServerLogFollowerOptions = {}): ServerLogFollower {
    let currentIdentity: string | null = null;
    let offset = 0;
    let remainder = '';
    let prefix: Buffer<ArrayBufferLike> = Buffer.alloc(0);
    let initialized = false;
    let closed = false;

    const poll = (): void => {
        if (closed || !existsSync(path)) {
            return;
        }

        try {
            const stats = statSync(path);
            const nextIdentity = identity(path);

            if (!initialized) {
                initialized = true;
                currentIdentity = nextIdentity;
                offset = stats.size;
                prefix = readFrom(path, 0, Math.min(stats.size, 64));

                return;
            }

            const comparable = Math.min(offset, 64, stats.size);
            const currentPrefix = readFrom(path, 0, comparable);

            if (nextIdentity !== currentIdentity || stats.size < offset || !currentPrefix.equals(prefix.subarray(0, comparable))) {
                currentIdentity = nextIdentity;
                offset = 0;
                remainder = '';
                prefix = Buffer.alloc(0);
            }

            if (stats.size === offset) {
                return;
            }

            const chunk = readFrom(path, offset, stats.size);

            offset += chunk.length;
            prefix = readFrom(path, 0, Math.min(offset, 64));

            const lines = `${remainder}${chunk.toString('utf8')}`.split('\n');

            remainder = lines.pop() ?? '';

            for (const line of lines) {
                onLine(line.replace(/\r$/, ''));
            }
        } catch {
            currentIdentity = null;
        }
    };

    poll();
    initialized = true;

    const timer = setInterval(poll, options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS);
    const close = (): void => {
        if (closed) {
            return;
        }

        closed = true;
        clearInterval(timer);
        options.signal?.removeEventListener('abort', close);
    };

    if (options.signal?.aborted === true) {
        close();
    } else {
        options.signal?.addEventListener('abort', close, { once: true });
    }

    return { close };
}
