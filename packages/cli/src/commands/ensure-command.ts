import { commandDeployment, commandReporter, type CommandContext } from '@cli/commands/command-context';
import { createEnsureRunner, type EnsureRunner } from '@cli/commands/ensure-runner';
import type { DevelopmentLogsConfig } from '@cli/config/config-schema';
import { missingServerPathMessage } from '@cli/config/deployment';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { reportRebuildSeparator } from '@cli/reporting/rebuild-separator';
import type { ServerConsole } from '@cli/server/server-console';
import { untilAborted } from '@cli/watch/abort-wait';
import { watchedRoots, watchSources } from '@cli/watch/source-watcher';
import type { BuildOutcome } from '@cli/build/build-runner';
import type { OutputLayout } from '@compiler/project/resource';

export interface EnsureOptions {
    serverConsole?: ServerConsole | null;
    watch: boolean;
    signal: AbortSignal | null;
    developmentLogs?: DevelopmentLogsConfig | null;
    commandName?: 'ensure' | 'dev';
    layout?: OutputLayout;
    map?: boolean;
    onBuild?: (outcome: BuildOutcome) => void;
}

async function watchLoop(context: CommandContext, runner: EnsureRunner, options: EnsureOptions): Promise<void> {
    const reporter = commandReporter(context);
    let running = false;
    let queued = false;

    const rebuild = async (): Promise<void> => {
        if (running) {
            queued = true;

            return;
        }

        running = true;

        do {
            queued = false;

            reportRebuildSeparator(reporter);

            const result = await runner.run();

            options.onBuild?.(result.outcome);
        } while (queued);

        running = false;
    };

    const watcher = watchSources(context.root, context.config.sources, () => {
        void rebuild();
    });
    const roots = watchedRoots(context.config.sources).map((entry) => `"${entry.length === 0 ? '.' : entry}"`);

    reporter.info(`Watching ${roots.join(', ')} for changes. Press Ctrl+C to stop.`);

    await untilAborted(options.signal);
    watcher.close();
}

export async function runEnsureCommand(context: CommandContext, options: EnsureOptions): Promise<number> {
    if (commandDeployment(context).serverRoot === null) {
        commandReporter(context).error(missingServerPathMessage(options.commandName ?? 'ensure'));

        return EXIT_DIAGNOSTICS;
    }

    const runner = createEnsureRunner(context, {
        serverConsole: options.serverConsole ?? null,
        developmentLogs: options.developmentLogs ?? null,
        layout: options.layout ?? 'tree',
        map: options.map ?? context.config.output.map,
    });
    const first = await runner.run();

    options.onBuild?.(first.outcome);

    if (!options.watch) {
        return first.ok ? EXIT_OK : EXIT_DIAGNOSTICS;
    }

    await watchLoop(context, runner, options);

    return EXIT_OK;
}
