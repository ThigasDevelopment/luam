import { spawnSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { extname, isAbsolute, join } from 'node:path';

import type { SpawnSyncOptionsWithStringEncoding, SpawnSyncReturns } from 'node:child_process';

export interface Invocation {
    file: string;
    args: string[];
    verbatim: boolean;
}

const WINDOWS_SEPARATOR = ';';
const DEFAULT_EXTENSIONS = '.COM;.EXE;.BAT;.CMD';
const SHELL_EXTENSIONS = new Set(['.bat', '.cmd']);

const SPAWN_OPTIONS: SpawnSyncOptionsWithStringEncoding = { encoding: 'utf8', shell: false, windowsHide: true, maxBuffer: 1024 * 1024 };

function entries(value: string): string[] {
    return value
        .split(WINDOWS_SEPARATOR)
        .map((entry) => entry.trim().replace(/^"|"$/gu, ''))
        .filter((entry) => entry.length > 0);
}

function present(path: string): boolean {
    try {
        return statSync(path).isFile();
    } catch {
        return false;
    }
}

function failure(error: Error): SpawnSyncReturns<string> {
    return { pid: 0, output: [null, '', ''], stdout: '', stderr: '', status: null, signal: null, error };
}

export function resolveWindowsCommand(command: string): string | null {
    const extensions = entries(process.env.PATHEXT ?? DEFAULT_EXTENSIONS);
    const named = extname(command).toLowerCase();
    const suffixes = named !== '' && extensions.some((entry) => entry.toLowerCase() === named) ? [''] : extensions;
    const rooted = isAbsolute(command) || command.includes('/') || command.includes('\\');
    const directories = rooted ? [''] : entries(process.env.PATH ?? process.env.Path ?? '');

    for (const directory of directories) {
        for (const suffix of suffixes) {
            const path = directory === '' ? `${command}${suffix}` : join(directory, `${command}${suffix}`);

            if (present(path)) {
                return path;
            }
        }
    }

    return null;
}

export function buildInvocation(executable: string, args: readonly string[]): Invocation {
    if (!SHELL_EXTENSIONS.has(extname(executable).toLowerCase())) {
        return { file: executable, args: [...args], verbatim: false };
    }

    const line = [executable, ...args].map((token) => `"${token}"`).join(' ');

    return { file: process.env.COMSPEC ?? 'cmd.exe', args: ['/d', '/s', '/c', `"${line}"`], verbatim: true };
}

export function runEditorCommand(command: string, args: readonly string[]): SpawnSyncReturns<string> {
    if (process.platform !== 'win32') {
        return spawnSync(command, [...args], SPAWN_OPTIONS);
    }

    const executable = resolveWindowsCommand(command);

    if (executable === null) {
        return failure(new Error(`The command ${command} was not found on PATH.`));
    }

    if ([executable, ...args].some((token) => token.includes('"'))) {
        return failure(new Error(`The command ${command} received an argument that cannot be quoted safely.`));
    }

    const invocation = buildInvocation(executable, args);

    return spawnSync(invocation.file, invocation.args, { ...SPAWN_OPTIONS, windowsVerbatimArguments: invocation.verbatim });
}
