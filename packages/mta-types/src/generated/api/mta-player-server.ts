import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, named, TABLE } from '@mta-types/type-descriptor';

export const MTA_PLAYER_SERVER: ApiCatalog = {
    getPlayerACInfo: fn([named('Element')], TABLE, 1),
};
