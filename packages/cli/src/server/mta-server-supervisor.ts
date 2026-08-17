import { followServerLog, resolveServerLogPath } from '@cli/logging/server-log-follower';
import { connectServerConsoleInput } from '@cli/server/server-console-input';
import { resolveServerExecutable } from '@cli/server/server-executable-resolver';

import type { LuamConfig } from '@cli/config/config-schema';
import type { ProcessExit, ProcessService, OwnedProcess } from '@cli/server/process-service';
import type { ServerConsoleInput } from '@cli/server/server-console-input';

export type MtaServerState = 'starting' | 'ready' | 'stopping' | 'exited';

export interface MtaServerSupervisor {
    readonly state: MtaServerState;
    writeCommand(command: string): void;
    waitUntilReady(): Promise<void>;
    waitForExit(): Promise<ProcessExit>;
    close(): Promise<void>;
}

export interface MtaServerSupervisorOptions {
    root: string;
    config: LuamConfig;
    processService: ProcessService;
    env: NodeJS.ProcessEnv;
    interactive?: boolean | undefined;
    signal?: AbortSignal | null | undefined;
    platform?: NodeJS.Platform | undefined;
    readinessTimeoutMs?: number | undefined;
    shutdownTimeoutMs?: number | undefined;
    pollIntervalMs?: number | undefined;
}

const DEFAULT_READINESS_TIMEOUT_MS = 30_000;

const DEFAULT_SHUTDOWN_TIMEOUT_MS = 5_000;

export function isMtaServerReady(line: string): boolean {
    return /server started(?: and is ready to accept connections)?[!.]?$/i.test(line.trim());
}

function timeout(milliseconds: number): Promise<void> {
    return new Promise((resolveTimeout) => setTimeout(resolveTimeout, milliseconds));
}

export function startMtaServer(options: MtaServerSupervisorOptions): MtaServerSupervisor {
    if (options.config.serverPath === null) {
        throw new Error('Local MTA server startup requires "serverPath" in .luam.manifest.');
    }

    const resolved = resolveServerExecutable({
        root: options.root,
        serverPath: options.config.serverPath,
        configured: options.config.development.server.executable,
        platform: options.platform,
    });
    let state: MtaServerState = 'starting';
    let closePromise: Promise<void> | null = null;
    let consoleInput: ServerConsoleInput | null = null;
    let readyResolve: (() => void) | null = null;
    let readyReject: ((error: Error) => void) | null = null;
    const logPath = resolveServerLogPath(options.root, options.config.serverPath);
    const ready = new Promise<void>((resolveReady, rejectReady) => {
        readyResolve = resolveReady;
        readyReject = rejectReady;
    });
    const follower = followServerLog(
        logPath,
        (line) => {
            if (state === 'starting' && isMtaServerReady(line)) {
                state = 'ready';
                follower.close();
                readyResolve?.();
            }
        },
        { pollIntervalMs: options.pollIntervalMs },
    );
    let child: OwnedProcess;

    try {
        child = options.processService.spawn(resolved.executable, {
            cwd: resolved.serverRoot,
            env: options.env,
            interactive: options.interactive ?? false,
        });
    } catch (error: unknown) {
        follower.close();
        throw error;
    }

    const exited = child.exited.then(
        (result) => {
            const previous = state;

            state = 'exited';
            follower.close();

            if (previous === 'starting') {
                readyReject?.(new Error(`MTA server exited before readiness with ${result.code === null ? `signal ${result.signal ?? 'unknown'}` : `code ${result.code}`}.`));
            }

            return result;
        },
        (error: unknown) => {
            state = 'exited';
            follower.close();
            readyReject?.(new Error(`Failed to start the MTA server: ${error instanceof Error ? error.message : String(error)}.`));

            throw error;
        },
    );
    const readinessTimer = setTimeout(() => {
        if (state === 'starting') {
            readyReject?.(new Error(`MTA server did not become ready within ${options.readinessTimeoutMs ?? DEFAULT_READINESS_TIMEOUT_MS}ms. Check "${logPath}".`));
        }
    }, options.readinessTimeoutMs ?? DEFAULT_READINESS_TIMEOUT_MS);
    const abort = (): void => {
        if (state === 'starting') {
            readyReject?.(new Error('MTA server startup was aborted.'));
        }

        void close();
    };
    const close = (): Promise<void> => {
        if (closePromise !== null) {
            return closePromise;
        }

        closePromise = (async (): Promise<void> => {
            follower.close();
            options.signal?.removeEventListener('abort', abort);
            consoleInput?.close();

            if (state === 'exited') {
                return;
            }

            state = 'stopping';
            child.stdin.write('shutdown\n');
            child.stdin.end();

            const stopped = await Promise.race([exited.then(() => true), timeout(options.shutdownTimeoutMs ?? DEFAULT_SHUTDOWN_TIMEOUT_MS).then(() => false)]);

            if (!stopped) {
                child.kill();
            }
        })();

        return closePromise;
    };

    void ready.finally(() => clearTimeout(readinessTimer)).catch(() => undefined);
    void exited.catch(() => undefined);
    options.signal?.addEventListener('abort', abort, { once: true });

    if (options.interactive === true) {
        consoleInput = connectServerConsoleInput(process.stdin, child.stdin, abort);
    }

    if (options.signal?.aborted === true) {
        abort();
    }

    return {
        get state(): MtaServerState {
            return state;
        },
        writeCommand: (command: string): void => {
            if (state !== 'ready') {
                throw new Error(`Cannot write an MTA console command while the server is ${state}.`);
            }

            if (command.length === 0 || /[\r\n]/.test(command)) {
                throw new Error('MTA console commands must be one non-empty line.');
            }

            child.stdin.write(`${command}\n`);
        },
        waitUntilReady: (): Promise<void> => ready,
        waitForExit: (): Promise<ProcessExit> => exited,
        close,
    };
}
