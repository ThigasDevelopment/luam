import { InvalidArgumentError, Option, type Command } from 'commander';

export function valueOption(flags: string, description: string): Option {
    const flag = flags.split(' ')[0] ?? flags;

    return new Option(flags, description).argParser((value: string): string => {
        if (value.startsWith('-')) {
            throw new InvalidArgumentError(`"${flag}" requires a value.`);
        }

        return value;
    });
}

export function cwdOption(): Option {
    return valueOption('--cwd <path>', 'Project directory that contains .luam.manifest. Defaults to the current directory.');
}

export function manifestOption(): Option {
    return valueOption('--manifest <path>', 'Manifest module to load instead of .luam.manifest.');
}

export function colorOption(): Option {
    return new Option('--no-color', 'Print plain output with no colour and no emoji.');
}

export function offlineOption(): Option {
    return new Option('--offline', 'Skip the MTA release lookup and use the cached version, if there is one.');
}

export function noMapOption(): Option {
    return new Option('--no-map', 'Disable resource map generation.');
}

export function addLayoutOptions(command: Command): Command {
    return command.addOption(new Option('--bundle', 'Write bundled output.')).addOption(new Option('--no-bundle', 'Write tree output.'));
}

export function addWatchOptions(command: Command): Command {
    return command
        .addOption(new Option('--watch', 'Keep the command running and rebuild on source changes.'))
        .addOption(new Option('--no-watch', 'Run the command once and exit.'));
}

export function addProjectOptions(command: Command): Command {
    return command.addOption(cwdOption()).addOption(manifestOption()).addOption(colorOption());
}
