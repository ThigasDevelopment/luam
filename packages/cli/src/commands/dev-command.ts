import { resolveServerLogPath, followServerLog } from '@cli/logging/server-log-follower';
import { parseMtaLogLine } from '@cli/logging/mta-log-parser';
import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { runEnsureCommand, type EnsureOptions } from '@cli/commands/ensure-command';
import { EXIT_DIAGNOSTICS } from '@cli/cli/exit-codes';
import { reportDevelopmentLog } from '@cli/reporting/development-log-reporter';

export async function runDevCommand(context: CommandContext, options: EnsureOptions): Promise<number> {
    const reporter = commandReporter(context);

    if (context.config.serverPath === null) {
        reporter.error('luam dev requires "serverPath" in luam.json.');

        return EXIT_DIAGNOSTICS;
    }

    const path = resolveServerLogPath(context.root, context.config.serverPath);
    const follower = followServerLog(
        path,
        (line) => {
            const record = parseMtaLogLine(line, context.config.name);

            if (record !== null) {
                reportDevelopmentLog(reporter, record);
            }
        },
        { signal: options.signal },
    );

    try {
        return await runEnsureCommand(context, {
            ...options,
            commandName: 'dev',
            developmentLogs: context.config.development.logs,
        });
    } finally {
        follower.close();
    }
}
