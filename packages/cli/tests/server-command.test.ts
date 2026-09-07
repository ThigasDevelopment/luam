import { afterEach, describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

import { EXIT_OK } from '@cli/cli/exit-codes';
import { runServerCommand } from '@cli/commands/server-command';
import { emptyDeployment, type DeploymentSettings } from '@cli/config/deployment';
import { createReporter } from '@cli/reporting/reporter';
import { serverTarget } from '@cli/server/mta-server-supervisor';

import { FakeProcessService } from './support/fake-process-service';
import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function harness(serverPath?: string) {
    const fixture = createProjectFixture(defaultProjectFiles());

    fixtures.push(fixture);

    const deployment: DeploymentSettings =
        serverPath === undefined ? emptyDeployment() : { ...emptyDeployment(), serverRoot: resolve(fixture.root, serverPath) };

    return {
        fixture,
        deployment,
        reporter: createReporter(createMemoryLogger()),
        service: new FakeProcessService(),
    };
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

        test.fixture.executable(`server/${executable}`, 'binary');

        const target = serverTarget(test.deployment);

        expect(target).not.toBeNull();

        const running = runServerCommand(target ?? { serverRoot: '', executable: null }, test.reporter, {
            processService: test.service,
            portHolder: (): null => null,
            env: {},
            signal: null,
        });

        test.fixture.write('server/mods/deathmatch/logs/server.log', 'Server started!\n');
        setTimeout(() => test.service.exit(0), 200);

        expect(await running).toBe(EXIT_OK);
        expect(test.service.calls[0]?.options.interactive).toBe(true);
    });

    it('has no server to run when no ".luam.server" names one', () => {
        const test = harness();

        expect(test.deployment.serverRoot).toBeNull();
        expect(serverTarget(test.deployment)).toBeNull();
        expect(test.service.calls).toEqual([]);
    });

    it('resolves the server root against the directory the workspace file sits in', () => {
        const test = harness('server');

        expect(serverTarget(test.deployment)?.serverRoot).toBe(resolve(test.fixture.root, 'server'));
    });
});
