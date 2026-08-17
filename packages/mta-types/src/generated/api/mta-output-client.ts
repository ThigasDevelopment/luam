import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_OUTPUT_CLIENT: ApiCatalog = {
    clearChatBox: fn([], BOOLEAN, 0),
    clearDebugBox: fn([], BOOLEAN, 0),
    isChatInputBlocked: fn([], BOOLEAN, 0),
    isChatVisible: fn([], BOOLEAN, 0),
    outputChatBox: fn([STRING, NUMBER, NUMBER, NUMBER, BOOLEAN], BOOLEAN, 1),
    outputConsole: fn([STRING], BOOLEAN, 1),
    showChat: fn([BOOLEAN, BOOLEAN], BOOLEAN, 1),
};
