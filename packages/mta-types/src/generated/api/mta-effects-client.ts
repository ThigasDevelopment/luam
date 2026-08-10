import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_EFFECTS_CLIENT: ApiCatalog = {
    createEffect: fn([STRING, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], named('Effect'), 4),
    fxAddBlood: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 6),
    fxAddBulletImpact: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 6),
    fxAddBulletSplash: fn([NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    fxAddDebris: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    fxAddFootSplash: fn([NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    fxAddGlass: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    fxAddGunshot: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], BOOLEAN, 6),
    fxAddPunchImpact: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 6),
    fxAddSparks: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN, NUMBER, NUMBER], BOOLEAN, 6),
    fxAddTankFire: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 6),
    fxAddTyreBurst: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 6),
    fxAddWaterHydrant: fn([NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    fxAddWaterSplash: fn([NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    fxAddWood: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 6),
    getEffectDensity: fn([named('Effect')], NUMBER, 1),
    getEffectSpeed: fn([named('Effect')], NUMBER, 1),
    setEffectDensity: fn([named('Effect'), NUMBER], BOOLEAN, 2),
    setEffectSpeed: fn([named('Effect'), NUMBER], BOOLEAN, 2),
};
