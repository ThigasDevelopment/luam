import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_40: ApiDocumentationCatalog = {
    setHeatHaze: {
        summary: 'This function changes the heat haze effect.',
        parameters: [
            { name: 'intensity', isOptional: false, isVariadic: false, summary: '' },
            { name: 'randomShift', isOptional: true, isVariadic: false, summary: '' },
            { name: 'speedMin', isOptional: true, isVariadic: false, summary: '' },
            { name: 'speedMax', isOptional: true, isVariadic: false, summary: '' },
            { name: 'scanSizeX', isOptional: true, isVariadic: false, summary: '' },
            { name: 'scanSizeY', isOptional: true, isVariadic: false, summary: '' },
            { name: 'renderSizeX', isOptional: true, isVariadic: false, summary: '' },
            { name: 'renderSizeY', isOptional: true, isVariadic: false, summary: '' },
            { name: 'bShowInside', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the heat haze effect was set correctly, false if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetHeatHaze',
    },
    setHeliBladeCollisionsEnabled: {
        summary: 'This function changes the state of the helicopter blades collisions on the specified\nvehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The helicopter that will have the blades collisions set.' },
            { name: 'collisions', isOptional: false, isVariadic: false, summary: 'The state of the helicopter blades collisions.' },
        ],
        returns: 'returns true if the collisions are set for the specified vehicle, false if the collisions cant be set for the specified vehicle, if the vehicle is not a helicopter or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetHeliBladeCollisionsEnabled',
    },
    setHelicopterRotorSpeed: {
        summary: 'Sets the rotor speed of a helicopter.',
        parameters: [
            { name: 'heli', isOptional: false, isVariadic: false, summary: 'the helicopter to adjust the rotor of.' },
            { name: 'speed', isOptional: false, isVariadic: false, summary: 'the new rotor speed. Usual values are 0 if the helicopter stands still, or 0.2 if the rotor is fully spun up. Higher values than normal will not affect the helicopters handling. Negative values are allowed and will make the rotor spin in the opposite direction (pushing the helicopter down).' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetHelicopterRotorSpeed',
    },
    setInteriorFurnitureEnabled: {
        summary: 'This function toggles furniture generation in interiors with the specified room ID.',
        parameters: [
            { name: 'roomID', isOptional: false, isVariadic: false, summary: 'The room type which you want disable or enable the furniture in: 0 : shop 1 : office 2 : lounge 3 : bedroom 4 : kitchen' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: ': A bool representing whether the interior furniture is enabled or disabled.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetInteriorFurnitureEnabled',
    },
    setInteriorSoundsEnabled: {
        summary: 'This function disables or enables the ambient sounds played by GTA in most interiors,\nlike restaurants, casinos, clubs, houses, etc.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'if a boolean was passed to the function, it always succeeds and returns true.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetInteriorSoundsEnabled',
    },
    setJetpackMaxHeight: {
        summary: 'This function changes the maximum flying height of jetpack.',
        parameters: [
            { name: 'Height', isOptional: false, isVariadic: false, summary: ': The max height starting at approximately -20.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetJetpackMaxHeight',
    },
    setJetpackWeaponEnabled: {
        summary: 'This function sets a weapon usable while using the Jetpack.',
        parameters: [
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'The weapon thats being set usable on a Jetpack. Names can be: (Case is ignored)' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A bool representing whether the weapon is enabled or disabled.' },
        ],
        returns: 'returns true, else false if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetJetpackWeaponEnabled',
    },
    setLightColor: {
        summary: 'This function sets the color for a Element/Light|light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The Element/Light|light that you wish to set the color of.' },
            { name: 'r', isOptional: false, isVariadic: false, summary: '' },
            { name: 'g', isOptional: false, isVariadic: false, summary: '' },
            { name: 'b', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLightColor',
    },
    setLightDirection: {
        summary: 'This function sets the direction for a Element/Light|light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The Element/Light|light that you wish to set the direction of.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLightDirection',
    },
    setLightRadius: {
        summary: 'This function sets the radius for a Element/Light|light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The Element/Light|light that you wish to set the radius of.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLightRadius',
    },
    setLowLODElement: {
        summary: 'This function assigns a low LOD element to an element. The low LOD element is displayed\nwhen its associated element is not fully visible. If a low LOD element is assigned to\nseveral elements, it will be displayed when any of these elements are not fully visible.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose low LOD version we want to change.' },
            { name: 'lowLODElement', isOptional: false, isVariadic: false, summary: 'A low LOD element to display when the first element is not fully visible.' },
        ],
        returns: 'returns true if the assignment was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetLowLODElement',
    },
    setMapName: {
        summary: 'This function is used to set a map name that will be visible in the server browser. In\npractice you should generally rely on the mapmanager to do this for you.',
        parameters: [
            { name: 'mapName', isOptional: false, isVariadic: false, summary: 'The name you wish the server browser to show.' },
        ],
        returns: 'returns true if map name was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMapName',
    },
    setMarkerColor: {
        summary: 'This function sets the color of the specified marker by modifying the values for red,\ngreen, blue and alpha.',
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
            { name: 'icon', isOptional: false, isVariadic: false, summary: 'A string referring to the type of icon, acceptable values are: none : No icon arrow : Arrow icon finish : Finish icon (at end of race)' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerIcon',
    },
    setMarkerSize: {
        summary: 'This function sets the size of the specified marker.\nSetting negative value will flip the marker, do nothing or make it invisible:\n* cylinder or arrow: upside down\n* ring: inside out\n* checkpoint: disappear\n* corona: bigger',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker that you wish to set the size of.' },
            { name: 'size', isOptional: false, isVariadic: false, summary: 'A float representing new size of the marker.' },
        ],
        returns: 'returns true if successful, false if failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerSize',
    },
    setMarkerTarget: {
        summary: 'This function sets the target for a marker. Only the checkpoint and ring marker types can\nhave a target.\nFor checkpoint markers, the target is shown as an arrow aiming at the point specified.\nFor ring markers, the target is shown by rotating the whole ring so that it faces the\npoint specified.\nThis function is most useful for setting up markers for races, where each marker points\nto the next ones position.\n(This is mostly used in races!)',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker to set the target of' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x axis of the coordinate to target the marker at' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y axis of the coordinate to target the marker at' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z axis of the coordinate to target the marker at' },
        ],
        returns: 'returns true if target was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerTarget',
    },
    setMarkerType: {
        summary: 'This function changes a markers type. The type controls how the marker is displayed in\nthe game. Its important that you use marker types that users are used to from the single\nplayer game. For example, checkpoints are used in races, rings are used for aircraft\nraces, arrows are used for entering buildings etc.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: ': A marker element referencing the specified marker.' },
            { name: 'markerType', isOptional: false, isVariadic: false, summary: ': A string denoting the marker type. Valid values are:' },
        ],
        returns: 'returns true if the marker type was changed, false if it wasnt or marker values were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMarkerType',
    },
    setMaxPlayers: {
        summary: 'This function sets the maximum number of player slots on the server.',
        parameters: [
            { name: 'slots', isOptional: false, isVariadic: false, summary: 'Maximum number of player slots on the server.' },
        ],
        returns: 'returns true if number of player slots was successfully changed, false or nil otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMaxPlayers',
    },
    setMinuteDuration: {
        summary: 'Sets the real-world duration of an ingame minute. The GTA default is 1000.',
        parameters: [
            { name: 'milliseconds', isOptional: false, isVariadic: false, summary: ': the new duration of an ingame minute, accepted values 0 - 2147483647.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMinuteDuration',
    },
    setModelHandling: {
        summary: 'This function is used to change the handling data of all vehicles of a specified model.',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: 'The Vehicle_IDs|vehicle model you wish to set the handling of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you wish to set the handling of the vehicle to, or nil if you want to reset the all the handling properties.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value of the modelss handling property you wish to set, or nil if you want to reset the handling property to its default value.' },
        ],
        returns: 'returns true if the handling was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetModelHandling',
    },
    setMoonSize: {
        summary: 'This function sets the moon size. Using this function server-side will overwrite the\nvalue that was previously set client-side.',
        parameters: [
            { name: 'size', isOptional: false, isVariadic: false, summary: 'The size, can be 0 or any positive value. Default is 3.' },
        ],
        returns: 'returns true if the moon size was set correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetMoonSize',
    },
    setNearClipDistance: {
        summary: '',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'the new near clip distance. It must be between 0.1 and 20 for the function to do any effect. Default value is 0.3.' },
        ],
        returns: 'this function returns true if the argument is valid. returns false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetNearClipDistance',
    },
    setObjectBreakable: {
        summary: 'This function sets an object to be breakable/unbreakable.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: '' },
            { name: 'breakable', isOptional: false, isVariadic: false, summary: 'a boolean whether the object is breakable (true) or unbreakable (false).' },
        ],
        returns: '* true if the object is now breakable. * false if it cant or if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectBreakable',
    },
    setObjectMass: {
        summary: 'This function sets the mass of a specified object. Changing the mass leads to a different\nmovement behavior for especially dynamic objects.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object whose mass will be set.' },
            { name: 'mass', isOptional: false, isVariadic: false, summary: 'the new mass.' },
        ],
        returns: '* true if the new mass value has been. * false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectMass',
    },
    setObjectProperty: {
        summary: '',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object you wish to change a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the property you want to set the value of:' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'the new value for the property.' },
        ],
        returns: 'returns true if the property was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectProperty',
    },
};
