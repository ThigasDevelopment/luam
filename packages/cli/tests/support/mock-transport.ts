import { transportFailure, transportSuccess, type MtaTransport, type TransportResult } from '@cli/transport/transport';

export interface MockTransport extends MtaTransport {
    calls: string[];
    failNext: boolean;
}

export function createMockTransport(kind = 'mock'): MockTransport {
    const calls: string[] = [];

    const transport: MockTransport = {
        kind,
        calls,
        failNext: false,
        refresh: async (): Promise<TransportResult> => {
            calls.push('refresh');

            return transport.failNext ? transportFailure('refresh rejected') : transportSuccess('refreshed');
        },
        restart: async (resource: string): Promise<TransportResult> => {
            calls.push(`restart:${resource}`);

            return transport.failNext ? transportFailure('restart rejected') : transportSuccess('restarted');
        },
    };

    return transport;
}
