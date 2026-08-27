import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

export const MTA_EVENT_DOCS_5: EventDocumentationCatalog = {
    onClientPlayerWeaponFire: {
        summary: 'This event is called when a player fires a weapon.  This event does not trigger for melee weapons. Projectile weapons or the camera will only trigger the event if fired by the local player.',
        parameters: [
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'an int representing weapon used for firing a shot.' },
            { name: 'ammo', isOptional: false, isVariadic: false, summary: 'an int amount of ammo left for this weapon type.' },
            { name: 'ammoInClip', isOptional: false, isVariadic: false, summary: 'an int amount of ammo left for this weapon type in clip.' },
            { name: 'hitX', isOptional: false, isVariadic: false, summary: 'float world X coordinate representing the hit point.' },
            { name: 'hitY', isOptional: false, isVariadic: false, summary: 'float world Y coordinate representing the hit point.' },
            { name: 'hitZ', isOptional: false, isVariadic: false, summary: 'float world Z coordinate representing the hit point.' },
            { name: 'hitElement', isOptional: false, isVariadic: false, summary: 'an element which was hit by a shot.' },
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'float world X coordinate representing the start of the bullet. Note: This is not the gun muzzle.' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'float world Y coordinate representing the start of the bullet.' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'float world Z coordinate representing the start of the bullet.' },
        ],
        source: 'The source of this event is the streamed in player who fired the weapon.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerWeaponFire',
    },
    onClientPlayerWeaponSwitch: {
        summary: 'This event is triggered whenever the local player\'s equipped **weapon slot** changes. This means giveWeapon and takeWeapon will trigger this event if the equipped slot is forced to change.',
        parameters: [
            { name: 'previousWeaponSlot', isOptional: false, isVariadic: false, summary: 'An integer representing the previous weapon slot the player had before he switched.' },
            { name: 'currentWeaponSlot', isOptional: false, isVariadic: false, summary: 'An integer representing the new weapon slot the player has after he switched.' },
        ],
        source: 'The source of this event is the player who switched their weapon (Local player only)',
        cancel: 'If this event is canceled, then the weapon will not be switched.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerWeaponSwitch',
    },
    onClientPreRender: {
        summary: 'This event is triggered every time before GTA renders a new frame.',
        parameters: [
            { name: 'timeSlice', isOptional: false, isVariadic: false, summary: 'The interval between this frame and the previous one in milliseconds (delta time).' },
        ],
        source: 'The source of this event is the client\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPreRender',
    },
    onClientProjectileCreation: {
        summary: 'This event is triggered when a projectile is created.',
        parameters: [
            { name: 'creator', isOptional: false, isVariadic: false, summary: 'the element that created the projectile.' },
        ],
        source: 'The source of this event is the projectile that was created.',
        cancel: 'This event cannot be cancelled. To remove the projectile you can use setElementPosition (somewhere far away) and then destroyElement (which makes it explode).',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientProjectileCreation',
    },
    onClientRender: {
        summary: 'This event is triggered every time GTA renders a new frame. It is required for the DirectX drawing functions, and also useful for other clientside operations that have to be applied repeatedly with very short time differences between them.',
        parameters: [],
        source: 'The source of this event is the client\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientRender',
    },
    onClientResourceFileDownload: {
        summary: 'This event is triggered every time a resource file download is queued, finished or has failed.',
        parameters: [
            { name: 'fileResource', isOptional: false, isVariadic: false, summary: 'Resource the file belongs to.' },
            { name: 'fileName', isOptional: false, isVariadic: false, summary: 'Relative resource file path.' },
            { name: 'fileSize', isOptional: false, isVariadic: false, summary: 'Size of the file in bytes.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'Possible values: "queued" or "finished" or "failed".' },
        ],
        source: 'The source of this event is the resource\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientResourceFileDownload',
    },
    onClientResourceStart: {
        summary: 'This event is triggered when a resource is started.  Please note that this is **not** triggered the same time as the serverside event onResourceStart is.  The event is triggered when any *clientside resources* are started.  This means it is triggered when a clientside script is initiated after a download, which includes downloading after join. So:\n\n* If a resource is running **before** a player joins, the onClientResourceStart event will be triggered after they join and have downloaded that resource.\n* If a resource is started **after** a player has joined, the player will be made to download the required files, and then the onClientResourceStart event will be triggered.',
        parameters: [
            { name: 'startedResource', isOptional: false, isVariadic: false, summary: 'the resource that was started.' },
        ],
        source: 'The source of this event is the started resource\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientResourceStart',
    },
    onClientResourceStop: {
        summary: 'This event is triggered when a resource is being stopped.',
        parameters: [
            { name: 'stoppedResource', isOptional: false, isVariadic: false, summary: 'the resource that is about to get stopped.' },
        ],
        source: 'The source of this event is the stopped resource root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientResourceStop',
    },
    onClientRestore: {
        summary: 'This event is triggered when the local player restores the game screen from a previously minimized state.',
        parameters: [
            { name: 'didClearRenderTargets', isOptional: false, isVariadic: false, summary: 'A bool specifying whether all render targets have been cleared as part of the restore process. Generally, restoring in full screen mode will clear render targets.' },
        ],
        source: 'The source of this event is root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientRestore',
    },
    onClientSoundBeat: {
        summary: 'This event is triggered when a **sound** beats.',
        parameters: [
            { name: 'theTime', isOptional: false, isVariadic: false, summary: 'the position in the song of the beat' },
        ],
        source: 'The source of this event is the sound\'s element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientSoundBeat',
    },
    onClientSoundChangedMeta: {
        summary: 'This event is triggered when a sound\'s meta tags have been modified.',
        parameters: [
            { name: 'streamTitle', isOptional: false, isVariadic: false, summary: 'The title of a specific stream' },
        ],
        source: 'The source of this event is the sound of which the meta tags have just been modified.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientSoundChangedMeta',
    },
    onClientSoundFinishedDownload: {
        summary: 'This event is triggered when a sound has just finished downloading. This means the complete sound file is now loaded in the player\'s RAM, and can be played completely from start to end. Unlike onClientSoundStream, this event only triggers for file streams, not for live ones since live streams never actually end.',
        parameters: [
            { name: 'length', isOptional: false, isVariadic: false, summary: 'The length of the stream in milliseconds' },
        ],
        source: 'The source of this event is the sound which just finished downloading.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientSoundFinishedDownload',
    },
    onClientSoundStarted: {
        summary: 'This event is triggered when a **sound** is started.',
        parameters: [
            { name: 'reason', isOptional: false, isVariadic: false, summary: 'the reason the **sound** was started, can be "play", "resumed" or "enabled".' },
        ],
        source: 'The source of this event is the sound\'s element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientSoundStarted',
    },
    onClientSoundStopped: {
        summary: 'This event is triggered when a **sound** is stopped.',
        parameters: [
            { name: 'reason', isOptional: false, isVariadic: false, summary: 'the reason the **sound** was stopped, can be "finished", "paused", "destroyed" or "disabled".' },
        ],
        source: 'The source of this event is the sound\'s element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientSoundStopped',
    },
    onClientSoundStream: {
        summary: 'This event is triggered when a sound has just finished initial streaming. For file streams, this means the sound will now start playing, but isn\'t done downloading yet. For live streams, this just means the stream will start playing. This event will also trigger when, for some reason, the streaming failed.',
        parameters: [
            { name: 'success', isOptional: false, isVariadic: false, summary: 'A boolean indicating whether the stream was a success or not' },
            { name: 'length', isOptional: false, isVariadic: false, summary: 'The length of the stream in seconds. Always returns **0** for a live stream' },
            { name: 'streamName', isOptional: false, isVariadic: false, summary: 'The name of the stream. Note that this isn\'t the filename. Also note that this isn\'t always provided' },
            { name: 'errorMessage', isOptional: false, isVariadic: false, summary: 'A string containing the error message or an empty string if there was no error' },
        ],
        source: 'The source of this event is the sound which either successfully streamed or failed to stream.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientSoundStream',
    },
    onClientTrailerAttach: {
        summary: 'This event is triggered by a trailer when it gets attached to a towing vehicle.',
        parameters: [
            { name: 'towedBy', isOptional: false, isVariadic: false, summary: 'the vehicle that is now towing the trailer.' },
        ],
        source: 'The source of this event is the trailer that is now being towed.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientTrailerAttach',
    },
    onClientTrailerDetach: {
        summary: 'This event is triggered when a trailer gets detached from its towing vehicle.',
        parameters: [
            { name: 'towedBy', isOptional: false, isVariadic: false, summary: 'the vehicle that was towing the trailer.' },
        ],
        source: 'The source of this event is the trailer that is now detached.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientTrailerDetach',
    },
    onClientTransferBoxProgressChange: {
        summary: 'This event is triggered every time the resource file downloader (aka. transfer box) updates the download progress.',
        parameters: [
            { name: 'downloadedSizeTotal', isOptional: false, isVariadic: false, summary: 'The total progress in bytes.' },
            { name: 'downloadTotalBytes', isOptional: false, isVariadic: false, summary: 'The total size of the download in bytes.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientTransferBoxProgressChange',
    },
    onClientTransferBoxVisibilityChange: {
        summary: 'This event is triggered every time the resource file downloader (aka. transfer box) is shown or hidden by MTA.',
        parameters: [
            { name: 'isVisible', isOptional: false, isVariadic: false, summary: 'A boolean, indicating the new visibility status of the transfer box.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientTransferBoxVisibilityChange',
    },
    onClientVehicleCollision: {
        summary: 'This event is triggered when a vehicle collides with an element or a world object.\n\nNote that the collision reported by this event doesn\'t always damage the vehicle by default (this event triggers when hitting lamp posts, but the vehicle isn\'t damaged by them automatically, for example). If you want to deal with real damage, please refer to onClientVehicleDamage.',
        parameters: [
            { name: 'theHitElement', isOptional: false, isVariadic: false, summary: 'the other entity, or nil if the vehicle collided with the world' },
            { name: 'damageImpulseMag', isOptional: false, isVariadic: false, summary: 'the impact magnitude (Note: this is NOT the damage it is a force value which is then multiplied by the vehicles collision damage multiplier. for an example of this see below)' },
            { name: 'bodypart', isOptional: false, isVariadic: false, summary: 'the bodypart that hit the other element' },
            { name: 'collisionX', isOptional: false, isVariadic: false, summary: 'the X coordinate of the position the collision took place' },
            { name: 'collisionY', isOptional: false, isVariadic: false, summary: 'the Y coordinate of the position the collision took place' },
            { name: 'collisionZ', isOptional: false, isVariadic: false, summary: 'the Z coordinate of the position the collision took place' },
            { name: 'normalX', isOptional: false, isVariadic: false, summary: 'the X coordinate of the surface normal of the hit object' },
            { name: 'normalY', isOptional: false, isVariadic: false, summary: 'the Y coordinate of the surface normal of the hit object' },
            { name: 'normalZ', isOptional: false, isVariadic: false, summary: 'the Z coordinate of the surface normal of the hit object' },
            { name: 'hitElementForce', isOptional: false, isVariadic: false, summary: '0 for non vehicles or the force of the other vehicle' },
            { name: 'model', isOptional: false, isVariadic: false, summary: 'model of the hit element (useful to detect building collisions as hitElement will be nil)' },
        ],
        source: 'The source of this event is the vehicle that collided with something.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientVehicleCollision',
    },
    onClientVehicleDamage: {
        summary: 'This event is triggered when a vehicle is damaged.',
        parameters: [
            { name: 'theAttacker', isOptional: false, isVariadic: false, summary: 'An element if there was an attacker.' },
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'An integer specifying the weapon ID if a weapon was used. Otherwise Damage Type ID is used.' },
            { name: 'loss', isOptional: false, isVariadic: false, summary: 'A float representing the amount of damage taken.' },
            { name: 'damagePosX', isOptional: false, isVariadic: false, summary: 'A float representing the X co-ordinate of where the damage took place.' },
            { name: 'damagePosY', isOptional: false, isVariadic: false, summary: 'A float representing the Y co-ordinate of where the damage took place.' },
            { name: 'damagePosZ', isOptional: false, isVariadic: false, summary: 'A float representing the Z co-ordinate of where the damage took place.' },
            { name: 'tireID', isOptional: false, isVariadic: false, summary: 'A number representing the tire which took damage, if there is one.' },
        ],
        source: 'The source of this event is the vehicle that got damaged.',
        cancel: 'If this event is canceled, the vehicle health won\'t be reduced. Physical damage to the vehicle will remain.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientVehicleDamage',
    },
    onClientVehicleEnter: {
        summary: 'This event gets fired when a player or ped enters a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped that entered the vehicle' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'the number of the seat that the ped is now sitting on. 0 = driver, higher numbers are passenger seats.' },
        ],
        source: 'The source of the event is the vehicle that the ped entered.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientVehicleEnter',
    },
    onClientVehicleExit: {
        summary: 'This event gets fired when a ped or player gets out of a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped element that exited the vehicle' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'the number of the seat that the player was sitting on. 0 = driver, higher numbers are passenger seats.' },
        ],
        source: 'The source of the event is the vehicle that the ped exited.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientVehicleExit',
    },
};
