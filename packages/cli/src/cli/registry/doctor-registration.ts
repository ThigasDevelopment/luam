import { runtimeEditorService } from '@cli/cli/cli-runtime';
import { colorOption, cwdOption } from '@cli/cli/shared-options';
import { runDoctorCommand } from '@cli/commands/doctor-command';

import type { CliRuntime } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

export function registerDoctorCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('doctor').description('Check the CLI, supported editors, and the Luam extension.');

    command.addOption(cwdOption()).addOption(colorOption());

    command.action((): void => {
        runtime.exitCode = runDoctorCommand(runtime.reporter, runtimeEditorService(runtime));
    });
}
