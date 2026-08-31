import { afterEach, describe, expect, it } from 'vitest';

import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { VERSION } from '@cli/cli/version';

import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const COMMANDS: readonly string[] = ['build', 'check', 'config', 'dev', 'doctor', 'ensure', 'format', 'init', 'server', 'setup', 'test', 'trace'];

const ACCEPTED: readonly [string, readonly string[]][] = [
    ['build', ['--manifest', '.luam.manifest', '--bundle', '--no-map', '--offline', '--no-color']],
    ['build', ['--no-bundle']],
    ['check', ['--manifest', '.luam.manifest', '--no-color']],
    ['check', ['--json']],
    ['build', ['--json']],
    ['check', ['--watch']],
    ['check', ['--no-watch']],
    ['config', ['--source', 'config.lua', '--out', 'config.d.luam', '--no-color']],
    ['dev', ['--no-watch', '--manifest', '.luam.manifest', '--no-map', '--offline']],
    ['ensure', ['--no-watch', '--bundle', '--no-map', '--offline']],
    ['ensure', ['--watch']],
    ['format', ['--check', '--manifest', '.luam.manifest', '--no-color']],
    ['format', ['src', '--cwd', '.']],
    ['trace', ['src/server.lua:1', '--map', 'build/luam-demo.luam-map.json', '--manifest', '.luam.manifest']],
    ['init', ['--name', 'demo', '--force', '--yes']],
    ['init', ['-y']],
    ['setup', ['--yes']],
    ['doctor', ['--no-color']],
    ['test', ['--lua', 'definitely-not-lua', '--manifest', '.luam.manifest', '--no-color']],
];

const STUB_EDITORS = { detect: (): [] => [], hasExtension: (): boolean => false, install: async (): Promise<never> => Promise.reject(new Error('unused')) };

const REJECTED: readonly [string, readonly string[]][] = [
    ['build', ['--watch']],
    ['format', ['--watch']],
    ['build', ['--map', 'x.json']],
    ['build', ['--name', 'demo']],
    ['check', ['--bundle']],
    ['test', ['--json']],
    ['dev', ['--json']],
    ['ensure', ['--json']],
    ['format', ['--json']],
    ['check', ['--check']],
    ['build', ['--check']],
    ['format', ['--bundle']],
    ['format', ['--offline']],
    ['check', ['--offline']],
    ['check', ['--no-map']],
    ['dev', ['--bundle']],
    ['dev', ['--no-bundle']],
    ['doctor', ['--manifest', '.luam.manifest']],
    ['doctor', ['--offline']],
    ['setup', ['--force']],
    ['init', ['--manifest', '.luam.manifest']],
    ['trace', ['--bundle']],
    ['config', ['--bundle']],
    ['config', ['--source']],
    ['ensure', ['--fast']],
    ['ensure', ['--start-server']],
    ['build', ['--cwd']],
    ['build', ['--manifest']],
    ['trace', ['--map']],
    ['init', ['--name']],
    ['test', ['--bundle']],
    ['test', ['--lua']],
    ['build', ['check']],
];

const fixtures: ProjectFixture[] = [];

function project(files: Readonly<Record<string, string>>): ProjectFixture {
    const fixture = createProjectFixture(files);

    fixtures.push(fixture);

    return fixture;
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('command help and version', () => {
    it('prints the root help with every command and the exit codes', async () => {
        const logger = createMemoryLogger();

        expect(await runCli(['--help'], { logger })).toBe(EXIT_OK);

        const help = logger.lines.join('\n');

        for (const command of COMMANDS) {
            expect(help, command).toContain(command);
        }

        expect(help).toContain('Exit codes:');
        expect(logger.errors).toEqual([]);
    });

    it('prints per-command help that names only the options the command owns', async () => {
        const help: Record<string, string> = {};

        for (const command of COMMANDS) {
            const logger = createMemoryLogger();

            expect(await runCli([command, '--help'], { logger }), command).toBe(EXIT_OK);
            expect(logger.errors, command).toEqual([]);
            help[command] = logger.lines.join('\n');
        }

        expect(help.build).toContain('--bundle');
        expect(help.build).toContain('--offline');
        expect(help.build).not.toContain('--watch');
        expect(help.dev).toContain('--watch');
        expect(help.dev).toContain('--start-server');
        expect(help.dev).not.toContain('--bundle');
        expect(help.server).toContain('--manifest');
        expect(help.server).not.toContain('--watch');
        expect(help.check).not.toContain('--offline');
        expect(help.check).toContain('--watch');
        expect(help.check).toContain('--json');
        expect(help.build).toContain('--json');
        expect(help.test).not.toContain('--json');
        expect(help.format).not.toContain('--watch');
        expect(help.doctor).not.toContain('--config');
        expect(help.trace).toContain('--map <path>');
        expect(help.init).toContain('--name <name>');
        expect(help.setup).toContain('--yes');
        expect(help.test).toContain('--lua <path>');
        expect(help.test).not.toContain('--bundle');
        expect(help.format).toContain('--check');
        expect(help.format).toContain('[paths...]');
        expect(help.build).not.toContain('--check');
    });

    it('prints the version once from the root', async () => {
        const logger = createMemoryLogger();

        expect(await runCli(['--version'], { logger })).toBe(EXIT_OK);
        expect(await runCli(['-v'], { logger })).toBe(EXIT_OK);
        expect(logger.lines).toEqual([VERSION, VERSION]);
    });

    it('prints help and reports a usage error with no command', async () => {
        const logger = createMemoryLogger();

        expect(await runCli([], { logger })).toBe(EXIT_USAGE);
        expect(logger.lines.join('\n')).toContain('Usage: luam');
    });
});

describe('command option matrix', () => {
    it('accepts every option its command owns', async () => {
        for (const [command, options] of ACCEPTED) {
            const fixture = project(defaultProjectFiles({ serverPath: 'mta-server' }));
            const logger = createMemoryLogger();
            const argv = [command, ...options, '--cwd', fixture.root];
            const code = await runCli(argv, {
                logger,
                env: OFFLINE,
                signal: AbortSignal.abort(),
                editorService: STUB_EDITORS,
                initPrompt: async (defaults) => defaults,
            });

            expect(code, argv.join(' ')).not.toBe(EXIT_USAGE);
        }
    });

    it('rejects every option its command does not own', async () => {
        for (const [command, options] of REJECTED) {
            const fixture = project(defaultProjectFiles());
            const logger = createMemoryLogger();
            const argv = [command, ...options];

            expect(await runCli([...argv, '--cwd', fixture.root], { logger, env: OFFLINE }), argv.join(' ')).toBe(EXIT_USAGE);
            expect(fixture.exists('build'), argv.join(' ')).toBe(false);
        }
    });

    it('runs without a terminal and keeps reports on stdout and problems on stderr', async () => {
        const fixture = project(defaultProjectFiles());
        const logger = createMemoryLogger();

        expect(await runCli(['build', '--cwd', fixture.root, '--no-color'], { logger, env: OFFLINE })).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
        expect(logger.lines.join('\n')).not.toContain(String.fromCharCode(27));
    });
});
