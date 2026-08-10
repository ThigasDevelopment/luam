import { appendFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { followServerLog, resolveServerLogPath } from '@cli/logging/server-log-follower';

import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

async function waitFor(condition: () => boolean): Promise<void> {
    const deadline = Date.now() + 3000;

    while (!condition()) {
        if (Date.now() > deadline) {
            throw new Error('The condition was not met before the timeout.');
        }

        await new Promise((resolveWait) => setTimeout(resolveWait, 10));
    }
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('server log follower', () => {
    it('resolves the standard MTA server log path', () => {
        expect(resolveServerLogPath('C:/project', 'mta-server').replace(/\\/g, '/')).toBe('C:/project/mta-server/mods/deathmatch/logs/server.log');
    });

    it('skips history and reads appended complete lines once', async () => {
        const fixture = createProjectFixture({ 'server.log': 'old\n' });
        const path = resolve(fixture.root, 'server.log');
        const lines: string[] = [];

        fixtures.push(fixture);

        const follower = followServerLog(path, (line) => lines.push(line), { pollIntervalMs: 5 });

        appendFileSync(path, 'new');
        appendFileSync(path, ' line\r\n');

        await waitFor(() => lines.length === 1);

        follower.close();

        expect(lines).toEqual(['new line']);
    });

    it('continues from the beginning after truncation and rotation', async () => {
        const fixture = createProjectFixture({ 'server.log': 'history\n' });
        const path = resolve(fixture.root, 'server.log');
        const lines: string[] = [];

        fixtures.push(fixture);

        const follower = followServerLog(path, (line) => lines.push(line), { pollIntervalMs: 5 });

        fixture.write('server.log', 'truncated\n');

        await waitFor(() => lines.includes('truncated'));

        renameSync(path, resolve(fixture.root, 'server.old.log'));
        fixture.write('server.log', 'rotated\n');

        await waitFor(() => lines.includes('rotated'));

        follower.close();

        expect(lines).toEqual(['truncated', 'rotated']);
    });

    it('reads a log created after following starts from the beginning', async () => {
        const fixture = createProjectFixture();
        const path = resolve(fixture.root, 'server.log');
        const lines: string[] = [];

        fixtures.push(fixture);

        const follower = followServerLog(path, (line) => lines.push(line), { pollIntervalMs: 5 });

        fixture.write('server.log', 'created later\n');

        await waitFor(() => lines.length === 1);

        follower.close();

        expect(lines).toEqual(['created later']);
    });

    it('stops polling when aborted', async () => {
        const fixture = createProjectFixture({ 'server.log': '' });
        const path = resolve(fixture.root, 'server.log');
        const lines: string[] = [];
        const controller = new AbortController();

        fixtures.push(fixture);

        followServerLog(path, (line) => lines.push(line), { signal: controller.signal, pollIntervalMs: 5 });
        controller.abort();
        appendFileSync(path, 'ignored\n');

        await new Promise((resolveWait) => setTimeout(resolveWait, 30));

        expect(lines).toEqual([]);
    });
});
