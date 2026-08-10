import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_PICKUP_SERVER: ApiCatalog = {
    getPickupRespawnInterval: fn([named('Pickup')], NUMBER, 1),
    isPickupSpawned: fn([named('Pickup')], BOOLEAN, 1),
    setPickupRespawnInterval: fn([named('Pickup'), NUMBER], BOOLEAN, 2),
};
