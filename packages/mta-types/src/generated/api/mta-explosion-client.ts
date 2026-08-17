import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER } from '@mta-types/type-descriptor';

export const MTA_EXPLOSION_CLIENT: ApiCatalog = {
    createExplosion: fn([NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN, NUMBER, BOOLEAN], BOOLEAN, 4),
};
