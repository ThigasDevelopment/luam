import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_35: ApiDocumentationCatalog = {
    isPlayerNametagShowing: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function will allow you to determine if a player\'s name tag is currently showing.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose current name tag condition you want to check' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the player\'s name tag is being shown, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerNametagShowing',
    },
    isPostFXEnabled: {
        summary: 'Checks whether a specific PostFX effect is currently enabled.',
        parameters: [
            { name: 'fxType', isOptional: false, isVariadic: false, summary: 'An string of the PostFX. Possible values are:' },
        ],
        returns: 'Returns **true** if the selected type is enabled, otherwise **false**',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPostFXEnabled',
    },
    isRadarAreaFlashing: {
        summary: 'This function allows detection of whether a radar area is flashing or not.',
        parameters: [
            { name: 'theRadararea', isOptional: false, isVariadic: false, summary: 'The radar area you wish to check the state of flashing' },
        ],
        returns: 'Returns *true* if the radar area is flashing, *false* if it is not or if it doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsRadarAreaFlashing',
    },
    isResourceArchived: {
        summary: 'Checks whether the specified resource is archived. (Currently running from a ZIP file)',
        parameters: [
            { name: 'resourceElement', isOptional: false, isVariadic: false, summary: 'The resource to check.' },
        ],
        returns: 'Returns **true** if the selected resource is archived, **false** if it is not archived, and **nil** if some kind of problem occurred.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsResourceArchived',
    },
    isResourceProtected: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\n\nThis will check if a resource is currently protected, as defined in mtaserver.conf.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource to check' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the resource is \'protected\', *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsResourceProtected',
    },
    isShowCollisionsEnabled: {
        summary: '',
        parameters: [],
        returns: '* Returns *true* if the collision previews are enabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsShowCollisionsEnabled',
    },
    isShowSoundEnabled: {
        summary: '',
        parameters: [],
        returns: '* Returns *true* if world sound IDs should be printed in the debug window, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsShowSoundEnabled',
    },
    isSoundLooped: {
        summary: '',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'The sound element which you want to get the loop state.' },
        ],
        returns: 'Returns *true* if the sound element is looped, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsSoundLooped',
    },
    isSoundPanningEnabled: {
        summary: 'This function checks whether panning is enabled in a sound element or not.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'A valid sound element.' },
        ],
        returns: 'Returns *true* if the sound is valid and it has panning enabled, *false* if it does not or is not valid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsSoundPanningEnabled',
    },
    isSoundPaused: {
        summary: 'This function is used to return the current pause state of the specified sound element.\n\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which pause state you want to return.' },
        ],
        returns: 'Returns *true* if the sound element is paused, *false* if unpaused or invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsSoundPaused',
    },
    isTimeFrozen: {
        summary: '',
        parameters: [],
        returns: 'Returns true if time is frozen, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTimeFrozen',
    },
    isTimer: {
        summary: 'This function checks if a variable is a timer.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'The variable that we want to check.' },
        ],
        returns: 'Returns *true* if the passed value is a timer, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTimer',
    },
    isTimerPaused: {
        summary: 'This function allows you to check whether a timer is paused.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'The timer you wish to check.' },
        ],
        returns: 'Returns *true* if the timer is currently paused, *false* if not or if no such timer existed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTimerPaused',
    },
    isTrainChainEngine: {
        summary: 'This function checks if a train is a chain engine (moves the rest of the chain\'s carriages) or not.',
        parameters: [
            { name: 'theTrain', isOptional: false, isVariadic: false, summary: 'a train to check if it\'s a chain engine or not.' },
        ],
        returns: '* *true* if a train was passed to the function and if it\'s a chain engine. * *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrainChainEngine',
    },
    isTrainDerailable: {
        summary: 'This function will check if a train or tram is derailable.',
        parameters: [
            { name: 'vehicleToCheck', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to check.' },
        ],
        returns: 'Returns *true* if the train is derailable, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrainDerailable',
    },
    isTrainDerailed: {
        summary: 'This function will check if a train or tram is derailed.',
        parameters: [
            { name: 'vehicleToCheck', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to check is derailed.' },
        ],
        returns: 'Returns *true* if the train is derailed, *false* if the train is still on the rails',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrainDerailed',
    },
    isTransferBoxActive: {
        summary: 'This function returns whether the file downloading dialog box is active or not. This appears when a resource is started and the client doesn\'t have all the files that resource requires the client to have.\n\nIt\'s important to note that resources aren\'t started on the client until they\'re completely downloaded, so a resource cannot use this function to detect if it\'s own files are downloaded. A client-side resource triggers the onClientResourceStart event when the files it requires are downloaded.',
        parameters: [],
        returns: 'Returns *true* if the file transfer box is visible, *false* if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTransferBoxActive',
    },
    isTransferBoxAlwaysVisible: {
        summary: '',
        parameters: [],
        returns: 'Returns a boolean, whether the transfer box should be always visible or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTransferBoxAlwaysVisible',
    },
    isTransferBoxVisible: {
        summary: '',
        parameters: [],
        returns: 'On **server** this returns a boolean, whether the transfer box should be visible during downloads or not. On **client** this returns a boolean, whether the transfer box should be visible or not at the time of invocation.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTransferBoxVisible',
    },
    isTrayNotificationEnabled: {
        summary: 'This function returns a boolean value whether the client has enabled tray notifications in his settings or not.',
        parameters: [],
        returns: 'Returns *true* if the tray notifications are enabled in the settings, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsTrayNotificationEnabled',
    },
    isVehicleBlown: {
        summary: 'This function allows you to determine whether a vehicle is blown or still intact.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to obtain the blown status of.' },
        ],
        returns: 'Returns *true* if the vehicle specified has blown up, *false* if it is still intact or the vehicle specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleBlown',
    },
    isVehicleDamageProof: {
        summary: 'This function checks if a vehicle is damage proof (set with setVehicleDamageProof).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle whose invincibility status we want to check.' },
        ],
        returns: 'Returns *true* if the vehicle is damage proof, *false* if it isn\'t or if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleDamageProof',
    },
    isVehicleFuelTankExplodable: {
        summary: 'This will tell you if a vehicle\'s petrol tank is explodable.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to obtain the fuel tank status of.' },
        ],
        returns: 'Returns *true* if the specified vehicle is valid and its fuel tank is explodable, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleFuelTankExplodable',
    },
    isVehicleLocked: {
        summary: 'This will tell you if a vehicle is locked.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to obtain the locked status of.' },
        ],
        returns: 'Returns *true* if the vehicle specified is locked, *false* if is unlocked or the vehicle specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleLocked',
    },
    isVehicleNitroActivated: {
        summary: 'This function checks if nitro is activated on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to check for an activation.' },
        ],
        returns: 'Returns *true* if the nitro is currently activated on the vehicle, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleNitroActivated',
    },
    isVehicleNitroRecharging: {
        summary: 'This function checks if nitro is recharging on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to check for recharging.' },
        ],
        returns: 'Returns *true* if the nitro is currently recharging on the vehicle, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleNitroRecharging',
    },
    isVehicleOnGround: {
        summary: 'Checks to see if a vehicle has contact with the ground.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to check.' },
        ],
        returns: 'Returns *true* if vehicle is on the ground, *false* if it is not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleOnGround',
    },
    isVehicleRespawnable: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which you\'d like to get respawn state of.' },
        ],
        returns: 'Returns three **true** if the vehicle is respawnable, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleRespawnable',
    },
    isVehicleSmokeTrailEnabled: {
        summary: '',
        parameters: [
            { name: 'veh', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'If it enabled it returns *true*, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleSmokeTrailEnabled',
    },
    isVehicleTaxiLightOn: {
        summary: 'This function will get the taxi light state of a taxi (vehicle IDs 420 and 438)',
        parameters: [
            { name: 'taxi', isOptional: false, isVariadic: false, summary: 'The vehicle element of the taxi that you wish to get the light state of.' },
        ],
        returns: 'Returns *true* if the light is on, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleTaxiLightOn',
    },
    isVehicleWheelOnGround: {
        summary: 'This function returns a boolean whether the vehicle\'s wheel is on ground (true) or in air (false).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to check.' },
            { name: 'wheel', isOptional: false, isVariadic: false, summary: 'The wheel name or number, see list below:' },
        ],
        returns: 'Returns *true* if the vehicle wheel is on ground/collided, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleWheelOnGround',
    },
};
