import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, literal, named, NUMBER, STRING, tupleOf, unionOf } from '@mta-types/type-descriptor';

export const MTA_MARKER_SHARED: ApiCatalog = {
    createMarker: fn(
        [
            NUMBER,
            NUMBER,
            NUMBER,
            unionOf([literal('checkpoint'), literal('ring'), literal('cylinder'), literal('arrow'), literal('corona')]),
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            ANY,
            ANY,
        ],
        named('Marker'),
        3,
    ),
    getMarkerColor: fn([named('Marker')], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    getMarkerCount: fn([], NUMBER, 0),
    getMarkerIcon: fn([named('Marker')], STRING, 1),
    getMarkerSize: fn([named('Marker')], NUMBER, 1),
    getMarkerTarget: fn([named('Marker')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getMarkerTargetArrowProperties: fn([named('Marker')], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    getMarkerType: fn([named('Marker')], STRING, 1),
    setMarkerColor: fn([named('Marker'), NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setMarkerIcon: fn([named('Marker'), unionOf([literal('none'), literal('arrow')])], BOOLEAN, 2),
    setMarkerSize: fn([named('Marker'), NUMBER], BOOLEAN, 2),
    setMarkerTarget: fn([named('Marker'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setMarkerTargetArrowProperties: fn([named('Element'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 1),
    setMarkerType: fn([named('Marker'), STRING], BOOLEAN, 2),
};
