import type { HttpTransportConfig } from '@cli/config/config-schema';
import { transportFailure, transportSuccess, type MtaTransport, type TransportResult } from '@cli/transport/transport';

export type HttpFetch = (input: string, init: RequestInit) => Promise<Response>;

const REQUEST_TIMEOUT_MS = 10000;

function authorization(config: HttpTransportConfig): string {
    return `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`;
}

function endpoint(config: HttpTransportConfig, functionName: string): string {
    return `http://${config.host}:${config.port}/${config.resource}/call/${functionName}`;
}

function describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

async function call(config: HttpTransportConfig, functionName: string, args: readonly unknown[], request: HttpFetch): Promise<TransportResult> {
    const url = endpoint(config, functionName);

    try {
        const response = await request(url, {
            method: 'POST',
            headers: { Authorization: authorization(config), 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
            return transportFailure(`"${functionName}" failed with HTTP ${response.status} ${response.statusText}.`);
        }

        return transportSuccess(`"${functionName}" responded with HTTP ${response.status}.`);
    } catch (error: unknown) {
        return transportFailure(`"${functionName}" could not reach ${config.host}:${config.port}: ${describe(error)}`);
    }
}

export function createHttpTransport(config: HttpTransportConfig, request: HttpFetch = fetch): MtaTransport {
    return {
        kind: 'http',
        refresh: () => call(config, config.refreshFunction, [], request),
        restart: (resource: string) => call(config, config.restartFunction, [resource], request),
    };
}
