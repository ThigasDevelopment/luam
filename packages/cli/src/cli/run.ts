import { CommanderError } from 'commander';

import { createRuntime } from '@cli/cli/cli-runtime';
import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { createProgram } from '@cli/cli/program';

import type { CliOverrides } from '@cli/cli/cli-runtime';

export type { CliOverrides } from '@cli/cli/cli-runtime';

export async function runCli(argv: readonly string[], overrides: Partial<CliOverrides> = {}): Promise<number> {
    const runtime = createRuntime(argv, overrides);
    const program = createProgram(runtime);

    if (argv.length === 0) {
        program.outputHelp();

        return EXIT_USAGE;
    }

    try {
        await program.parseAsync([...argv], { from: 'user' });
    } catch (error: unknown) {
        if (error instanceof CommanderError) {
            return error.exitCode === 0 ? EXIT_OK : EXIT_USAGE;
        }

        throw error;
    }

    return runtime.exitCode;
}
