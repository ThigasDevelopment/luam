import { afterEach, describe, expect, it } from 'vitest';
import { resolve } from 'node:path';

import { resolveServerExecutable } from '@cli/server/server-executable-resolver';

import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function project(): ProjectFixture {
    const fixture = createProjectFixture();

    fixtures.push(fixture);

    return fixture;
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('MTA server executable resolution', () => {
    it('probes the Windows executable name', () => {
        const fixture = project();

        fixture.write('server/MTA Server.exe', 'binary');

        const result = resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'win32' });

        expect(result.executable).toBe(resolve(fixture.root, 'server/MTA Server.exe'));
    });

    it('prefers the 64-bit Linux executable and falls back to the standard name', () => {
        const fixture = project();

        fixture.executable('server/mta-server', 'binary');
        expect(resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'linux' }).executable).toContain('mta-server');

        fixture.executable('server/mta-server64', 'binary');
        expect(resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'linux' }).executable).toContain('mta-server64');
    });

    it('resolves a configured executable under serverPath', () => {
        const fixture = project();

        fixture.executable('server/bin/custom-server', 'binary');

        expect(resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: 'bin/custom-server', platform: 'linux' }).executable).toContain(
            'custom-server',
        );
    });

    it('rejects escaping overrides and reports every attempted default', () => {
        const fixture = project();

        expect(() => resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: '../outside', platform: 'linux' })).toThrow(
            'must stay inside serverPath',
        );
        expect(() => resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'linux' })).toThrow(/mta-server64.*mta-server/);
    });

    it('reports a candidate that is missing the execute permission', () => {
        const fixture = project();

        fixture.write('server/mta-server64', 'binary');

        expect(() => resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'linux' })).toThrow(
            /missing the execute permission.*mta-server64.*chmod \+x/s,
        );
    });

    it('falls back to a runnable candidate when the preferred one is not executable', () => {
        const fixture = project();

        fixture.write('server/mta-server64', 'binary');
        fixture.executable('server/mta-server', 'binary');

        expect(resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'linux' }).executable).toBe(
            resolve(fixture.root, 'server/mta-server'),
        );
    });

    it('rejects directories and unsupported platforms', () => {
        const fixture = project();

        fixture.write('server/MTA Server.exe/entry', 'not a file');

        expect(() => resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'win32' })).toThrow('Could not find');
        expect(() => resolveServerExecutable({ root: fixture.root, serverPath: 'server', configured: null, platform: 'darwin' })).toThrow('not supported');
    });
});
