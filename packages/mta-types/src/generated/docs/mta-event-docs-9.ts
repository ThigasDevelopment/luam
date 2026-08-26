import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

export const MTA_EVENT_DOCS_9: EventDocumentationCatalog = {
    onPlayerWeaponFire: {
        summary: 'This event is called when a player fires a weapon.  This does not trigger for projectiles, melee weapons, or camera. For projectiles use onPlayerProjectileCreation.',
        parameters: [
            { name: 'weaponID', isOptional: false, isVariadic: false, summary: 'an int representing weapon used for making a shot.' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: 'float world X coordinate representing the end point.' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: 'float world Y coordinate representing the end point.' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: 'float world Z coordinate representing the end point.' },
            { name: 'hitElement', isOptional: false, isVariadic: false, summary: 'an element which was hit by a shot. Currently this can be only another player. **Note: hitElement could be incorrect and should not be relied upon.**' },
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'float world X coordinate representing the start of the bullet. **Note: This is not the gun muzzle.**' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'float world Y coordinate representing the start of the bullet.' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'float world Z coordinate representing the start of the bullet.' },
        ],
        source: 'The source of this event is the player who fired the weapon.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPlayerWeaponFire',
    },
    onPlayerWeaponSwitch: {
        summary: 'This event is triggered whenever a player\'s equipped weapon **slot** changes. This means giveWeapon and takeWeapon will trigger this event if the equipped slot is forced to change.',
        parameters: [
            { name: 'previousWeaponID', isOptional: false, isVariadic: false, summary: 'An integer representing the weapon that was switched from.' },
            { name: 'currentWeaponID', isOptional: false, isVariadic: false, summary: 'An integer representing the weapon that was switched to.' },
        ],
        source: 'The source of this event is the player that switched his weapon.',
        cancel: 'If this event is canceled, then the player\'s weapon won\'t be switched.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnPlayerWeaponSwitch',
    },
    onResourceLoadStateChange: {
        summary: '',
        parameters: [
            { name: 'changedResource', isOptional: false, isVariadic: false, summary: 'The resource that was either loaded, reloaded or is unloading.' },
            { name: 'oldState', isOptional: false, isVariadic: false, summary: 'The state the resource was in before it changed.' },
            { name: 'newState', isOptional: false, isVariadic: false, summary: 'The state the resource has changed to.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnResourceLoadStateChange',
    },
    onResourcePreStart: {
        summary: 'Analogous to onResourceStart, but triggered before script files are initialised.',
        parameters: [
            { name: 'startingResource', isOptional: false, isVariadic: false, summary: 'the resource that is starting.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: 'If this event is cancelled, the resource won\'t begin starting.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnResourcePreStart',
    },
    onResourceStart: {
        summary: 'This event is triggered when a resource is started.\n\n**Important:** If you attach this event to the root element it will called when *any* resource starts, not just the resource your script is running inside. As such, most of the time you will want to check that the resource passed to this event matches your resource (compare with the value returned by getThisResource before doing anything. Alternatively you can attach the event to resourceRoot.',
        parameters: [
            { name: 'startedResource', isOptional: false, isVariadic: false, summary: 'the resource that was started.' },
        ],
        source: 'The source of this event is the root element in the resource that started.',
        cancel: 'If this event is canceled, the resource starting is aborted and is stopped again.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnResourceStart',
    },
    onResourceStop: {
        summary: 'This event is triggered when the resource is stopped. This can occur for a number of reasons:\n* The *stop* console command was used\n* The *restart* console command was used\n* The resource was modified (the resource will automatically restart)\n* Another resource stopped it using stopResource.\n\n**Note:** If you wish to just detect a single resource being stopped, you should attach handlers for this event to the resource\'s root element. You can access this using getResourceRootElement.',
        parameters: [
            { name: 'stoppedResource', isOptional: false, isVariadic: false, summary: 'the resource that is being stopped.' },
            { name: 'wasDeleted', isOptional: false, isVariadic: false, summary: 'a boolean representing whether the resource folder was deleted, moved or renamed.' },
        ],
        source: 'The source of this event is the root element of the resource that is being stopped.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnResourceStop',
    },
    onSettingChange: {
        summary: 'This event is triggered when resource setting has been changed. For instance, this event would trigger if you would edit the settings of the Race resource through the Admin panel.',
        parameters: [
            { name: 'setting', isOptional: false, isVariadic: false, summary: 'The setting which was changed. For instance: "*race.ghostmode"' },
            { name: 'oldValue', isOptional: false, isVariadic: false, summary: 'The previous value. Please note that this value is in JSON. To get a normal Lua value, use fromJSON' },
            { name: 'newValue', isOptional: false, isVariadic: false, summary: 'The new value. Also in JSON' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnSettingChange',
    },
    onTrailerAttach: {
        summary: 'This event is triggered when a trailer is attached to a truck or when a tow truck hooks on to a vehicle.',
        parameters: [
            { name: 'theTruck', isOptional: false, isVariadic: false, summary: 'the truck vehicle that got attached to this trailer.' },
        ],
        source: 'The source of this event is the trailer vehicle that the truck got attached to. <!-- Only include this section below if cancelling the event has any effect. If you don\'t know if it does, ask a dev! -->',
        cancel: 'If this event is canceled, the trailer will detach from the truck again.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnTrailerAttach',
    },
    onTrailerDetach: {
        summary: 'This event is triggered when a trailer is detached from a truck.',
        parameters: [
            { name: 'theTruck', isOptional: false, isVariadic: false, summary: 'the truck vehicle that this trailer got detached from.' },
        ],
        source: 'The source of this event is the trailer vehicle that the truck got detached from.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnTrailerDetach',
    },
    onUnban: {
        summary: 'This event is triggered when a ban is removed from the server.\n\nif the ban was removed using function removeBan, and the responsibleElement was not specifying, the event will return nil.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'the ban that will be removed.' },
            { name: 'responsibleElement', isOptional: false, isVariadic: false, summary: 'the player who removed the ban, otherwise returns *nil*.' },
        ],
        source: 'The source is always the global root element.',
        cancel: 'If this event is canceled, the requested unban is not performed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnUnban',
    },
    onVehicleDamage: {
        summary: 'This event is triggered when a vehicle is damaged. If you want to get the attacker you can use onClientVehicleDamage.',
        parameters: [
            { name: 'loss', isOptional: false, isVariadic: false, summary: 'a float representing the amount of health the vehicle lost.' },
        ],
        source: 'The source of this event is the vehicle that got damaged.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnVehicleDamage',
    },
    onVehicleEnter: {
        summary: 'This event is triggered when a player or ped enters a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'a player or ped element who is entering the vehicle.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'an int representing the seat in which the ped is entering. Seat 0 is the driver\'s seat.' },
            { name: 'jacked', isOptional: false, isVariadic: false, summary: 'a player or ped element representing who has been jacked.' },
        ],
        source: 'The source of this event is the vehicle that was entered.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnVehicleEnter',
    },
    onVehicleExit: {
        summary: 'This event is triggered when a player or ped leaves a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'a player or ped element who exited the vehicle.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'an int representing the seat in which the ped exited from.' },
            { name: 'jacker', isOptional: false, isVariadic: false, summary: 'a player or ped element who jacked the driver.' },
            { name: 'forcedByScript', isOptional: false, isVariadic: false, summary: 'a boolean representing whether the exit was forced using removePedFromVehicle or by the ped/player.' },
        ],
        source: 'The source of this event is the vehicle that was exited.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnVehicleExit',
    },
    onVehicleExplode: {
        summary: 'This event is triggered when a vehicle explodes.',
        parameters: [
            { name: 'withExplosion', isOptional: false, isVariadic: false, summary: 'Determines whether the vehicle was blown with or without an explosion.' },
            { name: 'player', isOptional: false, isVariadic: false, summary: 'The player who sent the explosion packet.' },
        ],
        source: 'The source of this event is the vehicle that exploded.',
        cancel: 'If this event is cancelled, the vehicle won\'t explode.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnVehicleExplode',
    },
    onVehicleRespawn: {
        summary: 'This event is triggered when a vehicle is respawned due. See toggleVehicleRespawn.',
        parameters: [
            { name: 'exploded', isOptional: false, isVariadic: false, summary: '*true* if this vehicle respawned because it exploded, *false* if it respawned due to being deserted.' },
        ],
        source: 'The source of this event is the vehicle that respawned.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnVehicleRespawn',
    },
    onVehicleStartEnter: {
        summary: 'This event is triggered when a player or ped starts to enter a vehicle. This event can be used to cancel entry, if necessary.',
        parameters: [
            { name: 'enteringPed', isOptional: false, isVariadic: false, summary: 'a player or ped element who is starting to enter a vehicle.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'an int representing the seat in which the ped is entering.' },
            { name: 'jacked', isOptional: false, isVariadic: false, summary: 'a player or ped element representing who is going to be jacked.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'an int of which door is being used (0-3). 0 is driver side door, 1 is front passenger, 2 is back left, 3 is back right.' },
        ],
        source: 'The source of this event is the vehicle in which a ped began to enter.',
        cancel: 'If this event is canceled, the ped will not enter the vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnVehicleStartEnter',
    },
    onVehicleStartExit: {
        summary: 'This event is triggered when a player or ped starts to exit a vehicle. This event can be used to cancel exit, if necessary.',
        parameters: [
            { name: 'exitingPed', isOptional: false, isVariadic: false, summary: 'a player or ped element who is starting to exit a vehicle.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'an int representing the seat in which the ped is exiting from.' },
            { name: 'jacked', isOptional: false, isVariadic: false, summary: 'a player or ped element representing who is jacking.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'an int representing the door that the ped is using to leave.' },
        ],
        source: 'The source of this event is the vehicle in which a ped began to exit.',
        cancel: 'If this event is canceled, the ped will not exit the vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnVehicleStartExit',
    },
    onWeaponFire: {
        summary: 'This event is triggered when a custom weapon gets fired.',
        parameters: [],
        source: 'The source of this event is the element that fired the weapon. If the server is the creator it returns *nil*.',
        cancel: 'If this event is canceled, the bullet(s) won\'t be synced with other players.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnWeaponFire',
    },
};
