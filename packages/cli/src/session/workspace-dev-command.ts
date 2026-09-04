import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import type { CommandContext } from '@cli/commands/command-context';
import { followServerLog } from '@cli/logging/server-log-follower';
import { parseWorkspaceLogLine } from '@cli/logging/mta-log-parser';
import { reportDevelopmentLog } from '@cli/reporting/development-log-reporter';
import { createReporter, type Reporter } from '@cli/reporting/reporter';
import { formatDuration } from '@cli/reporting/duration';
import { serverTarget, startMtaServer, type MtaServerTarget } from '@cli/server/mta-server-supervisor';
import { createServerConsole } from '@cli/server/server-console';
import { SESSION_VERBS } from '@cli/session/session-commands';
import { guardedLogger, guardedPaint, type SessionLineGuard } from '@cli/session/session-line-guard';
import { createWorkspaceSession, type SessionResourceLoader } from '@cli/session/workspace-session';
import { untilAborted } from '@cli/watch/abort-wait';

import type { DeploymentSettings } from '@cli/config/deployment';
import type { Logger } from '@cli/reporting/logger';
import type { ProcessService } from '@cli/server/process-service';
import type { Writable } from 'node:stream';
import type { SessionLine, TerminalInput } from '@cli/server/session-console-input';

export interface WorkspaceDevOptions {
    root: string;
    resources: readonly string[];
    logger: Logger;
    reporter: Reporter;
    deployment: DeploymentSettings;
    loadResource: SessionResourceLoader;
    processService: ProcessService;
    input?: TerminalInput | undefined;
    echo?: Writable | undefined;
    env: NodeJS.ProcessEnv;
    signal: AbortSignal | null;
    platform?: NodeJS.Platform | undefined;
    readinessTimeoutMs?: number | undefined;
    shutdownTimeoutMs?: number | undefined;
    pollIntervalMs?: number | undefined;
    now?: (() => Date) | undefined;
}

export const START_SERVER_AT_A_WORKSPACE = 'luam dev at a workspace root always owns the server, so "--start-server" says nothing. Run it without the flag.';

function exitReason(code: number | null, signal: string | null): string {
    return code === null ? `signal ${signal ?? 'unknown'}` : `code ${code}`;
}

export async function runWorkspaceDevCommand(options: WorkspaceDevOptions): Promise<number> {
    let consoleInput: { eraseLine(): void; redrawLine(): void } | null = null;

    const guard: SessionLineGuard = {
        erase: (): void => consoleInput?.eraseLine(),
        redraw: (): void => consoleInput?.redrawLine(),
    };
    const reporter = createReporter(guardedLogger(options.logger, guard), options.reporter.capability, guardedPaint(options.reporter.paint, guard));
    const target: MtaServerTarget | null = serverTarget(options.deployment);

    if (target === null) {
        reporter.error('The workspace file names no MTA server installation.');

        return EXIT_DIAGNOSTICS;
    }

    const controller = new AbortController();
    const abort = (): void => controller.abort();

    options.signal?.addEventListener('abort', abort, { once: true });
    process.on('SIGINT', abort);

    const startedAt = Date.now();
    const queued: SessionLine[] = [];
    let session: ReturnType<typeof createWorkspaceSession> | null = null;
    let supervisor = null;
    let follower = null;

    try {
        supervisor = startMtaServer({
            target,
            processService: options.processService,
            env: options.env,
            interactive: true,
            input: options.input,
            echo: options.echo,
            sessionVerbs: SESSION_VERBS,
            onSessionLine: (line: SessionLine): void => {
                if (session === null) {
                    queued.push(line);

                    return;
                }

                void session.run(line);
            },
            signal: controller.signal,
            platform: options.platform,
            readinessTimeoutMs: options.readinessTimeoutMs,
            shutdownTimeoutMs: options.shutdownTimeoutMs,
            pollIntervalMs: options.pollIntervalMs,
        });

        consoleInput = supervisor.consoleInput;

        await supervisor.waitUntilReady();

        const opened = createWorkspaceSession({
            root: options.root,
            resources: options.resources,
            reporter,
            serverConsole: createServerConsole(supervisor),
            loadResource: options.loadResource,
            developmentLogs: options.deployment.logs,
            now: options.now,
        });

        session = opened;
        follower = followServerLog(
            supervisor.logPath,
            (line) => {
                const record = parseWorkspaceLogLine(line, opened.attached);

                if (record === null) {
                    return;
                }

                reportDevelopmentLog(reporter, record.resource === '' ? record : { ...record, message: `[${record.resource}] ${record.message}` });
            },
            { signal: controller.signal, pollIntervalMs: options.pollIntervalMs },
        );

        reporter.success(`Started the MTA server at "${target.serverRoot}" and waited for readiness in ${formatDuration(Date.now() - startedAt)}.`);
        opened.reportOpening();

        for (const line of queued.splice(0)) {
            await opened.run(line);
        }

        const result = await Promise.race([
            untilAborted(controller.signal).then(() => ({ kind: 'stopped' as const, exit: null })),
            supervisor.waitForExit().then((exit) => ({ kind: 'exited' as const, exit })),
        ]);

        if (result.kind === 'stopped') {
            return EXIT_OK;
        }

        reporter.error(`Owned MTA server exited unexpectedly with ${exitReason(result.exit.code, result.exit.signal)}.`);

        return EXIT_DIAGNOSTICS;
    } catch (error: unknown) {
        reporter.error(error instanceof Error ? error.message : String(error));

        return EXIT_DIAGNOSTICS;
    } finally {
        options.signal?.removeEventListener('abort', abort);
        process.off('SIGINT', abort);
        session?.close();
        follower?.close();
        await supervisor?.close();
    }
}
