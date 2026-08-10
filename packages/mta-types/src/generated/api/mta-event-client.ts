import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, STRING } from '@mta-types/type-descriptor';

export const MTA_EVENT_CLIENT: ApiCatalog = {
    triggerLatentServerEvent: fn([ANY, ANY, ANY, ANY], BOOLEAN, 2, true),
    triggerServerEvent: fn([STRING, named('Element')], BOOLEAN, 2, true),
};
