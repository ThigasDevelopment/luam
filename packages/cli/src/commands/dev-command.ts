import type { BuildOutcome } from '@cli/build/build-runner';
import { EXIT_DIAGNOSTICS } from '@cli/cli/exit-codes';
import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { runEnsureCommand, type EnsureOptions } from '@cli/commands/ensure-command';
import { resolveDevelopmentLogPosition } from '@cli/commands/trace-position';
import { parseMtaLogLine } from '@cli/logging/mta-log-parser';
import { resolveServerLogPath, followServerLog } from '@cli/logging/server-log-follower';
import { reportDevelopmentLog } from '@cli/reporting/development-log-reporter';
import { startMtaServer } from '@cli/server/mta-server-supervisor';
import { createServerConsole } from '@cli/server/server-console';
import type { ResourceMap } from '@compiler/project/resource';

import type { ProcessService } from '@cli/server/process-service';

export interface DevOptions extends EnsureOptions {
    startServer?: boolean | undefined;
    processService?: ProcessService | undefined;
    env?: NodeJS.ProcessEnv | undefined;
    platform?: NodeJS.Platform | undefined;
    readinessTimeoutMs?: number | undefined;
    shutdownTimeoutMs?: number | undefined;
    pollIntervalMs?: number | undefined;
}

export function deployedMapAfterBuild(map: ResourceMap | null, outcome: Pick<BuildOutcome, 'build' | 'map'>): ResourceMap | null {
    return outcome.build === null ? map : outcome.map;
}

export async function runDevCommand(context: CommandContext, options: DevOptions): Promise<number> {
    const reporter = commandReporter(context);
    let map: ResourceMap | null = null;

    if (context.config.serverPath === null) {
        reporter.error('luam dev requires "serverPath" in .luam.manifest.');

        return EXIT_DIAGNOSTICS;
    }

    const path = resolveServerLogPath(context.root, context.config.serverPath);
    const follower = followServerLog(
        path,
        (line) => {
            const record = parseMtaLogLine(line, context.config.name);

            if (record !== null) {
                reportDevelopmentLog(reporter, resolveDevelopmentLogPosition(record, map));
            }
        },
        { signal: options.signal },
    );

    let supervisor = null;
    const controller = new AbortController();
    const abort = (): void => controller.abort();

    options.signal?.addEventListener('abort', abort, { once: true });

    try {
        if (options.startServer === true) {
            if (options.processService === undefined) {
                throw new Error('The MTA process service is unavailable.');
            }

            supervisor = startMtaServer({
                root: context.root,
                config: context.config,
                processService: options.processService,
                env: options.env ?? process.env,
                signal: controller.signal,
                platform: options.platform,
                readinessTimeoutMs: options.readinessTimeoutMs,
                shutdownTimeoutMs: options.shutdownTimeoutMs,
                pollIntervalMs: options.pollIntervalMs,
            });
            await supervisor.waitUntilReady();
        }

        const ensure = runEnsureCommand(context, {
            ...options,
            serverConsole: supervisor === null ? null : createServerConsole(supervisor),
            signal: options.startServer === true ? controller.signal : options.signal,
            commandName: 'dev',
            developmentLogs: context.config.development.logs,
            layout: 'tree',
            onBuild: (outcome): void => {
                map = deployedMapAfterBuild(map, outcome);
                options.onBuild?.(outcome);
            },
        });

        if (supervisor === null) {
            return await ensure;
        }

        const result = await Promise.race([
            ensure.then((code) => ({ kind: 'ensure' as const, code })),
            supervisor.waitForExit().then((exit) => ({ kind: 'exit' as const, exit })),
        ]);

        if (result.kind === 'ensure') {
            return result.code;
        }

        controller.abort();
        await ensure;
        reporter.error(`Owned MTA server exited unexpectedly with ${result.exit.code === null ? `signal ${result.exit.signal ?? 'unknown'}` : `code ${result.exit.code}`}.`);

        return EXIT_DIAGNOSTICS;
    } catch (error: unknown) {
        reporter.error(error instanceof Error ? error.message : String(error));

        return EXIT_DIAGNOSTICS;
    } finally {
        options.signal?.removeEventListener('abort', abort);
        await supervisor?.close();
        follower.close();
    }
}
