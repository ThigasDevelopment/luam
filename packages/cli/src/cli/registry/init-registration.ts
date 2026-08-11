import { resolve } from 'node:path';

import { Option } from 'commander';

import { commandRoot } from '@cli/cli/cli-runtime';
import { colorOption, cwdOption, valueOption } from '@cli/cli/shared-options';
import { runInitCommand } from '@cli/commands/init-command';
import { promptForProject } from '@cli/commands/init-prompt';

import type { CliRuntime, RootOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface InitOptions extends RootOptions {
    name?: string;
    force?: boolean;
    yes?: boolean;
}

export function registerInitCommand(program: Command, runtime: CliRuntime): void {
    const command = program
        .command('init')
        .description('Interactively scaffold a new resource project.')
        .argument('[path]', 'Destination directory. Defaults to the project directory.');

    command
        .addOption(cwdOption())
        .addOption(valueOption('--name <name>', 'Resource name. Defaults to the destination directory name.'))
        .addOption(new Option('--force', 'Overwrite files that already exist.'))
        .addOption(new Option('-y, --yes', 'Accept the defaults without prompting.'))
        .addOption(colorOption());

    command.action(async (path: string | undefined, options: InitOptions): Promise<void> => {
        const root = commandRoot(runtime, options);
        const target = path === undefined ? root : resolve(root, path);

        runtime.exitCode = await runInitCommand(target, runtime.logger, {
            name: options.name ?? null,
            force: options.force === true,
            yes: options.yes === true,
            prompt: runtime.overrides.initPrompt ?? promptForProject,
        });
    });
}
