import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_WATER_SHARED: ApiCatalog = {
    createWater: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], named('Water'), 9),
    getWaterColor: fn([], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 0),
    getWaterVertexPosition: fn([named('Water'), NUMBER], tupleOf([NUMBER, NUMBER, NUMBER]), 2),
    getWaveHeight: fn([], NUMBER, 0),
    resetWaterColor: fn([], BOOLEAN, 0),
    resetWaterLevel: fn([], BOOLEAN, 0),
    setWaterColor: fn([NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    setWaterLevel: fn([ANY, NUMBER, ANY, ANY], BOOLEAN, 1),
    setWaterVertexPosition: fn([named('Water'), NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setWaveHeight: fn([NUMBER], BOOLEAN, 1),
};
