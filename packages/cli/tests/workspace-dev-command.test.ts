import { PassThrough } from 'node:stream';

class FakeTerminal extends PassThrough {
    readonly isTTY = true;
    isRaw = false;

    setRawMode(mode: boolean): this {
        this.isRaw = mode;

        return this;
    }
}
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createRuntime, createWorkspaceContext, resourceContext } from '@cli/cli/cli-runtime';
import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import type { CommandContext } from '@cli/commands/command-context';
import { workspaceResources } from '@cli/config/workspace-loader';
import { runWorkspaceDevCommand, START_SERVER_AT_A_WORKSPACE } from '@cli/session/workspace-dev-command';

import { FakeProcessService } from './support/fake-process-service';
import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createWorkspaceFixture, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

async function waitUntil(predicate: () => boolean, what: string): Promise<void> {
    const deadline = Date.now() + 2000;

    while (!predicate()) {
        if (Date.now() >= deadline) {
            throw new Error(`Timed out waiting for ${what}.`);
        }

        await new Promise((resolveDelay) => setTimeout(resolveDelay, 5));
    }
}

interface DevHarness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    service: FakeProcessService;
    controller: AbortController;
    terminal: FakeTerminal;
    run(): Promise<number>;
    ready(): void;
    written(): string;
    painted(): string;
}

function harness(): DevHarness {
    const fixture = createWorkspaceFixture();
    const logger = createMemoryLogger();
    const runtime = createRuntime([], { logger, cwd: fixture.root, env: OFFLINE });
    const resolved = createWorkspaceContext(runtime, {});
    const service = new FakeProcessService();
    const controller = new AbortController();
    const terminal = new FakeTerminal();
    const echo = new PassThrough();
    let written = '';
    let painted = '';

    echo.on('data', (chunk: Buffer) => {
        painted += chunk.toString();
    });

    fixtures.push(fixture);
    service.stdin.on('data', (chunk: Buffer) => {
        written += chunk.toString();
    });

    if (resolved.context === null || resolved.context.workspace.deployment === null) {
        throw new Error('The workspace fixture did not open.');
    }

    const workspace = resolved.context;
    const deployment = workspace.workspace.deployment;

    if (deployment === null) {
        throw new Error('The workspace fixture names no server.');
    }

    return {
        fixture,
        logger,
        service,
        controller,
        terminal,
        painted: (): string => painted,
        run: (): Promise<number> =>
            runWorkspaceDevCommand({
                root: workspace.root,
                listResources: (): readonly string[] => workspaceResources(workspace.root),
                logger,
                reporter: runtime.reporter,
                deployment,
                loadResource: (name: string): CommandContext | null => resourceContext(runtime, workspace, 'dev', name).context,
                processService: service,
                portHolder: (): null => null,
                input: terminal,
                echo,
                env: {},
                signal: controller.signal,
                pollIntervalMs: 5,
                readinessTimeoutMs: 1000,
                shutdownTimeoutMs: 20,
            }),
        ready: (): void => {
            fixture.write('server/mods/deathmatch/logs/server.log', 'Server started and is ready to accept connections!\n');
        },
        written: (): string => written,
    };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('luam dev at a workspace root', () => {
    it('starts exactly one server, waits for readiness, and attaches nothing', async () => {
        const test = harness();
        const running = test.run();

        test.ready();
        await waitUntil(() => test.logger.text().includes('Watching nothing yet'), 'the session to open');

        expect(test.service.calls).toHaveLength(1);
        expect(test.logger.text()).toContain('waited for readiness');
        expect(test.logger.text()).toContain('Resources here: "resource-a", "resource-b"');
        expect(test.fixture.exists('server/mods/deathmatch/resources')).toBe(false);

        test.controller.abort();
        expect(await running).toBe(EXIT_OK);
    });

    it('runs a verb typed before readiness once the server is ready', async () => {
        const test = harness();
        const running = test.run();

        test.terminal.write('ensure resource-a\n');
        await new Promise((resolveDelay) => setTimeout(resolveDelay, 20));

        expect(test.fixture.exists('server/mods/deathmatch/resources/resource-a')).toBe(false);

        test.ready();
        await waitUntil(() => test.fixture.exists('server/mods/deathmatch/resources/resource-a/meta.xml'), 'the queued verb to run');

        test.controller.abort();
        expect(await running).toBe(EXIT_OK);
    });

    it('ends the session with a diagnostics exit when the server exits unexpectedly', async () => {
        const test = harness();
        const running = test.run();

        test.ready();
        await waitUntil(() => test.logger.text().includes('Watching nothing yet'), 'the session to open');
        test.service.exit(7);

        expect(await running).toBe(EXIT_DIAGNOSTICS);
        expect(test.logger.errors.join('\n')).toContain('code 7');
    });

    it('shuts the server down on Ctrl+C', async () => {
        const test = harness();
        const running = test.run();

        test.ready();
        await waitUntil(() => test.logger.text().includes('Watching nothing yet'), 'the session to open');
        test.controller.abort();

        expect(await running).toBe(EXIT_OK);
        expect(test.written()).toContain('shutdown\n');
    });
});

describe('the line being typed', () => {
    it('survives a log record arriving mid-word', async () => {
        const test = harness();
        const running = test.run();

        test.ready();
        await waitUntil(() => test.logger.text().includes('Watching nothing yet'), 'the session to open');
        test.terminal.write('ensu');
        await waitUntil(() => test.painted().includes('ensu'), 'the half-typed line to echo');

        const before = test.painted();

        test.fixture.write(
            'server/mods/deathmatch/logs/server.log',
            'Server started and is ready to accept connections!\nsomething happened\n',
        );
        await waitUntil(() => test.logger.text().includes('something happened'), 'the log record');

        expect(test.painted().slice(before.length)).toContain('ensu');

        test.controller.abort();
        expect(await running).toBe(EXIT_OK);
    });
});

describe('the workspace dev usage surface', () => {
    it('rejects --start-server at a workspace root', async () => {
        const fixture = createWorkspaceFixture();
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(await runCli(['dev', '--start-server'], { logger, cwd: fixture.root, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain(START_SERVER_AT_A_WORKSPACE);
    });

    it('leaves luam dev inside a resource directory alone', async () => {
        const fixture = createWorkspaceFixture();
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(await runCli(['dev', '--no-watch'], { logger, cwd: resolve(fixture.root, 'resource-a'), env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.exists('server/mods/deathmatch/resources/resource-a/meta.xml')).toBe(true);
    });
});
