import { createServer } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { findPortHolder } from '@cli/server/port-holder';
import { conflictingPort, describeHolder, startupFailureMessage } from '@cli/server/startup-failure';

const MTA_PORT_FAILURE = [
    'MTA:BLUE Server for MTA:SA',
    '',
    "[18:51:25] ERROR: Could not start HTTP server on interface '' and port '22005'!",
    '[18:51:25] Server stopped!',
    'Press Q to shut down the server!',
];

const listeners: ReturnType<typeof createServer>[] = [];

afterEach(async () => {
    for (const listener of listeners.splice(0)) {
        await new Promise((done) => listener.close(done));
    }
});

describe('a server that exits before readiness', () => {
    it('names the port the server itself named', () => {
        expect(conflictingPort(MTA_PORT_FAILURE)).toBe(22005);
        expect(conflictingPort(['Could not bind port 22003'])).toBe(22003);
    });

    it('reads the last port failure when the server reports several', () => {
        expect(conflictingPort([...MTA_PORT_FAILURE, "ERROR: Could not start server on port '22003'!"])).toBe(22003);
    });

    it('finds no port in ordinary output', () => {
        expect(conflictingPort(['Server started', 'Loading resources'])).toBeNull();
    });

    it('names the process holding the port and how to stop it', () => {
        const message = startupFailureMessage('code 3', MTA_PORT_FAILURE, () => ({ pid: 79369, command: 'mta-server64' }));

        expect(message).toContain('exited before readiness with code 3');
        expect(message).toContain('Port 22005 is held by "mta-server64" (pid 79369)');
        expect(message).toContain('left behind by an earlier run');
        expect(message).toContain('kill 79369');
    });

    it('does not call an unrelated process a leftover server', () => {
        const message = startupFailureMessage('code 3', MTA_PORT_FAILURE, () => ({ pid: 4321, command: 'python3' }));

        expect(message).toContain('Port 22005 is held by "python3" (pid 4321)');
        expect(message).not.toContain('left behind');
    });

    it('still says the port is taken when the holder cannot be identified', () => {
        const message = startupFailureMessage('code 3', MTA_PORT_FAILURE, () => null);

        expect(message).toContain('Port 22005 is already in use');
        expect(message).not.toContain('pid');
    });

    it('quotes what the server said when nothing names a port', () => {
        const message = startupFailureMessage('signal SIGKILL', ['Loading resources', 'Fatal: the world is missing'], () => null);

        expect(message).toContain('exited before readiness with signal SIGKILL');
        expect(message).toContain('The server said: Fatal: the world is missing');
    });

    it('says only what it knows when the server said nothing', () => {
        expect(startupFailureMessage('code 1', [], () => null)).toBe('MTA server exited before readiness with code 1.');
    });

    it('describes a holder that is gone by the time it is asked', () => {
        expect(describeHolder(22005, null)).toContain('already in use');
    });
});

describe('the port holder lookup', () => {
    it('finds this process holding a port it just bound', async () => {
        if (process.platform !== 'linux') {
            expect(findPortHolder(1, 'win32')).toBeNull();

            return;
        }

        const listener = createServer();

        listeners.push(listener);

        const port = await new Promise<number>((done) => {
            listener.listen(0, '127.0.0.1', () => {
                const address = listener.address();

                done(typeof address === 'object' && address !== null ? address.port : 0);
            });
        });
        const holder = findPortHolder(port);

        expect(holder?.pid).toBe(process.pid);
    });

    it('finds nobody on a port nothing listens to', () => {
        expect(findPortHolder(1)).toBeNull();
    });

    it('does nothing outside Linux', () => {
        expect(findPortHolder(22005, 'darwin')).toBeNull();
        expect(findPortHolder(22005, 'win32')).toBeNull();
    });
});
