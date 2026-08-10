import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_EVENT_SHARED: ApiCatalog = {
    addEvent: fn([STRING, BOOLEAN], BOOLEAN, 1),
    addEventHandler: fn([STRING, named('Element'), ANY, BOOLEAN, STRING], BOOLEAN, 3),
    cancelEvent: fn([ANY, ANY], BOOLEAN, 0),
    cancelLatentEvent: fn([ANY, ANY], BOOLEAN, 1),
    getEventHandlers: fn([STRING, named('Element')], TABLE, 2),
    getLatentEventHandles: fn([ANY], TABLE, 0),
    getLatentEventStatus: fn([ANY, ANY], TABLE, 1),
    removeEventHandler: fn([STRING, named('Element'), ANY], BOOLEAN, 3),
    triggerEvent: fn([STRING, named('Element')], BOOLEAN, 2, true),
    wasEventCancelled: fn([], BOOLEAN, 0),
};
