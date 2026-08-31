import { commandRoot, createProjectContext } from '@cli/cli/cli-runtime';
import { addProjectOptions } from '@cli/cli/shared-options';
import { runFormatCommand } from '@cli/commands/format-command';

import { Option } from 'commander';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface FormatOptions extends ProjectOptions {
    check?: boolean;
}

export function registerFormatCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('format').description('Rewrite the project sources in the recorded formatting style.');

    command.argument('[paths...]', 'Files or directories to format instead of the manifest sources.');

    addProjectOptions(command).addOption(new Option('--check', 'Write nothing and report the files that differ.'));

    command.action((paths: string[], options: FormatOptions): void => {
        const check = options.check === true;

        if (paths.length > 0) {
            runtime.exitCode = runFormatCommand(
                { root: commandRoot(runtime, options), config: null, logger: runtime.logger, reporter: runtime.reporter },
                { check, paths },
            );

            return;
        }

        const project = createProjectContext(runtime, 'format', options);

        runtime.exitCode =
            project.context === null ? project.error : runFormatCommand({ ...project.context, config: project.context.config }, { check, paths: [] });
    });
}
