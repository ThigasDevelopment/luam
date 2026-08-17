import { BOOLEAN, fn, named, NUMBER, STRING, VOID } from '@mta-types/type-descriptor';

import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES_SERVER_5: Readonly<Record<string, FunctionDescriptor>> = {
    onResourceStop: fn(
        [
            named('Resource'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'stoppedResource',
            'wasDeleted',
        ],
    ),
    onSettingChange: fn(
        [
            STRING,
            STRING,
            STRING,
        ],
        VOID,
        3,
        false,
        [
            'setting',
            'oldValue',
            'newValue',
        ],
    ),
    onTrailerAttach: fn(
        [
            named('Vehicle'),
        ],
        VOID,
        1,
        false,
        [
            'theTruck',
        ],
    ),
    onTrailerDetach: fn(
        [
            named('Vehicle'),
        ],
        VOID,
        1,
        false,
        [
            'theTruck',
        ],
    ),
    onUnban: fn(
        [
            named('Ban'),
            named('Player'),
        ],
        VOID,
        2,
        false,
        [
            'theBan',
            'responsibleElement',
        ],
    ),
    onVehicleDamage: fn(
        [
            NUMBER,
        ],
        VOID,
        1,
        false,
        [
            'loss',
        ],
    ),
    onVehicleEnter: fn(
        [
            named('Ped'),
            NUMBER,
            named('Player'),
        ],
        VOID,
        3,
        false,
        [
            'thePed',
            'seat',
            'jacked',
        ],
    ),
    onVehicleExit: fn(
        [
            named('Ped'),
            NUMBER,
            named('Ped'),
            BOOLEAN,
        ],
        VOID,
        4,
        false,
        [
            'thePed',
            'seat',
            'jacker',
            'forcedByScript',
        ],
    ),
    onVehicleExplode: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onVehicleRespawn: fn(
        [
            BOOLEAN,
        ],
        VOID,
        1,
        false,
        [
            'exploded',
        ],
    ),
    onVehicleStartEnter: fn(
        [
            named('Ped'),
            NUMBER,
            named('Ped'),
        ],
        VOID,
        3,
        false,
        [
            'enteringPed',
            'seat',
            'jacked',
        ],
    ),
    onVehicleStartExit: fn(
        [
            named('Ped'),
            NUMBER,
            named('Ped'),
            NUMBER,
        ],
        VOID,
        4,
        false,
        [
            'exitingPed',
            'seat',
            'jacked',
            'door',
        ],
    ),
    onWeaponFire: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
};
