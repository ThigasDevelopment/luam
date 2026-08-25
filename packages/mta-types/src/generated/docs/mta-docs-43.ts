import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_43: ApiDocumentationCatalog = {
    setElementLighting: {
        summary: 'This function changes the lighting value for the specified element. This can be a player, ped, vehicle, object, weapon.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose lighting you want to change.' },
            { name: 'lighting', isOptional: false, isVariadic: false, summary: 'The lighting value that you want to set.' },
        ],
        returns: 'Returns true if the function was successful, false otherwise. This function can fail if called right after element creation.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementLighting',
    },
    setElementMatrix: {
        summary: 'This function sets matrix to element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which you set matrix' },
            { name: 'theMatrix', isOptional: false, isVariadic: false, summary: 'The matrix.' },
        ],
        returns: 'returns true if the matrix was set succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementMatrix',
    },
    setElementModel: {
        summary: 'Sets the model of a given element. This allows you to change the model of a player (or ped), a vehicle or an object.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element you want to change.' },
            { name: 'model', isOptional: false, isVariadic: false, summary: 'the model ID to set.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementModel',
    },
    setElementOnFire: {
        summary: 'This function can be used to set a element on fire or extinguish a fire on it. Supported types are ped, vehicle and object.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that we want to set/unset.' },
            { name: 'isOnFire', isOptional: false, isVariadic: false, summary: '*true* to set the element on fire, *false* to extinguish any fire on it.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementOnFire',
    },
    setElementParent: {
        summary: 'This function is used for setting an element as the parent of another element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that you wish to set the parent of.' },
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'The element you wish to be the parent of *theElement*.' },
        ],
        returns: 'Returns *true* if both elements are valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementParent',
    },
    setElementPosition: {
        summary: 'This function sets the position of an element to the specified coordinates.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'A valid element to be moved.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x coordinate of the destination.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y coordinate of the destination.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z coordinate of the destination.' },
            { name: 'warp', isOptional: true, isVariadic: false, summary: 'teleports players, resetting any animations they were doing. Setting this to *false* preserves the current animation.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementPosition',
    },
    setElementRotation: {
        summary: 'Sets the rotation of elements according to the world (does not work with players that are on the ground).',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose rotation will be set' },
            { name: 'rotX', isOptional: false, isVariadic: false, summary: 'The element\'s rotation around the x axis in degrees' },
            { name: 'rotY', isOptional: false, isVariadic: false, summary: 'The element\'s rotation around the y axis in degrees' },
            { name: 'rotZ', isOptional: false, isVariadic: false, summary: 'The element\'s rotation around the z axis in degrees' },
            { name: 'rotOrder', isOptional: true, isVariadic: false, summary: 'A string representing the rotation order desired when interpreting the provided [http://en.wikipedia.org/wiki/Euler_angles euler angles]. If omitted, default value is *"default"*. Allowed values are:' },
            { name: 'conformPedRotation', isOptional: true, isVariadic: false, summary: '*Relevant only for peds and will be ignored for other element types.* A bool which should be set to *true* to ensure the ped rotation is correctly set in all circumstances. Failing to set this argument may result in the ped rotation being inverted whilst it is in the air and other inconsistencies. The default value of false is for backward compatibility with scripts which may depend upon the incorrect behaviour.' },
        ],
        returns: 'Returns *true* if the element rotation was successfully set and *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementRotation',
    },
    setElementStreamable: {
        summary: 'This function can be used to disable streaming for an element. This will make sure the element is not virtualized (streamed out from GTA) when the player moves far away from it. This function only works in elements with a physical representation in the world (entities), such as players, peds, vehicles and objects.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to set the streaming of' },
            { name: 'streamable', isOptional: false, isVariadic: false, summary: '*true* if this element should stream in/out like normal, *false* if it should always be streamed in.' },
        ],
        returns: 'Returns whether the element could be set to be streamable.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementStreamable',
    },
    setElementSyncer: {
        summary: 'This function can be used to change the syncer (player) of an element. The syncer is the player who is responsible for informing the server about the state of that element - it\'s position, orientation and other state information. The function can be also used to remove an element\'s syncer.\n\nOnly vehicle and ped elements can have a syncer, other element types are not currently automatically synced by MTA.\n\nPlease note that using this function to change an element\'s syncer will only last as long as the element is within syncable range of the player unless persist is set to true. This is within 140 units for vehicles and 100 units for peds. As soon as it becomes impossible for your chosen player to sync the element, another player (or no player) will be automatically selected, and your setting will be lost. With vehicles, the last occupant to leave a vehicle will be selected as the syncer and override any setting you may have made.\n\nUsing this function to remove an element\'s syncer, means no player will be assigned to syncing the element. That will not be changed until setElementSyncer is called again.\nIt should also be noted that certain network changes to an element do not require a syncer. Actions such as destroying an element or explicitly setting the element\'s position (in a server side script), will still be updated on all clients regardless of this setting.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose syncer you wish to change.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who should be the new syncer of the element. If set to *false*, this element will not have a syncer. If set to *true*, MTA will pick automatically the nearest or most relevant player to that element.' },
            { name: 'persist', isOptional: true, isVariadic: false, summary: 'If *true*, the server will not automatically change the syncer. If set to *false*, default syncer behavior resumes.' },
        ],
        returns: 'Returns *true* if the syncer was changed successfully, *false* if the element passed was not a ped or vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementSyncer',
    },
    setElementVelocity: {
        summary: 'This function sets the velocity (movement speeds) along each axis, for an element.\n\nThis is not compatible with all elements. Only the following element types are compatible:\n* Ped\n* Vehicle\n* Object\n* Projectile',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to set the velocity of.' },
            { name: 'speedX', isOptional: false, isVariadic: false, summary: 'A floating point value determining the speed along the X axis.' },
            { name: 'speedY', isOptional: false, isVariadic: false, summary: 'A floating point value determining the speed along the Y axis.' },
            { name: 'speedZ', isOptional: false, isVariadic: false, summary: 'A floating point value determining the speed along the Z axis.' },
        ],
        returns: 'Returns *true* if the speed was set successfully, *false* if a bad element was specified or other bad arguments.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementVelocity',
    },
    setElementVisibleTo: {
        summary: 'This function can change an element\'s visibility.\n\nThis function only works with the following elements.\n* Markers\n* Blips\n* Radarareas\n\nVisibility settings of lower elements in the element tree override higher ones - if visibility for root is set to false and for a player is set to true, it will be visible to the player.\n\nIf you want to clear all visibility settings of an element, try clearElementVisibleTo\n\nSetting visibility for one element will also set visibility for all of its children.\n\nOrder of **setElementVisibleTo** calls doesn\'t matter.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to control the visibility of.' },
            { name: 'visibleTo', isOptional: false, isVariadic: false, summary: 'The element you wish the element to be visible or invisible to. Any child elements that are players will also be able to see the element. See visibility.' },
            { name: 'visible', isOptional: false, isVariadic: false, summary: 'Whether you are making it visible or invisible to the player.' },
        ],
        returns: 'Returns *true* if the element\'s visibility was changed successfully, *false* otherwise, for example if you are trying to change the visibility of a vehicle, player or object.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementVisibleTo',
    },
    setFarClipDistance: {
        summary: 'This function is used to set the distance of render. Areas beyond the specified distance will not be rendered.',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'A float specifying the distance of render. **Setting this less than 5 will cause problems to the client.**' },
        ],
        returns: 'Returns *true* if the distance was set correctly, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetFarClipDistance',
    },
    setFogDistance: {
        summary: 'This function changes the distance at which fog appears. Keep in mind that this function doesn\'t change the distance of render.',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'distance in GTA units at which fog will appear. Very short or negative distances will cause graphical bugs to the players.' },
        ],
        returns: 'Returns *true* if the distance changed successfully, *false* if bad arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetFogDistance',
    },
    setFPSLimit: {
        summary: 'This function sets the maximum [http://en.wikipedia.org/wiki/Frame_rate FPS (Frames per second)] that players on the server can run their game at.',
        parameters: [
            { name: 'fpsLimit', isOptional: false, isVariadic: false, summary: 'An integer value representing the maximum FPS. Refer to the note above for possible values. You can also pass **0** or **false**, in which case the FPS limit will be the one set in the client settings (by default **100 FPS** and the client fps limit should also be manually changed via "**fps_limit=0**" in console or **MTA San Andreas\\MTA\\config\\coreconfig.xml**).' },
        ],
        returns: 'Returns *true* if successful, or *false* if it was not possible to set the limit or an invalid value was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetFPSLimit',
    },
    setGameSpeed: {
        summary: 'This function sets the game speed to the given value.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The float value of the game speed (Range 0 - 10)' },
        ],
        returns: 'Returns *true* if the gamespeed was set successfully, *false* otherwise. The normal game speed is \'1\'.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGameSpeed',
    },
    setGameType: {
        summary: 'This function sets a string containing a name for the game type. This should be the game-mode that is active, for example "Capture The Flag" or "Deathmatch". This is then displayed in the server browser and external server browsers.\n\n**It should be noted that mapmanager handles this automatically for gamemodes that utilise the map/gamemode system.**',
        parameters: [
            { name: 'gameType', isOptional: false, isVariadic: false, summary: 'A string containing a name for the game mode, or *false* to clear it. **(MAX 200 characters)**' },
        ],
        returns: 'Returns *true* if the game type was set, *false* if an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGameType',
    },
    setGarageOpen: {
        summary: 'This function opens or closes the specified garage door in the world.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The garage ID that represents the garage door being opened or closed.' },
            { name: 'open', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if successful, *false* if an invalid garage id was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGarageOpen',
    },
    setGlitchEnabled: {
        summary: 'This function enables or disables glitches that are found in the original Single Player game that can be used to gain an advantage in multiplayer.\n\nUsers of the **fastmove** glitch may additionally want to install [https://community.mtasa.com/index.php?p=resources&s=details&id=13368 this resource to disable crouchsliding].',
        parameters: [
            { name: 'glitchName', isOptional: false, isVariadic: false, summary: 'the name of the property to set. Possible values are:' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'whether or not to enable the glitch.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGlitchEnabled',
    },
    setGrainLevel: {
        summary: 'This function sets a level of the overlay grain effect. The game will draw it on top of other grain effects. It can be used to imitate an effect of radiation or electromagnetic disturbances, for example.',
        parameters: [
            { name: 'level', isOptional: false, isVariadic: false, summary: 'The amount of grain (0-255).' },
        ],
        returns: 'Returns *true* if the grain level was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGrainLevel',
    },
    setGrainMultiplier: {
        summary: 'This function is used to adjust an intensity of the grain effect in different situations. It separately modulates an intensity of effect for infrared goggles, night vision goggles, rain and screen overlay.',
        parameters: [
            { name: 'modifierName', isOptional: false, isVariadic: false, summary: 'The modifier name to use which can be one of:' },
            { name: 'multiplier', isOptional: false, isVariadic: false, summary: 'The multiplier (0-1).' },
        ],
        returns: 'Returns *true* if the grain multiplier was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGrainMultiplier',
    },
    setGravity: {
        summary: 'This function sets the server\'s gravity level.',
        parameters: [
            { name: 'level', isOptional: false, isVariadic: false, summary: 'The level of gravity (default is **0.008**).' },
        ],
        returns: 'Returns *true* if gravity was changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGravity',
    },
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
        returns: 'Returns *true* if the heat haze effect was set correctly, *false* if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetHeatHaze',
    },
    setHeliBladeCollisionsEnabled: {
        summary: 'This function changes the state of the helicopter blades collisions on the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The helicopter that will have the blades collisions set.' },
            { name: 'collisions', isOptional: false, isVariadic: false, summary: 'The state of the helicopter blades collisions.' },
        ],
        returns: 'Returns *true* if the collisions are set for the specified vehicle, *false* if the collisions can\'t be set for the specified vehicle, if the vehicle is not a helicopter or if invalid arguments are specified.',
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
            { name: 'roomID', isOptional: false, isVariadic: false, summary: 'The room type which you want disable or enable the furniture in:' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A bool representing whether the interior furniture is enabled or disabled.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetInteriorFurnitureEnabled',
    },
};
