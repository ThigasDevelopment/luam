import type { BuildOutcome } from '@cli/build/build-runner';
import { EXIT_DIAGNOSTICS } from '@cli/cli/exit-codes';
import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { runEnsureCommand, type EnsureOptions } from '@cli/commands/ensure-command';
import { resolveDevelopmentLogPosition } from '@cli/commands/trace-position';
import { parseMtaLogLine } from '@cli/logging/mta-log-parser';
import { resolveServerLogPath, followServerLog } from '@cli/logging/server-log-follower';
import { reportDevelopmentLog } from '@cli/reporting/development-log-reporter';
import type { ResourceMap } from '@compiler/project/resource';

export function deployedMapAfterBuild(map: ResourceMap | null, outcome: Pick<BuildOutcome, 'build' | 'map'>): ResourceMap | null {
    return outcome.build === null ? map : outcome.map;
}

export async function runDevCommand(context: CommandContext, options: EnsureOptions): Promise<number> {
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

    try {
        return await runEnsureCommand(context, {
            ...options,
            commandName: 'dev',
            developmentLogs: context.config.development.logs,
            layout: 'tree',
            onBuild: (outcome): void => {
                map = deployedMapAfterBuild(map, outcome);
                options.onBuild?.(outcome);
            },
        });
    } finally {
        follower.close();
    }
}
