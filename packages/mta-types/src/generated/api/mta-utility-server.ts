import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, STRING } from '@mta-types/type-descriptor';

export const MTA_UTILITY_SERVER: ApiCatalog = {
    getServerConfigSetting: fn([STRING], STRING, 1),
    setServerConfigSetting: fn([STRING, STRING, BOOLEAN], BOOLEAN, 2),
};
