import { describe, expect, it } from 'vitest';

import type { HttpTransportConfig } from '@cli/config/config-schema';
import { createHttpTransport, type HttpFetch } from '@cli/transport/http-transport';
import { createTransport } from '@cli/transport/transport-factory';

interface RecordedRequest {
    url: string;
    method: string | undefined;
    authorization: string | undefined;
    body: string;
}

const CONFIG: HttpTransportConfig = {
    kind: 'http',
    host: '127.0.0.1',
    port: 22005,
    resource: 'luam-sync',
    username: 'admin',
    password: 'secret',
    refreshFunction: 'refreshResources',
    restartFunction: 'restartResource',
};

function recorder(status = 200): { requests: RecordedRequest[]; request: HttpFetch } {
    const requests: RecordedRequest[] = [];

    const request: HttpFetch = async (url, init) => {
        const headers = new Headers(init.headers);

        requests.push({
            url,
            method: init.method,
            authorization: headers.get('Authorization') ?? undefined,
            body: typeof init.body === 'string' ? init.body : '',
        });

        return new Response('[]', { status, statusText: status === 200 ? 'OK' : 'Unauthorized' });
    };

    return { requests, request };
}

describe('http transport', () => {
    it('calls the configured refresh function', async () => {
        const { requests, request } = recorder();
        const result = await createHttpTransport(CONFIG, request).refresh();

        expect(result.ok).toBe(true);
        expect(requests[0]?.url).toBe('http://127.0.0.1:22005/luam-sync/call/refreshResources');
        expect(requests[0]?.method).toBe('POST');
        expect(requests[0]?.body).toBe('[]');
    });

    it('calls the configured restart function with the resource name', async () => {
        const { requests, request } = recorder();
        const result = await createHttpTransport(CONFIG, request).restart('luam-demo');

        expect(result.ok).toBe(true);
        expect(requests[0]?.url).toBe('http://127.0.0.1:22005/luam-sync/call/restartResource');
        expect(requests[0]?.body).toBe('["luam-demo"]');
    });

    it('sends basic authentication', async () => {
        const { requests, request } = recorder();

        await createHttpTransport(CONFIG, request).refresh();

        expect(requests[0]?.authorization).toBe(`Basic ${Buffer.from('admin:secret').toString('base64')}`);
    });

    it('fails on a non success response', async () => {
        const { request } = recorder(401);
        const result = await createHttpTransport(CONFIG, request).refresh();

        expect(result.ok).toBe(false);
        expect(result.message).toBe('"refreshResources" failed with HTTP 401 Unauthorized.');
    });

    it('fails when the server cannot be reached', async () => {
        const request: HttpFetch = async () => {
            throw new Error('connect ECONNREFUSED');
        };
        const result = await createHttpTransport(CONFIG, request).restart('luam-demo');

        expect(result.ok).toBe(false);
        expect(result.message).toContain('could not reach 127.0.0.1:22005');
    });

    it('never leaks the password in a message', async () => {
        const { request } = recorder(401);
        const result = await createHttpTransport(CONFIG, request).refresh();

        expect(result.message).not.toContain('secret');
    });
});

describe('transport factory', () => {
    it('creates the none transport by default', async () => {
        const transport = createTransport({ kind: 'none' });

        expect(transport.kind).toBe('none');
        expect((await transport.restart('luam-demo')).ok).toBe(true);
    });

    it('creates the http transport from the configuration', () => {
        expect(createTransport(CONFIG).kind).toBe('http');
    });
});
