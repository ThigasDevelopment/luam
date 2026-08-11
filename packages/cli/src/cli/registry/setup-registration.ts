import { Option } from 'commander';

import { runtimeEditorService } from '@cli/cli/cli-runtime';
import { colorOption, cwdOption } from '@cli/cli/shared-options';
import { runSetupCommand } from '@cli/commands/setup-command';
import { promptForInstallation } from '@cli/editor/installation-prompt';

import type { CliRuntime } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface SetupOptions {
    yes?: boolean;
}

export function registerSetupCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('setup').description('Detect supported editors and install the Luam extension with consent.');

    command
        .addOption(cwdOption())
        .addOption(new Option('-y, --yes', 'Install into every detected editor without prompting.'))
        .addOption(colorOption());

    command.action(async (options: SetupOptions): Promise<void> => {
        runtime.exitCode = await runSetupCommand(runtime.reporter, {
            yes: options.yes === true,
            editorService: runtimeEditorService(runtime),
            prompt: runtime.overrides.prompt ?? promptForInstallation,
        });
    });
}
