import { BOOLEAN, fn, named, NUMBER, STRING, VOID } from '@mta-types/type-descriptor';

import type { FunctionDescriptor } from '@mta-types/type-descriptor';

export const MTA_EVENT_SIGNATURES_CLIENT_6: Readonly<Record<string, FunctionDescriptor>> = {
    onClientPlayerTarget: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'target',
        ],
    ),
    onClientPlayerVehicleEnter: fn(
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
    onClientPlayerVehicleExit: fn(
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
    onClientPlayerVoicePause: fn(
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
    onClientPlayerVoiceResumed: fn(
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
    onClientPlayerVoiceStart: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientPlayerVoiceStop: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientPlayerWasted: fn(
        [
            named('Element'),
            NUMBER,
            NUMBER,
            BOOLEAN,
            NUMBER,
            NUMBER,
        ],
        VOID,
        6,
        false,
        [
            'killer',
            'weapon',
            'bodypart',
            'stealth',
            'animGroup',
            'animID',
        ],
    ),
    onClientPlayerWeaponFire: fn(
        [
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            named('Element'),
            NUMBER,
            NUMBER,
            NUMBER,
        ],
        VOID,
        10,
        false,
        [
            'weapon',
            'ammo',
            'ammoInClip',
            'hitX',
            'hitY',
            'hitZ',
            'hitElement',
            'startX',
            'startY',
            'startZ',
        ],
    ),
    onClientPlayerWeaponSwitch: fn(
        [
            NUMBER,
            NUMBER,
        ],
        VOID,
        2,
        false,
        [
            'previousWeaponSlot',
            'currentWeaponSlot',
        ],
    ),
    onClientPreRender: fn(
        [
            NUMBER,
        ],
        VOID,
        1,
        false,
        [
            'timeSlice',
        ],
    ),
    onClientProjectileCreation: fn(
        [
            named('Element'),
        ],
        VOID,
        1,
        false,
        [
            'creator',
        ],
    ),
    onClientRender: fn(
        [
        ],
        VOID,
        0,
        false,
        [
        ],
    ),
    onClientResourceFileDownload: fn(
        [
            named('Resource'),
            STRING,
            NUMBER,
            STRING,
        ],
        VOID,
        4,
        false,
        [
            'fileResource',
            'fileName',
            'fileSize',
            'state',
        ],
    ),
    onClientResourceStart: fn(
        [
            named('Resource'),
        ],
        VOID,
        1,
        false,
        [
            'startedResource',
        ],
    ),
    onClientResourceStop: fn(
        [
            named('Resource'),
        ],
        VOID,
        1,
        false,
        [
            'stoppedResource',
        ],
    ),
    onClientRestore: fn(
        [
            BOOLEAN,
        ],
        VOID,
        1,
        false,
        [
            'didClearRenderTargets',
        ],
    ),
};
