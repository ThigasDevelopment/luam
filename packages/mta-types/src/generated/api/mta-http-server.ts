import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_HTTP_SERVER: ApiCatalog = {
    httpClear: fn([], BOOLEAN, 0),
    httpRequestLogin: fn([], BOOLEAN, 0),
    httpSetResponseCode: fn([NUMBER], BOOLEAN, 1),
    httpSetResponseCookie: fn([STRING, STRING], BOOLEAN, 2),
    httpSetResponseHeader: fn([STRING, STRING], BOOLEAN, 2),
    httpWrite: fn([STRING, NUMBER], BOOLEAN, 1),
};
