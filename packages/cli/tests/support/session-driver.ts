import { createRuntime, createWorkspaceContext, type CliRuntime, type WorkspaceContext } from '@cli/cli/cli-runtime';
import { resourceContext } from '@cli/cli/cli-runtime';
import type { CommandContext } from '@cli/commands/command-context';
import type { ServerConsole, ServerConsoleResult } from '@cli/server/server-console';
import { splitSessionLine } from '@cli/server/session-console-input';
import { createWorkspaceSession, type WorkspaceSession } from '@cli/session/workspace-session';

import { createMemoryLogger, type MemoryLogger } from './memory-logger';
import { createWorkspaceFixture, type ProjectFixture, type WorkspaceShape } from './project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

export interface SessionDriver {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    runtime: CliRuntime;
    workspace: WorkspaceContext;
    session: WorkspaceSession;
    console: string[];
    type(line: string): Promise<void>;
    deployed(resource: string, path?: string): boolean;
    close(): void;
}

export function openSessionDriver(shape: WorkspaceShape = {}): SessionDriver {
    const fixture = createWorkspaceFixture(shape);
    const logger = createMemoryLogger();
    const runtime = createRuntime([], { logger, cwd: fixture.root, env: OFFLINE });
    const resolved = createWorkspaceContext(runtime, {});

    if (resolved.context === null) {
        throw new Error('The workspace fixture did not open.');
    }

    const workspace = resolved.context;
    const written: string[] = [];
    const record = (command: string, message: string): ServerConsoleResult => {
        written.push(command);

        return { ok: true, message };
    };
    const serverConsole: ServerConsole = {
        refresh: (): ServerConsoleResult => record('refresh', 'refreshed the resource list'),
        start: (resource: string): ServerConsoleResult => record(`start ${resource}`, `Started "${resource}"`),
        restart: (resource: string): ServerConsoleResult => {
            record(`stop ${resource}`, '');

            return record(`start ${resource}`, `restarted "${resource}"`);
        },
    };
    const session = createWorkspaceSession({
        root: workspace.root,
        resources: workspace.resources,
        reporter: runtime.reporter,
        serverConsole,
        loadResource: (name: string): CommandContext | null => resourceContext(runtime, workspace, 'dev', name).context,
        developmentLogs: workspace.workspace.deployment?.logs ?? null,
    });

    return {
        fixture,
        logger,
        runtime,
        workspace,
        session,
        console: written,
        type: (line: string): Promise<void> => session.run(splitSessionLine(line)),
        deployed: (resource: string, path = 'meta.xml'): boolean => fixture.exists(`server/mods/deathmatch/resources/${resource}/${path}`),
        close: (): void => {
            session.close();
            fixture.dispose();
        },
    };
}
