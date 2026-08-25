import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER } from '@mta-types/type-descriptor';

export const MTA_WATER_CLIENT: ApiCatalog = {
    getWaterLevel: fn([NUMBER, NUMBER, NUMBER, BOOLEAN], NUMBER, 3),
    isWaterDrawnLast: fn([], BOOLEAN, 0),
    setWaterDrawnLast: fn([BOOLEAN], BOOLEAN, 1),
    setWaterLevel: fn([NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 1),
};
