import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_WEAPON_CLIENT: ApiCatalog = {
    createWeapon: fn([STRING, NUMBER, NUMBER, NUMBER], named('Weapon'), 4),
    fireWeapon: fn([named('Weapon')], BOOLEAN, 1),
    getWeaponAmmo: fn([named('Weapon')], NUMBER, 1),
    getWeaponClipAmmo: fn([named('Weapon')], NUMBER, 1),
    getWeaponFiringRate: fn([named('Weapon')], NUMBER, 1),
    getWeaponFlags: fn([named('Weapon'), STRING], BOOLEAN, 2),
    getWeaponOwner: fn([named('Weapon')], BOOLEAN, 1),
    getWeaponState: fn([named('Weapon')], STRING, 1),
    getWeaponTarget: fn([named('Weapon')], ANY, 1),
    resetWeaponFiringRate: fn([named('Weapon')], BOOLEAN, 1),
    setWeaponClipAmmo: fn([named('Weapon'), NUMBER], BOOLEAN, 2),
    setWeaponFiringRate: fn([named('Weapon'), NUMBER], BOOLEAN, 2),
    setWeaponFlags: fn([named('Weapon'), STRING, BOOLEAN], BOOLEAN, 3),
    setWeaponState: fn([named('Weapon'), STRING], BOOLEAN, 2),
    setWeaponTarget: fn([named('Weapon'), named('Element'), NUMBER], BOOLEAN, 2),
};
