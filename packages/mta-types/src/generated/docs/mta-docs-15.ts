import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_15: ApiDocumentationCatalog = {
    getElementMatrix: {
        summary: 'This function gets an elements transform matrix. This contains 16 float values that\nmultiplied to a point will give you the point transformed. It is most useful for matrix\ncalculations such as calculating offsets. For further information, please refer to a\ntutorial of matrices in computer graphics programming.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which you wish to retrieve the matrix for.' },
            { name: 'legacy', isOptional: true, isVariadic: false, summary: 'Set to false to return correctly setup matrix (i.e. Last column in the first 3 rows set to zero).' },
        ],
        returns: 'returns a multi-dimensional array (which can be transformed into a proper matrix class using matrix.create method) containing a 4x4 matrix. returns false if the element is not streamed in, and not a vehicle, ped or object.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementMatrix',
    },
    getElementModel: {
        summary: 'Returns the model ID of a given element. This can be a player/ped skin, a pickup model,\nan object model or a vehicle model.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to retrieve the model ID of.' },
        ],
        returns: 'returns the model id if successful, false otherwise. * for players/peds: a gtasa player model (skin) id. see character skins. * for vehicles: the vehicle ids|vehicle id of the vehicle. * for objects: an int specifying the model id.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementModel',
    },
    getElementParent: {
        summary: 'This function is used to determine the parent of an element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The child of the parent element you want returned.' },
        ],
        returns: 'this returns the parent as an element. it returns false if theelement is invalid, or is the root node.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementParent',
    },
    getElementPosition: {
        summary: 'The getElementPosition function allows you to retrieve the position coordinates of an\nelement.  This can be any real world element, including:\n* Element/Player|Players\n* Element/Vehicle|Vehicles\n* Element/Object|Objects\n* Element/Pickup|Pickups\n* Element/Marker|Markers\n* Element/Collision shape|Collision shapes\n* Element/Blip|Blips\n* Element/Radar area|Radar areas',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which youd like to retrieve the location of' },
        ],
        returns: 'returns three floats indicating the position of the element, x, y and z respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementPosition',
    },
    getElementRadius: {
        summary: 'This function gets the radius of an element. Normally, sphere or circle-shaped elements\ntend to return a more accurate and expected radius than others with another shapes.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to get the radius of. It can be any entity type, such as: player|Players . ped|Peds . vehicle|Vehicles . object|Objects .' },
        ],
        returns: 'returns a float containing the radius if the element is valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementRadius',
    },
    getElementRotation: {
        summary: 'Retrieve the rotation of elements.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose rotation will be retrieved' },
            { name: 'rotOrder', isOptional: true, isVariadic: false, summary: 'A string representing the rotation order desired when returning the http://en.wikipedia.org/wiki/Euler_angles euler angles. If omitted, default value is default. Allowed values are: default default MTA behavior prior to 1.1, where rotation order depends on element type ZXY rotation about the Z axis (up), then about the resulting X axis (right) and finally about the resulting Y axis (front). This is the default rotation order for object|objects ZYX rotation about the Z axis (up), then about the resulting Y axis (front), and finally about the resulting X axis (right). This is the default rotation order for vehicle|vehicles The default rotation order for peds/players is Z-Y-X (clientside) and -Z-Y-X (serverside) but those rotation orders (set using \'\'"default"\'\' on peds) can not be used manually on other element types since they only exist due to historical and backward compatibility reasons. Specifying a rotation order other than \'\'"default"\'\' allows the same angles to later be uniformly used on several elements without having to consider their type.' },
        ],
        returns: '* rx, ry, rz: 3 floats representing the euler rotation angles on the axis x, y and z (with the rotation order depending on the rotorder argument) if element exists and is a valid element, false if its invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementRotation',
    },
    getElementsByType: {
        summary: 'This function is used to retrieve a list of all elements of the specified type. This can\nbe useful, as it disregards where in the element tree it is. It can be used with either\nthe built in types (listed below) or with any custom type used in a .map file. For\nexample, if there is an element of type flag (e.g. ) in the .map file, the using\nflag as the type argument would find it.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startat', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementsByType',
    },
    getElementsWithinColShape: {
        summary: 'This function is used to retrieve a list of all elements in a colshape, of the specified\ntype.\n* For legacy reasons, a colshape created on the client does not collide with elements\nalready existing at that location until they first move.\n* This function doesnt verify whether elements are in the same dimension and interior,\nadditional checks could be implemented manually if they are needed.',
        parameters: [
            { name: 'theShape', isOptional: false, isVariadic: false, summary: 'The colshape you want to get the elements from.' },
            { name: 'elemType', isOptional: true, isVariadic: false, summary: 'The type of element you want a list of. This can be any element type, the common ones being: player A player connected to the server ped A ped vehicle A vehicle object An object pickup A pickup marker A marker remoteclient A remote client connected to the server' },
        ],
        returns: 'returns a table containing all the elements inside the colshape, of the specified type. returns an empty table if there are no elements inside. returns false if the colshape is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementsWithinColShape',
    },
    getElementsWithinRange: {
        summary: 'This function is used to retrieve a list of all elements of specified type within a range\nof 3D coordinates.\n* Z argument isnt in use currently, but make your scripts like it is for future\ncompatibility reasons.\n|21438\n* Z argument is now being taken into consideration when checking for elements.\n* This function checks if elements are in a box, not in a sphere.\n* This function doesnt work with elements which are created by createElement.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'the x coordinate at which to retrieve elements.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'the y coordinate at which to retrieve elements.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'the z coordinate at which to retrieve elements.' },
            { name: 'range', isOptional: false, isVariadic: false, summary: 'the range at the coordinates in which to retrieve elements.' },
            { name: 'elemType', isOptional: true, isVariadic: false, summary: 'The type of element you want a list of. This can be any element type, such as: player A player connected to the server. ped A ped. vehicle A vehicle. object An object. pickup A pickup. marker A marker.' },
            { name: 'interior', isOptional: true, isVariadic: false, summary: 'The interior you want to limit the search to. If not specified, it can return elements in any interior.' },
            { name: 'dimension', isOptional: true, isVariadic: false, summary: 'The dimension you want to limit the search to. If not specified, it can return elements in any dimension.' },
        ],
        returns: 'returns a table containing all the elements of the specified type within range. returns an empty table if there are no elements within range. returns false if the arguments are invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementsWithinRange',
    },
    getElementSyncer: {
        summary: 'This function gets the syncer of an element. The syncer is the player who is in control\nof the element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element to get the syncer of.' },
        ],
        returns: 'returns the element that is the syncer of theelement or false if the element does not have a syncer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementSyncer',
    },
    getElementType: {
        summary: 'This function is used to retrieve the type of an element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to get the type of.' },
        ],
        returns: 'returns a string containing the element type, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementType',
    },
    getElementVelocity: {
        summary: 'This function returns three floats containing the velocity (movement speeds) along the X,\nY, and Z axis respectively. This means that velocity values can be positive and negative\nfor each axis.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element you wish to retrieve the velocity of.' },
        ],
        returns: 'if succesful, returns three floats that represent the elements current velocity along the x, y, and z axis respectively. this function can fail if the element is a player in a car. use the vehicle element in this case. it will also fail if the element specified does not have a velocity, or does not exist. in case of failure, the first return value will be false. the returned values are expressed in gta units per 1/50th of a secondhttp://forum.mtasa.com/viewtopic.php?f=91&t=31225. a gta unit is equal to one metrehttp://gta.wikia.com/unit#gta3.2c_gtavc_.26_gtasa.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementVelocity',
    },
    getElementZoneName: {
        summary: 'This function allows you to retrieve the zone name of an element (eg. Verdant Bluffs or\nOcean Docks)\nThe same can be achieved client side by getting element coordinates and using GetZoneName.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which youd like to retrieve the zone name from' },
            { name: 'citiesonly', isOptional: true, isVariadic: false, summary: ': An optional argument to choose if you want to return the city name (eg Las Venturas)' },
        ],
        returns: 'returns the string of the elements zone name.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementZoneName',
    },
    getEventHandlers: {
        summary: 'This function gets the attached functions from the event and attached element from\ncurrent lua script.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event. For example ( onPlayerWasted ).' },
            { name: 'attachedTo', isOptional: false, isVariadic: false, summary: 'The element attached to.' },
        ],
        returns: 'returns table with attached functions, empty table otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetEventHandlers',
    },
    getFarClipDistance: {
        summary: 'This function will tell you what is the current render distance.',
        parameters: [],
        returns: 'returns a float with the current render distance, false if the operation could not be completed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFarClipDistance',
    },
    getFogDistance: {
        summary: 'This function will tell you what is the current fog render distance.',
        parameters: [],
        returns: 'returns a float with the current fog render distance, false if the operation could not be completed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFogDistance',
    },
    getFPSLimit: {
        summary: 'This function retrieves the maximum http://en.wikipedia.org/wiki/Frame_rate FPS (Frames\nper second) that players on the server can run their game at.',
        parameters: [],
        returns: 'returns an integer between 25 and 100 of the maximum fps that players can run their game at.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFPSLimit',
    },
    getFunctionsBoundToKey: {
        summary: 'Gets the functions bound to a key. To bind a function to a key use the bindKey function',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player to get the functions from a key. theKey The key you wish to check the functions from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: '' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'A string that has one of the following values: up If the bound key should trigger the function when the key is released down If the bound key should trigger the function when the key is pressed both If the bound key should trigger the function when the key is pressed or released' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetFunctionsBoundToKey',
    },
    getGameSpeed: {
        summary: 'This function gets the current game speed value.',
        parameters: [],
        returns: 'returns a float representing the speed of the game.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGameSpeed',
    },
    getGameType: {
        summary: 'This function retrieves the current gametype as set by setGameType. The game type is\ndisplayed in the server browser next to the servers name.',
        parameters: [],
        returns: 'returns the gametype as a string. if no gametype is set it returns nil.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGameType',
    },
    getGarageBoundingBox: {
        summary: 'This function outputs the bounding box of a garage.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The Garage|garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'returns four floats indicating the bounding box of the garage. western x position, eastern x position, southern y position, northern y position,, false when invalid garageid was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGarageBoundingBox',
    },
    getGaragePosition: {
        summary: 'This function outputs X, Y and Z position of given garage.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The Garage|garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'returns three floats indicating the position of the garage, x, y and z respectively, false when garageid was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGaragePosition',
    },
    getGarageSize: {
        summary: 'This function outputs the size of garage.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The Garage|garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'returns three floats indicating the size of the garage, false if an invalid garageid has been provided',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGarageSize',
    },
    getGravity: {
        summary: 'This function returns the current gravity level for the context in which it is called\n(server or client).',
        parameters: [],
        returns: 'returns a float with the current server or client (depending on where you call the function) gravity level.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGravity',
    },
    getGroundPosition: {
        summary: 'This function gets the Z level of the highest ground below a point.\nIt is required that the point is near enough to the local player so that its within the\narea where collision data is loaded. If this is not the case, an incorrect position will\nbe returned.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X world coordinate of the point.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y world coordinate of the point.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z world coordinate of the point.' },
        ],
        returns: 'returns a float with the highest ground-level z coord if parameters are valid, 0 if the point you tried to test is outside the loaded world map, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetGroundPosition',
    },
    getHeatHaze: {
        summary: 'This function will return the current heat haze effect settings.\nNote: The server can only return the heat haze settings if it has actually been set by\nscript.',
        parameters: [],
        returns: 'returns 9 values, which are the same used as arguments in setheathaze:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetHeatHaze',
    },
    getHeliBladeCollisionsEnabled: {
        summary: 'This function gets the state of the helicopter blades collisions on the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that will be checked.' },
        ],
        returns: 'returns true if the collisions are enabled for specified vehicle, false if the collisions arent enabled for the specified vehicle, if the vehicle is not a helicopter or if invalid arguments are specified.',
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
        summary: 'This function will tell you if interior furniture are enabled or disabled in a specified\nroom ID.',
        parameters: [
            { name: 'roomID', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if interior furniture is enabled or false if interior furniture is disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetInteriorFurnitureEnabled',
    },
    getInteriorSoundsEnabled: {
        summary: 'This function checks to see if the music played by default in clubs is disabled or not.',
        parameters: [],
        returns: 'returns true if music is playing, returns false if music is not playing.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetInteriorSoundsEnabled',
    },
};
