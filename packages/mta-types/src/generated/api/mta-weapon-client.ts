import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named } from '@mta-types/type-descriptor';

export const MTA_WEAPON_CLIENT: ApiCatalog = {
    getWeaponOwner: fn([named('Weapon')], BOOLEAN, 1),
};
