import { BOOLEAN, fn, named, NUMBER, STRING, VOID } from '@mta-types/type-descriptor';

import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES_CLIENT_5: Readonly<Record<string, FunctionDescriptor>> = {
    onClientPedWeaponFire: fn(
        [
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            named('Element'),
        ],
        VOID,
        7,
        false,
        [
            'weapon',
            'ammo',
            'ammoInClip',
            'hitX',
            'hitY',
            'hitZ',
            'hitElement',
        ],
    ),
    onClientPickupHit: fn(
        [
            named('Player'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'thePlayer',
            'matchingDimension',
        ],
    ),
    onClientPickupLeave: fn(
        [
            named('Player'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'thePlayer',
            'matchingDimension',
        ],
    ),
    onClientPlayerChangeNick: fn(
        [
            STRING,
            STRING,
        ],
        VOID,
        2,
        false,
        [
            'oldNick',
            'newNick',
        ],
    ),
    onClientPlayerChoke: fn(
        [
            NUMBER,
        ],
        VOID,
        1,
        false,
        [
            'weaponID',
        ],
    ),
    onClientPlayerDamage: fn(
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
            'damage_causing',
            'bodypart',
            'loss',
        ],
    ),
    onClientPlayerHeliKilled: fn(
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
    onClientPlayerHitByWaterCannon: fn(
        [
            named('Player'),
        ],
        VOID,
        1,
        false,
        [
            'playerHit',
        ],
    ),
    onClientPlayerJoin: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientPlayerNetworkStatus: fn(
        [
            NUMBER,
            NUMBER,
        ],
        VOID,
        2,
        false,
        [
            'status',
            'ticks',
        ],
    ),
    onClientPlayerPickupHit: fn(
        [
            named('Pickup'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'thePickup',
            'matchingDimension',
        ],
    ),
    onClientPlayerPickupLeave: fn(
        [
            named('Pickup'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'thePickup',
            'matchingDimension',
        ],
    ),
    onClientPlayerQuit: fn(
        [
            STRING,
        ],
        VOID,
        1,
        false,
        [
            'reason',
        ],
    ),
    onClientPlayerRadioSwitch: fn(
        [
            NUMBER,
        ],
        VOID,
        1,
        false,
        [
            'stationID',
        ],
    ),
    onClientPlayerSpawn: fn(
        [
            named('Team'),
        ],
        VOID,
        1,
        false,
        [
            'hisTeam',
        ],
    ),
    onClientPlayerStealthKill: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'targetPlayer',
        ],
    ),
    onClientPlayerStuntFinish: fn(
        [
            STRING,
            NUMBER,
            NUMBER,
        ],
        VOID,
        3,
        false,
        [
            'stuntType',
            'stuntTime',
            'stuntDistance',
        ],
    ),
    onClientPlayerStuntStart: fn(
        [
            STRING,
        ],
        VOID,
        1,
        false,
        [
            'stuntType',
        ],
    ),
};
