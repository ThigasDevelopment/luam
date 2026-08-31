import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

export const MTA_EVENT_DOCS_7: EventDocumentationCatalog = {
    onElementDestroy: {
        summary: 'This event is triggered when an element gets destroyed by destroyElement or when the creator resource is stopping. It is also triggered when a parent element of this element is destroyed.',
        parameters: [],
        source: 'The source of this event is the element that is being destroyed.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnElementDestroy',
    },
    onElementDimensionChange: {
        summary: 'This event is triggered when the dimension of an element is changed using setElementDimension.',
        parameters: [
            { name: 'oldDimension', isOptional: false, isVariadic: false, summary: 'An int representing the dimension the element was in before.' },
            { name: 'newDimension', isOptional: false, isVariadic: false, summary: 'An int representing the dimension the element is in now.' },
        ],
        source: 'The source of this event is the element that changed its dimension.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnElementDimensionChange',
    },
    onElementInteriorChange: {
        summary: 'This event is triggered when the interior of an element is changed using setElementInterior.',
        parameters: [
            { name: 'oldInterior', isOptional: false, isVariadic: false, summary: 'an int representing the interior the element was in before.' },
            { name: 'newInterior', isOptional: false, isVariadic: false, summary: 'an int representing the interior the element is in now.' },
        ],
        source: 'The source of this event is the element that changed its interior.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnElementInteriorChange',
    },
    onElementModelChange: {
        summary: 'This event is triggered when the model of an element is changed using setElementModel.',
        parameters: [
            { name: 'oldModel', isOptional: false, isVariadic: false, summary: 'an int representing the model of the element before the change occurred.' },
            { name: 'newModel', isOptional: false, isVariadic: false, summary: 'an int representing the new model of the element.' },
        ],
        source: 'The source of this event is the element that changed its model',
        cancel: 'This event does NOT support cancellation. Use setElementModel with the old value to reverse.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnElementModelChange',
    },
    onElementStartSync: {
        summary: 'This event is triggered when an element becomes synced by a player.',
        parameters: [
            { name: 'newSyncer', isOptional: false, isVariadic: false, summary: 'a player element representing the player who is now syncing the element.' },
        ],
        source: 'The source of this event is the element that got synced by a player.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnElementStartSync',
    },
    onElementStopSync: {
        summary: 'This event is triggered when an element is no longer synced by a player.',
        parameters: [
            { name: 'oldSyncer', isOptional: false, isVariadic: false, summary: 'a player element representing the last player who was syncing the element.' },
        ],
        source: 'The source of this event is the element which is no longer synced by a player.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnElementStopSync',
    },
    onExplosion: {
        summary: 'This event is triggered every time an explosion is created either by server-side createExplosion, or when reported by player.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'X coordinate of where the explosion was created' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'Y coordinate of where the explosion was created' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'Z coordinate of where the explosion was created' },
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'the type of explosion created, see: Explosion types' },
        ],
        source: 'The source of this event is the player who notified server about explosion, or root if explosion was created server-side along without specifying creator in createExplosion.',
        cancel: 'If this event is canceled, the explosion will not occur. If an explosion is notified by a player, that explosion will still be visible to this player.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnExplosion',
    },
    onMarkerHit: {
        summary: 'This event is triggered when an element enters a marker created using createMarker.',
        parameters: [
            { name: 'hitElement', isOptional: false, isVariadic: false, summary: 'the element that hit the marker.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: 'a boolean representing whether the element is in the same dimension as the marker.' },
        ],
        source: 'The source of this event is the marker that got hit by the element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnMarkerHit',
    },
    onMarkerLeave: {
        summary: 'This event is triggered when an element leaves the area of a marker created using createMarker.',
        parameters: [
            { name: 'leftElement', isOptional: false, isVariadic: false, summary: 'the element that left the marker\'s area.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: 'a boolean representing whether the element is in the same dimension as the marker.' },
        ],
        source: 'The source of this event is the marker that the element left.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnMarkerLeave',
    },
    onPedDamage: {
        summary: 'This event is triggered when a ped is damaged. For player damage, use onPlayerDamage instead.',
        parameters: [
            { name: 'loss', isOptional: false, isVariadic: false, summary: 'an int representing the percentage of health the ped lost.' },
        ],
        source: 'The source of this event is the ped that got damaged.',
        cancel: 'Canceling this event has no effect. Cancel the client-side event onClientPedDamage instead.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPedDamage',
    },
    onPedVehicleEnter: {
        summary: 'This event is triggered when a ped enters a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A vehicle element representing the vehicle that was entered.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'An int representing the seat in which the ped is entering.' },
            { name: 'jacked', isOptional: false, isVariadic: false, summary: 'A player or ped element representing who has been jacked.' },
        ],
        source: 'The source of this event is the ped that entered the vehicle.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPedVehicleEnter',
    },
    onPedVehicleExit: {
        summary: 'This event is triggered when a ped leaves a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A vehicle element representing the vehicle in which the ped exited from.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'An int representing the seat in which the ped was before exiting.' },
            { name: 'jacker', isOptional: false, isVariadic: false, summary: 'A player or ped element representing who jacked the driver.' },
            { name: 'forcedByScript', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the exit was forced using removePedFromVehicle or by the ped.' },
        ],
        source: 'The source of this event is the ped that left the vehicle.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPedVehicleExit',
    },
    onPedWasted: {
        summary: 'This event is triggered when a ped is killed or dies. It is not triggered for players.',
        parameters: [
            { name: 'totalAmmo', isOptional: false, isVariadic: false, summary: 'an int representing the total ammo the victim had when he died.' },
            { name: 'killer', isOptional: false, isVariadic: false, summary: 'an element representing the player, ped or vehicle who was the killer. If there was no killer this is *false*.' },
            { name: 'killerWeapon', isOptional: false, isVariadic: false, summary: 'an int representing the killer weapon or the damage types.' },
            { name: 'bodypart', isOptional: false, isVariadic: false, summary: 'an int representing the bodypart ID the victim was hit on when he died.' },
            { name: 'stealth', isOptional: false, isVariadic: false, summary: 'a boolean representing whether or not this was a stealth kill.' },
            { name: 'animGroup', isOptional: false, isVariadic: false, summary: 'an integer representing the ped\'s current animation group.' },
            { name: 'animID', isOptional: false, isVariadic: false, summary: 'an integer representing the ped\'s current animation ID.' },
        ],
        source: 'The source of this event is the ped that died or got killed.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPedWasted',
    },
    onPedWeaponReload: {
        summary: 'Event has been added.\n\nThis event is triggered when a ped reloads his weapons.',
        parameters: [
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'an int representing the weapon that has been reloaded.' },
            { name: 'clip', isOptional: false, isVariadic: false, summary: 'an int representing the weapon clip size.' },
            { name: 'ammo', isOptional: false, isVariadic: false, summary: 'an int representing the weapon ammo.' },
        ],
        source: 'The source of this event is the ped that reloaded his weapon.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPedWeaponReload',
    },
    onPedWeaponSwitch: {
        summary: 'This event is triggered when a ped switches weapons.',
        parameters: [
            { name: 'previousWeaponID', isOptional: false, isVariadic: false, summary: 'an int representing the weapon that was switched from.' },
            { name: 'currentWeaponID', isOptional: false, isVariadic: false, summary: 'an int representing the weapon that was switched to.' },
        ],
        source: 'The source of this event is the ped that switched his weapon.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPedWeaponSwitch',
    },
    onPickupHit: {
        summary: 'This event is triggered when a player hits a pickup.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'a player element referring to the player who moved over the pickup.' },
        ],
        source: 'The source of this event is the pickup that was hit by the player.',
        cancel: 'If this event is canceled, the pickup does not disappear and the player does not receive its bonus.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPickupHit',
    },
    onPickupLeave: {
        summary: 'This event is triggered when a player leaves a pickup.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'a player element referring to the player who left the pickup.' },
        ],
        source: 'The source of this event is the pickup that was left by the player.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPickupLeave',
    },
    onPickupSpawn: {
        summary: 'This event is triggered when a pickup is spawned or respawned.',
        parameters: [],
        source: 'The source of this event is the pickup that just spawned or respawned.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPickupSpawn',
    },
    onPickupUse: {
        summary: 'This event is triggered when a player stands on a pickup while not in a vehicle.',
        parameters: [
            { name: 'playerWhoUsed', isOptional: false, isVariadic: false, summary: 'a player element referring to the player who used the pickup.' },
        ],
        source: 'The source of this event is the pickup that is getting used by the player.',
        cancel: 'If this event is canceled, the player will not be given the item they picked up.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPickupUse',
    },
    onPlayerACInfo: {
        summary: 'This event is triggered when a player trips anti-cheat detections. It can be used to script a white/blacklist of custom d3d9.dll files, or a white/blacklist of players with certain anti-cheat codes. The relevant anti-cheat code has to be disabled (or not enabled) in the server mtaserver.conf to be of use here.',
        parameters: [
            { name: 'detectedACList', isOptional: false, isVariadic: false, summary: 'A table of anti-cheat codes the player has triggered.' },
            { name: 'd3d9Size', isOptional: false, isVariadic: false, summary: 'A number representing the file size of any custom d3d9.dll the player may have installed.' },
            { name: 'd3d9MD5', isOptional: false, isVariadic: false, summary: 'A string containing the MD5 of any custom d3d9.dll the player may have installed.' },
            { name: 'd3d9SHA256', isOptional: false, isVariadic: false, summary: 'A string containing the SHA256 of any custom d3d9.dll the player may have installed.' },
        ],
        source: 'The source of this event is the player',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPlayerACInfo',
    },
    onPlayerBan: {
        summary: 'This event is triggered when a player added a ban (like onBan).',
        parameters: [
            { name: 'banPointer', isOptional: false, isVariadic: false, summary: 'the ban pointer which was added.' },
            { name: 'responsibleElement', isOptional: false, isVariadic: false, summary: 'the player who added the ban.' },
        ],
        source: 'The source of this event is the player who was banned.',
        cancel: 'This event cannot be canceled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPlayerBan',
    },
    onPlayerChangeNick: {
        summary: 'This event is triggered when a player changes his nickname.',
        parameters: [
            { name: 'oldNick', isOptional: false, isVariadic: false, summary: 'the nickname the player had before.' },
            { name: 'newNick', isOptional: false, isVariadic: false, summary: 'the new nickname of the player.' },
            { name: 'changedByUser', isOptional: false, isVariadic: false, summary: 'a boolean representing whether the name was changed using setPlayerName or by the user.' },
        ],
        source: 'The source of this event is the player that changed his nick',
        cancel: 'Cancelling this event depends on how it is called, if it is called by the scripting event then it is NOT cancelable. If it is called from the /nick command it IS cancelable. If this event is cancelled and can be cancelled then the name will not change.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPlayerChangeNick',
    },
    onPlayerChangesProtectedData: {
        summary: 'This event is triggered when a player tries to change protected element data. The server protects element data with using elementdata_whitelisted from **mtaserver.conf** and the **clientChangesPolicy** parameter in setElementData.',
        parameters: [
            { name: 'element', isOptional: false, isVariadic: false, summary: 'The affected element.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the element data entry that has changed.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value that the player sends.' },
        ],
        source: 'The source of this event is the player who changes protected element data.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPlayerChangesProtectedData',
    },
};
