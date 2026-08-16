import { afterEach, describe, expect, it } from 'vitest';

import { deployedMapAfterBuild, runDevCommand } from '@cli/commands/dev-command';
import { runEnsureCommand } from '@cli/commands/ensure-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import type { ResourceMap } from '@compiler/project/resource';

import { createMemoryLogger } from './support/memory-logger';
import { createMockTransport } from './support/mock-transport';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

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
        const transport = createMockTransport();

        expect(await runDevCommand(harness.context, { transport, watch: false, signal: null })).toBe(EXIT_DIAGNOSTICS);
        expect(harness.fixture.exists('mta-server')).toBe(false);
        expect(transport.calls).toEqual([]);
    });

    it('writes configured development helpers only to the server resource', async () => {
        const development = { logs: { maxMessageLength: 300, rateLimit: 4, rateWindowMs: 500 } };
        const harness = context({ serverPath: 'mta-server', development });
        const transport = createMockTransport();
        const resource = 'mta-server/mods/deathmatch/resources/luam-demo';

        expect(await runDevCommand(harness.context, { transport, watch: false, signal: null })).toBe(EXIT_OK);
        expect(harness.fixture.read(`${resource}/lib/development-logs-client.lua`)).toContain('local luamMaximumMessageLength = 300');
        expect(harness.fixture.read(`${resource}/lib/development-logs-server.lua`)).toContain('local luamRateLimit = 4');
        expect(harness.fixture.read(`${resource}/meta.xml`).indexOf('development-logs-server.lua')).toBeLessThan(
            harness.fixture.read(`${resource}/meta.xml`).indexOf('src/server'),
        );
        expect(harness.fixture.exists('build')).toBe(false);
    });

    it('keeps normal ensure output free of development helpers and prunes prior helpers', async () => {
        const harness = context({ serverPath: 'mta-server' });
        const transport = createMockTransport();
        const resource = 'mta-server/mods/deathmatch/resources/luam-demo';

        await runDevCommand(harness.context, { transport, watch: false, signal: null });
        await runEnsureCommand(harness.context, { transport, watch: false, signal: null });

        expect(harness.fixture.exists(`${resource}/lib/development-logs-client.lua`)).toBe(false);
        expect(harness.fixture.exists(`${resource}/lib/development-logs-server.lua`)).toBe(false);
        expect(harness.fixture.read(`${resource}/meta.xml`)).not.toContain('development-logs');
    });

    it('retains the deployed map when a rebuild fails', () => {
        const map: ResourceMap = { version: 1, resource: 'demo', layout: 'tree', files: [] };

        expect(deployedMapAfterBuild(map, { build: null, map: null })).toBe(map);
    });
});
