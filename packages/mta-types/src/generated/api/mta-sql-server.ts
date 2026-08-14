import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_SQL_SERVER: ApiCatalog = {
    dbConnect: fn([STRING, STRING, STRING, STRING, STRING], named('Connection'), 2),
    dbExec: fn([named('Connection'), STRING, ANY], BOOLEAN, 2, true),
    dbFree: fn([ANY], BOOLEAN, 1),
    dbPoll: fn([ANY, NUMBER, BOOLEAN], TABLE, 2),
    dbPrepareString: fn([named('Connection'), STRING, ANY], STRING, 2, true),
    dbQuery: fn([ANY, ANY, ANY, ANY, ANY], ANY, 2, true),
    executeSQLQuery: fn([STRING, ANY], TABLE, 1, true),
};
