import { createProjectContext, runtimeTransport } from '@cli/cli/cli-runtime';
import { addLayoutOptions, addProjectOptions, addWatchOptions, noMapOption, offlineOption } from '@cli/cli/shared-options';
import { runEnsureCommand } from '@cli/commands/ensure-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface EnsureOptions extends ProjectOptions {
    bundle?: boolean;
    watch?: boolean;
    map: boolean;
}

export function registerEnsureCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('ensure').description('Build, sync the resource into the MTA server, and restart it.');

    addWatchOptions(addLayoutOptions(addProjectOptions(command)))
        .addOption(noMapOption())
        .addOption(offlineOption());

    command.action(async (options: EnsureOptions): Promise<void> => {
        const project = createProjectContext(runtime, options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        runtime.exitCode = await runEnsureCommand(project.context, {
            transport: runtimeTransport(runtime, project.context.config),
            watch: options.watch ?? true,
            signal: runtime.overrides.signal ?? null,
            layout: options.bundle === true ? 'bundle' : 'tree',
            map: options.map && project.context.config.output.map,
        });
    });
}
