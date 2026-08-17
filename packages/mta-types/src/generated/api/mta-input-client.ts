import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, NUMBER, STRING, TABLE, VOID } from '@mta-types/type-descriptor';

export const MTA_INPUT_CLIENT: ApiCatalog = {
    addCommandHandler: fn([STRING, fn([STRING], VOID, 1, true, ['commandName'], STRING), BOOLEAN], BOOLEAN, 2),
    bindKey: fn([STRING, STRING, fn([STRING, STRING], VOID, 2, true, ['key', 'keyState'], ANY)], BOOLEAN, 3, true, undefined),
    executeCommandHandler: fn([STRING, STRING], BOOLEAN, 1),
    getAnalogControlState: fn([STRING, BOOLEAN], NUMBER, 1),
    getBoundKeys: fn([STRING], TABLE, 1),
    getCommandsBoundToKey: fn([STRING, STRING], TABLE, 2),
    getFunctionsBoundToKey: fn([STRING, STRING], TABLE, 2),
    getKeyBoundToCommand: fn([STRING], STRING, 1),
    getKeyBoundToFunction: fn([fn([], ANY, 0, true, [], ANY)], STRING, 1),
    getKeyState: fn([STRING], BOOLEAN, 1),
    isCapsLockEnabled: fn([], BOOLEAN, 0),
    isControlEnabled: fn([STRING], BOOLEAN, 1),
    removeCommandHandler: fn([STRING, fn([STRING], VOID, 1, true, ['commandName'], STRING)], BOOLEAN, 1),
    toggleAllControls: fn([BOOLEAN, BOOLEAN, BOOLEAN], BOOLEAN, 1),
    toggleControl: fn([STRING, BOOLEAN], BOOLEAN, 2),
};
