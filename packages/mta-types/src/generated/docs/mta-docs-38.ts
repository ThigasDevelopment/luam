import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_38: ApiDocumentationCatalog = {
    removeElementData: {
        summary: 'This function removes the element data with the given key for that element. The element data removal is synced with all the clients.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to remove the data from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key string you wish to remove.' },
        ],
        returns: 'Returns *true* if the data was removed succesfully, *false* if the given key does not exist in the element or the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveElementData',
    },
    removeElementDataSubscriber: {
        summary: 'This function unsubscribes a player from specific element data.\nThis function is used together with setElementData in *"subscribe"* mode.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to unsubscribe the player from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to unsubscribe the player from.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to unsubscribe.' },
        ],
        returns: 'Returns *true* if the player was unsubscribed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveElementDataSubscriber',
    },
    removeEventHandler: {
        summary: 'This functions removes a handler function from an event, so that the function is not called anymore when the event is triggered. See event system for more information on how the event system works.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you want to detach the handler function from.' },
            { name: 'attachedTo', isOptional: false, isVariadic: false, summary: 'The element the handler was attached to.' },
            { name: 'functionVar', isOptional: false, isVariadic: false, summary: 'The handler function that was attached.' },
        ],
        returns: 'Returns *true* if the event handler was removed successfully. Returns *false* if the specified event handler could not be found or invalid parameters were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveEventHandler',
    },
    removeGameWorld: {
        summary: 'This function removes the entire game world and also clears the dummies pool.',
        parameters: [],
        returns: 'This function does not return any value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveGameWorld',
    },
    removePedClothes: {
        summary: 'This function is used to remove the current clothes of a certain type on a ped. It will remove them if the clothesTexture and clothesModel aren\'t specified, or if they match the current clothes on that slot.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you want to remove clothes from.' },
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: 'the clothes slot/type to remove. See the clothes catalog.' },
            { name: 'clothesTexture', isOptional: true, isVariadic: false, summary: '(Server only) A string determining the clothes texture that will be removed. See the clothes catalog.' },
            { name: 'clothesModel', isOptional: true, isVariadic: false, summary: '(Server only) A string determining the clothes model that will be removed. See the clothes catalog.' },
        ],
        returns: 'This function returns *true* if the clothes were successfully removed from the ped, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemovePedClothes',
    },
    removePedFromVehicle: {
        summary: 'This function removes a ped from a vehicle immediately. This works for drivers and passengers. Note that this removes the ped from the vehicle and puts him in the exact position where the command was initiated.\n\n**Available client side from 1.3.1** (It will only work with client side vehicles and peds)',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you wish to remove from a vehicle' },
        ],
        returns: 'Returns *true* if the operation was successful, *false* if the specified ped is not valid or if it isn\'t in a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemovePedFromVehicle',
    },
    removeResourceFile: {
        summary: 'This function removes a file from the resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource element.' },
            { name: 'fileName', isOptional: false, isVariadic: false, summary: 'The filename what you wan\'t to delete.' },
        ],
        returns: 'Returns *true* if file was deleted, otherwise *false* if the resource is in use or the file doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveResourceFile',
    },
    removeRuleValue: {
        summary: 'This function removes a set rule value that can be viewed by server browsers.',
        parameters: [
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the rule you wish to remove' },
        ],
        returns: 'Returns *true* if the rule value was removed, *false* if it failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveRuleValue',
    },
    removeVehicleSirens: {
        summary: 'This function removes sirens from a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to remove the sirens of' },
        ],
        returns: 'Returns *true* if sirens were successfully removed from the vehicle, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveVehicleSirens',
    },
    removeVehicleUpgrade: {
        summary: 'This function removes an already existing upgrade from the specified vehicle, eg: nos, hydraulics. Defined in San Andreas\\data\\maps\\veh_mods\\veh_mods.ide.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The element representing the vehicle you wish to remove the upgrade from' },
            { name: 'upgrade', isOptional: false, isVariadic: false, summary: 'The ID of the upgrade you wish to remove.' },
        ],
        returns: 'Returns *true* if the upgrade was successfully removed from the vehicle, otherwise *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveVehicleUpgrade',
    },
    removeWorldModel: {
        summary: '<!--\n\n-->\nThis function is used to remove a world object. Use restoreWorldModel to reverse this action.\n\n<!--\n\n-->',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'A whole integer specifying the GTASA object model ID.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: 'A floating point number representing the radius that will be eliminated.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'interior', isOptional: true, isVariadic: false, summary: 'The interior ID to apply the removal to. Some objects in interior 13 show in all interiors so if you want to remove everything in interior 0 also remove everything in interior 13. A value of -1 here will affect all interiors.' },
        ],
        returns: 'Returns *true* if the world object was removed, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveWorldModel',
    },
    renameResource: {
        summary: 'This function renames a resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The name of resource or the resource you want to rename.' },
            { name: 'newResourceName', isOptional: false, isVariadic: false, summary: 'The name of what the resource should be renamed to.' },
            { name: 'organizationalPath', isOptional: true, isVariadic: false, summary: 'If you want to store the new resource inside a category.' },
        ],
        returns: 'Returns *true* if the resource has been renamed successfully, *false* otherwise. This could fail if the resource name already is in use, if a directory already exists with the name you\'ve specified (but this isn\'t a valid resource) or if the name you specify isn\'t valid. It could also fail if the disk was full or for other similar reasons. Won\'t work on a started resource or if the resource is not loaded (not known by MTA (use /refresh))',
        wiki: 'https://wiki.multitheftauto.com/wiki/RenameResource',
    },
    requestBrowserDomains: {
        summary: 'This function opens a request window in order to accept the requested remote URLs.',
        parameters: [
            { name: 'pages', isOptional: false, isVariadic: false, summary: 'A table containing all domains' },
            { name: 'parseAsURL', isOptional: true, isVariadic: false, summary: '*true* if the passed addresses should be converted from URLs, *false* otherwise.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function that is called as soon as the result is available' },
        ],
        returns: 'Returns **true**, if the string was successfully read, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RequestBrowserDomains',
    },
    resendPlayerACInfo: {
        summary: 'This function will force the specified player to resend their AC info, triggering the onPlayerACInfo event again.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player' },
        ],
        returns: 'Returns *true* if the AC info will be resent, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResendPlayerACInfo',
    },
    resendPlayerModInfo: {
        summary: 'This function will force the specified player to resend their mod info, triggering the onPlayerModInfo event again.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player' },
        ],
        returns: 'Returns *true* if the mod info will be resent, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResendPlayerModInfo',
    },
    resetAmbientSounds: {
        summary: 'This function is used to reset the background sounds to the default setting.',
        parameters: [],
        returns: 'Returns true if the ambient sounds were reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetAmbientSounds',
    },
    resetBlurLevel: {
        summary: 'Resets the motion blur level on the client\'s screen to default value (36).',
        parameters: [],
        returns: 'Returns *true* if the blur level was reset successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetBlurLevel',
    },
    resetColorFilter: {
        summary: 'This function is used to reset the color filtering to its default values.',
        parameters: [],
        returns: 'Returns *true* if the color filtering was reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetColorFilter',
    },
    resetCoronaReflectionsEnabled: {
        summary: 'This function resets visibility of corona reflections. Default value depends on client setting. If client has enabled *corona rain reflections* in video options, value will be reset to **1**, otherwise to **0**. You can check value of this option using dxGetStatus (*SettingCoronaReflections*).',
        parameters: [],
        returns: 'Returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetCoronaReflectionsEnabled',
    },
    resetDiscordRichPresenceData: {
        summary: 'The function resets the Discord Rich Presence configuration to default.',
        parameters: [],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetDiscordRichPresenceData',
    },
    resetFarClipDistance: {
        summary: 'This function resets the far clip distance to its default state.',
        parameters: [],
        returns: 'Returns *true* if operation was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetFarClipDistance',
    },
    resetFogDistance: {
        summary: 'This function resets the fog render distance to its default state.',
        parameters: [],
        returns: 'Returns *true* if operation was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetFogDistance',
    },
    resetHeatHaze: {
        summary: 'This function restores the default heat haze.',
        parameters: [],
        returns: 'Returns *true* if the heat haze was reset correctly, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetHeatHaze',
    },
    resetMapInfo: {
        summary: 'This function is used to reset the state of a player.  It is intended to restore a player to their default state as if they had just joined the server, without any scripts affecting the player.',
        parameters: [
            { name: 'thePlayer', isOptional: true, isVariadic: false, summary: 'The specific player you wish to restore the state of. Not specifying this will result in all players map info being reset.' },
        ],
        returns: 'Returns *true* if the map info was reset successfully, otherwise *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetMapInfo',
    },
    resetMoonSize: {
        summary: 'This function is used to reset the size of the moon to its normal size.',
        parameters: [],
        returns: 'Returns true if the size of the moon was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetMoonSize',
    },
    resetNearClipDistance: {
        summary: 'This function resets near clip distance set by setNearClipDistance.',
        parameters: [],
        returns: '***boolean:** always returns **true**',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetNearClipDistance',
    },
    resetPedsLODDistance: {
        summary: 'Resets the distance of peds LOD to default. Default values depends on client setting. If client has enabled *high detail peds* in video options, value will be reset to 500 - otherwise to 60.',
        parameters: [],
        returns: 'Returns *true* if the peds LOD distance was reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetPedsLODDistance',
    },
    resetPedVoice: {
        summary: 'Resets the voice of a ped to a default one.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose voice to reset.' },
        ],
        returns: 'Returns *true* when the voice was successfully reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetPedVoice',
    },
    resetPlayerHudComponentProperty: {
        summary: 'This function resets the specified property to its default value.',
        parameters: [
            { name: 'component', isOptional: false, isVariadic: false, summary: 'The component whose property you want to reset. See HUD Components.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The name of the property you want to reset. See HUD Properties.' },
        ],
        returns: 'Returns **true** if successful, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetPlayerHudComponentProperty',
    },
    resetRainLevel: {
        summary: 'This function resets the rain level of the current weather to its default.',
        parameters: [],
        returns: 'Returns true if the rain level was reset.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetRainLevel',
    },
    resetShakeCamera: {
        summary: 'This function cancels the shaking effect caused by **shakeCamera**',
        parameters: [],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetShakeCamera',
    },
};
