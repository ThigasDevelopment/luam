import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_CURSOR_CLIENT: ApiCatalog = {
    getCursorAlpha: fn([], NUMBER, 0),
    getCursorPosition: fn([], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER]), 0),
    isCursorShowing: fn([], BOOLEAN, 0),
    setCursorAlpha: fn([NUMBER], BOOLEAN, 1),
    setCursorPosition: fn([NUMBER, NUMBER], BOOLEAN, 2),
    showCursor: fn([BOOLEAN, BOOLEAN], BOOLEAN, 1),
};
