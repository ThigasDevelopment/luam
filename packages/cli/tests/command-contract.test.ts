import { afterEach, describe, expect, it } from 'vitest';

import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { VERSION } from '@cli/cli/version';

import { createMemoryLogger } from './support/memory-logger';
import { createMockTransport } from './support/mock-transport';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const COMMANDS: readonly string[] = ['build', 'check', 'dev', 'doctor', 'ensure', 'init', 'setup', 'trace'];

const ACCEPTED: readonly [string, readonly string[]][] = [
    ['build', ['--config', 'luam.json', '--bundle', '--no-map', '--offline', '--no-color']],
    ['build', ['--no-bundle']],
    ['check', ['--config', 'luam.json', '--no-color']],
    ['dev', ['--no-watch', '--config', 'luam.json', '--no-map', '--offline']],
    ['ensure', ['--no-watch', '--bundle', '--no-map', '--offline']],
    ['ensure', ['--watch']],
    ['trace', ['src/server.lua:1', '--map', 'build/luam-demo.luam-map.json', '--config', 'luam.json']],
    ['init', ['--name', 'demo', '--force', '--yes']],
    ['init', ['-y']],
    ['setup', ['--yes']],
    ['doctor', ['--no-color']],
];

const STUB_EDITORS = { detect: (): [] => [], hasExtension: (): boolean => false, install: async (): Promise<never> => Promise.reject(new Error('unused')) };

const REJECTED: readonly [string, readonly string[]][] = [
    ['build', ['--watch']],
    ['build', ['--map', 'x.json']],
    ['build', ['--name', 'demo']],
    ['check', ['--bundle']],
    ['check', ['--offline']],
    ['check', ['--no-map']],
    ['dev', ['--bundle']],
    ['dev', ['--no-bundle']],
    ['doctor', ['--config', 'luam.json']],
    ['doctor', ['--offline']],
    ['setup', ['--force']],
    ['init', ['--config', 'luam.json']],
    ['trace', ['--bundle']],
    ['ensure', ['--fast']],
    ['build', ['--cwd']],
    ['build', ['--config']],
    ['trace', ['--map']],
    ['init', ['--name']],
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
        expect(help.dev).not.toContain('--bundle');
        expect(help.check).not.toContain('--offline');
        expect(help.doctor).not.toContain('--config');
        expect(help.trace).toContain('--map <path>');
        expect(help.init).toContain('--name <name>');
        expect(help.setup).toContain('--yes');
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
                transport: createMockTransport(),
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
