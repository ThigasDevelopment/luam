import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_WATER_SERVER: ApiCatalog = {
    setWaterLevel: fn([named('Water'), NUMBER], BOOLEAN, 1),
};
