import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn } from '@mta-types/type-descriptor';

export const MTA_CURSOR_SHARED: ApiCatalog = {
    isCursorShowing: fn([ANY], BOOLEAN, 0),
    showCursor: fn([ANY, BOOLEAN, ANY], BOOLEAN, 1),
};
