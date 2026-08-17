import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE, unionOf } from '@mta-types/type-descriptor';

export const MTA_SQL_SERVER: ApiCatalog = {
    dbConnect: fn([STRING, STRING, STRING, STRING, STRING], named('Connection'), 2),
    dbExec: fn([named('Connection'), STRING, ANY], BOOLEAN, 2, true, undefined),
    dbFree: fn([ANY], BOOLEAN, 1),
    dbPoll: fn([ANY, NUMBER, BOOLEAN], TABLE, 2),
    dbPrepareString: fn([named('Connection'), STRING, ANY], STRING, 2, true, undefined),
    dbQuery: fn([unionOf([fn([], ANY, 0, true, undefined), named('Connection')]), ANY, ANY, ANY, ANY], ANY, 2, true, undefined),
    executeSQLQuery: fn([STRING, ANY], TABLE, 1, true, undefined),
};
