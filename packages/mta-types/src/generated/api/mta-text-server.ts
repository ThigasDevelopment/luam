import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE, tupleOf, VOID } from '@mta-types/type-descriptor';

export const MTA_TEXT_SERVER: ApiCatalog = {
    textCreateDisplay: fn([], ANY, 0),
    textCreateTextItem: fn([STRING, NUMBER, NUMBER, STRING, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, STRING, STRING, NUMBER], ANY, 3),
    textDestroyDisplay: fn([ANY], BOOLEAN, 1),
    textDestroyTextItem: fn([ANY], VOID, 1),
    textDisplayAddObserver: fn([ANY, named('Player')], VOID, 2),
    textDisplayAddText: fn([ANY, ANY], VOID, 2),
    textDisplayGetObservers: fn([ANY], TABLE, 1),
    textDisplayIsObserver: fn([ANY, named('Player')], BOOLEAN, 2),
    textDisplayRemoveObserver: fn([ANY, named('Player')], BOOLEAN, 2),
    textDisplayRemoveText: fn([ANY, ANY], VOID, 2),
    textItemGetColor: fn([ANY], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    textItemGetPosition: fn([ANY], tupleOf([NUMBER, NUMBER]), 1),
    textItemGetPriority: fn([ANY], NUMBER, 1),
    textItemGetScale: fn([ANY], NUMBER, 1),
    textItemGetText: fn([ANY], STRING, 1),
    textItemSetColor: fn([ANY, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 5),
    textItemSetPosition: fn([ANY, NUMBER, NUMBER], BOOLEAN, 3),
    textItemSetPriority: fn([ANY, STRING], VOID, 2),
    textItemSetScale: fn([ANY, NUMBER], BOOLEAN, 2),
    textItemSetText: fn([ANY, STRING], VOID, 2),
};
