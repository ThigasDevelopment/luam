import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_44: ApiDocumentationCatalog = {
    setInteriorSoundsEnabled: {
        summary: 'This function disables or enables the ambient sounds played by GTA in most interiors, like restaurants, casinos, clubs, houses, etc.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'If a boolean was passed to the function, it always succeeds and returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetInteriorSoundsEnabled',
    },
    setJetpackMaxHeight: {
        summary: 'This function changes the maximum flying height of jetpack.',
        parameters: [
            { name: 'Height', isOptional: false, isVariadic: false, summary: 'The max height starting at approximately -20.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetJetpackMaxHeight',
    },
    setJetpackWeaponEnabled: {
        summary: 'This function sets a weapon usable while using the Jetpack.',
        parameters: [
            { name: 'weaponName', isOptional: false, isVariadic: false, summary: '' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the weapon is enabled or disabled.' },
        ],
        returns: 'Returns true if successful, or false if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetJetpackWeaponEnabled',
    },
    setLightColor: {
        summary: 'This function sets the color for a light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The light that you wish to set the color of.' },
            { name: 'r', isOptional: false, isVariadic: false, summary: '' },
            { name: 'g', isOptional: false, isVariadic: false, summary: '' },
            { name: 'b', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLightColor',
    },
    setLightDirection: {
        summary: 'This function sets the direction for a light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The light that you wish to set the direction of.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLightDirection',
    },
    setLightRadius: {
        summary: 'This function sets the radius for a light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The light that you wish to set the radius of.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLightRadius',
    },
    setLowLODElement: {
        summary: 'This function assigns a low LOD element to an element. The low LOD element is displayed when its associated element is not fully visible. If a low LOD element is assigned to several elements, it will be displayed when any of these elements are not fully visible.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose low LOD version we want to change.' },
            { name: 'lowLODElement', isOptional: false, isVariadic: false, summary: 'A low LOD element to display when the first element is not fully visible.' },
        ],
        returns: 'Returns *true* if the assignment was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLowLODElement',
    },
    setMapName: {
        summary: 'This function is used to set a map name that will be visible in the server browser. In practice you should generally rely on the mapmanager to do this for you.',
        parameters: [
            { name: 'mapName', isOptional: false, isVariadic: false, summary: 'The name you wish the server browser to show. **(MAX 200 characters)**' },
        ],
        returns: 'Returns *true* if map name was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMapName',
    },
    setMarkerColor: {
        summary: 'This function sets the color of the specified marker by modifying the values for red, green, blue and alpha.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker that you wish to set the color of.' },
            { name: 'r', isOptional: false, isVariadic: false, summary: 'The amount of red in the final color (0 to 255).' },
            { name: 'g', isOptional: false, isVariadic: false, summary: 'The amount of green in the final color (0 to 255).' },
            { name: 'b', isOptional: false, isVariadic: false, summary: 'The amount of blue in the final color (0 to 255).' },
            { name: 'a', isOptional: false, isVariadic: false, summary: 'The amount of alpha in the final color (0 to 255).' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerColor',
    },
    setMarkerIcon: {
        summary: 'This function allows changing the icon of a checkpoint marker.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker to change the visual style of' },
            { name: 'icon', isOptional: false, isVariadic: false, summary: 'A string referring to the type of icon, acceptable values are:' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerIcon',
    },
    setMarkerSize: {
        summary: 'This function sets the size of the specified marker.\n\nSetting negative value will "flip" the marker, do nothing or make it invisible:\n* **cylinder** or **arrow**: upside down\n* **ring**: inside out\n* **checkpoint**: disappear\n* **corona**: bigger',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker that you wish to set the size of.' },
            { name: 'size', isOptional: false, isVariadic: false, summary: 'A float representing new size of the marker.' },
        ],
        returns: 'Returns *true* if successful, *false* if failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerSize',
    },
    setMarkerTarget: {
        summary: 'This function sets the \'target\' for a marker. Only the *checkpoint* and *ring* marker types can have a target.\n\nFor *checkpoint* markers, the target is shown as an arrow aiming at the point specified. Only 5 arrows can be visible at the same time.\n\nFor *ring* markers, the target is shown by rotating the whole ring so that it faces the point specified.\n\nThis function is most useful for setting up markers for races, where each marker points to the next one\'s position.\n(This is mostly used in races!)',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker to set the target of' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x axis of the coordinate to target the marker at' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y axis of the coordinate to target the marker at' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z axis of the coordinate to target the marker at' },
        ],
        returns: 'Returns *true* if target was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerTarget',
    },
    setMarkerTargetArrowProperties: {
        summary: 'This function changes the color and size of the checkpoint marker\'s target arrow.',
        parameters: [
            { name: 'marker', isOptional: false, isVariadic: false, summary: '' },
            { name: 'r', isOptional: true, isVariadic: false, summary: 'The amount of red in the final color (0 to 255).' },
            { name: 'g', isOptional: true, isVariadic: false, summary: 'The amount of green in the final color (0 to 255).' },
            { name: 'b', isOptional: true, isVariadic: false, summary: 'The amount of blue in the final color (0 to 255).' },
            { name: 'a', isOptional: true, isVariadic: false, summary: 'The amount of alpha in the final color (0 to 255).' },
            { name: 'size', isOptional: true, isVariadic: false, summary: 'Target arrow size.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerTargetArrowProperties',
    },
    setMarkerType: {
        summary: 'This function changes a marker\'s type. The type controls how the marker is displayed in the game. It\'s important that you use marker types that users are used to from the single player game. For example, checkpoints are used in races, rings are used for aircraft races, arrows are used for entering buildings etc.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'A marker element referencing the specified marker.' },
            { name: 'markerType', isOptional: false, isVariadic: false, summary: 'A string denoting the marker type. Valid values are:' },
        ],
        returns: 'Returns *true* if the marker type was changed, *false* if it wasn\'t or marker values were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerType',
    },
    setMaxPlayers: {
        summary: 'This function sets the maximum number of player slots on the server.',
        parameters: [
            { name: 'slots', isOptional: false, isVariadic: false, summary: 'Maximum number of player slots on the server.' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if number of player slots was successfully changed, *false* or *nil* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMaxPlayers',
    },
    setMinuteDuration: {
        summary: 'Sets the real-world duration of an ingame minute. The GTA default is 1000.',
        parameters: [
            { name: 'milliseconds', isOptional: false, isVariadic: false, summary: 'the new duration of an ingame minute, accepted values 0 - 2147483647.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMinuteDuration',
    },
    setModelHandling: {
        summary: 'This function is used to change the handling data of all vehicles of a specified model.',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: 'The vehicle model you wish to set the handling of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you wish to set the handling of the vehicle to, or *nil* if you want to reset the all the handling properties.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value of the models\'s handling property you wish to set, or *nil* if you want to reset the handling property to its default value.' },
        ],
        returns: 'Returns *true* if the handling was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetModelHandling',
    },
    setMoonSize: {
        summary: 'This function sets the moon size. Using this function server-side will overwrite the value that was previously set client-side.',
        parameters: [
            { name: 'size', isOptional: false, isVariadic: false, summary: 'The size, can be 0 or any positive value. Default is **3**.' },
        ],
        returns: 'Returns true if the moon size was set correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMoonSize',
    },
    setNearClipDistance: {
        summary: 'This function sets the distance from the camera at which the world starts rendering. Do not use this function unless you have a specific reason to do so, as any values can cause artifacts and flickering problems. It can be used in many ways, including: reducing Z-fighting, creating more sophisticated first person views, allowing the camera to fly closer to the ground without passing through it, etcetera.',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'the new near clip distance. It must be between **0.1** and **20** for the function to do any effect. Default value is **0.3**.' },
        ],
        returns: 'This function returns *true* if the argument is valid. Returns *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetNearClipDistance',
    },
    setObjectBreakable: {
        summary: 'Added also as a server-side function. Previously only available as a client-side function.\n\nThis function sets an object to be breakable/unbreakable.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: '' },
            { name: 'breakable', isOptional: false, isVariadic: false, summary: 'a boolean whether the object is breakable (true) or unbreakable (false).' },
        ],
        returns: '* *true* if the object is now breakable. * *false* if it can\'t or if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectBreakable',
    },
    setObjectMass: {
        summary: 'This function sets the mass of a specified object. Changing the mass leads to a different movement behavior for especially dynamic objects.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object whose mass will be set.' },
            { name: 'mass', isOptional: false, isVariadic: false, summary: 'the new mass.' },
        ],
        returns: '* *true* if the new mass value has been. * *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectMass',
    },
    setObjectProperty: {
        summary: 'This function sets a property of the specified object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object you wish to change a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the property you want to set the value of:' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'the new value for the property.' },
        ],
        returns: 'Returns *true* if the property was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectProperty',
    },
    setObjectScale: {
        summary: 'This function changes the visible size of an object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object you wish to change the scale of.' },
            { name: 'scale', isOptional: false, isVariadic: false, summary: 'a float containing the new scale. 1.0 is the standard scale, with 0.5 being half the size and 2.0 being twice the size. If the scaleY is set, this will be scaleX.' },
            { name: 'scaleY', isOptional: true, isVariadic: false, summary: 'a float containing the new scale on the Y axis' },
            { name: 'scaleZ', isOptional: true, isVariadic: false, summary: 'a float containing the new scale on the Z axis' },
        ],
        returns: '* *true* if the scale was set properly. * *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectScale',
    },
    setOcclusionsEnabled: {
        summary: 'This function is used to enable or disable occlusions. Occlusions are used by GTA to enhance performance by hiding objects that are (normally) obscured by certain large buildings. However when removeWorldModel is used they may also have the undesired effect of making parts of the map disappear. Disabling occlusions will fix that.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A bool specifying if GTA occlusions should be enabled' },
        ],
        returns: 'Returns *true* if the setting was set correctly, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetOcclusionsEnabled',
    },
    setPedAimTarget: {
        summary: 'This function allows you to set a ped\'s aim target to a specific point. If a ped is within a certain range defined by getPedTargetStart and getPedTargetEnd he will be targeted and shot.\n\n*Note: If you wish to make a ped shoot you must use this in conjunction with an equipped weapon and setPedControlState.  Also for akimbo weapons such as 22, 26, 28, 32 and the sniper rifle you must also set both aim_weapon and fire to true at least once.*',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose target you want to set. Only peds and remote players will work; this function has no effect on the local player.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x coordinate of the aim target point.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y coordinate of the aim target point.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z coordinate of the aim target point.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAimTarget',
    },
};
