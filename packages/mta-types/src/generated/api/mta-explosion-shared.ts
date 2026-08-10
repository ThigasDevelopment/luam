import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, NUMBER } from '@mta-types/type-descriptor';

export const MTA_EXPLOSION_SHARED: ApiCatalog = {
    createExplosion: fn([NUMBER, NUMBER, NUMBER, NUMBER, ANY, ANY, ANY], BOOLEAN, 4),
};
