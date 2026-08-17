import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_EVENT_CLIENT: ApiCatalog = {
    cancelEvent: fn([], BOOLEAN, 0),
    cancelLatentEvent: fn([NUMBER], BOOLEAN, 1),
    getLatentEventHandles: fn([], TABLE, 0),
    getLatentEventStatus: fn([NUMBER], TABLE, 1),
    triggerLatentServerEvent: fn([ANY, ANY, ANY, ANY], BOOLEAN, 2, true, undefined),
    triggerServerEvent: fn([STRING, named('Element')], BOOLEAN, 2, true, undefined),
};
