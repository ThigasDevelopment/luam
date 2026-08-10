import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_MARKER_SHARED: ApiCatalog = {
    createMarker: fn([NUMBER, NUMBER, NUMBER, STRING, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, ANY], named('Marker'), 3),
    getMarkerColor: fn([named('Marker')], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    getMarkerCount: fn([], NUMBER, 0),
    getMarkerIcon: fn([named('Marker')], STRING, 1),
    getMarkerSize: fn([named('Marker')], NUMBER, 1),
    getMarkerTarget: fn([named('Marker')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getMarkerType: fn([named('Marker')], STRING, 1),
    setMarkerColor: fn([named('Marker'), NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setMarkerIcon: fn([named('Marker'), STRING], BOOLEAN, 2),
    setMarkerSize: fn([named('Marker'), NUMBER], BOOLEAN, 2),
    setMarkerTarget: fn([named('Marker'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setMarkerType: fn([named('Marker'), STRING], BOOLEAN, 2),
};
