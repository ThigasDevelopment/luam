import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, tupleOf, unionOf } from '@mta-types/type-descriptor';

export const MTA_OBJECT_SHARED: ApiCatalog = {
    breakObject: fn([named('Object')], BOOLEAN, 1),
    createObject: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], named('Object'), 4),
    getObjectScale: fn([named('Object')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    isObjectBreakable: fn([unionOf([named('Object'), NUMBER])], BOOLEAN, 1),
    isObjectMoving: fn([named('Object')], BOOLEAN, 1),
    isObjectRespawnable: fn([named('Object')], BOOLEAN, 1),
    moveObject: fn([named('Object'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, STRING, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    respawnObject: fn([named('Object')], BOOLEAN, 1),
    setObjectBreakable: fn([named('Object'), BOOLEAN], BOOLEAN, 2),
    setObjectScale: fn([named('Object'), NUMBER, NUMBER, NUMBER], BOOLEAN, 2),
    stopObject: fn([named('Object')], BOOLEAN, 1),
    toggleObjectRespawn: fn([named('Object'), BOOLEAN], BOOLEAN, 2),
};
