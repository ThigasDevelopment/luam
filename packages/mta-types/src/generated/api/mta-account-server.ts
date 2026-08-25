import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_ACCOUNT_SERVER: ApiCatalog = {
    addAccount: fn([STRING, STRING, BOOLEAN], named('Account'), 2),
    copyAccountData: fn([named('Account'), named('Account')], BOOLEAN, 2),
    getAccount: fn([STRING, STRING, BOOLEAN], named('Account'), 1),
    getAccountByID: fn([NUMBER], named('Account'), 1),
    getAccountData: fn([named('Account'), STRING], STRING, 2),
    getAccountID: fn([named('Account')], NUMBER, 1),
    getAccountIP: fn([named('Account')], STRING, 1),
    getAccountName: fn([named('Account')], STRING, 1),
    getAccountPlayer: fn([named('Account')], named('Player'), 1),
    getAccounts: fn([], TABLE, 0),
    getAccountsByData: fn([STRING, STRING], TABLE, 2),
    getAccountsByIP: fn([STRING], TABLE, 1),
    getAccountsBySerial: fn([STRING], TABLE, 1),
    getAccountSerial: fn([named('Account')], STRING, 1),
    getAccountType: fn([named('Account')], STRING, 1),
    getAllAccountData: fn([named('Account')], TABLE, 1),
    getPlayerAccount: fn([named('Player')], named('Account'), 1),
    isGuestAccount: fn([named('Account')], BOOLEAN, 1),
    logIn: fn([named('Player'), named('Account'), STRING], BOOLEAN, 3),
    logOut: fn([named('Player')], BOOLEAN, 1),
    removeAccount: fn([named('Account')], BOOLEAN, 1),
    setAccountData: fn([named('Account'), STRING, ANY], BOOLEAN, 3),
    setAccountName: fn([named('Account'), STRING, BOOLEAN], BOOLEAN, 2),
    setAccountPassword: fn([named('Account'), STRING], BOOLEAN, 2),
};
