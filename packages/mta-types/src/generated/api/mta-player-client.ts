import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER } from '@mta-types/type-descriptor';

export const MTA_PLAYER_CLIENT: ApiCatalog = {
    getBlurLevel: fn([], NUMBER, 0),
    setBlurLevel: fn([NUMBER], BOOLEAN, 1),
};
