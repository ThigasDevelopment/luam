import { afterEach, describe, expect, it } from 'vitest';

import { deployedMapAfterBuild, runDevCommand } from '@cli/commands/dev-command';
import { runEnsureCommand } from '@cli/commands/ensure-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import type { ResourceMap } from '@compiler/project/resource';

import { createMemoryLogger } from './support/memory-logger';
import { FakeProcessService } from './support/fake-process-service';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

async function waitUntil(predicate: () => boolean): Promise<void> {
    const deadline = Date.now() + 1000;

    while (!predicate()) {
        if (Date.now() >= deadline) {
            throw new Error('Timed out waiting for the development command.');
        }

        await new Promise((resolveDelay) => setTimeout(resolveDelay, 5));
    }
}

function context(overrides: Readonly<Record<string, unknown>> = {}): { context: CommandContext; fixture: ProjectFixture } {
    const fixture = createProjectFixture(defaultProjectFiles(overrides));
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, context: { root: fixture.root, config, logger: createMemoryLogger() } };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('development command', () => {
    it('requires serverPath before writing or following logs', async () => {
        const harness = context();

        expect(await runDevCommand(harness.context, { watch: false, signal: null })).toBe(EXIT_DIAGNOSTICS);
        expect(harness.fixture.exists('mta-server')).toBe(false);
    });

    it('writes configured development helpers only to the server resource', async () => {
        const development = { logs: { maxMessageLength: 300, rateLimit: 4, rateWindowMs: 500 } };
        const harness = context({ serverPath: 'mta-server', development });
        const resource = 'mta-server/mods/deathmatch/resources/luam-demo';

        expect(await runDevCommand(harness.context, { watch: false, signal: null })).toBe(EXIT_OK);
        expect(harness.fixture.read(`${resource}/lib/development-logs-client.lua`)).toContain('local luamMaximumMessageLength = 300');
        expect(harness.fixture.read(`${resource}/lib/development-logs-server.lua`)).toContain('local luamRateLimit = 4');
        expect(harness.fixture.read(`${resource}/meta.xml`).indexOf('development-logs-server.lua')).toBeLessThan(
            harness.fixture.read(`${resource}/meta.xml`).indexOf('src/server'),
        );
        expect(harness.fixture.exists('build')).toBe(false);
    });

    it('keeps normal ensure output free of development helpers and prunes prior helpers', async () => {
        const harness = context({ serverPath: 'mta-server' });
        const resource = 'mta-server/mods/deathmatch/resources/luam-demo';

        await runDevCommand(harness.context, { watch: false, signal: null });
        await runEnsureCommand(harness.context, { watch: false, signal: null });

        expect(harness.fixture.exists(`${resource}/lib/development-logs-client.lua`)).toBe(false);
        expect(harness.fixture.exists(`${resource}/lib/development-logs-server.lua`)).toBe(false);
        expect(harness.fixture.read(`${resource}/meta.xml`)).not.toContain('development-logs');
    });

    it('retains the deployed map when a rebuild fails', () => {
        const map: ResourceMap = { version: 1, resource: 'demo', layout: 'tree', files: [] };

        expect(deployedMapAfterBuild(map, { build: null, map: null })).toBe(map);
    });

    it('waits for an owned server before the first console command', async () => {
        const harness = context({ serverPath: 'mta-server' });
        const processService = new FakeProcessService();
        let input = '';

        harness.fixture.write('mta-server/MTA Server.exe', 'binary');
        processService.stdin.on('data', (chunk: Buffer) => {
            input += chunk.toString();

            if (input.includes('shutdown\n')) {
                processService.exit(0);
            }
        });

        const running = runDevCommand(harness.context, {
            watch: false,
            signal: null,
            startServer: true,
            processService,
            portHolder: (): null => null,
            platform: 'win32',
            pollIntervalMs: 5,
            readinessTimeoutMs: 500,
        });


        harness.fixture.write('mta-server/mods/deathmatch/logs/server.log', 'Server started and is ready to accept connections!\n');

        expect(await running).toBe(EXIT_OK);
        expect(input).toBe('refresh\nstop luam-demo\nstart luam-demo\nshutdown\n');
        expect(processService.calls).toHaveLength(1);
    });

    it('does not build when the owned server exits during startup', async () => {
        const harness = context({ serverPath: 'mta-server' });
        const processService = new FakeProcessService();

        harness.fixture.write('mta-server/MTA Server.exe', 'binary');

        const running = runDevCommand(harness.context, {
            watch: false,
            signal: null,
            startServer: true,
            processService,
            portHolder: (): null => null,
            platform: 'win32',
        });

        processService.exit(2);

        expect(await running).toBe(EXIT_DIAGNOSTICS);
        expect(harness.fixture.exists('mta-server/mods/deathmatch/resources/luam-demo')).toBe(false);
    });

    it('stops watch mode when the owned server exits unexpectedly', async () => {
        const harness = context({ serverPath: 'mta-server' });
        const processService = new FakeProcessService();
        let input = '';

        harness.fixture.write('mta-server/MTA Server.exe', 'binary');
        processService.stdin.on('data', (chunk: Buffer) => {
            input += chunk.toString();
        });

        const running = runDevCommand(harness.context, {
            watch: true,
            signal: null,
            startServer: true,
            processService,
            portHolder: (): null => null,
            platform: 'win32',
            pollIntervalMs: 5,
            readinessTimeoutMs: 500,
        });

        harness.fixture.write('mta-server/mods/deathmatch/logs/server.log', 'Server started!\n');
        await waitUntil(() => input.includes('start luam-demo\n'));
        processService.exit(4);

        expect(await running).toBe(EXIT_DIAGNOSTICS);
    });
});
