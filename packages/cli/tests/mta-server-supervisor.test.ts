import { afterEach, describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

import { startMtaServer } from '@cli/server/mta-server-supervisor';

import { FakeProcessService } from './support/fake-process-service';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function harness() {
    const fixture = createProjectFixture(defaultProjectFiles({ serverPath: 'server' }));

    fixture.write('server/MTA Server.exe', 'binary');
    fixtures.push(fixture);

    return { fixture, target: { serverRoot: resolve(fixture.root, 'server'), executable: null }, service: new FakeProcessService() };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('MTA server supervisor', () => {
    it('spawns without a shell and becomes ready from new log output', async () => {
        const test = harness();
        const supervisor = startMtaServer({
            target: test.target,
            processService: test.service,
            env: { TEST_VALUE: 'preserved' },
            platform: 'win32',
            pollIntervalMs: 5,
            readinessTimeoutMs: 500,
        });

        test.fixture.write('server/mods/deathmatch/logs/server.log', '[2026-08-16] Server started and is ready to accept connections!\n');
        await supervisor.waitUntilReady();

        expect(supervisor.state).toBe('ready');
        expect(test.service.calls).toHaveLength(1);
        expect(test.service.calls[0]?.options).toMatchObject({ cwd: resolve(test.fixture.root, 'server'), env: { TEST_VALUE: 'preserved' }, interactive: false });

        supervisor.writeCommand('refresh');
        expect(test.service.stdin.read()?.toString()).toBe('refresh\n');

        test.service.exit(0);
        await supervisor.close();
    });

    it('reports an early exit before readiness', async () => {
        const test = harness();
        const supervisor = startMtaServer({
            target: test.target,
            processService: test.service,
            env: {},
            platform: 'win32',
        });

        test.service.exit(3);

        await expect(supervisor.waitUntilReady()).rejects.toThrow('exited before readiness with code 3');
        await supervisor.close();
    });

    it('rejects console commands before readiness and multiline input', async () => {
        const test = harness();
        const supervisor = startMtaServer({
            target: test.target,
            processService: test.service,
            env: {},
            platform: 'win32',
            pollIntervalMs: 5,
            readinessTimeoutMs: 500,
        });

        expect(() => supervisor.writeCommand('refresh')).toThrow('while the server is starting');
        test.fixture.write('server/mods/deathmatch/logs/server.log', 'Server started!\n');
        await supervisor.waitUntilReady();
        expect(() => supervisor.writeCommand('refresh\nshutdown')).toThrow('one non-empty line');

        test.service.exit(0);
        await supervisor.close();
    });

    it('times out readiness and uses a bounded kill fallback once', async () => {
        const test = harness();
        const supervisor = startMtaServer({
            target: test.target,
            processService: test.service,
            env: {},
            platform: 'win32',
            readinessTimeoutMs: 5,
            shutdownTimeoutMs: 5,
        });

        await expect(supervisor.waitUntilReady()).rejects.toThrow('did not become ready');
        await Promise.all([supervisor.close(), supervisor.close()]);

        expect(test.service.kills).toBe(1);
    });

    it('requests graceful shutdown before the fallback', async () => {
        const test = harness();
        let input = '';

        test.service.stdin.on('data', (chunk: Buffer) => {
            input += chunk.toString();
            test.service.exit(0);
        });

        const supervisor = startMtaServer({
            target: test.target,
            processService: test.service,
            env: {},
            platform: 'win32',
        });

        await supervisor.close();

        expect(input).toBe('shutdown\n');
        expect(test.service.kills).toBe(0);
    });
});
