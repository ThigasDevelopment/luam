import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '@cli/cli/run';
import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { VERSION } from '@cli/cli/version';

import { createMemoryLogger } from './support/memory-logger';
import { createMockTransport } from './support/mock-transport';
import { BROKEN_SERVER, createProjectFixture, defaultProjectFiles, MANIFEST_FILE, manifestSource, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

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

describe('command dispatch', () => {
    it('prints usage and reports a usage error without a command', async () => {
        const logger = createMemoryLogger();

        expect(await runCli([], { logger })).toBe(EXIT_USAGE);
        expect(logger.text()).toContain('Usage:');
    });

    it('prints usage for the help flag', async () => {
        const logger = createMemoryLogger();

        expect(await runCli(['--help'], { logger })).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
    });

    it('prints the version', async () => {
        const logger = createMemoryLogger();

        expect(await runCli(['--version'], { logger })).toBe(EXIT_OK);
        expect(logger.lines).toEqual([VERSION]);
    });

    it('rejects an unknown command', async () => {
        const logger = createMemoryLogger();

        expect(await runCli(['deploy'], { logger })).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain("unknown command 'deploy'");
    });

    it('reports a missing configuration file', async () => {
        const fixture = project({});
        const logger = createMemoryLogger();

        expect(await runCli(['check'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(logger.errors[0]).toContain('config-not-found');
    });

    it('reports an invalid configuration file', async () => {
        const fixture = project({ [MANIFEST_FILE]: manifestSource({ target: 'lua54' }) });
        const logger = createMemoryLogger();

        expect(await runCli(['build'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(logger.errors.at(-1)).toContain('is invalid.');
    });

    it('routes check to the compiler pipeline', async () => {
        const fixture = project(defaultProjectFiles());
        const logger = createMemoryLogger();

        expect(await runCli(['check'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.exists('build')).toBe(false);
    });

    it('routes build to the resource writer', async () => {
        const fixture = project(defaultProjectFiles());
        const logger = createMemoryLogger();

        expect(await runCli(['build'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(true);
    });

    it('returns the diagnostics exit code when the build fails', async () => {
        const fixture = project({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });
        const logger = createMemoryLogger();

        expect(await runCli(['build'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_DIAGNOSTICS);
    });

    it('resolves the project directory from --cwd', async () => {
        const fixture = project({});
        const logger = createMemoryLogger();

        for (const [path, contents] of Object.entries(defaultProjectFiles())) {
            fixture.write(`nested/${path}`, contents);
        }

        expect(await runCli(['check', '--cwd', 'nested'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
    });

    it('loads an alternative manifest module', async () => {
        const files = defaultProjectFiles();
        const profile = `dev${MANIFEST_FILE}`;
        const fixture = project({ ...files, [profile]: manifestSource({ name: 'luam-dev', outDir: 'dist' }) });
        const logger = createMemoryLogger();

        expect(await runCli(['build', '--manifest', profile], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.exists('dist/luam-dev/meta.xml')).toBe(true);
    });

    it('gives the manifest the mode of the command that loaded it', async () => {
        const source = "name = 'luam-demo'\noutDir = 'build-' .. mode\n";
        const fixture = project({ ...defaultProjectFiles(), [MANIFEST_FILE]: source });
        const logger = createMemoryLogger();

        expect(await runCli(['build'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.exists('build-production/luam-demo/meta.xml')).toBe(true);
    });

    it('runs ensure once with --no-watch', async () => {
        const fixture = project(defaultProjectFiles({ serverPath: 'mta-server' }));
        const logger = createMemoryLogger();
        const transport = createMockTransport();

        expect(await runCli(['ensure', '--no-watch'], { logger, cwd: fixture.root, env: OFFLINE, transport })).toBe(EXIT_OK);
        expect(transport.calls).toEqual(['refresh', 'restart:luam-demo']);
        expect(fixture.exists('mta-server/mods/deathmatch/resources/luam-demo/meta.xml')).toBe(true);
    });

    it('routes dev through server sync with development log helpers', async () => {
        const fixture = project(defaultProjectFiles({ serverPath: 'mta-server' }));
        const logger = createMemoryLogger();
        const transport = createMockTransport();
        const resource = 'mta-server/mods/deathmatch/resources/luam-demo';

        expect(await runCli(['dev', '--no-watch'], { logger, cwd: fixture.root, env: OFFLINE, transport })).toBe(EXIT_OK);
        expect(fixture.exists(`${resource}/lib/development-logs-client.lua`)).toBe(true);
        expect(fixture.exists(`${resource}/lib/development-logs-server.lua`)).toBe(true);
    });

    it('rejects an option that the command does not own', async () => {
        const fixture = project(defaultProjectFiles({ serverPath: 'mta-server' }));
        const logger = createMemoryLogger();
        const transport = createMockTransport();

        expect(await runCli(['dev', '--no-watch', '--bundle'], { logger, cwd: fixture.root, env: OFFLINE, transport })).toBe(EXIT_USAGE);
        expect(await runCli(['doctor', '--manifest', MANIFEST_FILE], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(await runCli(['check', '--offline'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(transport.calls).toEqual([]);
        expect(fixture.exists('mta-server/mods/deathmatch/resources/luam-demo')).toBe(false);
    });

    it('reads the transport password from the environment', async () => {
        const transport = { kind: 'http', resource: 'luam-sync', username: 'admin', passwordEnv: 'LUAM_PASSWORD' };
        const fixture = project(defaultProjectFiles({ transport }));
        const logger = createMemoryLogger();

        expect(await runCli(['check'], { logger, cwd: fixture.root, env: { ...OFFLINE, LUAM_PASSWORD: 'secret' } })).toBe(EXIT_OK);
        expect(await runCli(['check'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
    });
});
