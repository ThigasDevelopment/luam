import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_BLIP_SHARED: ApiCatalog = {
    createBlip: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, ANY], named('Blip'), 3),
    createBlipAttachedTo: fn([named('Element'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, ANY], named('Blip'), 1),
    getBlipColor: fn([named('Blip')], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    getBlipIcon: fn([named('Blip')], NUMBER, 1),
    getBlipOrdering: fn([named('Blip')], NUMBER, 1),
    getBlipSize: fn([named('Blip')], NUMBER, 1),
    getBlipVisibleDistance: fn([named('Blip')], NUMBER, 1),
    setBlipColor: fn([named('Blip'), NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setBlipIcon: fn([named('Blip'), NUMBER], BOOLEAN, 2),
    setBlipOrdering: fn([named('Blip'), NUMBER], BOOLEAN, 2),
    setBlipSize: fn([named('Blip'), NUMBER], BOOLEAN, 2),
    setBlipVisibleDistance: fn([named('Blip'), NUMBER], BOOLEAN, 2),
};
