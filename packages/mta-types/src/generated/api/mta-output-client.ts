import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn } from '@mta-types/type-descriptor';

export const MTA_OUTPUT_CLIENT: ApiCatalog = {
    clearDebugBox: fn([], BOOLEAN, 0),
    isChatInputBlocked: fn([], BOOLEAN, 0),
    isChatVisible: fn([], BOOLEAN, 0),
};
