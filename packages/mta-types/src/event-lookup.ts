import type { ApiEnvironment } from './api-declaration';
import { MTA_EVENTS } from '@mta-types/generated/mta-events';

const SERVER: ReadonlySet<string> = new Set(MTA_EVENTS.server);
const CLIENT: ReadonlySet<string> = new Set(MTA_EVENTS.client);
const SHARED: ReadonlySet<string> = new Set(MTA_EVENTS.shared);

export function eventEnvironment(name: string): ApiEnvironment | null {
    if (SHARED.has(name)) {
        return 'shared';
    }

    if (SERVER.has(name)) {
        return 'server';
    }

    if (CLIENT.has(name)) {
        return 'client';
    }

    return null;
}
