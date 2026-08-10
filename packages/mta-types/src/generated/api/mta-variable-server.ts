import type { ApiCatalog } from '@mta-types/api-declaration';
import { named } from '@mta-types/type-descriptor';

export const MTA_VARIABLE_SERVER: ApiCatalog = {
    client: named('Player'),
    sourceResource: named('Resource'),
    sourceResourceRoot: named('Element'),
};
