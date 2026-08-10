export type CommandName = 'build' | 'check' | 'dev' | 'ensure' | 'init';

export interface ParsedArguments {
    command: CommandName | null;
    cwd: string | null;
    config: string | null;
    name: string | null;
    watch: boolean | null;
    force: boolean;
    offline: boolean;
    noColor: boolean;
    help: boolean;
    version: boolean;
    errors: string[];
}

const COMMANDS: readonly string[] = ['build', 'check', 'dev', 'ensure', 'init'];

const VALUE_FLAGS: readonly string[] = ['--cwd', '--config', '--name'];

function isCommand(value: string): value is CommandName {
    return COMMANDS.includes(value);
}

function emptyArguments(): ParsedArguments {
    return {
        command: null,
        cwd: null,
        config: null,
        name: null,
        watch: null,
        force: false,
        offline: false,
        noColor: false,
        help: false,
        version: false,
        errors: [],
    };
}

function readValue(argv: readonly string[], index: number, flag: string, parsed: ParsedArguments): string | null {
    const value = argv[index + 1];

    if (value === undefined || value.startsWith('-')) {
        parsed.errors.push(`The "${flag}" option requires a value.`);

        return null;
    }

    return value;
}

export function parseArguments(argv: readonly string[]): ParsedArguments {
    const parsed = emptyArguments();

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];

        if (token === undefined) {
            continue;
        }

        if (VALUE_FLAGS.includes(token)) {
            const value = readValue(argv, index, token, parsed);

            index += 1;

            if (value === null) {
                continue;
            }

            if (token === '--cwd') {
                parsed.cwd = value;

                continue;
            }

            if (token === '--name') {
                parsed.name = value;

                continue;
            }

            parsed.config = value;

            continue;
        }

        if (token === '--force') {
            parsed.force = true;

            continue;
        }

        if (token === '--offline') {
            parsed.offline = true;

            continue;
        }

        if (token === '--no-color') {
            parsed.noColor = true;

            continue;
        }

        if (token === '--watch') {
            parsed.watch = true;

            continue;
        }

        if (token === '--no-watch') {
            parsed.watch = false;

            continue;
        }

        if (token === '--help' || token === '-h') {
            parsed.help = true;

            continue;
        }

        if (token === '--version' || token === '-v') {
            parsed.version = true;

            continue;
        }

        if (token.startsWith('-')) {
            parsed.errors.push(`"${token}" is not a known option.`);

            continue;
        }

        if (parsed.command !== null) {
            parsed.errors.push(`"${token}" is unexpected because the command is already "${parsed.command}".`);

            continue;
        }

        if (!isCommand(token)) {
            parsed.errors.push(`"${token}" is not a known command. Use ${COMMANDS.map((entry) => `"${entry}"`).join(', ')}.`);

            continue;
        }

        parsed.command = token;
    }

    return parsed;
}
