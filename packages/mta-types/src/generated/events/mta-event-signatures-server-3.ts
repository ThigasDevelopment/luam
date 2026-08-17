import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE, VOID } from '@mta-types/type-descriptor';

import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES_SERVER_3: Readonly<Record<string, FunctionDescriptor>> = {
    onPlayerCommand: fn(
        [
            STRING,
        ],
        VOID,
        1,
        false,
        [
            'command',
        ],
    ),
    onPlayerConnect: fn(
        [
            STRING,
            STRING,
            STRING,
            STRING,
            NUMBER,
            STRING,
        ],
        VOID,
        6,
        false,
        [
            'playerNick',
            'playerIP',
            'playerUsername',
            'playerSerial',
            'playerVersionNumber',
            'playerVersionString',
        ],
    ),
    onPlayerContact: fn(
        [
            named('Element'),
            named('Element'),
        ],
        VOID,
        2,
        false,
        [
            'previousElement',
            'currentElement',
        ],
    ),
    onPlayerDamage: fn(
        [
            named('Player'),
            NUMBER,
            NUMBER,
            NUMBER,
        ],
        VOID,
        4,
        false,
        [
            'attacker',
            'damage_causing',
            'bodypart',
            'loss',
        ],
    ),
    onPlayerJoin: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onPlayerLogin: fn(
        [
            named('Account'),
            named('Account'),
        ],
        VOID,
        2,
        false,
        [
            'thePreviousAccount',
            'theCurrentAccount',
        ],
    ),
    onPlayerLogout: fn(
        [
            named('Account'),
            named('Account'),
        ],
        VOID,
        2,
        false,
        [
            'thePreviousAccount',
            'theCurrentAccount',
        ],
    ),
    onPlayerMarkerHit: fn(
        [
            named('Marker'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'markerHit',
            'matchingDimension',
        ],
    ),
    onPlayerMarkerLeave: fn(
        [
            named('Marker'),
            BOOLEAN,
        ],
        VOID,
        2,
        false,
        [
            'markerLeft',
            'matchingDimension',
        ],
    ),
    onPlayerModInfo: fn(
        [
            STRING,
            TABLE,
        ],
        VOID,
        2,
        false,
        [
            'filename',
            'itemlist',
        ],
    ),
    onPlayerMute: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onPlayerNetworkStatus: fn(
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
    onPlayerPickupHit: fn(
        [
            ANY,
        ],
        VOID,
        1,
        false,
        [
            'pickupHit',
        ],
    ),
    onPlayerPickupLeave: fn(
        [
            ANY,
        ],
        VOID,
        1,
        false,
        [
            'pickupLeft',
        ],
    ),
    onPlayerPickupUse: fn(
        [
            ANY,
        ],
        VOID,
        1,
        false,
        [
            'thePickupToUse',
        ],
    ),
    onPlayerPrivateMessage: fn(
        [
            STRING,
            named('Player'),
        ],
        VOID,
        2,
        false,
        [
            'message',
            'recipient',
        ],
    ),
    onPlayerQuit: fn(
        [
            STRING,
            STRING,
            named('Element'),
        ],
        VOID,
        3,
        false,
        [
            'quitType',
            'reason',
            'responsibleElement',
        ],
    ),
    onPlayerResourceStart: fn(
        [
            named('Resource'),
        ],
        VOID,
        1,
        false,
        [
            'loadedResource',
        ],
    ),
};
