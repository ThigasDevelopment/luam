import { afterEach, describe, expect, it } from 'vitest';

import { busyPortMessage, busyServerPorts, readServerPorts, SERVER_CONFIG_PATH } from '@cli/server/server-ports';

import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function server(configuration: string | null): ProjectFixture {
    const fixture = createProjectFixture();

    fixtures.push(fixture);

    if (configuration !== null) {
        fixture.write(`server/${SERVER_CONFIG_PATH}`, configuration);
    }

    return fixture;
}

function root(fixture: ProjectFixture): string {
    return `${fixture.root}/server`;
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('the ports an MTA installation asks for', () => {
    it('reads them from mtaserver.conf', () => {
        const fixture = server('<config>\n<serverport>23003</serverport>\n<httpport>23005</httpport>\n</config>\n');

        expect(readServerPorts(root(fixture))).toEqual([
            { port: 23003, name: 'game' },
            { port: 23005, name: 'HTTP' },
        ]);
    });

    it('falls back to the standard ports when the file is missing or silent', () => {
        expect(readServerPorts(root(server(null)))).toEqual([
            { port: 22003, name: 'game' },
            { port: 22005, name: 'HTTP' },
        ]);
        expect(readServerPorts(root(server('<config></config>\n')))).toEqual([
            { port: 22003, name: 'game' },
            { port: 22005, name: 'HTTP' },
        ]);
    });

    it('reports only the ports something already holds', () => {
        const fixture = server('<config>\n<serverport>22003</serverport>\n<httpport>22005</httpport>\n</config>\n');
        const busy = busyServerPorts(root(fixture), (port) => (port === 22005 ? { pid: 4242, command: 'mta-server64' } : null));

        expect(busy).toEqual([{ port: 22005, name: 'HTTP', holder: { pid: 4242, command: 'mta-server64' } }]);
    });

    it('says nothing when every port is free', () => {
        expect(busyServerPorts(root(server(null)), () => null)).toEqual([]);
        expect(busyPortMessage([])).toBe('');
    });

    it('names the port, the process and the way to stop it', () => {
        const message = busyPortMessage([{ port: 22005, name: 'HTTP', holder: { pid: 4242, command: 'mta-server64' } }]);

        expect(message).toContain('port 22005 (HTTP) is already held');
        expect(message).toContain('"mta-server64" (pid 4242)');
        expect(message).toContain('probably a server left behind by an earlier run');
        expect(message).toContain('kill 4242');
    });

    it('lists every taken port in one sentence', () => {
        const message = busyPortMessage([
            { port: 22003, name: 'game', holder: { pid: 7, command: 'mta-server64' } },
            { port: 22005, name: 'HTTP', holder: { pid: 7, command: 'mta-server64' } },
        ]);

        expect(message).toContain('ports 22003 (game) and 22005 (HTTP) are already held');
    });

    it('does not call an unrelated process a leftover server', () => {
        const message = busyPortMessage([{ port: 22003, name: 'game', holder: { pid: 9, command: 'python3' } }]);

        expect(message).toContain('"python3" (pid 9)');
        expect(message).not.toContain('left behind');
    });

    it('still asks for the port to be freed when the holder is invisible', () => {
        const message = busyPortMessage([{ port: 22003, name: 'game', holder: null }]);

        expect(message).toContain('another process');
        expect(message).toContain('Stop it and run the command again');
    });
});
