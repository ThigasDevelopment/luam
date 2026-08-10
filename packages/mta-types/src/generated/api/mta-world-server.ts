import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, STRING } from '@mta-types/type-descriptor';

export const MTA_WORLD_SERVER: ApiCatalog = {
    getJetpackWeaponEnabled: fn([STRING], BOOLEAN, 1),
    setJetpackWeaponEnabled: fn([STRING, BOOLEAN], BOOLEAN, 2),
};
