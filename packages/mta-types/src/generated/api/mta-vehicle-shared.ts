import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_VEHICLE_SHARED: ApiCatalog = {
    getVehicleTurnVelocity: fn([named('Vehicle')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    setVehicleDirtLevel: fn([named('Vehicle'), NUMBER], BOOLEAN, 2),
    setVehicleTurnVelocity: fn([named('Vehicle'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
};
