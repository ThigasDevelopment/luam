import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn } from '@mta-types/type-descriptor';

export const MTA_SERVER_CLIENT: ApiCatalog = {
    isTransferBoxAlwaysVisible: fn([], BOOLEAN, 0),
};
