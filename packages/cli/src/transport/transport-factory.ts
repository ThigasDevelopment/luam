import type { TransportConfig } from '@cli/config/config-schema';
import { createHttpTransport } from '@cli/transport/http-transport';
import { createNoneTransport } from '@cli/transport/none-transport';
import type { MtaTransport } from '@cli/transport/transport';

export function createTransport(config: TransportConfig): MtaTransport {
    if (config.kind === 'http') {
        return createHttpTransport(config);
    }

    return createNoneTransport();
}
