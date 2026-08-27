import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

export const MTA_EVENT_DOCS_4: EventDocumentationCatalog = {
    onClientPickupLeave: {
        summary: 'This event triggers whenever a pickup is left clientside.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player that left the pickup' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: '*true* if thePlayer is in the same dimension as the pickup, *false* otherwise.' },
        ],
        source: 'The source of this event is the pickup that was left.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPickupLeave',
    },
    onClientPlayerChangeNick: {
        summary: 'This event is triggered when a player changes his nickname.',
        parameters: [
            { name: 'oldNick', isOptional: false, isVariadic: false, summary: 'the nickname the player had before.' },
            { name: 'newNick', isOptional: false, isVariadic: false, summary: 'the new nickname of the player.' },
        ],
        source: 'The source of this event is the player that changed his nick',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerChangeNick',
    },
    onClientPlayerChoke: {
        summary: 'This event is fired when the local player chokes due to the effect of a weapon such as tear gas grenades, fire extinguishers and spray cans.',
        parameters: [
            { name: 'weaponID', isOptional: false, isVariadic: false, summary: 'an int representing the ID of the weapon which caused the choking.' },
        ],
        source: 'The source of this event is the player who is choking. (Local player only)',
        cancel: 'If this event is canceled, the player will not be choked.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerChoke',
    },
    onClientPlayerDamage: {
        summary: 'This event is triggered whenever a player is damaged.',
        parameters: [
            { name: 'attacker', isOptional: false, isVariadic: false, summary: 'A player element representing the attacker or vehicle element (when being run over or falling off a bike).' },
            { name: 'damage_causing', isOptional: false, isVariadic: false, summary: 'An int representing the cause of damage, either a attacker weapon, or some other types of damage.' },
            { name: 'bodypart', isOptional: false, isVariadic: false, summary: 'An integer representing the bodypart the player was damaged.' },
            { name: 'loss', isOptional: false, isVariadic: false, summary: 'A float representing the percentage of health the player lost.' },
        ],
        source: 'The source of this event is the player that got damaged. (Streamed in players only)',
        cancel: 'If this event is canceled, then any damaging effects to the local player will cease.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerDamage',
    },
    onClientPlayerHeliKilled: {
        summary: 'This event is fired when a player is killed due to the effect of a helicopter blades.',
        parameters: [
            { name: 'killer', isOptional: false, isVariadic: false, summary: 'the vehicle (heli) responsible for causing the death.' },
        ],
        source: 'The source of this event is the player who was killed',
        cancel: 'If this event is canceled, the player will not be killed',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerHeliKilled',
    },
    onClientPlayerHitByWaterCannon: {
        summary: 'This event is fired when a player is hit by a water cannon.',
        parameters: [
            { name: 'playerHit', isOptional: false, isVariadic: false, summary: 'the player which got shot by the water cannon' },
        ],
        source: 'The source of this event is the vehicle who shot the water cannon.',
        cancel: 'If this event is canceled, the player will not be knocked down.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerHitByWaterCannon',
    },
    onClientPlayerJoin: {
        summary: 'This event is triggered when a player joins a server. It is triggered for all players except the local player, as the local player joins the server before their client-side resources are started. It would also be possible for two players to join within a few seconds of each other and for the two players\' scripts may not receive onClientPlayerJoin events as their scripts wouldn\'t have started yet.\n\nThis event is not cancellable.',
        parameters: [],
        source: 'The source of this event is the player that joined the server.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerJoin',
    },
    onClientPlayerNetworkStatus: {
        summary: 'This event is triggered when the server network connection to a player is interrupted. See onPlayerNetworkStatus for detecting player to server interruptions.',
        parameters: [
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A number which is 0 if the interruption has begun, or 1 if the interruption is ending.' },
            { name: 'ticks', isOptional: false, isVariadic: false, summary: 'Number of ticks since the interruption started.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerNetworkStatus',
    },
    onClientPlayerPickupHit: {
        summary: 'This event triggers whenever a player hits a pickup locally.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'the pickup that was hit.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: '*true* if thePickup is in the same dimension as the player, *false* otherwise.' },
        ],
        source: 'The source of this event is the player that hit the pickup.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerPickupHit',
    },
    onClientPlayerPickupLeave: {
        summary: 'This event triggers whenever a player leaves pickup locally.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'the pickup that was left.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: '*true* if thePickup is in the same dimension as the player, *false* otherwise.' },
        ],
        source: 'The source of this event is the player that left the pickup.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerPickupLeave',
    },
    onClientPlayerQuit: {
        summary: 'This event is triggered when a **remote** player quits the game or leaves the server. It **will not** get triggered on the source player\'s client. (Use onClientResourceStop to save client side data when the local player quits.)',
        parameters: [
            { name: 'reason', isOptional: false, isVariadic: false, summary: 'A string representing the reason why the player quit.' },
        ],
        source: 'The source of this event is the player that quit the game.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerQuit',
    },
    onClientPlayerRadioSwitch: {
        summary: 'This event is triggered whenever the local player\'s radio station is changed',
        parameters: [
            { name: 'stationID', isOptional: false, isVariadic: false, summary: 'An integer representing the station the player switched to.' },
        ],
        source: 'The source of this event is the local player.',
        cancel: 'If this event is canceled, the Radio station will not change.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerRadioSwitch',
    },
    onClientPlayerSpawn: {
        summary: 'This event is triggered when any player, including a remote player, spawns.',
        parameters: [
            { name: 'hisTeam', isOptional: false, isVariadic: false, summary: 'A team element representing the team the player spawned on.' },
        ],
        source: 'The source of this event is the player that spawned.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerSpawn',
    },
    onClientPlayerStealthKill: {
        summary: 'This event is triggered when the local player stealth kills another player.',
        parameters: [
            { name: 'targetPlayer', isOptional: false, isVariadic: false, summary: 'The player or ped that is being stealth killed.' },
        ],
        source: 'The source of this event is the player that initiated the stealth kill. (Local player only)',
        cancel: 'If this event is canceled, then the stealth kill is aborted.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerStealthKill',
    },
    onClientPlayerStuntFinish: {
        summary: 'This event is triggered whenever the local player finishes a vehicle stunt.',
        parameters: [
            { name: 'stuntType', isOptional: false, isVariadic: false, summary: 'the type of stunt the player just performed. Valid types are:' },
            { name: 'stuntTime', isOptional: false, isVariadic: false, summary: 'the number of miliseconds the stunt lasted.' },
            { name: 'stuntDistance', isOptional: false, isVariadic: false, summary: 'the distance traveled while doing the stunt.' },
        ],
        source: 'The source of this event is the local player.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerStuntFinish',
    },
    onClientPlayerStuntStart: {
        summary: 'This event is triggered whenever the local player starts doing a vehicle stunt.',
        parameters: [
            { name: 'stuntType', isOptional: false, isVariadic: false, summary: 'the type of stunt the player is starting to perform. Valid types are:' },
        ],
        source: 'The source of this event is the local player.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerStuntStart',
    },
    onClientPlayerTarget: {
        summary: 'This event is triggered whenever the local player targets an element.',
        parameters: [
            { name: 'target', isOptional: false, isVariadic: false, summary: 'The element the player targetted.' },
        ],
        source: 'The source of this event is the player that targeted the element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerTarget',
    },
    onClientPlayerVehicleEnter: {
        summary: 'This event is fired when a player has entered a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that the player entered' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'the seat that the player now is on. Driver\'s seat = 0, higher numbers are passenger seats.' },
        ],
        source: 'The source of this event is the player that entered the vehicle.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerVehicleEnter',
    },
    onClientPlayerVehicleExit: {
        summary: 'This event is triggered when a player has exited a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that the player exited.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'the number of the seat that the player was sitting on.' },
        ],
        source: 'The source of this event is the player that exited the vehicle.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerVehicleExit',
    },
    onClientPlayerVoicePause: {
        summary: 'This event is triggered when a player\'s voice sound is paused using setSoundPaused.',
        parameters: [
            { name: 'reason', isOptional: false, isVariadic: false, summary: 'the reason for the pause, this can be only "paused".' },
        ],
        source: 'The source of this event is the player whose voice got paused.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerVoicePause',
    },
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
        ],
        source: 'The source of this event is the player that died.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPlayerWasted',
    },
};
