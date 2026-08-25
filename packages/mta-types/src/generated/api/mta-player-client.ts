import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_PLAYER_CLIENT: ApiCatalog = {
    forcePlayerMap: fn([BOOLEAN], BOOLEAN, 1),
    getBlurLevel: fn([], NUMBER, 0),
    getLocalPlayer: fn([], named('Player'), 0),
    getPlayerHudComponentProperty: fn([STRING, STRING], ANY, 2),
    getPlayerMapBoundingBox: fn([], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 0),
    getPlayerMapOpacity: fn([], NUMBER, 0),
    getPlayerMoney: fn([], NUMBER, 0),
    getPlayerScriptDebugLevel: fn([], NUMBER, 0),
    getPlayerSerial: fn([], STRING, 0),
    getPlayerWantedLevel: fn([], NUMBER, 0),
    givePlayerMoney: fn([NUMBER], BOOLEAN, 1),
    isPlayerCrosshairVisible: fn([], BOOLEAN, 0),
    isPlayerHudComponentVisible: fn([STRING], BOOLEAN, 1),
    isPlayerMapForced: fn([], BOOLEAN, 0),
    isPlayerMapVisible: fn([], BOOLEAN, 0),
    resetPlayerHudComponentProperty: fn([STRING, STRING], BOOLEAN, 2),
    setBlurLevel: fn([NUMBER], BOOLEAN, 1),
    setPlayerHudComponentProperty: fn([STRING, STRING, ANY], BOOLEAN, 3),
    setPlayerHudComponentVisible: fn([STRING, BOOLEAN], BOOLEAN, 2),
    setPlayerMoney: fn([NUMBER, BOOLEAN], BOOLEAN, 1),
    takePlayerMoney: fn([NUMBER], BOOLEAN, 1),
};
