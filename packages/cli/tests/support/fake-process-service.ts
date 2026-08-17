import { PassThrough } from 'node:stream';

import type { OwnedProcess, ProcessExit, ProcessService, ProcessSpawnOptions } from '@cli/server/process-service';

export interface SpawnRecord {
    executable: string;
    options: ProcessSpawnOptions;
}

export class FakeProcessService implements ProcessService {
    readonly calls: SpawnRecord[] = [];
    readonly stdin = new PassThrough();
    kills = 0;
    private resolveExit: ((exit: ProcessExit) => void) | null = null;
    readonly exited = new Promise<ProcessExit>((resolveExit) => {
        this.resolveExit = resolveExit;
    });

    spawn(executable: string, options: ProcessSpawnOptions): OwnedProcess {
        this.calls.push({ executable, options });

        return {
            stdin: this.stdin,
            exited: this.exited,
            kill: (): void => {
                this.kills += 1;
                this.exit(null, 'SIGTERM');
            },
        };
    }

    exit(code: number | null, signal: NodeJS.Signals | null = null): void {
        this.resolveExit?.({ code, signal });
        this.resolveExit = null;
    }
}
