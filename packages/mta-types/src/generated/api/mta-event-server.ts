import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_EVENT_SERVER: ApiCatalog = {
    cancelEvent: fn([BOOLEAN, STRING], BOOLEAN, 0),
    cancelLatentEvent: fn([named('Player'), NUMBER], BOOLEAN, 2),
    getCancelReason: fn([], STRING, 0),
    getLatentEventHandles: fn([named('Player')], TABLE, 1),
    getLatentEventStatus: fn([named('Player'), NUMBER], TABLE, 2),
    triggerClientEvent: fn([ANY, ANY, ANY], BOOLEAN, 2, true, undefined),
    triggerLatentClientEvent: fn([ANY, ANY, ANY, ANY, ANY], BOOLEAN, 2, true, undefined),
};
