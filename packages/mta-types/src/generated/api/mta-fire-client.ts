import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER } from '@mta-types/type-descriptor';

export const MTA_FIRE_CLIENT: ApiCatalog = {
    createFire: fn([NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    extinguishFire: fn([NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 0),
};
