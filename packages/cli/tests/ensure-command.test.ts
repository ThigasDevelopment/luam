import { afterEach, describe, expect, it } from 'vitest';

import type { CommandContext } from '@cli/commands/command-context';
import { runEnsureCommand } from '@cli/commands/ensure-command';
import { createEnsureRunner } from '@cli/commands/ensure-runner';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createMockServerConsole, type MockServerConsole } from './support/mock-server-console';
import { BROKEN_SERVER, clientSource, createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const SERVER_RESOURCE = 'mta-server/mods/deathmatch/resources/luam-demo';

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
    serverConsole: MockServerConsole;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, logger, serverConsole: createMockServerConsole(), context: { root: fixture.root, config, logger } };
}

function syncedProject(overrides: Readonly<Record<string, unknown>> = {}): Record<string, string> {
    return defaultProjectFiles({ serverPath: 'mta-server', ...overrides });
}

async function waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (!condition()) {
        if (Date.now() > deadline) {
            throw new Error('The condition was not met before the timeout.');
        }

        await new Promise((resolveWait) => setTimeout(resolveWait, 25));
    }
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('ensure runner', () => {
    it('builds, syncs, and restarts on the first run', async () => {
        const { context, fixture, serverConsole } = harness(syncedProject());
        const result = await createEnsureRunner(context, { serverConsole }).run();

        expect(result.ok).toBe(true);
        expect(fixture.exists(`${SERVER_RESOURCE}/meta.xml`)).toBe(true);
        expect(fixture.exists(`${SERVER_RESOURCE}/src/server/main.lua`)).toBe(true);
        expect(fixture.exists('build')).toBe(false);
        expect(serverConsole.calls).toEqual(['refresh', 'restart:luam-demo']);
        expect(result.restarted).toBe(true);
        expect(result.outcome.map?.layout).toBe('tree');
    });

    it('keeps authored statement lines in the synchronized Lua', async () => {
        const files = syncedProject();

        files['src/server/main.luam'] = "local LUAM_EXAMPLE: string = 'Ola Mundo!'\n\nprint(LUAM_EXAMPLE)\n";

        const { context, fixture, serverConsole } = harness(files);

        await createEnsureRunner(context, { serverConsole }).run();

        expect(fixture.read(`${SERVER_RESOURCE}/src/server/main.lua`)).toBe("local LUAM_EXAMPLE = 'Ola Mundo!'\n\nprint(LUAM_EXAMPLE)\n");
    });

    it('skips the sync and the restart when the build fails', async () => {
        const { context, fixture, serverConsole, logger } = harness({ ...syncedProject(), 'src/server/main.luam': BROKEN_SERVER });
        const result = await createEnsureRunner(context, { serverConsole }).run();

        expect(result.ok).toBe(false);
        expect(fixture.exists('mta-server')).toBe(false);
        expect(fixture.exists('build')).toBe(false);
        expect(serverConsole.calls).toEqual([]);
        expect(logger.warnings).toContain('Skipping sync and restart because the build reported errors.');
    });

    it('keeps the synced resource untouched when a later build fails', async () => {
        const { context, fixture, serverConsole } = harness(syncedProject());
        const runner = createEnsureRunner(context, { serverConsole });

        await runner.run();
        fixture.write('src/server/main.luam', BROKEN_SERVER);
        serverConsole.calls.length = 0;

        const result = await runner.run();

        expect(result.ok).toBe(false);
        expect(fixture.read(`${SERVER_RESOURCE}/src/server/main.lua`)).toContain('announceJoin');
        expect(serverConsole.calls).toEqual([]);
    });

    it('does not restart when nothing changed', async () => {
        const { context, serverConsole } = harness(syncedProject());
        const runner = createEnsureRunner(context, { serverConsole });

        await runner.run();
        serverConsole.calls.length = 0;

        const result = await runner.run();

        expect(result.ok).toBe(true);
        expect(result.restarted).toBe(false);
        expect(serverConsole.calls).toEqual([]);
    });

    it('syncs only the files that changed', async () => {
        const { context, fixture, serverConsole } = harness(syncedProject());
        const runner = createEnsureRunner(context, { serverConsole });

        await runner.run();
        fixture.write('src/client/hud.luam', clientSource('Luam 2'));
        serverConsole.calls.length = 0;

        const result = await runner.run();

        expect(result.sync?.written).toEqual(['src/client/hud.lua']);
        expect(result.sync?.removed).toEqual([]);
        expect(serverConsole.calls).toEqual(['refresh', 'restart:luam-demo']);
    });

    it('reports a failing server console without failing the build', async () => {
        const { context, serverConsole, logger } = harness(syncedProject());

        serverConsole.failNext = true;

        const result = await createEnsureRunner(context, { serverConsole }).run();

        expect(result.ok).toBe(true);
        expect(result.restarted).toBe(false);
        expect(logger.errors).toContain('Refresh failed: refresh rejected');
    });

    it('never restarts without an owned server console', async () => {
        const { context } = harness(syncedProject());
        const result = await createEnsureRunner(context).run();

        expect(result.ok).toBe(true);
        expect(result.restarted).toBe(false);
    });
});

describe('ensure command', () => {
    it('runs once, syncs, and exits without restarting when watch is disabled', async () => {
        const { context, fixture } = harness(syncedProject());

        expect(await runEnsureCommand(context, { watch: false, signal: null })).toBe(EXIT_OK);
        expect(fixture.exists(`${SERVER_RESOURCE}/meta.xml`)).toBe(true);
    });

    it('exits non-zero when the single run fails', async () => {
        const { context } = harness({ ...syncedProject(), 'src/server/main.luam': BROKEN_SERVER });

        expect(await runEnsureCommand(context, { watch: false, signal: null })).toBe(EXIT_DIAGNOSTICS);
    });

    it('requires serverPath before building or watching', async () => {
        const { context, fixture, serverConsole, logger } = harness(defaultProjectFiles());

        expect(await runEnsureCommand(context, { watch: true, signal: null })).toBe(EXIT_DIAGNOSTICS);
        expect(fixture.exists('build')).toBe(false);
        expect(serverConsole.calls).toEqual([]);
        expect(logger.errors).toContain('luam ensure requires "serverPath" in .luam.manifest.');
    });

    it('rebuilds and restarts through an owned server console when a watched source changes', async () => {
        const { context, fixture, serverConsole } = harness(syncedProject());
        const controller = new AbortController();
        const command = runEnsureCommand(context, { serverConsole, watch: true, signal: controller.signal });

        await waitFor(() => serverConsole.calls.length === 2);
        fixture.write('src/client/hud.luam', clientSource('Luam watched'));

        await waitFor(() => serverConsole.calls.length === 4);

        expect(fixture.read(`${SERVER_RESOURCE}/src/client/hud.lua`)).toContain('Luam watched');
        expect(fixture.exists('build')).toBe(false);

        controller.abort();

        expect(await command).toBe(EXIT_OK);
    });

    it('uses absolute serverPath and custom resourcesDir without writing custom outDir', async () => {
        const server = createProjectFixture();
        const { context, fixture } = harness(syncedProject({ outDir: 'dist', resourcesDir: 'resources-custom', serverPath: server.root }));

        fixtures.push(server);

        expect(await runEnsureCommand(context, { watch: false, signal: null })).toBe(EXIT_OK);
        expect(server.exists('resources-custom/luam-demo/meta.xml')).toBe(true);
        expect(fixture.exists('dist')).toBe(false);
        expect(fixture.exists('build')).toBe(false);
    });

    it('preserves local output while syncing changes and pruning stale server files', async () => {
        const files = { ...syncedProject({ outDir: 'dist' }), 'src/client/extra.luam': 'local extra: number = 1\n' };
        const { context, fixture, serverConsole } = harness(files);
        const localFiles = {
            'dist/luam-demo/meta.xml': '<meta sentinel="true" />\n',
            'dist/luam-demo/src/client/extra.lua': 'local sentinel = "unchanged"\n',
        };

        for (const [path, contents] of Object.entries(localFiles)) {
            fixture.write(path, contents);
        }

        const runner = createEnsureRunner(context, { serverConsole });

        await runner.run();
        fixture.remove('src/client/extra.luam');
        fixture.write('src/client/hud.luam', clientSource('Luam pruned'));

        const result = await runner.run();

        expect(result.sync?.removed).toContain('src/client/extra.lua');
        expect(fixture.exists(`${SERVER_RESOURCE}/src/client/extra.lua`)).toBe(false);
        expect(fixture.read(`${SERVER_RESOURCE}/src/client/hud.lua`)).toContain('Luam pruned');

        for (const [path, contents] of Object.entries(localFiles)) {
            expect(fixture.read(path)).toBe(contents);
        }
    });
});
