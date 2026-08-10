import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_OBJECT_SHARED: ApiCatalog = {
    createObject: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], named('Object'), 4),
    getObjectScale: fn([named('Object')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    moveObject: fn([named('Object'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, STRING, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setObjectScale: fn([named('Object'), NUMBER, NUMBER, NUMBER], BOOLEAN, 2),
    stopObject: fn([named('Object')], BOOLEAN, 1),
};
