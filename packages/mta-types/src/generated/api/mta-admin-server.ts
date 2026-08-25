import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, TABLE, unionOf } from '@mta-types/type-descriptor';

export const MTA_ADMIN_SERVER: ApiCatalog = {
    addBan: fn([STRING, STRING, STRING, named('Player'), STRING, NUMBER], named('Ban'), 3),
    banPlayer: fn([named('Player'), BOOLEAN, BOOLEAN, BOOLEAN, unionOf([named('Player'), STRING]), STRING, NUMBER], named('Ban'), 1),
    getBanAdmin: fn([named('Ban')], STRING, 1),
    getBanIP: fn([named('Ban')], STRING, 1),
    getBanNick: fn([named('Ban')], STRING, 1),
    getBanReason: fn([named('Ban')], STRING, 1),
    getBans: fn([], TABLE, 0),
    getBanSerial: fn([named('Ban')], STRING, 1),
    getBanTime: fn([named('Ban')], NUMBER, 1),
    getBanUsername: fn([named('Ban')], STRING, 1),
    getUnbanTime: fn([named('Ban')], NUMBER, 1),
    isBan: fn([named('Ban')], BOOLEAN, 1),
    kickPlayer: fn([named('Player'), unionOf([named('Player'), STRING]), STRING], BOOLEAN, 1),
    reloadBans: fn([], BOOLEAN, 0),
    removeBan: fn([named('Ban'), named('Player')], BOOLEAN, 1),
    setBanAdmin: fn([named('Ban'), STRING], BOOLEAN, 2),
    setBanNick: fn([named('Ban'), STRING], BOOLEAN, 2),
    setBanReason: fn([named('Ban'), STRING], BOOLEAN, 2),
    setUnbanTime: fn([named('Ban'), NUMBER], BOOLEAN, 2),
};
