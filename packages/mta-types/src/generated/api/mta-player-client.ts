import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_PLAYER_CLIENT: ApiCatalog = {
    forcePlayerMap: fn([BOOLEAN], BOOLEAN, 1),
    getBlurLevel: fn([], NUMBER, 0),
    getLocalPlayer: fn([], named('Player'), 0),
    getPlayerMapBoundingBox: fn([], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 0),
    getPlayerMapOpacity: fn([], NUMBER, 0),
    getPlayerMoney: fn([], NUMBER, 0),
    getPlayerWantedLevel: fn([], NUMBER, 0),
    givePlayerMoney: fn([NUMBER], BOOLEAN, 1),
    isPlayerHudComponentVisible: fn([STRING], BOOLEAN, 1),
    isPlayerMapForced: fn([], BOOLEAN, 0),
    isPlayerMapVisible: fn([], BOOLEAN, 0),
    setBlurLevel: fn([NUMBER], BOOLEAN, 1),
    setPlayerHudComponentVisible: fn([STRING, BOOLEAN], BOOLEAN, 2),
    setPlayerMoney: fn([NUMBER, BOOLEAN], BOOLEAN, 1),
    takePlayerMoney: fn([NUMBER], BOOLEAN, 1),
};
