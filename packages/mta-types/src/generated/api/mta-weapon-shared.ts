import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_WEAPON_SHARED: ApiCatalog = {
    getOriginalWeaponProperty: fn([ANY, STRING, STRING], NUMBER, 3),
    getSlotFromWeapon: fn([NUMBER], NUMBER, 1),
    getWeaponIDFromName: fn([STRING], NUMBER, 1),
    getWeaponNameFromID: fn([NUMBER], STRING, 1),
    getWeaponProperty: fn([ANY, STRING, STRING], NUMBER, 3),
    setWeaponAmmo: fn([named('Player'), NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    setWeaponProperty: fn([ANY, STRING, ANY, ANY], BOOLEAN, 3),
};
