import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_EXPLOSION_SERVER: ApiCatalog = {
    createExplosion: fn([NUMBER, NUMBER, NUMBER, NUMBER, named('Player')], BOOLEAN, 4),
};
