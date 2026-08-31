import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

export const MTA_EVENT_DOCS_5: EventDocumentationCatalog = {
    onClientPlayerVoiceResumed: {
        summary: 'This event is triggered when a player\'s voice sound is resumed using setSoundPaused.',
        parameters: [
            { name: 'reason', isOptional: false, isVariadic: false, summary: 'the reason for the pause, this can be only "resumed".' },
        ],
        source: 'The source of this event is the player whose voice got resumed.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerVoiceResumed',
    },
    onClientPlayerVoiceStart: {
        summary: '**Note**:  This event should only be used as a low-level function for advanced users.  For typical Voice scripting, please see the Voice Resource\nThis event is triggered when a player starts talking through voice chat.',
        parameters: [],
        source: 'The source of this event is the player element that just started talking through voice chat.',
        cancel: '* If the source is the local player, the local player will not broadcast his voice chat to the server * If the source is a remote player, the player who started talking will not be heard.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerVoiceStart',
    },
    onClientPlayerVoiceStop: {
        summary: 'This event is triggered when a player stops talking through voice chat.',
        parameters: [],
        source: 'The source of this event is the player element that just stopped talking through voice chat.',
        cancel: '* If the source is the local player, the local player will not broadcast his voice chat to the server * If the source is a remote player, the player who started talking will not be heard.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerVoiceStop',
    },
    onClientPlayerWasted: {
        summary: 'This event is triggered whenever a player, including those remote, dies.',
        parameters: [
            { name: 'killer', isOptional: false, isVariadic: false, summary: 'A player, ped or vehicle element representing the killer.' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'An integer representing the killer weapon or the damage types.' },
            { name: 'bodypart', isOptional: false, isVariadic: false, summary: 'An integer representing the bodypart the player was damaged.' },
            { name: 'stealth', isOptional: false, isVariadic: false, summary: 'A boolean representing whether or not this was a stealth kill.' },
            { name: 'animGroup', isOptional: false, isVariadic: false, summary: 'an integer representing the player\'s current animation group.' },
            { name: 'animID', isOptional: false, isVariadic: false, summary: 'an integer representing the player\'s current animation ID.' },
        ],
        source: 'The source of this event is the player that died.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerWasted',
    },
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
};
