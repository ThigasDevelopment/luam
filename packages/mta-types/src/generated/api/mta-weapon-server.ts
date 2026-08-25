import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, literal, named, NUMBER, STRING, unionOf } from '@mta-types/type-descriptor';

export const MTA_WEAPON_SERVER: ApiCatalog = {
    giveWeapon: fn([named('Ped'), NUMBER, NUMBER, BOOLEAN], BOOLEAN, 2),
    setWeaponProperty: fn([unionOf([NUMBER, STRING]), unionOf([literal('pro'), literal('std'), literal('poor')]), STRING, NUMBER], BOOLEAN, 4),
    takeAllWeapons: fn([named('Ped')], BOOLEAN, 1),
    takeWeapon: fn([named('Player'), NUMBER, NUMBER], BOOLEAN, 2),
};
