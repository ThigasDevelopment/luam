import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_OUTPUT_SHARED: ApiCatalog = {
    clearChatBox: fn([ANY], BOOLEAN, 0),
    outputChatBox: fn([STRING, ANY, NUMBER, NUMBER, ANY, ANY], BOOLEAN, 1),
    outputConsole: fn([STRING, ANY], BOOLEAN, 1),
    outputDebugString: fn([STRING, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 1),
    showChat: fn([ANY, BOOLEAN, ANY], BOOLEAN, 1),
};
