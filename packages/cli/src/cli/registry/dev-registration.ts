import { createProjectContext, runtimeProcessService } from '@cli/cli/cli-runtime';
import { addProjectOptions, addWatchOptions, noMapOption, offlineOption } from '@cli/cli/shared-options';
import { runDevCommand } from '@cli/commands/dev-command';

import { Option } from 'commander';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface DevOptions extends ProjectOptions {
    watch?: boolean;
    map: boolean;
    startServer?: boolean;
}

export function registerDevCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('dev').description('Build, sync, restart, watch, and stream resource development logs.');

    addWatchOptions(addProjectOptions(command))
        .addOption(noMapOption())
        .addOption(offlineOption())
        .addOption(new Option('--start-server', 'Start and own the configured local MTA server before development.'));

    command.action(async (options: DevOptions): Promise<void> => {
        const project = createProjectContext(runtime, 'dev', options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        runtime.exitCode = await runDevCommand(project.context, {
            watch: options.watch ?? true,
            signal: runtime.overrides.signal ?? null,
            layout: 'tree',
            map: options.map && project.context.config.output.map,
            startServer: options.startServer ?? false,
            processService: options.startServer === true ? runtimeProcessService(runtime) : undefined,
            env: runtime.env,
        });
    });
}
