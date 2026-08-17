import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, STRING, TABLE, VOID } from '@mta-types/type-descriptor';

export const MTA_INPUT_SERVER: ApiCatalog = {
    addCommandHandler: fn(
        [STRING, fn([named('Player'), STRING], VOID, 2, true, ['playerSource', 'commandName'], STRING), BOOLEAN, BOOLEAN],
        BOOLEAN,
        2,
    ),
    bindKey: fn(
        [named('Player'), STRING, STRING, fn([named('Player'), STRING, STRING], VOID, 3, true, ['keyPresser', 'key', 'keyState'], ANY)],
        BOOLEAN,
        4,
        true,
    ),
    executeCommandHandler: fn([STRING, named('Player'), STRING], BOOLEAN, 2),
    getControlState: fn([named('Player'), STRING], BOOLEAN, 2),
    getFunctionsBoundToKey: fn([named('Player'), STRING, STRING], TABLE, 3),
    getKeyBoundToFunction: fn([named('Player'), fn([], ANY, 0, true, [], ANY)], STRING, 2),
    isControlEnabled: fn([named('Player'), STRING], BOOLEAN, 2),
    isKeyBound: fn([named('Player'), STRING, STRING, fn([], ANY, 0, true, [], ANY)], BOOLEAN, 2),
    removeCommandHandler: fn([STRING, fn([named('Player'), STRING], VOID, 2, true, ['playerSource', 'commandName'], STRING)], BOOLEAN, 1),
    setControlState: fn([named('Player'), STRING, BOOLEAN], BOOLEAN, 3),
    toggleAllControls: fn([named('Player'), BOOLEAN, BOOLEAN, BOOLEAN], BOOLEAN, 2),
    toggleControl: fn([named('Player'), STRING, BOOLEAN], BOOLEAN, 3),
};
