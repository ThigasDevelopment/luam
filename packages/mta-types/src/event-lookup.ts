import { MTA_EVENTS } from '@mta-types/generated/mta-events';
import { MTA_EVENT_SIGNATURES } from '@mta-types/generated/events/mta-event-signatures';

import type { ApiEnvironment } from './api-declaration';
import type { FunctionDescriptor } from './type-descriptor';

const SERVER: ReadonlySet<string> = new Set(MTA_EVENTS.server);
const CLIENT: ReadonlySet<string> = new Set(MTA_EVENTS.client);
const SHARED: ReadonlySet<string> = new Set(MTA_EVENTS.shared);

export function eventsFor(environment: ApiEnvironment): string[] {
    if (environment === 'shared') {
        return [...MTA_EVENTS.shared, ...MTA_EVENTS.server, ...MTA_EVENTS.client].sort();
    }

    return [...MTA_EVENTS.shared, ...MTA_EVENTS[environment]].sort();
}

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

export function eventHandler(name: string, environment: ApiEnvironment): FunctionDescriptor | null {
    return MTA_EVENT_SIGNATURES[environment][name] ?? null;
}
