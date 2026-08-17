import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_MARKER_SERVER: ApiCatalog = {
    createMarker: fn([NUMBER, NUMBER, NUMBER, STRING, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, named('Element')], named('Marker'), 3),
};
