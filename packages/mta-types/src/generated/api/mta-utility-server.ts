import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_UTILITY_SERVER: ApiCatalog = {
    getNetworkStats: fn([named('Element')], TABLE, 0),
    getServerConfigSetting: fn([STRING], STRING, 1),
    setServerConfigSetting: fn([STRING, STRING, BOOLEAN], BOOLEAN, 2),
};
