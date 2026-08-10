import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_WEAPON_SERVER: ApiCatalog = {
    giveWeapon: fn([named('Ped'), NUMBER, NUMBER, BOOLEAN], BOOLEAN, 2),
    takeAllWeapons: fn([named('Ped')], BOOLEAN, 1),
    takeWeapon: fn([named('Player'), NUMBER, NUMBER], BOOLEAN, 2),
};
