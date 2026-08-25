import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_PICKUP_SHARED: ApiCatalog = {
    createPickup: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], named('Pickup'), 5),
    getPickupAmmo: fn([named('Pickup')], NUMBER, 1),
    getPickupAmount: fn([named('Pickup')], NUMBER, 1),
    getPickupType: fn([named('Pickup')], NUMBER, 1),
    getPickupWeapon: fn([named('Pickup')], NUMBER, 1),
    setPickupType: fn([named('Pickup'), NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
};
