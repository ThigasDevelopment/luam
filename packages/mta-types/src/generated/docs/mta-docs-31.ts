import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_31: ApiDocumentationCatalog = {
    isElementStreamedIn: {
        summary: 'This function checks whether an element is currently streamed in (not virtualized) and\nare actual GTA objects in the world. You can force an element to be streamed in using\nsetElementStreamable.\n\nDP2 can return true even if this element is not fully streamed in. This can happen during\nthe period when the vehicle/object model is loading while the element is not actually\nfully created yet.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element to check whether is streamed in or not.' },
        ],
        returns: 'returns true if the passed element is currently streamed in, false if it is virtualized.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementStreamedIn',
    },
    isElementSyncer: {
        summary: 'This function checks whether an element is synced by the local player or not. Accepted\nelements are ped|peds and vehicle|vehicles.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element to check.' },
        ],
        returns: 'returns true if the passed element is synced by the local player, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementSyncer',
    },
    isElementVisibleTo: {
        summary: 'This checks if an element is visible to a player. This does not check if the player can\nliterally see the element, just that they are aware that it exists. Some so-called\nper-player elements are able to be visible only to some players, as such this checks if\nthis is the case for a particular element/player combination.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to check the visibility of' },
            { name: 'visibleTo', isOptional: false, isVariadic: false, summary: 'The player you want to check against' },
        ],
        returns: 'returns true if element is visible to the specified player, false if not or an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementVisibleTo',
    },
    isElementWaitingForGroundToLoad: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to check its frozen waiting for custom map objects to load status. It can be a vehicle, ped or player.' },
        ],
        returns: 'returns true if the specified element is frozen waiting for collisions of custom map objects to load. returns false if its not or if the specified element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementWaitingForGroundToLoad',
    },
    isElementWithinColShape: {
        summary: 'This function is used to determine if an element is within a collision shape. Please note\nthat for legacy reasons, a colshape created on the client does not collide with elements\nalready existing at that location until they first move. Please also note that before\n1.0.3, this did not function correctly when moving a colshape.\nPlease note that this function doesnt verify whether element is in the same dimension and\ninterior, additional checks could be implemented manually if they are needed.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element youre checking.' },
            { name: 'theShape', isOptional: false, isVariadic: false, summary: 'The colshape youre checking' },
        ],
        returns: 'returns true if the element is within the colshape, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementWithinColShape',
    },
    isElementWithinMarker: {
        summary: 'This function is used to determine if an element is within a marker.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element youre checking.' },
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker youre checking.' },
        ],
        returns: 'returns true if the element is within the marker, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementWithinMarker',
    },
    isGarageOpen: {
        summary: 'This function checks whether or not a specific garage door is open.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The Garage|garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'returns true if the garage is open, false if it is closed or an invalid garage id was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsGarageOpen',
    },
    isGlitchEnabled: {
        summary: 'This function retrieves whether San Andreas game glitches are enabled or not, set by\nusing setGlitchEnabled',
        parameters: [
            { name: 'glitchName', isOptional: false, isVariadic: false, summary: 'the name of the property to set. Possible values are:' },
        ],
        returns: 'returns true if if the glitch was enabled, or false if it is disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsGlitchEnabled',
    },
    isGuestAccount: {
        summary: 'This function checks to see if an account is a guest account. A guest account is an\naccount automatically created for a user when they join the server and deleted when they\nquit or login to another account. Data stored in a guest account is not stored after the\nplayer has left the server. As a consequence, this function will check if a player is\nlogged in or not.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you want to check to see if it is a guest account.' },
        ],
        returns: 'returns true if the account is a guest account, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsGuestAccount',
    },
    isInsideColShape: {
        summary: '',
        parameters: [
            { name: 'theShape', isOptional: false, isVariadic: false, summary: 'The colshape youre checking the position against.' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'The X coordinate of the position youre checking.' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'The Y coordinate of the position youre checking.' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: 'The Z coordinate of the position youre checking.' },
        ],
        returns: 'returns true if the position is inside the colshape, false if it isnt or if any parameters are invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsInsideColShape',
    },
    isInsideRadarArea: {
        summary: 'This function checks if a 2D position is inside a radararea|radar area or not.',
        parameters: [
            { name: 'theArea', isOptional: false, isVariadic: false, summary: 'The radararea|radar area youre checking the position against.' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'The X coordinate of the position youre checking.' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'The Y coordinate of the position youre checking.' },
        ],
        returns: 'returns true if the position is inside the radar area, false if it isnt or if any parameters are invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsInsideRadarArea',
    },
    isKeyBound: {
        summary: 'This function can be used to find out if a key has already been bound. If you do not\nspecify a keyState or handler, any instances of key being bound will cause isKeyBound to\nreturn true.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player youre checking.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key youre checking. See Key names for a list of valid key names.' },
            { name: 'keyState', isOptional: true, isVariadic: false, summary: 'Is the state of the key when it calls the function, Can be either: up when the key is released down when the key is pressed' },
            { name: 'handler', isOptional: true, isVariadic: false, summary: 'The function youre checking against' },
        ],
        returns: 'returns true if the key is bound, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsKeyBound',
    },
    isLineOfSightClear: {
        summary: 'This function checks if there are obstacles between two points of the game world,\noptionally ignoring certain kinds of elements. Use processLineOfSight if you want more\ninformation about what the ray hits.',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'The first points world X coordinate.' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'The first points world Y coordinate.' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'The first points world Z coordinate.' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: 'The second points world X coordinate.' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: 'The second points world Y coordinate.' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: 'The second points world Z coordinate.' },
            { name: 'checkBuildings', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTAs internally placed buildings, i.e. the world map.' },
            { name: 'checkVehicles', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by Vehicle|vehicles.' },
            { name: 'checkPeds', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by peds, i.e. Player|players.' },
            { name: 'checkObjects', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by Object|objects.' },
            { name: 'checkDummies', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTAs internal dummies. These are not used in the current MTA version so this argument can be set to false.' },
            { name: 'seeThroughStuff', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to pass through collision materials that have this flag enabled (By default material IDs 52, 55 and 66 which are some fences). This flag originally allows some objects to be walked on but you can shoot throug them.' },
            { name: 'ignoreSomeObjectsForCamera', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to pass through objects that have (K) property enabled in object.dat data file. (i.e. Most dynamic objects like boxes or barrels)' },
            { name: 'ignoredElement', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to pass through a certain specified element.' },
        ],
        returns: 'returns true if the line between the specified points is clear, false if theres an obstacle or if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsLineOfSightClear',
    },
    isMainMenuActive: {
        summary: 'This function returns whether the user is in the mainmenu or not.',
        parameters: [],
        returns: 'returns true if the mainmenu is visible, false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsMainMenuActive',
    },
    isMTAWindowActive: {
        summary: 'This function returns whether any system windows that take focus are active. This\nincludes:\n* Chatbox input\n* Console window\n* Main menu\n* Transferbox\nTo get the status of the debug view, see isDebugViewActive.',
        parameters: [],
        returns: 'returns true if the focus is on the mta window, false if it isnt.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsMTAWindowActive',
    },
    isObjectBreakable: {
        summary: 'This function checks if an object / model ID is breakable.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: '/ modelId The object / model ID thats being checked.' },
        ],
        returns: '* true if the object is breakable. * false if the object is not breakable.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsObjectBreakable',
    },
    isObjectInACLGroup: {
        summary: 'This function is used to determine if an object is in a group.',
        parameters: [
            { name: 'theObjectName', isOptional: false, isVariadic: false, summary: 'the name of the object to check. Examples: resource.ctf, user.Jim.' },
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'the ACL group pointer of the group from which the object should be found.' },
        ],
        returns: 'returns true if the object is in the specified group, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsObjectInACLGroup',
    },
    isObjectMoving: {
        summary: '',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'The object element.' },
        ],
        returns: '* returns true if the object is moving, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsObjectMoving',
    },
    isOOPEnabled: {
        summary: '',
        parameters: [],
        returns: 'returns true or false if oop is enabled or not. returns nil if an error arised.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsOOPEnabled',
    },
    isPedBleeding: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped whose bleeding effect state you want to get.' },
        ],
        returns: 'returns true if the player or ped is bleeding, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedBleeding',
    },
    isPedChoking: {
        summary: 'This function checks if the specified ped is choking (coughing) or not. This happens as a\nresult of weapons that produce smoke - smoke grenades, fire extinguisher and the spray\ncan.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped you wish to check' },
        ],
        returns: 'returns true if the ped is choking, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedChoking',
    },
    isPedDead: {
        summary: 'This function checks if the specified ped is dead or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': the ped you want to check up on.' },
        ],
        returns: 'returns true if the ped is dead, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDead',
    },
    isPedDoingGangDriveby: {
        summary: 'This function checks if the ped is in the driveby state.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped element whose state is to be checked.' },
        ],
        returns: 'returns true if the driveby state is enabled, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDoingGangDriveby',
    },
    isPedDoingTask: {
        summary: 'This function checks if the specified ped is carrying out a certain List of player\ntasks|task.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped you want to check.' },
            { name: 'taskName', isOptional: false, isVariadic: false, summary: ': A string containing the name of the List of player tasks|task youre checking for.' },
        ],
        returns: 'returns true if the player is currently doing the task, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDoingTask',
    },
    isPedDucked: {
        summary: 'This function checks if the specified ped is ducked (crouched) or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped to check.' },
        ],
        returns: 'returns true if the ped is ducked, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDucked',
    },
    isPedFootBloodEnabled: {
        summary: 'This function checks if player feets are bleeding.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player to give bloody foot prints to.' },
        ],
        returns: 'returns true if feets are bleeding, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedFootBloodEnabled',
    },
    isPedHeadless: {
        summary: 'With this function, you can check if a ped has a head or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped to check.' },
        ],
        returns: 'returns true if the ped is headless, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedHeadless',
    },
};
