import { createProjectContext, runtimeTransport } from '@cli/cli/cli-runtime';
import { addProjectOptions, addWatchOptions, noMapOption, offlineOption } from '@cli/cli/shared-options';
import { runDevCommand } from '@cli/commands/dev-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface DevOptions extends ProjectOptions {
    watch?: boolean;
    map: boolean;
}

export function registerDevCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('dev').description('Build, sync, restart, watch, and stream resource development logs.');

    addWatchOptions(addProjectOptions(command)).addOption(noMapOption()).addOption(offlineOption());

    command.action(async (options: DevOptions): Promise<void> => {
        const project = createProjectContext(runtime, 'dev', options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        runtime.exitCode = await runDevCommand(project.context, {
            transport: runtimeTransport(runtime, project.context.config),
            watch: options.watch ?? true,
            signal: runtime.overrides.signal ?? null,
            layout: 'tree',
            map: options.map && project.context.config.output.map,
        });
    });
}
