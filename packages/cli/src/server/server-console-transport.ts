import { transportSuccess } from '@cli/transport/transport';

import type { MtaServerSupervisor } from '@cli/server/mta-server-supervisor';
import type { MtaTransport, TransportResult } from '@cli/transport/transport';

export function createServerConsoleTransport(supervisor: MtaServerSupervisor): MtaTransport {
    return {
        kind: 'console',
        refresh: async (): Promise<TransportResult> => {
            supervisor.writeCommand('refresh');

            return transportSuccess('refreshed through the owned server console');
        },
        restart: async (resource: string): Promise<TransportResult> => {
            supervisor.writeCommand(`stop ${resource}`);
            supervisor.writeCommand(`start ${resource}`);

            return transportSuccess(`restarted "${resource}" through the owned server console`);
        },
    };
}
