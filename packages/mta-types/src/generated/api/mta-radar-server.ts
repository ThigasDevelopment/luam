import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_RADAR_SERVER: ApiCatalog = {
    createRadarArea: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, named('Element')], named('RadarArea'), 4),
};
