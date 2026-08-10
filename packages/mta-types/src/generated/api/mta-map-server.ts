import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named } from '@mta-types/type-descriptor';

export const MTA_MAP_SERVER: ApiCatalog = {
    loadMapData: fn([named('XmlNode'), named('Element')], named('Element'), 2),
    resetMapInfo: fn([named('Player')], BOOLEAN, 0),
    saveMapData: fn([named('XmlNode'), named('Element'), BOOLEAN], BOOLEAN, 2),
};
