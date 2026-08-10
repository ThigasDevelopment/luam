import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_PLAYER_CLIENT: ApiCatalog = {
    getBlurLevel: fn([], NUMBER, 0),
    getLocalPlayer: fn([], named('Player'), 0),
    getPlayerMapBoundingBox: fn([], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 0),
    getPlayerMapOpacity: fn([], NUMBER, 0),
    isPlayerHudComponentVisible: fn([STRING], BOOLEAN, 1),
    isPlayerMapVisible: fn([], BOOLEAN, 0),
    setBlurLevel: fn([NUMBER], BOOLEAN, 1),
};
