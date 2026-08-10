import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, STRING } from '@mta-types/type-descriptor';

export const MTA_EVENT_SERVER: ApiCatalog = {
    getCancelReason: fn([], STRING, 0),
    triggerClientEvent: fn([ANY, ANY, ANY], BOOLEAN, 2, true),
    triggerLatentClientEvent: fn([ANY, ANY, ANY, ANY, ANY], BOOLEAN, 2, true),
};
