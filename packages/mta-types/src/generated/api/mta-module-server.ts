import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_MODULE_SERVER: ApiCatalog = {
    getLoadedModules: fn([], TABLE, 0),
    getModuleInfo: fn([STRING], TABLE, 1),
};
