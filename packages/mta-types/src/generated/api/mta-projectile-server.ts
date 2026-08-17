import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named } from '@mta-types/type-descriptor';

export const MTA_PROJECTILE_SERVER: ApiCatalog = {
    detonateSatchels: fn([named('Player')], BOOLEAN, 1),
};
