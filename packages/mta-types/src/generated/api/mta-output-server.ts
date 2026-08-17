import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_OUTPUT_SERVER: ApiCatalog = {
    clearChatBox: fn([named('Element')], BOOLEAN, 0),
    outputChatBox: fn([STRING, ANY, NUMBER, NUMBER, NUMBER, BOOLEAN], BOOLEAN, 1),
    outputConsole: fn([STRING, named('Element')], BOOLEAN, 1),
    outputServerLog: fn([STRING], BOOLEAN, 1),
    showChat: fn([named('Player'), BOOLEAN, BOOLEAN], BOOLEAN, 2),
};
