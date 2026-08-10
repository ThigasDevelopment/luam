import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_INPUT_SHARED: ApiCatalog = {
    addCommandHandler: fn([STRING, ANY, BOOLEAN, ANY], BOOLEAN, 2),
    bindKey: fn([ANY, ANY, ANY, ANY], BOOLEAN, 3, true),
    executeCommandHandler: fn([STRING, ANY, ANY], BOOLEAN, 1),
    getCommandHandlers: fn([named('Resource')], TABLE, 0),
    getFunctionsBoundToKey: fn([ANY, STRING, ANY], TABLE, 2),
    getKeyBoundToFunction: fn([ANY, ANY], STRING, 1),
    isControlEnabled: fn([ANY, ANY], BOOLEAN, 1),
    removeCommandHandler: fn([STRING, ANY], BOOLEAN, 1),
    toggleAllControls: fn([ANY, BOOLEAN, BOOLEAN, ANY], BOOLEAN, 1),
    toggleControl: fn([ANY, ANY, ANY], BOOLEAN, 2),
    unbindKey: fn([ANY, STRING, STRING, ANY], BOOLEAN, 1),
};
