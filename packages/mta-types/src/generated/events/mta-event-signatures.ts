import { MTA_EVENT_SIGNATURES_SERVER_1 } from './mta-event-signatures-server-1';
import { MTA_EVENT_SIGNATURES_SERVER_2 } from './mta-event-signatures-server-2';
import { MTA_EVENT_SIGNATURES_SERVER_3 } from './mta-event-signatures-server-3';
import { MTA_EVENT_SIGNATURES_SERVER_4 } from './mta-event-signatures-server-4';
import { MTA_EVENT_SIGNATURES_SERVER_5 } from './mta-event-signatures-server-5';
import { MTA_EVENT_SIGNATURES_SERVER_6 } from './mta-event-signatures-server-6';
import { MTA_EVENT_SIGNATURES_CLIENT_1 } from './mta-event-signatures-client-1';
import { MTA_EVENT_SIGNATURES_CLIENT_2 } from './mta-event-signatures-client-2';
import { MTA_EVENT_SIGNATURES_CLIENT_3 } from './mta-event-signatures-client-3';
import { MTA_EVENT_SIGNATURES_CLIENT_4 } from './mta-event-signatures-client-4';
import { MTA_EVENT_SIGNATURES_CLIENT_5 } from './mta-event-signatures-client-5';
import { MTA_EVENT_SIGNATURES_CLIENT_6 } from './mta-event-signatures-client-6';
import { MTA_EVENT_SIGNATURES_CLIENT_7 } from './mta-event-signatures-client-7';
import { MTA_EVENT_SIGNATURES_CLIENT_8 } from './mta-event-signatures-client-8';

import type { ApiEnvironment } from '@mta-types/api-declaration';
import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES: Readonly<Record<ApiEnvironment, Readonly<Record<string, FunctionDescriptor>>>> = {
    server: {
        ...MTA_EVENT_SIGNATURES_SERVER_1,
        ...MTA_EVENT_SIGNATURES_SERVER_2,
        ...MTA_EVENT_SIGNATURES_SERVER_3,
        ...MTA_EVENT_SIGNATURES_SERVER_4,
        ...MTA_EVENT_SIGNATURES_SERVER_5,
        ...MTA_EVENT_SIGNATURES_SERVER_6,
    },
    client: {
        ...MTA_EVENT_SIGNATURES_CLIENT_1,
        ...MTA_EVENT_SIGNATURES_CLIENT_2,
        ...MTA_EVENT_SIGNATURES_CLIENT_3,
        ...MTA_EVENT_SIGNATURES_CLIENT_4,
        ...MTA_EVENT_SIGNATURES_CLIENT_5,
        ...MTA_EVENT_SIGNATURES_CLIENT_6,
        ...MTA_EVENT_SIGNATURES_CLIENT_7,
        ...MTA_EVENT_SIGNATURES_CLIENT_8,
    },
    shared: {},
};
