import type { ServerConsole, ServerConsoleResult } from '@cli/server/server-console';

export interface MockServerConsole extends ServerConsole {
    calls: string[];
    failNext: boolean;
}

export function createMockServerConsole(): MockServerConsole {
    const calls: string[] = [];

    const result = (message: string): ServerConsoleResult => (mock.failNext ? { ok: false, message: `${message} rejected` } : { ok: true, message });

    const mock: MockServerConsole = {
        calls,
        failNext: false,
        refresh: (): ServerConsoleResult => {
            calls.push('refresh');

            return result('refresh');
        },
        start: (resource: string): ServerConsoleResult => {
            calls.push(`start:${resource}`);

            return result('start');
        },
        restart: (resource: string): ServerConsoleResult => {
            calls.push(`restart:${resource}`);

            return result('restart');
        },
    };

    return mock;
}
