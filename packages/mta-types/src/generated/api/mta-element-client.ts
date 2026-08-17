import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE, tupleOf } from '@mta-types/type-descriptor';

export const MTA_ELEMENT_CLIENT: ApiCatalog = {
    getElementBoneMatrix: fn([named('Element'), NUMBER], TABLE, 2),
    getElementBonePosition: fn([named('Element'), NUMBER], tupleOf([NUMBER, NUMBER, NUMBER]), 2),
    getElementBoneRotation: fn([named('Element'), NUMBER], tupleOf([NUMBER, NUMBER, NUMBER]), 2),
    getElementBoundingBox: fn([named('Element')], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    getElementDistanceFromCentreOfMassToBaseOfModel: fn([named('Element')], NUMBER, 1),
    getElementLighting: fn([named('Element')], NUMBER, 1),
    getElementRadius: fn([named('Element')], NUMBER, 1),
    getElementsByType: fn([STRING, named('Element'), BOOLEAN], TABLE, 1),
    isElementCollidableWith: fn([named('Element'), named('Element')], BOOLEAN, 2),
    isElementLocal: fn([named('Element')], BOOLEAN, 1),
    isElementOnScreen: fn([named('Element')], BOOLEAN, 1),
    isElementStreamable: fn([named('Element')], BOOLEAN, 1),
    isElementStreamedIn: fn([named('Element')], BOOLEAN, 1),
    isElementSyncer: fn([named('Element')], BOOLEAN, 1),
    isElementWaitingForGroundToLoad: fn([named('Element')], BOOLEAN, 1),
    setElementBoneMatrix: fn([named('Element'), NUMBER, TABLE], BOOLEAN, 3),
    setElementBonePosition: fn([named('Element'), NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setElementBoneRotation: fn([named('Element'), NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setElementCollidableWith: fn([named('Element'), named('Element'), BOOLEAN], BOOLEAN, 3),
    setElementData: fn([named('Element'), STRING, ANY, BOOLEAN], BOOLEAN, 3),
    setElementStreamable: fn([named('Element'), BOOLEAN], BOOLEAN, 2),
    updateElementRpHAnim: fn([named('Element')], BOOLEAN, 1),
};
