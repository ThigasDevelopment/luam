import { afterEach, describe, expect, it } from 'vitest';

import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { runServerCommand } from '@cli/commands/server-command';
import { loadManifest } from '@cli/config/manifest-loader';

import { FakeProcessService } from './support/fake-process-service';
import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function harness(serverPath?: string) {
    const fixture = createProjectFixture(defaultProjectFiles({ serverPath }));
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, context: { root: fixture.root, config, logger: createMemoryLogger() }, service: new FakeProcessService() };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('server command', () => {
    it('runs the owned process in the foreground and returns its exit status', async () => {
        const test = harness('server');
        const executable = process.platform === 'win32' ? 'MTA Server.exe' : 'mta-server64';

        test.fixture.write(`server/${executable}`, 'binary');

        const running = runServerCommand(test.context, { processService: test.service, env: {}, signal: null });

        test.fixture.write('server/mods/deathmatch/logs/server.log', 'Server started!\n');
        setTimeout(() => test.service.exit(0), 200);

        expect(await running).toBe(EXIT_OK);
        expect(test.service.calls[0]?.options.interactive).toBe(true);
    });

    it('reports a missing serverPath without spawning', async () => {
        const test = harness();

        expect(await runServerCommand(test.context, { processService: test.service, env: {}, signal: null })).toBe(EXIT_DIAGNOSTICS);
        expect(test.service.calls).toEqual([]);
    });
});
