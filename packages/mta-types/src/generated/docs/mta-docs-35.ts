import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_35: ApiDocumentationCatalog = {
    removeElementDataSubscriber: {
        summary: 'This function is used together with setElementData in subscribe mode.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to unsubscribe the player from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to unsubscribe the player from.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to unsubscribe.' },
        ],
        returns: 'returns true if the player was unsubscribed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveElementDataSubscriber',
    },
    removeEventHandler: {
        summary: 'This functions removes a handler function from an event, so that the function is not\ncalled anymore when the event is triggered. See event system for more information on how\nthe event system works.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you want to detach the handler function from.' },
            { name: 'attachedTo', isOptional: false, isVariadic: false, summary: 'The element the handler was attached to.' },
            { name: 'functionVar', isOptional: false, isVariadic: false, summary: 'The handler function that was attached.' },
        ],
        returns: 'returns true if the event handler was removed successfully. returns false if the specified event handler could not be found or invalid parameters were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveEventHandler',
    },
    removePedClothes: {
        summary: 'This function is used to remove the current clothes of a certain type on a ped. It will\nremove them if the clothesTexture and clothesModel arent specified, or if they match the\ncurrent clothes on that slot.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped you want to remove clothes from.' },
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: ': the clothes slot/type to remove. See the CJ Clothes|clothes catalog.' },
            { name: 'clothesTexture', isOptional: true, isVariadic: false, summary: ': (Server only) A string determining the clothes texture that will be removed. See the CJ Clothes|clothes catalog.' },
            { name: 'clothesModel', isOptional: true, isVariadic: false, summary: ': (Server only) A string determining the clothes model that will be removed. See the CJ Clothes|clothes catalog.' },
        ],
        returns: 'this function returns true if the clothes were successfully removed from the ped, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemovePedClothes',
    },
    removePedFromVehicle: {
        summary: 'This function removes a ped from a vehicle immediately. This works for drivers and\npassengers. Note that this removes the ped from the vehicle and puts him in the exact\nposition where the command was initiated.\nAvailable client side from 1.3.1 (It will only work with client side vehicles and peds)',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you wish to remove from a vehicle' },
        ],
        returns: 'returns true if the operation was successful, false if the specified ped is not valid or if it isnt in a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemovePedFromVehicle',
    },
    removeResourceFile: {
        summary: 'This function removes a file from the resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource element.' },
            { name: 'fileName', isOptional: false, isVariadic: false, summary: 'The filename what you want to delete.' },
        ],
        returns: 'returns true if file was deleted, otherwise false if the resource is in use or the file doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveResourceFile',
    },
    removeRuleValue: {
        summary: 'This function removes a set rule value that can be viewed by server browsers.',
        parameters: [
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the rule you wish to remove' },
        ],
        returns: 'returns true if the rule value was removed, false if it failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveRuleValue',
    },
    removeVehicleSirens: {
        summary: 'This function removes sirens from a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to remove the sirens of' },
        ],
        returns: 'returns true if sirens were successfully removed from the vehicle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveVehicleSirens',
    },
    removeVehicleUpgrade: {
        summary: 'This function removes an already existing upgrade from the specified vehicle, eg: nos,\nhydraulics. Defined in San Andreas\\data\\maps\\veh_mods\\veh_mods.ide.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The element representing the vehicle you wish to remove the upgrade from' },
            { name: 'upgrade', isOptional: false, isVariadic: false, summary: ': The ID of the upgrade you wish to remove.' },
        ],
        returns: 'returns true if the upgrade was successfully removed from the vehicle, otherwise false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveVehicleUpgrade',
    },
    removeWorldModel: {
        summary: 'This function is used to remove a world object.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'A whole integer specifying the GTASA object model ID.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: 'A floating point number representing the radius that will be eliminated.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'interior', isOptional: true, isVariadic: false, summary: 'The interior ID to apply the removal to. Some objects in interior 13 show in all interiors so if you want to remove everything in interior 0 also remove everything in interior 13. A value of -1 here will affect all interiors.' },
        ],
        returns: 'returns true if the object was removed, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveWorldModel',
    },
    renameResource: {
        summary: 'This function renames a resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The name of resource or the resource you want to rename.' },
            { name: 'newResourceName', isOptional: false, isVariadic: false, summary: 'The name of what the resource should be renamed to.' },
            { name: 'organizationalPath', isOptional: true, isVariadic: false, summary: 'If you want to store the new resource inside a category.' },
        ],
        returns: 'returns true if the resource has been renamed successfully, false otherwise. this could fail if the resource name already is in use, if a directory already exists with the name youve specified (but this isnt a valid resource) or if the name you specify isnt valid. it could also fail if the disk was full or for other similar reasons. wont work on a started resource or if the resource is not loaded (not known by mta (use /refresh))',
        wiki: 'https://wiki.multitheftauto.com/wiki/RenameResource',
    },
    requestBrowserDomains: {
        summary: 'This function opens a request window in order to accept the requested remote URLs.',
        parameters: [
            { name: 'pages', isOptional: false, isVariadic: false, summary: 'A table containing all domains' },
            { name: 'parseAsURL', isOptional: true, isVariadic: false, summary: 'true if the passed addresses should be converted from URLs, false otherwise.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function that is called as soon as the result is available Syntax: ```lua function(bool wasAccepted, table new_domains) ```' },
        ],
        returns: 'returns true, if the string was successfully read, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RequestBrowserDomains',
    },
    resendPlayerACInfo: {
        summary: 'This function will force the specified player to resend their AC info, triggering the\nonPlayerACInfo event again.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': A player object referencing the specified player' },
        ],
        returns: 'returns true if the ac info will be resent, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResendPlayerACInfo',
    },
    resendPlayerModInfo: {
        summary: 'This function will force the specified player to resend their mod info, triggering the\nonPlayerModInfo event again.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': A player object referencing the specified player' },
        ],
        returns: 'returns true if the mod info will be resent, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResendPlayerModInfo',
    },
    resetAmbientSounds: {
        summary: 'This function is used to reset the background sounds to the default setting.',
        parameters: [],
        returns: 'returns true if the ambient sounds were reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetAmbientSounds',
    },
    resetBlurLevel: {
        summary: 'Resets the motion blur level on the clients screen to default value (36).',
        parameters: [],
        returns: 'returns true if the blur level was reset successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetBlurLevel',
    },
    resetColorFilter: {
        summary: '',
        parameters: [],
        returns: 'returns true if the color filtering was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetColorFilter',
    },
    resetCoronaReflectionsEnabled: {
        summary: '',
        parameters: [],
        returns: 'returns true.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetCoronaReflectionsEnabled',
    },
    resetFarClipDistance: {
        summary: 'This function resets the far clip distance to its default state.',
        parameters: [],
        returns: 'returns true if operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetFarClipDistance',
    },
    resetFogDistance: {
        summary: 'This function resets the fog render distance to its default state.',
        parameters: [],
        returns: 'returns true if operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetFogDistance',
    },
    resetHeatHaze: {
        summary: 'This function restores the default heat haze.',
        parameters: [],
        returns: 'returns true if the heat haze was reset correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetHeatHaze',
    },
    resetMapInfo: {
        summary: 'This function is used to reset the state of a player.  It is intended to restore a player\nto his default state as if he had just joined the server, without any scripts affecting\nhim.',
        parameters: [
            { name: 'thePlayer', isOptional: true, isVariadic: false, summary: 'The specific player you wish to restore the state of. Not specifying this will result in all players map info being reset.' },
        ],
        returns: 'returns true if the map info was reset successfully, otherwise false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetMapInfo',
    },
    resetMoonSize: {
        summary: 'This function is used to reset the size of the moon to its normal size.',
        parameters: [],
        returns: 'returns true if the size of the moon was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetMoonSize',
    },
    resetNearClipDistance: {
        summary: 'This function resets near clip distance set by setNearClipDistance.',
        parameters: [],
        returns: '*boolean: always returns true',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetNearClipDistance',
    },
    resetPedsLODDistance: {
        summary: '',
        parameters: [],
        returns: 'returns true if the peds lod distance was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetPedsLODDistance',
    },
    resetRainLevel: {
        summary: 'This function resets the rain level of the current weather to its default.',
        parameters: [],
        returns: 'returns true if the rain level was reset.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetRainLevel',
    },
    resetSkyGradient: {
        summary: 'This function allows restoring of a changed sky gradient as a result of setSkyGradient.',
        parameters: [],
        returns: 'returns true if sky color was reset correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetSkyGradient',
    },
    resetSunColor: {
        summary: 'This function is used to reset the color of the sun to its normal color.',
        parameters: [],
        returns: 'returns true if the color of the sun was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetSunColor',
    },
    resetSunSize: {
        summary: 'This function is used to reset the size of the sun to its normal size.',
        parameters: [],
        returns: 'returns true if the size of the sun was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetSunSize',
    },
    resetTimer: {
        summary: 'This function allows you to reset the elapsed time in existing timers to zero. The\nfunction does not reset the times to execute count on timers which have a limited amout\nof repetitions.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'The timer whose elapsed time you wish to reset.' },
        ],
        returns: 'returns true if the timer was successfully reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetTimer',
    },
    resetVehicleComponentPosition: {
        summary: 'This function reset to default component position for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset component position.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'returns true if the position of the component was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleComponentPosition',
    },
    resetVehicleComponentRotation: {
        summary: 'This function reset to default component rotation for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset component rotation.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'returns true if the rotation of the component was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleComponentRotation',
    },
};
