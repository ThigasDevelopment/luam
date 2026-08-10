import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_32: ApiDocumentationCatalog = {
    isPedInVehicle: {
        summary: 'Checks whether or not a given ped is currently in a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check.' },
        ],
        returns: 'returns true if the ped is in a vehicle, false if he is on foot or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedInVehicle',
    },
    isPedOnFire: {
        summary: 'This function checks if the specified ped is on fire or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped to check.' },
        ],
        returns: 'returns true if the ped is on fire, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedOnFire',
    },
    isPedOnGround: {
        summary: 'This function is used to determine whether or not a ped is on the ground. This is for\non-foot usage only.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you are checking.' },
        ],
        returns: 'returns true if the ped is on foot and on the ground, false otherwise, even if he is in a car that stands still or on object outside world map.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedOnGround',
    },
    isPedReloadingWeapon: {
        summary: 'This function is used to determine whether or not a ped is currently reloading their\nweapon. Useful to stop certain quick reload exploits.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you are checking.' },
        ],
        returns: 'returns true if the ped is currently reloading a weapon, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedReloadingWeapon',
    },
    isPedTargetingMarkerEnabled: {
        summary: 'This function checks whether health target markers are drawn as set by\nsetPedTargetingMarkerEnabled or not.',
        parameters: [],
        returns: 'returns true if the health target markers are enabled, false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedTargetingMarkerEnabled',
    },
    isPedWearingJetpack: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check' },
        ],
        returns: 'returns true if the ped is carrying a jetpack, false if he is not or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedWearingJetpack',
    },
    isPickupSpawned: {
        summary: 'This function checks if a pickup is currently spawned (is visible and can be picked up)\nor not (a player picked it up recently).',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'the pickup you want to check.' },
        ],
        returns: 'returns true if the pickup is spawned, false if its not spawned or an invalid pickup was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPickupSpawned',
    },
    isPlayerHudComponentVisible: {
        summary: 'This function can be used to check whether an hud component is visable or not.',
        parameters: [
            { name: 'component', isOptional: false, isVariadic: false, summary: 'The component you wish to check. Valid values are: ammo The display showing how much ammo the player has in their weapon area_name The text that appears containing the name of the area a player has entered armour The display showing the players armor breath The display showing the players breath clock The display showing the in-game time health The display showing the players health money The display showing how much money the player has radar The bottom-left corner miniradar vehicle_name The text that appears containing the players vehicle name when the player enters a vehicle weapon The display showing the players weapon radio The display showing the radio label wanted The display showing the players wanted level crosshair The weapon crosshair and sniper scope' },
        ],
        returns: 'returns true if the component is visable, false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerHudComponentVisible',
    },
    isPlayerMapForced: {
        summary: 'This function checks if the specified players radar map has been forced on or not.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player' },
        ],
        returns: 'returns true if the players radar map is forced on, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerMapForced',
    },
    isPlayerMapVisible: {
        summary: 'This function checks if the local player has their map showing.',
        parameters: [],
        returns: 'returns true if the player has the map visible, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerMapVisible',
    },
    isPlayerMuted: {
        summary: 'Use this function to check if a player has been muted.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you are checking.' },
        ],
        returns: 'returns true if the player is muted and false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerMuted',
    },
    isPlayerNametagShowing: {
        summary: 'This function will allow you to determine if a players name tag is currently showing.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose current name tag condition you want to check' },
        ],
        returns: 'returns true if the players name tag is being shown, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerNametagShowing',
    },
    isRadarAreaFlashing: {
        summary: 'This function allows detection of whether a radar area is flashing or not.',
        parameters: [
            { name: 'theRadararea', isOptional: false, isVariadic: false, summary: 'The radar area you wish to check the state of flashing' },
        ],
        returns: 'returns true if the radar area is flashing, false if it is not or if it doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsRadarAreaFlashing',
    },
    isResourceArchived: {
        summary: 'Checks whether a resource is currently archived (running from within a ZIP file).',
        parameters: [
            { name: 'resourceElement', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if a resource is archived, false if it is not archived, or nil if there is problem with resource.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsResourceArchived',
    },
    isResourceProtected: {
        summary: 'This will check if a resource is currently protected, as defined in\nServer_mtaserver.conf#resource|mtaserver.conf.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource to check' },
        ],
        returns: 'returns true if the resource is protected, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsResourceProtected',
    },
    isShowCollisionsEnabled: {
        summary: '',
        parameters: [],
        returns: '* returns true if the collision previews are enabled, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsShowCollisionsEnabled',
    },
    isShowSoundEnabled: {
        summary: '',
        parameters: [],
        returns: '* returns true if world sound ids should be printed in the debug window, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsShowSoundEnabled',
    },
    isSoundLooped: {
        summary: '',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'The sound element which you want to get the loop state.' },
        ],
        returns: 'returns true if the sound element is looped, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsSoundLooped',
    },
    isSoundPanningEnabled: {
        summary: 'This function checks whether panning is enabled in a sound element or not.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'A valid sound element.' },
        ],
        returns: 'returns true if the sound is valid and it has panning enabled, false if it does not or is not valid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsSoundPanningEnabled',
    },
    isSoundPaused: {
        summary: 'This function is used to return the current pause state of the specified sound element.\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which pause state you want to return.' },
        ],
        returns: 'returns true if the sound element is paused, false if unpaused or invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsSoundPaused',
    },
    isTimer: {
        summary: 'This function checks if a variable is a timer.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: ': The variable that we want to check.' },
        ],
        returns: 'returns true if the passed value is a timer, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTimer',
    },
    isTrainChainEngine: {
        summary: 'This function checks if a Element/Vehicle|train is a chain engine (moves the rest of the\nchains carriages) or not.',
        parameters: [
            { name: 'theTrain', isOptional: false, isVariadic: false, summary: 'a Element/Vehicle|train to check if its a chain engine or not.' },
        ],
        returns: '* true if a element/vehicle|train was passed to the function and if its a chain engine. * false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrainChainEngine',
    },
    isTrainDerailable: {
        summary: 'This function will check if a train or tram is derailable.',
        parameters: [
            { name: 'vehicleToCheck', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to check.' },
        ],
        returns: 'returns true if the train is derailable, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrainDerailable',
    },
    isTrainDerailed: {
        summary: 'This function will check if a train or tram is derailed.',
        parameters: [
            { name: 'vehicleToCheck', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to check is derailed.' },
        ],
        returns: 'returns true if the train is derailed, false if the train is still on the rails',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrainDerailed',
    },
    isTransferBoxActive: {
        summary: 'This function returns whether the file downloading dialog box is active or not. This\nappears when a resource is started and the client doesnt have all the files that resource\nrequires the client to have.\nIts important to note that resources arent started on the client until theyre completely\ndownloaded, so a resource cannot use this function to detect if its own files are\ndownloaded. A client-side resource triggers the onClientResourceStart event when the\nfiles it requires are downloaded.',
        parameters: [],
        returns: 'returns true if the file transfer box is visible, false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTransferBoxActive',
    },
    isTransferBoxAlwaysVisible: {
        summary: '',
        parameters: [],
        returns: 'returns a boolean, whether the transfer box should be always visible or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTransferBoxAlwaysVisible',
    },
    isTransferBoxVisible: {
        summary: '',
        parameters: [],
        returns: 'on server this returns a boolean, whether the transfer box should be visible during downloads or not. on client this returns a boolean, whether the transfer box should be visible or not at the time of invocation.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTransferBoxVisible',
    },
    isTrayNotificationEnabled: {
        summary: 'This function returns a boolean value whether the client has enabled tray notifications\nin his settings or not.',
        parameters: [],
        returns: 'returns true if the tray notifications are enabled in the settings, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrayNotificationEnabled',
    },
    isVehicleBlown: {
        summary: 'This function allows you to determine whether a vehicle is blown or still intact.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to obtain the blown status of.' },
        ],
        returns: 'returns true if the vehicle specified has blown up, false if it is still intact or the vehicle specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleBlown',
    },
    isVehicleDamageProof: {
        summary: 'This function checks if a vehicle is damage proof (set with setVehicleDamageProof).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle whose invincibility status we want to check.' },
        ],
        returns: 'returns true if the vehicle is damage proof, false if it isnt or if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleDamageProof',
    },
    isVehicleFuelTankExplodable: {
        summary: 'This will tell you if a vehicles petrol tank is explodable.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to obtain the fuel tank status of.' },
        ],
        returns: 'returns true if the specified vehicle is valid and its fuel tank is explodable, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleFuelTankExplodable',
    },
    isVehicleLocked: {
        summary: 'This will tell you if a vehicle is locked.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to obtain the locked status of.' },
        ],
        returns: 'returns true if the vehicle specified is locked, false if is unlocked or the vehicle specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleLocked',
    },
};
