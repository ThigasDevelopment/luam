import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE, tupleOf } from '@mta-types/type-descriptor';

export const MTA_VEHICLE_SERVER: ApiCatalog = {
    addVehicleSirens: fn([named('Vehicle'), NUMBER, NUMBER, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN], BOOLEAN, 3),
    blowVehicle: fn([named('Vehicle'), BOOLEAN], BOOLEAN, 1),
    getModelHandling: fn([NUMBER], TABLE, 1),
    getVehicleRespawnPosition: fn([named('Element')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getVehicleRespawnRotation: fn([named('Element')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getVehiclesOfType: fn([NUMBER], TABLE, 1),
    removeVehicleSirens: fn([named('Vehicle')], BOOLEAN, 1),
    resetVehicleExplosionTime: fn([named('Vehicle')], BOOLEAN, 1),
    resetVehicleIdleTime: fn([named('Vehicle')], BOOLEAN, 1),
    respawnVehicle: fn([named('Vehicle')], BOOLEAN, 1),
    setModelHandling: fn([NUMBER, STRING, ANY], BOOLEAN, 3),
    setVehicleIdleRespawnDelay: fn([named('Vehicle'), NUMBER], BOOLEAN, 2),
    setVehicleRespawnDelay: fn([named('Vehicle'), NUMBER], BOOLEAN, 2),
    setVehicleRespawnPosition: fn([named('Vehicle'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setVehicleRespawnRotation: fn([named('Vehicle'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    spawnVehicle: fn([named('Vehicle'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    toggleVehicleRespawn: fn([named('Vehicle'), BOOLEAN], BOOLEAN, 2),
};
