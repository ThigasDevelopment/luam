import type { BuildOutcome } from '@cli/build/build-runner';
import { EXIT_DIAGNOSTICS } from '@cli/cli/exit-codes';
import { commandDeployment, commandReporter, type CommandContext } from '@cli/commands/command-context';
import { runEnsureCommand, type EnsureOptions } from '@cli/commands/ensure-command';
import { missingServerPathMessage } from '@cli/config/deployment';
import { resolveDevelopmentLogPosition } from '@cli/commands/trace-position';
import { parseMtaLogLine } from '@cli/logging/mta-log-parser';
import { serverLogPath, followServerLog } from '@cli/logging/server-log-follower';
import { reportDevelopmentLog } from '@cli/reporting/development-log-reporter';
import { serverTarget, startMtaServer } from '@cli/server/mta-server-supervisor';
import { createServerConsole } from '@cli/server/server-console';
import type { ResourceMap } from '@compiler/project/resource';

import type { PortHolder } from '@cli/server/port-holder';
import type { ProcessService } from '@cli/server/process-service';

export interface DevOptions extends EnsureOptions {
    startServer?: boolean | undefined;
    processService?: ProcessService | undefined;
    env?: NodeJS.ProcessEnv | undefined;
    platform?: NodeJS.Platform | undefined;
    readinessTimeoutMs?: number | undefined;
    shutdownTimeoutMs?: number | undefined;
    pollIntervalMs?: number | undefined;
    portHolder?: ((port: number) => PortHolder | null) | undefined;
}

export function deployedMapAfterBuild(map: ResourceMap | null, outcome: Pick<BuildOutcome, 'build' | 'map'>): ResourceMap | null {
    return outcome.build === null ? map : outcome.map;
}

export async function runDevCommand(context: CommandContext, options: DevOptions): Promise<number> {
    const reporter = commandReporter(context);
    const deployment = commandDeployment(context);
    let map: ResourceMap | null = null;

    if (deployment.serverRoot === null) {
        reporter.error(missingServerPathMessage('dev'));

        return EXIT_DIAGNOSTICS;
    }

    const path = serverLogPath(deployment.serverRoot);
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

            const target = serverTarget(deployment);

            if (target === null) {
                throw new Error(missingServerPathMessage('dev'));
            }

            supervisor = startMtaServer({
                target,
                processService: options.processService,
                checkPorts: true,
                portHolder: options.portHolder,
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
            developmentLogs: deployment.logs,
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
