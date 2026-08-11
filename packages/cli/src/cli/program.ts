import { Command } from 'commander';

import { COMMAND_REGISTRARS } from '@cli/cli/registry';
import { PROGRAM_DESCRIPTION, PROGRAM_NAME, VERSION } from '@cli/cli/version';

import type { CliRuntime } from '@cli/cli/cli-runtime';

export const EXIT_CODE_HELP = [
    '',
    'Exit codes:',
    '  0    The command succeeded.',
    '  1    The command reported diagnostics or could not complete setup.',
    '  2    The command line or configuration is invalid.',
].join('\n');

function withoutTrailingNewline(text: string): string {
    return text.endsWith('\n') ? text.slice(0, -1) : text;
}

export function createProgram(runtime: CliRuntime): Command {
    const program = new Command();

    program
        .name(PROGRAM_NAME)
        .description(PROGRAM_DESCRIPTION)
        .version(VERSION, '-v, --version', 'Show the CLI version.')
        .helpOption('-h, --help', 'Show this help text.')
        .helpCommand('help [command]', 'Show the help text for a command.')
        .allowExcessArguments(false)
        .showHelpAfterError(true)
        .exitOverride()
        .configureOutput({
            writeOut: (text: string): void => {
                runtime.reporter.raw(withoutTrailingNewline(text));
            },
            writeErr: (text: string): void => {
                runtime.reporter.rawError(withoutTrailingNewline(text));
            },
        });

    program.addHelpText('after', EXIT_CODE_HELP);

    for (const register of COMMAND_REGISTRARS) {
        register(program, runtime);
    }

    return program;
}
