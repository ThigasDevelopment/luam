import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_RESOURCE_SHARED: ApiCatalog = {
    abortRemoteRequest: fn([ANY], BOOLEAN, 1),
    call: fn([named('Resource'), STRING], ANY, 2, true, undefined),
    fetchRemote: fn([STRING, TABLE, fn([], ANY, 0, true, undefined), TABLE], BOOLEAN, 2),
    getRemoteRequestInfo: fn([ANY, NUMBER, BOOLEAN], TABLE, 1),
    getRemoteRequests: fn([named('Resource')], TABLE, 0),
    getResourceConfig: fn([STRING], named('XmlNode'), 1),
    getResourceDynamicElementRoot: fn([named('Resource')], named('Element'), 1),
    getResourceExportedFunctions: fn([named('Resource')], TABLE, 0),
    getResourceFromName: fn([STRING], named('Resource'), 1),
    getResourceName: fn([named('Resource')], STRING, 0),
    getResourceRootElement: fn([named('Resource')], named('Element'), 0),
    getResourceState: fn([named('Resource')], STRING, 1),
    getThisResource: fn([], named('Resource'), 0),
};
