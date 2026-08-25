import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_17: ApiDocumentationCatalog = {
    getElementPosition: {
        summary: 'The getElementPosition function allows you to retrieve the position coordinates of an element.  This can be any real world element, including:\n* Players\n* Vehicles\n* Objects\n* Pickups\n* Markers\n* Collision shapes\n* Blips\n* Radar areas',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which you\'d like to retrieve the location of' },
        ],
        returns: 'Returns three *float*s indicating the position of the element, *x*, *y* and *z* respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementPosition',
    },
    getElementRadius: {
        summary: 'This function gets the radius of an element. Normally, sphere or circle-shaped elements tend to return a more accurate and expected radius than others with another shapes.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to get the radius of. It can be any entity type, such as:' },
        ],
        returns: 'Returns a *float* containing the radius if the element is valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementRadius',
    },
    getElementRotation: {
        summary: 'Retrieve the rotation of elements.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose rotation will be retrieved' },
            { name: 'rotOrder', isOptional: true, isVariadic: false, summary: 'A string representing the rotation order desired when returning the [http://en.wikipedia.org/wiki/Euler_angles euler angles]. If omitted, default value is *"default"*. Allowed values are:' },
        ],
        returns: '* *rx, ry, rz*: 3 *float*s representing the Euler rotation angles on the axis X, Y and Z (with the rotation order depending on the *rotOrder* argument) if *element* exists and is a valid element, *false* if it\'s invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementRotation',
    },
    getElementsByType: {
        summary: 'This function is used to retrieve a list of all elements of the specified type. This can be useful, as it disregards *where* in the element tree it is. It can be used with either the built in types (listed below) or with any custom type used in a .map file. For example, if there is an element of type "flag" (e.g. ) in the .map file, the using "flag" as the type argument would find it.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'The type of element you want a list of. This is the same as the tag name in the .map file, so this can be used with a custom element type if desired. Built in types can be found here: Element' },
            { name: 'startat', isOptional: true, isVariadic: false, summary: 'The element the search should start at. Children of this element are searched, siblings or parents will not be found. By default, this is the root element which should suit most uses.' },
        ],
        returns: 'Returns a *table* containing all the elements of the specified type. Returns an empty *table* if there are no elements of the specified type. Returns *false* if the string specified is invalid (or not a string).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementsByType',
    },
    getElementsWithinColShape: {
        summary: 'This function is used to retrieve a list of all elements in a colshape, of the specified type.',
        parameters: [
            { name: 'theShape', isOptional: false, isVariadic: false, summary: 'The colshape you want to get the elements from.' },
            { name: 'elemType', isOptional: true, isVariadic: false, summary: 'The type of element you want a list of. This can be any element type, the common ones being:' },
        ],
        returns: 'Returns a table containing all the elements inside the colshape, of the specified type. Returns an empty table if there are no elements inside. Returns *false* if the colshape is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementsWithinColShape',
    },
    getElementsWithinRange: {
        summary: 'This function is used to retrieve a list of all elements of specified type within a range of 3D coordinates.\n\n* Z argument is now being taken into consideration when checking for elements.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'the x coordinate at which to retrieve elements.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'the y coordinate at which to retrieve elements.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'the z coordinate at which to retrieve elements.' },
            { name: 'range', isOptional: false, isVariadic: false, summary: 'the range at the coordinates in which to retrieve elements.' },
            { name: 'elemType', isOptional: true, isVariadic: false, summary: 'The type of element you want a list of. This can be any element type, such as:' },
            { name: 'interior', isOptional: true, isVariadic: false, summary: 'The interior you want to limit the search to. If not specified, it can return elements in any interior.' },
            { name: 'dimension', isOptional: true, isVariadic: false, summary: 'The dimension you want to limit the search to. If not specified, it can return elements in any dimension.' },
        ],
        returns: 'Returns a table containing all the elements of the specified type within range. Returns an empty table if there are no elements within range. Returns *false* if the arguments are invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementsWithinRange',
    },
    getElementSyncer: {
        summary: 'This function gets the syncer of an element. The syncer is the player who is in control of the element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to get the syncer of.' },
        ],
        returns: 'Returns the element that is the syncer of *theElement* or *false* if the element does not have a syncer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementSyncer',
    },
    getElementType: {
        summary: 'This function is used to retrieve the type of an element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to get the type of.' },
        ],
        returns: 'Returns a *string* containing the element type, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementType',
    },
    getElementVelocity: {
        summary: 'This function returns three floats containing the velocity (movement speeds) along the X, Y, and Z axis respectively. This means that velocity values can be positive and negative for each axis.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to retrieve the velocity of.' },
        ],
        returns: 'If succesful, returns three *float*s that represent the element\'s current velocity along the *x*, *y*, and *z* axis respectively. This function can fail if the element is a player in a car. Use the vehicle element in this case. It will also fail if the element specified does not have a velocity, or does not exist. In case of failure, the first return value will be *false*. The returned values are expressed in GTA units per 1/50th of a second[http://forum.mtasa.com/viewtopic.php?f=91&t=31225]. A GTA Unit is equal to one metre[http://gta.wikia.com/Unit#GTA3.2C_GTAVC_.26_GTASA].',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementVelocity',
    },
    getElementZoneName: {
        summary: 'This function allows you to retrieve the zone name of an element (eg. Verdant Bluffs or Ocean Docks)\n\nThe same can be achieved client side by getting element coordinates and using GetZoneName.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which you\'d like to retrieve the zone name from' },
            { name: 'citiesonly', isOptional: true, isVariadic: false, summary: 'An optional argument to choose if you want to return the city name (eg Las Venturas)' },
        ],
        returns: 'Returns the string of the elements zone name.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementZoneName',
    },
    getEventHandlers: {
        summary: 'This function gets the attached functions from the event and attached element from current lua script.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event. For example ( "onPlayerWasted" ).' },
            { name: 'attachedTo', isOptional: false, isVariadic: false, summary: 'The element attached to.' },
        ],
        returns: 'Returns table with attached functions, empty table otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetEventHandlers',
    },
    getFarClipDistance: {
        summary: 'This function will tell you what is the current render distance.',
        parameters: [],
        returns: 'Returns a *float* with the current render distance, *false* if the operation could not be completed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFarClipDistance',
    },
    getFogDistance: {
        summary: 'This function will tell you what is the current fog render distance.',
        parameters: [],
        returns: 'Returns a *float* with the current fog render distance, *false* if the operation could not be completed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFogDistance',
    },
    getFPSLimit: {
        summary: 'This function retrieves the maximum [http://en.wikipedia.org/wiki/Frame_rate FPS (Frames per second)] that players on the server can run their game at.',
        parameters: [],
        returns: 'Returns an integer between **25** and **32767** (refer to the note above) of the maximum FPS that players can run their game at.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFPSLimit',
    },
    getFunctionsBoundToKey: {
        summary: 'Gets the functions bound to a key. To bind a function to a key use the bindKey function',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player to get the functions from a key.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: '' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'A string that has one of the following values:' },
        ],
        returns: 'Returns a table of the key function(s).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFunctionsBoundToKey',
    },
    getGameSpeed: {
        summary: 'This function gets the current game speed value.',
        parameters: [],
        returns: 'Returns a *float* representing the speed of the game.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGameSpeed',
    },
    getGameType: {
        summary: '<!-- Change this to "Client function" or "Server function" appropriately-->\n<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function retrieves the current gametype as set by setGameType. The game type is displayed in the server browser next to the server\'s name.',
        parameters: [],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns the gametype as a string. If no gametype is set it returns *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGameType',
    },
    getGarageBoundingBox: {
        summary: 'This function outputs the bounding box of a garage.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'Returns four *float*s indicating the bounding box of the garage. *Western X position, Eastern X position, Southern Y position, Northern Y position,, false when invalid garageID was provided.*',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGarageBoundingBox',
    },
    getGaragePosition: {
        summary: 'This function outputs X, Y and Z position of given garage.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'Returns three *float*s indicating the position of the garage, *x*, *y* and *z* respectively, false when garageID was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGaragePosition',
    },
    getGarageSize: {
        summary: 'This function outputs the size of garage.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'Returns three *float*s indicating the size of the garage, false if an invalid garageID has been provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGarageSize',
    },
    getGravity: {
        summary: 'This function returns the current gravity level for the context in which it is called (server or client).',
        parameters: [],
        returns: 'Returns a float with the current server or client (depending on where you call the function) gravity level.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGravity',
    },
    getGroundPosition: {
        summary: 'This function gets the Z level of the highest ground below a point.\n\nIt is required that the point is near enough to the local player so that it\'s within the area where collision data is loaded. If this is not the case, an incorrect position will be returned.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X world coordinate of the point.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y world coordinate of the point.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z world coordinate of the point.' },
        ],
        returns: 'Returns a float with the highest ground-level Z coord if parameters are valid, *0* if the point you tried to test is outside the loaded world map, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGroundPosition',
    },
    getHeatHaze: {
        summary: 'This function will return the current heat haze effect settings.\n\n**Note:** The server can only return the heat haze settings if it has actually been set by script.',
        parameters: [],
        returns: 'Returns 9 values, which are the same used as arguments in SetHeatHaze:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetHeatHaze',
    },
    getHeliBladeCollisionsEnabled: {
        summary: 'This function gets the state of the helicopter blades collisions on the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that will be checked.' },
        ],
        returns: 'Returns *true* if the collisions are enabled for specified vehicle, *false* if the collisions aren\'t enabled for the specified vehicle, if the vehicle is not a helicopter or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetHeliBladeCollisionsEnabled',
    },
    getHelicopterRotorSpeed: {
        summary: 'Retrieves the speed at which the rotor of a helicopter rotates.',
        parameters: [
            { name: 'heli', isOptional: false, isVariadic: false, summary: 'the helicopter element to get the rotor speed of.' },
        ],
        returns: 'returns the rotor speed if successful. this is 0 when the helicopter is parked, and about 0.2 when it is fully spun up. it can be negative if the rotor rotates counter-clockwise. returns false in case of failure (an invalid element or a vehicle element that is not a helicopter was passed).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetHelicopterRotorSpeed',
    },
    getInteriorFurnitureEnabled: {
        summary: 'This function will tell you if interior furniture are enabled or disabled in a specified room ID.',
        parameters: [
            { name: 'roomID', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if interior furniture is enabled or *false* if interior furniture is disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetInteriorFurnitureEnabled',
    },
    getInteriorSoundsEnabled: {
        summary: 'This function checks to see if the music played by default in clubs is disabled or not.',
        parameters: [],
        returns: 'Returns true if music is playing, returns false if music is not playing.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetInteriorSoundsEnabled',
    },
    getJetpackMaxHeight: {
        summary: 'This function gets the maximum height at which your jetpack can fly without failing to go higher.',
        parameters: [],
        returns: 'Returns a float containing the max jetpack height.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetJetpackMaxHeight',
    },
    getJetpackWeaponEnabled: {
        summary: 'This function checks if a weapon is usable while on a Jetpack.',
        parameters: [
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'The weapon that\'s being checked if it\'s usable on a Jetpack.' },
        ],
        returns: 'Returns true if the weapon is enabled, else false if the weapon isn\'t or invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetJetpackWeaponEnabled',
    },
    getKeyboardLayout: {
        summary: 'This function gets the player\'s keyboard layout settings, which they are currently (keyboard layout can be changed at any moment) using at the time of invocation.',
        parameters: [],
        returns: 'Returns a *table* with keyboard layout properties: {| class="wikitable" style="cellpadding: 10px;" |- ! Property || Values and description |- | readingLayout || {| class="prettytable" |- | "ltr" || Left to right (English) |- | "rtl" || Right to left (Arabic, Hebrew) |- | "ttb-rtl-ltr" || Either read vertically from top to bottom with columns going from right to left, or read in horizontal rows from left to right, as for the Japanese (Japan) locale. |- | "ttb-ltr" || Read vertically from top to bottom with columns going from left to right, as for the Mongolian (Mongolian) locale. |} |}',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyboardLayout',
    },
};
