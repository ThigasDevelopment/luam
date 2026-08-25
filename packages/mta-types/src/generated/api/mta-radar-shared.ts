import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_RADAR_SHARED: ApiCatalog = {
    createRadarArea: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, ANY], named('RadarArea'), 4),
    getRadarAreaColor: fn([named('RadarArea')], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    getRadarAreaSize: fn([named('RadarArea')], tupleOf([NUMBER, NUMBER]), 1),
    isInsideRadarArea: fn([named('RadarArea'), NUMBER, NUMBER], BOOLEAN, 3),
    isRadarAreaFlashing: fn([named('RadarArea')], BOOLEAN, 1),
    setRadarAreaColor: fn([named('RadarArea'), NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    setRadarAreaFlashing: fn([named('RadarArea'), BOOLEAN], BOOLEAN, 2),
    setRadarAreaSize: fn([named('RadarArea'), NUMBER, NUMBER], BOOLEAN, 3),
};
