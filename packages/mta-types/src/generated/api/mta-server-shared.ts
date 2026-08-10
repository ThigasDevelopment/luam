import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn } from '@mta-types/type-descriptor';

export const MTA_SERVER_SHARED: ApiCatalog = {
    isTransferBoxVisible: fn([], BOOLEAN, 0),
    setTransferBoxVisible: fn([BOOLEAN], BOOLEAN, 1),
};
