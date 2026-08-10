import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_ELEMENT_SERVER: ApiCatalog = {
    addElementDataSubscriber: fn([named('Element'), STRING, named('Player')], BOOLEAN, 3),
    clearElementVisibleTo: fn([named('Element')], BOOLEAN, 1),
    cloneElement: fn([named('Element'), NUMBER, NUMBER, NUMBER, BOOLEAN], named('Element'), 1),
    getAllElementData: fn([named('Element')], TABLE, 1),
    getElementByIndex: fn([STRING, NUMBER], named('Element'), 2),
    getElementSyncer: fn([named('Element')], named('Element'), 1),
    getElementZoneName: fn([named('Element'), BOOLEAN], STRING, 1),
    hasElementDataSubscriber: fn([named('Element'), STRING, named('Player')], BOOLEAN, 3),
    isElementVisibleTo: fn([named('Element'), named('Element')], BOOLEAN, 2),
    removeElementData: fn([named('Element'), STRING], BOOLEAN, 2),
    removeElementDataSubscriber: fn([named('Element'), STRING, named('Player')], BOOLEAN, 3),
    setElementSyncer: fn([named('Element'), named('Player')], BOOLEAN, 2),
    setElementVisibleTo: fn([named('Element'), named('Element'), BOOLEAN], BOOLEAN, 3),
};
