import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_MARKER_CLIENT: ApiCatalog = {
    createMarker: fn([NUMBER, NUMBER, NUMBER, STRING, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], named('Marker'), 3),
    isCoronaReflectionEnabled: fn([named('Marker')], BOOLEAN, 1),
    setCoronaReflectionEnabled: fn([named('Marker'), BOOLEAN], BOOLEAN, 2),
};
