import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_INPUT_CLIENT: ApiCatalog = {
    getAnalogControlState: fn([STRING, BOOLEAN], NUMBER, 1),
    getBoundKeys: fn([STRING], TABLE, 1),
    getCommandsBoundToKey: fn([STRING, STRING], TABLE, 2),
    getKeyBoundToCommand: fn([STRING], STRING, 1),
    getKeyState: fn([STRING], BOOLEAN, 1),
    isCapsLockEnabled: fn([], BOOLEAN, 0),
};
