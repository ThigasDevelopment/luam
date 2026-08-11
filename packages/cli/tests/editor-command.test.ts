import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { buildInvocation, resolveWindowsCommand } from '@cli/editor/editor-command';

const directories: string[] = [];

function workspace(files: readonly string[]): string {
    const directory = mkdtempSync(join(tmpdir(), 'luam-editor-'));

    directories.push(directory);

    for (const file of files) {
        writeFileSync(join(directory, file), '');
    }

    return directory;
}

function withEnvironment<T>(values: Record<string, string>, body: () => T): T {
    const previous = { PATH: process.env.PATH, PATHEXT: process.env.PATHEXT };

    Object.assign(process.env, values);

    try {
        return body();
    } finally {
        process.env.PATH = previous.PATH;
        process.env.PATHEXT = previous.PATHEXT;
    }
}

afterEach(() => {
    for (const directory of directories.splice(0)) {
        rmSync(directory, { recursive: true, force: true });
    }
});

describe('editor command', () => {
    it('resolves a launcher that only exists under a PATHEXT extension', () => {
        const directory = workspace(['code.cmd']);

        const resolved = withEnvironment({ PATH: directory, PATHEXT: '.COM;.EXE;.BAT;.CMD' }, () => resolveWindowsCommand('code'));

        expect(resolved?.toLowerCase()).toBe(join(directory, 'code.cmd').toLowerCase());
    });

    it('follows the PATHEXT order inside a directory', () => {
        const directory = workspace(['code.cmd', 'code.exe']);

        const resolved = withEnvironment({ PATH: directory, PATHEXT: '.EXE;.CMD' }, () => resolveWindowsCommand('code'));

        expect(resolved?.toLowerCase()).toBe(join(directory, 'code.exe').toLowerCase());
    });

    it('returns null when no directory on PATH holds the command', () => {
        const directory = workspace([]);

        const resolved = withEnvironment({ PATH: directory, PATHEXT: '.EXE;.CMD' }, () => resolveWindowsCommand('windsurf'));

        expect(resolved).toBeNull();
    });

    it('runs a batch launcher through the command interpreter as a single quoted line', () => {
        const executable = join('C:\\Program Files', 'Microsoft VS Code', 'bin', 'code.cmd');

        const invocation = buildInvocation(executable, ['--install-extension', 'thigasdevelopment.luam', '--force']);

        expect(invocation.verbatim).toBe(true);
        expect(invocation.args.slice(0, 3)).toEqual(['/d', '/s', '/c']);
        expect(invocation.args[3]).toBe(`""${executable}" "--install-extension" "thigasdevelopment.luam" "--force""`);
    });

    it('spawns a native executable directly', () => {
        const invocation = buildInvocation(join('C:\\Tools', 'cursor.exe'), ['--version']);

        expect(invocation).toEqual({ file: join('C:\\Tools', 'cursor.exe'), args: ['--version'], verbatim: false });
    });
});
