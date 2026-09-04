import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { startMtaServer, type MtaServerTarget } from '@cli/server/mta-server-supervisor';

import type { Reporter } from '@cli/reporting/reporter';
import type { PortHolder } from '@cli/server/port-holder';
import type { ProcessService } from '@cli/server/process-service';

export interface ServerOptions {
    processService: ProcessService;
    env: NodeJS.ProcessEnv;
    signal: AbortSignal | null;
    portHolder?: ((port: number) => PortHolder | null) | undefined;
}

export async function runServerCommand(target: MtaServerTarget, reporter: Reporter, options: ServerOptions): Promise<number> {
    const controller = new AbortController();
    const abort = (): void => controller.abort();

    options.signal?.addEventListener('abort', abort, { once: true });
    process.on('SIGINT', abort);

    try {
        const supervisor = startMtaServer({
            target,
            processService: options.processService,
            checkPorts: true,
            portHolder: options.portHolder,
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
