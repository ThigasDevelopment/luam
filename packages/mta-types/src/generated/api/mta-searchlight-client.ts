import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_SEARCHLIGHT_CLIENT: ApiCatalog = {
    createSearchLight: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], named('Searchlight'), 8),
    getSearchLightEndPosition: fn([named('Searchlight')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getSearchLightEndRadius: fn([named('Searchlight')], NUMBER, 1),
    getSearchLightStartPosition: fn([named('Searchlight')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getSearchLightStartRadius: fn([named('Searchlight')], NUMBER, 1),
    setSearchLightEndPosition: fn([named('Searchlight'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setSearchLightEndRadius: fn([named('Searchlight'), NUMBER], BOOLEAN, 2),
    setSearchLightStartPosition: fn([named('Searchlight'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setSearchLightStartRadius: fn([named('Searchlight'), NUMBER], BOOLEAN, 2),
};
