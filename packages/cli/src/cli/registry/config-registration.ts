import { commandRoot } from '@cli/cli/cli-runtime';
import { addProjectOptions, valueOption } from '@cli/cli/shared-options';
import { runConfigCommand } from '@cli/commands/config-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import { Option, type Command } from 'commander';

interface ConfigOptions extends ProjectOptions {
    source?: string;
    out?: string;
    write?: boolean;
}

export function registerConfigCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('config').description('Derive a declaration file from the literal data in a native "config.lua".');

    addProjectOptions(command)
        .addOption(valueOption('--source <path>', 'Native Lua file to read. Defaults to "config.lua".'))
        .addOption(valueOption('--out <path>', 'Declaration file to write. Defaults to "config.d.luam".'))
        .addOption(new Option('--write', 'Write the declaration file instead of printing it.'));

    command.action((options: ConfigOptions): void => {
        runtime.exitCode = runConfigCommand(commandRoot(runtime, options), runtime.reporter, {
            source: options.source ?? null,
            out: options.out ?? null,
            write: options.write === true,
        });
    });
}
