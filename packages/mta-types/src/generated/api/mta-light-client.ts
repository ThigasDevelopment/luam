import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_LIGHT_CLIENT: ApiCatalog = {
    createLight: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], named('Light'), 4),
    getLightColor: fn([named('Light')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getLightDirection: fn([named('Light')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getLightRadius: fn([named('Light')], NUMBER, 1),
    getLightType: fn([named('Light')], NUMBER, 1),
    setLightColor: fn([named('Light'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setLightDirection: fn([named('Light'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setLightRadius: fn([named('Light'), NUMBER], BOOLEAN, 2),
};
