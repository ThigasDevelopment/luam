import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, STRING } from '@mta-types/type-descriptor';

export const MTA_ANNOUNCEMENT_SERVER: ApiCatalog = {
    getGameType: fn([], STRING, 0),
    getMapName: fn([], STRING, 0),
    getRuleValue: fn([STRING], STRING, 1),
    removeRuleValue: fn([STRING], BOOLEAN, 1),
    setGameType: fn([STRING], BOOLEAN, 1),
    setMapName: fn([STRING], BOOLEAN, 1),
    setRuleValue: fn([STRING, STRING], BOOLEAN, 2),
};
