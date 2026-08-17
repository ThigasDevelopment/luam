import { spawn } from 'node:child_process';

import type { Writable } from 'node:stream';

export interface ProcessExit {
    code: number | null;
    signal: NodeJS.Signals | null;
}

export interface OwnedProcess {
    stdin: Writable;
    exited: Promise<ProcessExit>;
    kill(): void;
}

export interface ProcessSpawnOptions {
    cwd: string;
    env: NodeJS.ProcessEnv;
    interactive: boolean;
}

export interface ProcessService {
    spawn(executable: string, options: ProcessSpawnOptions): OwnedProcess;
}

export function createProcessService(): ProcessService {
    return {
        spawn: (executable, options): OwnedProcess => {
            const child = spawn(executable, [], {
                cwd: options.cwd,
                env: options.env,
                shell: false,
                stdio: ['pipe', options.interactive ? 'inherit' : 'ignore', options.interactive ? 'inherit' : 'ignore'],
                windowsHide: !options.interactive,
            });
            const exited = new Promise<ProcessExit>((resolveExit, rejectExit) => {
                child.once('error', rejectExit);
                child.once('exit', (code, signal) => resolveExit({ code, signal }));
            });

            return {
                stdin: child.stdin,
                exited,
                kill: (): void => {
                    child.kill();
                },
            };
        },
    };
}
