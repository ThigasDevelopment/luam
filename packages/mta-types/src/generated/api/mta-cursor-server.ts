import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named } from '@mta-types/type-descriptor';

export const MTA_CURSOR_SERVER: ApiCatalog = {
    isCursorShowing: fn([named('Player')], BOOLEAN, 1),
    showCursor: fn([named('Player'), BOOLEAN, BOOLEAN], BOOLEAN, 2),
};
