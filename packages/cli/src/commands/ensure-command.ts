import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { createEnsureRunner, type EnsureRunner } from '@cli/commands/ensure-runner';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { reportRebuildSeparator } from '@cli/reporting/rebuild-separator';
import type { MtaTransport } from '@cli/transport/transport';
import { watchSources } from '@cli/watch/source-watcher';

export interface EnsureOptions {
    transport: MtaTransport;
    watch: boolean;
    signal: AbortSignal | null;
}

function untilAborted(signal: AbortSignal | null): Promise<void> {
    return new Promise<void>((resolveLoop) => {
        const stop = (): void => {
            process.off('SIGINT', stop);
            resolveLoop();
        };

        if (signal !== null) {
            signal.addEventListener('abort', stop, { once: true });
        }

        process.on('SIGINT', stop);
    });
}

async function watchLoop(context: CommandContext, runner: EnsureRunner, signal: AbortSignal | null): Promise<void> {
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

            await runner.run();
        } while (queued);

        running = false;
    };

    const watcher = watchSources(context.root, context.config.sourceDirs, () => {
        void rebuild();
    });

    reporter.info(`Watching ${context.config.sourceDirs.map((entry) => `"${entry}"`).join(', ')} for changes. Press Ctrl+C to stop.`);

    await untilAborted(signal);
    watcher.close();
}

export async function runEnsureCommand(context: CommandContext, options: EnsureOptions): Promise<number> {
    if (context.config.serverPath === null) {
        commandReporter(context).error('luam ensure requires "serverPath" in luam.json.');

        return EXIT_DIAGNOSTICS;
    }

    const runner = createEnsureRunner(context, options.transport);
    const first = await runner.run();

    if (!options.watch) {
        return first.ok ? EXIT_OK : EXIT_DIAGNOSTICS;
    }

    await watchLoop(context, runner, options.signal);

    return EXIT_OK;
}
