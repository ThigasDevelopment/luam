import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_39: ApiDocumentationCatalog = {
    setElementData: {
        summary: 'This function stores element data under a certain key, attached to an element. Element\ndata set using this is then synced with all clients and the server. The data can contain\nserver-created elements, but you should avoid passing data that is not able to be synced\nsuch as xmlnodes, acls, aclgroups etc.\nAs element data is synced to all clients, it can generate a lot of network traffic and be\nheavy on performance. Events are much more efficient for sending data from a client to\nthe server only, or from the server to a specific client.\n\nUsage of element data should be discouraged where your goal can be achieved with events\nlike above, and table|tables for storing and retrieving data.\nNote this mode only works when setting element data serverside. Setting data clientside\nstill sends the update to all clients if synchronize is set to true.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to attach the data to.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to store the data under. (Maximum 31 characters.)' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you wish to store. See element data for a list of acceptable datatypes.' },
            { name: 'syncMode', isOptional: true, isVariadic: false, summary: 'Synchronisation mode. broadcast - Synchronise to all clients (default behavior). You can also parse true for this option. local - Dont synchronise. You can also parse false for this option. subscribe - Only synchronise to specific clients. See addElementDataSubscriber and removeElementDataSubscriber.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementData',
    },
    setElementDimension: {
        summary: 'This function allows you to set the dimension of any element. The dimension determines\nwhat/who the element is visible to.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which youd like to set the dimension of.' },
            { name: 'dimension', isOptional: false, isVariadic: false, summary: 'An integer representing the dimension ID. New feature/item|3.0154|1.5.3|11199|You can also use -1 to make the element visible in all dimensions (only valid to objects). Valid values are 0 to 65535.' },
        ],
        returns: 'returns true if theelement and dimension are valid, false otherwise. also returns false if theelement is a player and its not alive.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementDimension',
    },
    setElementDoubleSided: {
        summary: 'This function allows you to set the double-sidedness of an elements model. When an\nelements model is double-sided, its back facing triangles become visible.\nPossible uses of double-sidedness are: Elimination of invisible walls, using buildings as\nenclosures, using inverted landmasses as large pits or to make cave networks. It can also\nremove the need to add extra triangles to custom models when trying to make them appear\nsolid from all directions.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which youd like to set the double-sidedness of.' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set to true/false to enable/disable double-sidedness.' },
        ],
        returns: 'returns true if theelement is valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementDoubleSided',
    },
    setElementFrozen: {
        summary: 'This function freezes an element (stops it in its position and disables movement) or\nunfreezes it.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose freeze status we want to change.' },
            { name: 'freezeStatus', isOptional: false, isVariadic: false, summary: 'A boolean denoting whether we want to freeze (true) or unfreeze (false) it.' },
        ],
        returns: 'returns true if the element was frozen, false if it wasnt or if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementFrozen',
    },
    setElementHealth: {
        summary: 'This function sets the health for the specified element. This can be a ped, object or a\nvehicle.\n*650: white steam 0%, black smoke 0%\n*450: white steam 100%, black smoke 50%\n*250: white steam 0%, black smoke 100%\n*249: fire with big black smoke',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The ped, vehicle or object whose health you want to set.' },
            { name: 'newHealth', isOptional: false, isVariadic: false, summary: 'A float indicating the new health to set for the element.' },
        ],
        returns: 'returns true if the new health was set successfully, or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementHealth',
    },
    setElementID: {
        summary: 'This function sets the ID of an element to a string. This can be anything from an\nidentifying number, to a name.\nYou can only change the ID of an element clientside if that element has been created\nclientside as well.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to set the ID of.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The new ID for theElement.' },
        ],
        returns: 'this returns true if successful. it will return false if theelement is invalid, or does not exist, or if name is invalid, or is not a string.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementID',
    },
    setElementInterior: {
        summary: 'This function allows you to set the interior of any element. An interior is the current\nloaded place, 0 being outside.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which youd like to set the interior of.' },
            { name: 'interior', isOptional: false, isVariadic: false, summary: 'The interior you want to set the element to. Valid values are 0 to 255.' },
            { name: 'x', isOptional: true, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: true, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: true, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
        ],
        returns: 'returns true if theelement and interior are valid arguments, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementInterior',
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
        summary: 'Sets the model of a given element. This allows you to change the model of a player (or\nped), a vehicle or an object.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element you want to change.' },
            { name: 'model', isOptional: false, isVariadic: false, summary: 'the model ID to set. ** For players/peds: A GTASA player model (skin) ID. See Character Skins. ** For vehicles: The vehicle ID of the vehicle being changed. ** For objects/projectiles/weapons: An int specifying the model id.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementModel',
    },
    setElementParent: {
        summary: 'This function is used for setting an element as the parent of another element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that you wish to set the parent of.' },
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'The element you wish to be the parent of theElement.' },
        ],
        returns: 'returns true if both elements are valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementParent',
    },
    setElementPosition: {
        summary: 'This function sets the position of an element to the specified coordinates.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'A valid element to be moved.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x coordinate of the destination.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y coordinate of the destination.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z coordinate of the destination.' },
            { name: 'warp', isOptional: true, isVariadic: false, summary: 'teleports players, resetting any animations they were doing. Setting this to false preserves the current animation.' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementPosition',
    },
    setElementRotation: {
        summary: 'Sets the rotation of elements according to the world (does not work with players that are\non the ground).',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose rotation will be set' },
            { name: 'rotX', isOptional: false, isVariadic: false, summary: 'The elements rotation around the x axis in degrees' },
            { name: 'rotY', isOptional: false, isVariadic: false, summary: 'The elements rotation around the y axis in degrees' },
            { name: 'rotZ', isOptional: false, isVariadic: false, summary: 'The elements rotation around the z axis in degrees' },
            { name: 'rotOrder', isOptional: true, isVariadic: false, summary: 'A string representing the rotation order desired when interpreting the provided http://en.wikipedia.org/wiki/Euler_angles euler angles. If omitted, default value is default. Allowed values are: default default MTA behavior prior to 1.1, where rotation order depends on element type ZXY rotation about the Z axis (up), then about the resulting X axis (right), and finally about the resulting Y axis (front). This is the default rotation order for object|objects ZYX rotation about the Z axis (up), then about the resulting Y axis (front), and finally about the resulting X axis (right). This is the default rotation order for vehicle|vehicles The default rotation order for peds/players is -Z-Y-X but this rotation order (set using \'\'"default"\'\' on peds) can not be set manually on other element types since it only exists due to historical and backward compatibility reasons. Specifying a rotation order other than \'\'"default"\'\' allows the same angles to be uniformly used on several elements without having to consider their type.' },
            { name: 'conformPedRotation', isOptional: true, isVariadic: false, summary: 'Relevant only for peds and will be ignored for other element types. A bool which should be set to true to ensure the ped rotation is correctly set in all circumstances. Failing to set this argument may result in the ped rotation being inverted whilst it is in the air and other inconsistencies. The default value of false is for backward compatibility with scripts which may depend upon the incorrect behaviour.' },
        ],
        returns: 'returns true if the element rotation was successfully set and false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementRotation',
    },
    setElementStreamable: {
        summary: 'This function can be used to disable streaming for an element. This will make sure the\nelement is not virtualized (streamed out from GTA) when the player moves far away from\nit. This function only works in elements with a physical representation in the world\n(entities), such as player|players, ped|peds, vehicle|vehicles and object|objects.\n* There is a limit of elements that can be streamed in safely for every GTA entity type.\nIf you bypass said limit by using this function, the client can experience problems of\ndisappearing objects and unstability when trying to stream in new elements of that type.\n* In general, if you disable too many elements (of the same type or not) to stream out,\nGTA will always try to render them, so it can cause a noticeable FPS drop.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to set the streaming of' },
            { name: 'streamable', isOptional: false, isVariadic: false, summary: 'true if this element should stream in/out like normal, false if it should always be streamed in.' },
        ],
        returns: 'returns whether the element could be set to be streamable.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementStreamable',
    },
    setElementSyncer: {
        summary: 'This function can be used to change the syncer (player) of an element. The syncer is the\nplayer who is responsible for informing the server about the state of that element - its\nposition, orientation and other state information. The function can be also used to\nremove an elements syncer.\nOnly vehicle and ped elements can have a syncer, other element types are not currently\nautomatically synced by MTA.\nPlease note that using this function to change an elements syncer will only last as long\nas the element is within syncable range of the player. This is within 140 units for\nvehicles and 100 units for peds. As soon as it becomes impossible for your chosen player\nto sync the element, another player (or no player) will be automatically selected, and\nyour setting will be lost. With vehicles, the last occupant to leave a vehicle will be\nselected as the syncer and override any setting you may have made.\nUsing this function to remove an elements syncer, means no player will be assigned to\nsyncing the element. That will not be changed until setElementSyncer is called again.\nIt should also be noted that certain network changes to an element do not require a\nsyncer. Actions such as destroying an element or explicitly setting the elements position\n(in a server side script), will still be updated on all clients regardless of this\nsetting.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose syncer you wish to change.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who should be the new syncer of the element. If set to false, this element will not have a syncer. If set to true, MTA will pick automatically the nearest or most relevant player to that element.' },
        ],
        returns: 'returns true if the syncer was changed successfully, false if the element passed was not a ped or vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementSyncer',
    },
    setElementVelocity: {
        summary: 'This function sets the velocity (movement speeds) along each axis, for an element.\nThis is not compatible with all elements. Only the following elements are compatible:\n* Peds.\n* Vehicles.\n* Objects.\n* Projectiles.\nObjects and projectiles velocity can only be set clientside.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to set the velocity of.' },
            { name: 'speedX', isOptional: false, isVariadic: false, summary: 'A floating point value determining the speed along the X axis.' },
            { name: 'speedY', isOptional: false, isVariadic: false, summary: 'A floating point value determining the speed along the Y axis.' },
            { name: 'speedZ', isOptional: false, isVariadic: false, summary: 'A floating point value determining the speed along the Z axis.' },
        ],
        returns: 'returns true if the speed was set successfully, false if a bad element was specified or other bad arguments.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementVelocity',
    },
    setElementVisibleTo: {
        summary: 'Does the order of setElementVisibleTo calls really not matter? visibility|Visibility\nseems to imply that the order does matter.\nIs this function particularly or only useful for changing the visibility of markers,\nradar blips and radar areas?|User:EAi|EAiUser:Iam2noob4u|Iam2noob4u\nThis function can change an elements visibility. This does not work with all entities -\nvehicles, players and objects are exempt. This is because these objects are required for\naccurate sync (theyre physical objects that contribute to the physics engine). This\nfunction is particularly useful for changing the visibility of markers, radar blips and\nradar areas.\nVisibility settings of lower elements in the element tree override higher ones - if\nvisibility for root is set to false and for a player is set to true, it will be visible\nto the player.\nIf you want to clear all visibility settings of an object, try clearElementVisibleTo',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to control the visibility of.' },
            { name: 'visibleTo', isOptional: false, isVariadic: false, summary: 'The element you wish the element to be visible or invisible to. Any child elements that are players will also be able to see the element. See visibility.' },
            { name: 'visible', isOptional: false, isVariadic: false, summary: 'Whether you are making it visible or invisible to the player.' },
        ],
        returns: 'returns true if the elements visibility was changed successfully, false otherwise, for example if you are trying to change the visibility of a vehicle, player or object.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementVisibleTo',
    },
    setFarClipDistance: {
        summary: 'This function is used to set the distance of render. Areas beyond the specified distance\nwill not be rendered.',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'A float specifying the distance of render. Setting this less than 5 will cause problems to the client.' },
        ],
        returns: 'returns true if the distance was set correctly, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetFarClipDistance',
    },
    setFogDistance: {
        summary: 'This function changes the distance at which fog appears. Keep in mind that this function\ndoesnt change the distance of render.',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'distance in GTA units at which fog will appear. Very short or negative distances will cause graphical bugs to the players.' },
        ],
        returns: 'returns true if the distance changed successfully, false if bad arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetFogDistance',
    },
    setFPSLimit: {
        summary: 'This function sets the maximum http://en.wikipedia.org/wiki/Frame_rate FPS (Frames per\nsecond) that players on the server can run their game at.\n* When set client side, the actual limit used is the lowest of both the server and client\nset values.\n* Starting from version https://buildinfo.mtasa.com/?Revision=21313&Branch r21313 and\nabove fpsLimit range is 25-32767. In older MTA releases it was 25-100.',
        parameters: [
            { name: 'fpsLimit', isOptional: false, isVariadic: false, summary: 'An integer value representing the maximum FPS. Refer to the note above for possible values. You can also pass 0 or false, in which case the FPS limit will be the one set in the client settings (by default, 100 FPS and the client fps limit should also be manually changed via fps_limit=0 in console or MTA San Andreas 1.5\\MTA\\config\\coreconfig.xml).' },
        ],
        returns: 'returns true if successful, or false if it was not possible to set the limit or an invalid value was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetFPSLimit',
    },
    setGameSpeed: {
        summary: 'This function sets the game speed to the given value.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: ': The float value of the game speed (Range 0 - 10)' },
        ],
        returns: 'returns true if the gamespeed was set successfully, false otherwise. the normal game speed is 1.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGameSpeed',
    },
    setGameType: {
        summary: 'This function sets a string containing a name for the game type. This should be the\ngame-mode that is active, for example Capture The Flag or Deathmatch. This is then\ndisplayed in the server browser and external server browsers.\nIt should be noted that mapmanager handles this automatically for gamemodes that utilise\nthe map/gamemode system.',
        parameters: [
            { name: 'gameType', isOptional: false, isVariadic: false, summary: 'A string containing a name for the game mode, or false to clear it.' },
        ],
        returns: 'returns true if the game type was set, false if an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGameType',
    },
    setGarageOpen: {
        summary: 'This function opens or closes the specified garage door in the world.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The Garage|garage ID that represents the garage door being opened or closed. isOpen A boolean indicating whether or not to open the door.' },
            { name: 'open', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if successful, false if an invalid garage id was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGarageOpen',
    },
    setGlitchEnabled: {
        summary: 'This function enables or disables glitches that are found in the original Single Player\ngame that can be used to gain an advantage in multiplayer.\nUsers of the fastmove glitch may additionally want to install\nhttps://community.mtasa.com/index.php?p=resources&s=details&id=13368 this resource to\ndisable crouchsliding.',
        parameters: [
            { name: 'glitchName', isOptional: false, isVariadic: false, summary: 'the name of the property to set. Possible values are:' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'whether or not to enable the glitch.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGlitchEnabled',
    },
    setGravity: {
        summary: 'This function sets the servers gravity level.\n*This will override setPedGravity applied to peds/players.\n*Setting the gravity level to different values on clients can cause animation bugs\n(players floating across ground because players see different fall animation.)',
        parameters: [
            { name: 'level', isOptional: false, isVariadic: false, summary: ': The level of gravity (default is 0.008).' },
        ],
        returns: 'returns true if gravity was changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetGravity',
    },
};
