import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { createEnsureRunner, type EnsureRunner } from '@cli/commands/ensure-runner';
import type { DevelopmentLogsConfig } from '@cli/config/config-schema';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { reportRebuildSeparator } from '@cli/reporting/rebuild-separator';
import type { MtaTransport } from '@cli/transport/transport';
import { watchSources } from '@cli/watch/source-watcher';
import type { BuildOutcome } from '@cli/build/build-runner';
import type { OutputLayout } from '@compiler/project/resource';

export interface EnsureOptions {
    transport: MtaTransport;
    watch: boolean;
    signal: AbortSignal | null;
    developmentLogs?: DevelopmentLogsConfig | null;
    commandName?: 'ensure' | 'dev';
    layout?: OutputLayout;
    map?: boolean;
    onBuild?: (outcome: BuildOutcome) => void;
}

function untilAborted(signal: AbortSignal | null): Promise<void> {
    return new Promise<void>((resolveLoop) => {
        if (signal?.aborted === true) {
            resolveLoop();

            return;
        }

        const stop = (): void => {
            process.off('SIGINT', stop);
            signal?.removeEventListener('abort', stop);
            resolveLoop();
        };

        if (signal !== null) {
            signal.addEventListener('abort', stop, { once: true });
        }

        process.on('SIGINT', stop);
    });
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

    const watcher = watchSources(context.root, context.config.sourceDirs, () => {
        void rebuild();
    });

    reporter.info(`Watching ${context.config.sourceDirs.map((entry) => `"${entry}"`).join(', ')} for changes. Press Ctrl+C to stop.`);

    await untilAborted(options.signal);
    watcher.close();
}

export async function runEnsureCommand(context: CommandContext, options: EnsureOptions): Promise<number> {
    if (context.config.serverPath === null) {
        commandReporter(context).error(`luam ${options.commandName ?? 'ensure'} requires "serverPath" in .luam.manifest.`);

        return EXIT_DIAGNOSTICS;
    }

    const runner = createEnsureRunner(context, options.transport, {
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
