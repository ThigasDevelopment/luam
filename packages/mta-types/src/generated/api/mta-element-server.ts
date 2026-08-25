import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, literal, named, NUMBER, STRING, TABLE, unionOf } from '@mta-types/type-descriptor';

export const MTA_ELEMENT_SERVER: ApiCatalog = {
    addElementDataSubscriber: fn([named('Element'), STRING, named('Player')], BOOLEAN, 3),
    clearElementVisibleTo: fn([named('Element')], BOOLEAN, 1),
    cloneElement: fn([named('Element'), NUMBER, NUMBER, NUMBER, BOOLEAN], named('Element'), 1),
    getElementsByType: fn([STRING, named('Element')], TABLE, 1),
    getElementSyncer: fn([named('Element')], named('Element'), 1),
    getElementZoneName: fn([named('Element'), BOOLEAN], STRING, 1),
    hasElementDataSubscriber: fn([named('Element'), STRING, named('Player')], BOOLEAN, 3),
    isElementVisibleTo: fn([named('Element'), named('Element')], BOOLEAN, 2),
    removeElementData: fn([named('Element'), STRING], BOOLEAN, 2),
    removeElementDataSubscriber: fn([named('Element'), STRING, named('Player')], BOOLEAN, 3),
    setElementData: fn(
        [
            named('Element'),
            STRING,
            ANY,
            unionOf([literal('broadcast'), literal('local'), literal('subscribe')]),
            unionOf([literal('default'), literal('allow'), literal('deny')]),
        ],
        BOOLEAN,
        3,
    ),
    setElementSyncer: fn([named('Element'), named('Player'), BOOLEAN], BOOLEAN, 2),
    setElementVisibleTo: fn([named('Element'), named('Element'), BOOLEAN], BOOLEAN, 3),
};
