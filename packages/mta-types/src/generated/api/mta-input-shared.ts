import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, STRING, TABLE, unionOf, VOID } from '@mta-types/type-descriptor';

export const MTA_INPUT_SHARED: ApiCatalog = {
    addCommandHandler: fn([STRING, fn([ANY, ANY], VOID, 1, true, undefined), BOOLEAN, ANY], BOOLEAN, 2),
    bindKey: fn(
        [
            ANY,
            STRING,
            unionOf([STRING, fn([STRING, STRING], VOID, 2, true, ['key', 'keyState'], ANY)]),
            unionOf([fn([named('Player'), STRING, STRING], VOID, 3, true, ['keyPresser', 'key', 'keyState'], ANY), ANY]),
        ],
        BOOLEAN,
        3,
        true,
    ),
    executeCommandHandler: fn([STRING, ANY, ANY], BOOLEAN, 1),
    getCommandHandlers: fn([named('Resource')], TABLE, 0),
    getFunctionsBoundToKey: fn([ANY, STRING, ANY], TABLE, 2),
    getKeyBoundToFunction: fn([unionOf([named('Player'), fn([], ANY, 0, true, [], ANY)]), unionOf([fn([], ANY, 0, true, [], ANY), ANY])], STRING, 1),
    isControlEnabled: fn([ANY, ANY], BOOLEAN, 1),
    removeCommandHandler: fn([STRING, fn([ANY, ANY], VOID, 1, true, undefined)], BOOLEAN, 1),
    toggleAllControls: fn([ANY, BOOLEAN, BOOLEAN, ANY], BOOLEAN, 1),
    toggleControl: fn([ANY, ANY, ANY], BOOLEAN, 2),
    unbindKey: fn([ANY, STRING, STRING, ANY], BOOLEAN, 1),
};
