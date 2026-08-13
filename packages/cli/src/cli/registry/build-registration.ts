import { createProjectContext } from '@cli/cli/cli-runtime';
import { addLayoutOptions, addProjectOptions, noMapOption, offlineOption } from '@cli/cli/shared-options';
import { runBuildCommand } from '@cli/commands/build-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface BuildOptions extends ProjectOptions {
    bundle?: boolean;
    map: boolean;
}

export function registerBuildCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('build').description('Compile the project and write the resource to the output directory.');

    addLayoutOptions(addProjectOptions(command)).addOption(noMapOption()).addOption(offlineOption());

    command.action(async (options: BuildOptions): Promise<void> => {
        const project = createProjectContext(runtime, 'build', options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        const bundled = options.bundle ?? project.context.config.output.bundle;

        runtime.exitCode = await runBuildCommand(project.context, {
            layout: bundled ? 'bundle' : 'tree',
            map: options.map && project.context.config.output.map,
        });
    });
}
