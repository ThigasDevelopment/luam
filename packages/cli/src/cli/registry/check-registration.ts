import { createProjectContext } from '@cli/cli/cli-runtime';
import { addProjectOptions } from '@cli/cli/shared-options';
import { runCheckCommand } from '@cli/commands/check-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

export function registerCheckCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('check').description('Compile the project and report diagnostics without writing files.');

    addProjectOptions(command);

    command.action((options: ProjectOptions): void => {
        const project = createProjectContext(runtime, options);

        runtime.exitCode = project.context === null ? project.error : runCheckCommand(project.context);
    });
}
