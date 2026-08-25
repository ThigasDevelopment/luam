import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, fn, NUMBER } from '@mta-types/type-descriptor';

export const MTA_BUILDING_CLIENT: ApiCatalog = {
    createBuilding: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], ANY, 4),
};
