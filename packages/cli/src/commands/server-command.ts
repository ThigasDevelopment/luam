import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { commandReporter } from '@cli/commands/command-context';
import { startMtaServer } from '@cli/server/mta-server-supervisor';

import type { CommandContext } from '@cli/commands/command-context';
import type { ProcessService } from '@cli/server/process-service';

export interface ServerOptions {
    processService: ProcessService;
    env: NodeJS.ProcessEnv;
    signal: AbortSignal | null;
}

export async function runServerCommand(context: CommandContext, options: ServerOptions): Promise<number> {
    const reporter = commandReporter(context);
    const controller = new AbortController();
    const abort = (): void => controller.abort();

    options.signal?.addEventListener('abort', abort, { once: true });
    process.on('SIGINT', abort);

    try {
        const supervisor = startMtaServer({
            root: context.root,
            config: context.config,
            processService: options.processService,
            env: options.env,
            interactive: true,
            signal: controller.signal,
        });

        try {
            await supervisor.waitUntilReady();

            const exit = await supervisor.waitForExit();

            return exit.code === 0 ? EXIT_OK : EXIT_DIAGNOSTICS;
        } finally {
            await supervisor.close();
        }
    } catch (error: unknown) {
        reporter.error(error instanceof Error ? error.message : String(error));

        return EXIT_DIAGNOSTICS;
    } finally {
        options.signal?.removeEventListener('abort', abort);
        process.off('SIGINT', abort);
    }
}
