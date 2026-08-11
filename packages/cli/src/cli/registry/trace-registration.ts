import { commandRoot } from '@cli/cli/cli-runtime';
import { addProjectOptions, valueOption } from '@cli/cli/shared-options';
import { runTraceCommand } from '@cli/commands/trace-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface TraceOptions extends ProjectOptions {
    map?: string;
}

export function registerTraceCommand(program: Command, runtime: CliRuntime): void {
    const command = program
        .command('trace')
        .description('Resolve generated Lua positions back to Luam source positions.')
        .argument('[position]', 'Generated position such as "src/server.lua:12". Defaults to reading positions from stdin.');

    addProjectOptions(command).addOption(valueOption('--map <path>', 'Resource map to use instead of the one found for the project.'));

    command.action((position: string | undefined, options: TraceOptions): void => {
        runtime.exitCode = runTraceCommand(commandRoot(runtime, options), runtime.reporter, {
            configPath: options.config ?? null,
            env: runtime.env,
            mapPath: options.map ?? null,
            operand: position ?? null,
        });
    });
}
