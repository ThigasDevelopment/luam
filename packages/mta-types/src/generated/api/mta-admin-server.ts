import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, named, STRING } from '@mta-types/type-descriptor';

export const MTA_ADMIN_SERVER: ApiCatalog = {
    getBanUsername: fn([named('Ban')], STRING, 1),
};
