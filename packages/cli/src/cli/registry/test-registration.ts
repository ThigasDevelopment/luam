import { createProjectContext } from '@cli/cli/cli-runtime';
import { addProjectOptions } from '@cli/cli/shared-options';
import { runTestCommand } from '@cli/commands/test-command';
import { LUA_ENV_VARIABLE } from '@cli/testing/lua-interpreter';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface TestOptions extends ProjectOptions {
    lua?: string;
}

export function registerTestCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('test').description('Compile the project with its test files and run them on a Lua 5.1 interpreter.');

    addProjectOptions(command);

    command.option('--lua <path>', 'Path to the Lua 5.1 interpreter that runs the tests.');

    command.action((options: TestOptions): void => {
        const project = createProjectContext(runtime, 'test', options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        runtime.exitCode = runTestCommand(project.context, { lua: options.lua ?? null, env: runtime.env[LUA_ENV_VARIABLE] ?? null });
    });
}
