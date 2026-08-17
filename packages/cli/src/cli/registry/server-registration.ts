import { createProjectContext, runtimeProcessService } from '@cli/cli/cli-runtime';
import { addProjectOptions } from '@cli/cli/shared-options';
import { runServerCommand } from '@cli/commands/server-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

export function registerServerCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('server').description('Run an existing local MTA server in the foreground.');

    addProjectOptions(command);

    command.action(async (options: ProjectOptions): Promise<void> => {
        const project = createProjectContext(runtime, 'server', options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        runtime.exitCode = await runServerCommand(project.context, {
            processService: runtimeProcessService(runtime),
            env: runtime.env,
            signal: runtime.overrides.signal ?? null,
        });
    });
}
