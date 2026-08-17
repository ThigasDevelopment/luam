import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_WEAPON_SERVER: ApiCatalog = {
    giveWeapon: fn([named('Ped'), NUMBER, NUMBER, BOOLEAN], BOOLEAN, 2),
    setWeaponProperty: fn([ANY, STRING, STRING, NUMBER], BOOLEAN, 4),
    takeAllWeapons: fn([named('Ped')], BOOLEAN, 1),
    takeWeapon: fn([named('Player'), NUMBER, NUMBER], BOOLEAN, 2),
};
