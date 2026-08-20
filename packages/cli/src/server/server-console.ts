import type { MtaServerSupervisor } from '@cli/server/mta-server-supervisor';

export interface ServerConsoleResult {
    ok: boolean;
    message: string;
}

export interface ServerConsole {
    refresh(): ServerConsoleResult;
    restart(resource: string): ServerConsoleResult;
}

function write(supervisor: MtaServerSupervisor, commands: readonly string[], message: string): ServerConsoleResult {
    try {
        for (const command of commands) {
            supervisor.writeCommand(command);
        }
    } catch (error: unknown) {
        return { ok: false, message: error instanceof Error ? error.message : String(error) };
    }

    return { ok: true, message };
}

export function createServerConsole(supervisor: MtaServerSupervisor): ServerConsole {
    return {
        refresh: (): ServerConsoleResult => write(supervisor, ['refresh'], 'refreshed the resource list'),
        restart: (resource: string): ServerConsoleResult => write(supervisor, [`stop ${resource}`, `start ${resource}`], `restarted "${resource}"`),
    };
}
