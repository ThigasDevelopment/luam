import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, STRING } from '@mta-types/type-descriptor';

export const MTA_OUTPUT_SERVER: ApiCatalog = {
    outputServerLog: fn([STRING], BOOLEAN, 1),
};
