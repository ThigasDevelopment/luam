import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE, unionOf, VOID } from '@mta-types/type-descriptor';

export const MTA_RESOURCE_SHARED: ApiCatalog = {
    abortRemoteRequest: fn([ANY], BOOLEAN, 1),
    call: fn([named('Resource'), STRING], ANY, 2, true, undefined),
    fetchRemote: fn(
        [
            STRING,
            unionOf([STRING, fn([STRING, NUMBER], VOID, 2, true, ['responseData', 'error'], TABLE)]),
            ANY,
            ANY,
            unionOf([fn([STRING, NUMBER], VOID, 2, true, ['responseData', 'error'], TABLE), ANY]),
            ANY,
            ANY,
        ],
        BOOLEAN,
        2,
        true,
    ),
    getRemoteRequestInfo: fn([ANY, NUMBER, BOOLEAN], TABLE, 1),
    getRemoteRequests: fn([named('Resource')], TABLE, 0),
    getResourceConfig: fn([STRING], named('XmlNode'), 1),
    getResourceDynamicElementRoot: fn([named('Resource')], named('Element'), 1),
    getResourceExportedFunctions: fn([named('Resource')], TABLE, 0),
    getResourceFromName: fn([STRING], named('Resource'), 1),
    getResourceName: fn([named('Resource')], STRING, 1),
    getResourceRootElement: fn([named('Resource')], named('Element'), 0),
    getResourceState: fn([named('Resource')], STRING, 1),
    getThisResource: fn([], named('Resource'), 0),
};
