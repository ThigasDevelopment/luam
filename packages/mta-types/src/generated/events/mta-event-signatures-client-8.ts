import { fn, named, NUMBER, VOID } from '@mta-types/type-descriptor';

import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES_CLIENT_8: Readonly<Record<string, FunctionDescriptor>> = {
    onClientVehicleWeaponHit: fn(
        [
            NUMBER,
            named('Element'),
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
        ],
        VOID,
        7,
        false,
        [
            'weaponType',
            'hitElement',
            'hitX',
            'hitY',
            'hitZ',
            'model',
            'materialID',
        ],
    ),
    onClientWeaponFire: fn(
        [
            named('Element'),
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
        ],
        VOID,
        10,
        false,
        [
            'hitElement',
            'posX',
            'posY',
            'posZ',
            'normalX',
            'normalY',
            'normalZ',
            'materialType',
            'lighting',
            'pieceHit',
        ],
    ),
    onClientWorldSound: fn(
        [
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
        ],
        VOID,
        5,
        false,
        [
            'group',
            'index',
            'x',
            'y',
            'z',
        ],
    ),
};
