import { ANY, BOOLEAN, fn, named, NUMBER, STRING, VOID } from '@mta-types/type-descriptor';

import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES_CLIENT_4: Readonly<Record<string, FunctionDescriptor>> = {
    onClientMouseLeave: fn(
        [
            NUMBER,
            NUMBER,
            named('Element'),
        ],
        VOID,
        3,
        false,
        [
            'absoluteX',
            'absoluteY',
            'enteredGUI',
        ],
    ),
    onClientMouseMove: fn(
        [
            NUMBER,
            NUMBER,
        ],
        VOID,
        2,
        false,
        [
            'absoluteX',
            'absoluteY',
        ],
    ),
    onClientMouseWheel: fn(
        [
            NUMBER,
        ],
        VOID,
        1,
        false,
        [
            'upOrDown',
        ],
    ),
    onClientMTAFocusChange: fn(
        [
            BOOLEAN,
        ],
        VOID,
        1,
        false,
        [
            'windowFocused',
        ],
    ),
    onClientObjectBreak: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'attacker',
        ],
    ),
    onClientObjectDamage: fn(
        [
            NUMBER,
            named('Element'),
        ],
        VOID,
        2,
        false,
        [
            'loss',
            'attacker',
        ],
    ),
    onClientObjectMoveStart: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientObjectMoveStop: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientPaste: fn(
        [
            STRING,
        ],
        VOID,
        1,
        false,
        [
            'clipboardText',
        ],
    ),
    onClientPedChoke: fn(
        [
            NUMBER,
            named('Ped'),
        ],
        VOID,
        2,
        false,
        [
            'weaponID',
            'responsiblePed',
        ],
    ),
    onClientPedDamage: fn(
        [
            named('Element'),
            NUMBER,
            NUMBER,
            NUMBER,
        ],
        VOID,
        3,
        false,
        [
            'attacker',
            'weapon',
            'bodypart',
            'loss',
        ],
    ),
    onClientPedHeliKilled: fn(
        [
            named('Vehicle'),
        ],
        VOID,
        1,
        false,
        [
            'killer',
        ],
    ),
    onClientPedHitByWaterCannon: fn(
        [
            named('Ped'),
        ],
        VOID,
        1,
        false,
        [
            'pedHit',
        ],
    ),
    onClientPedsProcessed: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientPedStep: fn(
        [
            BOOLEAN,
        ],
        VOID,
        1,
        false,
        [
            'leftFoot',
        ],
    ),
    onClientPedVehicleEnter: fn(
        [
            named('Vehicle'),
            NUMBER,
        ],
        VOID,
        2,
        false,
        [
            'theVehicle',
            'seat',
        ],
    ),
    onClientPedVehicleExit: fn(
        [
            named('Vehicle'),
            NUMBER,
        ],
        VOID,
        2,
        false,
        [
            'theVehicle',
            'seat',
        ],
    ),
    onClientPedWasted: fn(
        [
            named('Element'),
            NUMBER,
            NUMBER,
            ANY,
        ],
        VOID,
        4,
        false,
        [
            'killer',
            'weapon',
            'bodypart',
            'lossOrStealth',
        ],
    ),
};
