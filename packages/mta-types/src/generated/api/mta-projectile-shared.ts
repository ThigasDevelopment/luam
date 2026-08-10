import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn } from '@mta-types/type-descriptor';

export const MTA_PROJECTILE_SHARED: ApiCatalog = {
    detonateSatchels: fn([ANY], BOOLEAN, 0),
};
