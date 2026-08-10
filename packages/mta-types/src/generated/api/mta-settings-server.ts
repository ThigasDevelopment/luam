import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, STRING } from '@mta-types/type-descriptor';

export const MTA_SETTINGS_SERVER: ApiCatalog = {
    get: fn([STRING], ANY, 1),
    set: fn([STRING, ANY], BOOLEAN, 2),
};
