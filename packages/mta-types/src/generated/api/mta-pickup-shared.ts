import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_PICKUP_SHARED: ApiCatalog = {
    createPickup: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], ANY, 5),
    getPickupAmmo: fn([ANY], NUMBER, 1),
    getPickupAmount: fn([ANY], NUMBER, 1),
    getPickupType: fn([ANY], NUMBER, 1),
    getPickupWeapon: fn([ANY], NUMBER, 1),
    setPickupType: fn([ANY, NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    usePickup: fn([ANY, named('Player')], BOOLEAN, 2),
};
