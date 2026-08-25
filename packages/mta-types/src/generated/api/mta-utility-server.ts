import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, named, TABLE } from '@mta-types/type-descriptor';

export const MTA_UTILITY_SERVER: ApiCatalog = {
    getNetworkStats: fn([named('Element')], TABLE, 0),
};
