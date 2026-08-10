import { transportSuccess, type MtaTransport } from '@cli/transport/transport';

export function createNoneTransport(): MtaTransport {
    return {
        kind: 'none',
        refresh: async () => transportSuccess('No transport configured, skipping refresh.'),
        restart: async (resource: string) => transportSuccess(`No transport configured, skipping restart of "${resource}".`),
    };
}
