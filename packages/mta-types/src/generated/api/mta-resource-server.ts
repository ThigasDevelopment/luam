import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_RESOURCE_SERVER: ApiCatalog = {
    addResourceConfig: fn([STRING, STRING], named('XmlNode'), 1),
    addResourceMap: fn([STRING, NUMBER], named('XmlNode'), 1),
    callRemote: fn([STRING, STRING, ANY, ANY, ANY, ANY, ANY], BOOLEAN, 4, true),
    copyResource: fn([named('Resource'), STRING, STRING], named('Resource'), 2),
    createResource: fn([STRING, STRING], named('Resource'), 1),
    deleteResource: fn([STRING], BOOLEAN, 1),
    getResourceACLRequests: fn([named('Resource')], TABLE, 1),
    getResourceInfo: fn([named('Resource'), STRING], STRING, 2),
    getResourceLastStartTime: fn([named('Resource')], NUMBER, 1),
    getResourceLoadFailureReason: fn([named('Resource')], STRING, 1),
    getResourceLoadTime: fn([named('Resource')], NUMBER, 1),
    getResourceMapRootElement: fn([named('Resource'), STRING], named('Element'), 2),
    getResourceOrganizationalPath: fn([named('Resource')], STRING, 1),
    getResources: fn([], TABLE, 0),
    isResourceArchived: fn([named('Resource')], BOOLEAN, 1),
    isResourceProtected: fn([named('Resource')], BOOLEAN, 1),
    refreshResources: fn([BOOLEAN, named('Resource')], BOOLEAN, 0),
    removeResourceFile: fn([named('Resource'), STRING], BOOLEAN, 2),
    renameResource: fn([ANY, STRING, STRING], BOOLEAN, 2),
    restartResource: fn([named('Resource'), BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN], BOOLEAN, 1),
    setResourceInfo: fn([named('Resource'), STRING, STRING], BOOLEAN, 3),
    startResource: fn([named('Resource'), BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN], BOOLEAN, 1),
    stopResource: fn([named('Resource')], BOOLEAN, 1),
    updateResourceACLRequest: fn([named('Resource'), STRING, BOOLEAN, STRING], BOOLEAN, 3),
};
