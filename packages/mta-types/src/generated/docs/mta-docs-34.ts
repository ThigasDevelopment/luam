import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_34: ApiDocumentationCatalog = {
    isKeyBound: {
        summary: 'This function can be used to find out if a key has already been bound. If you do not specify a keyState or handler, any instances of key being bound will cause isKeyBound to return true.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you\'re checking.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you\'re checking. See Key names for a list of valid key names.' },
            { name: 'keyState', isOptional: true, isVariadic: false, summary: 'Is the state of the key when it calls the function, Can be either:' },
            { name: 'handler', isOptional: true, isVariadic: false, summary: 'The function you\'re checking against' },
        ],
        returns: 'Returns *true* if the key is bound, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsKeyBound',
    },
    isLineOfSightClear: {
        summary: 'This function checks if there are obstacles between two points of the game world, optionally ignoring certain kinds of elements. Use processLineOfSight if you want more information about what the ray hits.',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'The first point\'s world X coordinate.' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'The first point\'s world Y coordinate.' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'The first point\'s world Z coordinate.' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: 'The second point\'s world X coordinate.' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: 'The second point\'s world Y coordinate.' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: 'The second point\'s world Z coordinate.' },
            { name: 'checkBuildings', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTA\'s internally placed buildings, i.e. the world map.' },
            { name: 'checkVehicles', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by vehicles.' },
            { name: 'checkPeds', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by peds, i.e. players.' },
            { name: 'checkObjects', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by objects.' },
            { name: 'checkDummies', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTA\'s internal dummies. These are not used in the current MTA version so this argument can be set to *false*.' },
            { name: 'seeThroughStuff', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to **pass through** collision materials that have this flag enabled (By default material IDs 52, 55 and 66 which are some fences). This flag originally allows some objects to be walked on but you can shoot throug them.' },
            { name: 'ignoreSomeObjectsForCamera', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to **pass through** objects that have (K) property enabled in "object.dat" data file. (i.e. Most dynamic objects like boxes or barrels)' },
            { name: 'ignoredElement', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to pass through a certain specified element.' },
        ],
        returns: 'Returns *true* if the line between the specified points is clear, *false* if there\'s an obstacle or if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsLineOfSightClear',
    },
    isMainMenuActive: {
        summary: 'This function returns whether the user is in the mainmenu or not.',
        parameters: [],
        returns: 'Returns *true* if the mainmenu is visible, *false* if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsMainMenuActive',
    },
    isMTAWindowActive: {
        summary: 'This function returns whether any system windows that take focus are active. This includes:\n* Chatbox input\n* Console window\n* Main menu\n* Transferbox\nTo get the status of the debug view, see isDebugViewActive.',
        parameters: [],
        returns: 'Returns *true* if the focus is on the MTA window, *false* if it isn\'t.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsMTAWindowActive',
    },
    isObjectBreakable: {
        summary: 'Added also as a server-side function. Previously only available as a client-side function.\n\nThis function checks if an object / model ID is breakable.',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: '* *true* if the object is breakable. * *false* if the object is not breakable.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsObjectBreakable',
    },
    isObjectInACLGroup: {
        summary: 'This function is used to determine if an object is in a group.',
        parameters: [
            { name: 'theObjectName', isOptional: false, isVariadic: false, summary: 'the name of the object to check. Examples: "resource.ctf", "user.Jim".' },
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'the ACL group pointer of the group from which the object should be found.' },
        ],
        returns: 'Returns *true* if the object is in the specified group, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsObjectInACLGroup',
    },
    isObjectMoving: {
        summary: 'This function checks if an object is moving. This function is now also available on the server side.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'The object element.' },
        ],
        returns: '* Returns *true* if the object is moving, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsObjectMoving',
    },
    isObjectRespawnable: {
        summary: 'This function checks if the object has respawn enabled, which can be toggled using toggleObjectRespawn.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'an object element.' },
        ],
        returns: 'Returns true if the object has respawning enabled, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsObjectRespawnable',
    },
    isOOPEnabled: {
        summary: 'This function checks whether *OOP* (Object Oriented Programming) is enabled in the current resource or not.',
        parameters: [],
        returns: 'Returns *true* or *false* if *OOP* is enabled or not. Returns *nil* if an error arised.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsOOPEnabled',
    },
    isPedBleeding: {
        summary: 'This function gets the state of a player\'s or ped\'s bleeding effect.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped whose bleeding effect state you want to get.' },
        ],
        returns: 'Returns *true* if the player or ped is bleeding, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedBleeding',
    },
    isPedChoking: {
        summary: 'This function checks if the specified ped is choking (coughing) or not. This happens as a result of weapons that produce smoke - smoke grenades, fire extinguisher and the spray can.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you wish to check' },
        ],
        returns: 'Returns *true* if the ped is choking, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedChoking',
    },
    isPedDead: {
        summary: 'This function checks if the specified ped is dead or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check up on.' },
        ],
        returns: 'Returns *true* if the ped is dead, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDead',
    },
    isPedDoingGangDriveby: {
        summary: 'This function checks if the ped is in the driveby state.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped element whose state is to be checked.' },
        ],
        returns: 'Returns **true** if the driveby state is enabled, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDoingGangDriveby',
    },
    isPedDoingTask: {
        summary: 'This function checks if the specified ped is carrying out a certain task.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you want to check.' },
            { name: 'taskName', isOptional: false, isVariadic: false, summary: 'A string containing the name of the task you\'re checking for.' },
        ],
        returns: 'Returns *true* if the player is currently doing the task, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDoingTask',
    },
    isPedDucked: {
        summary: 'This function checks if the specified ped is ducked (crouched) or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped to check.' },
        ],
        returns: 'Returns *true* if the ped is ducked, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedDucked',
    },
    isPedFootBloodEnabled: {
        summary: 'This function checks if player feets are bleeding.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player to give bloody foot prints to.' },
        ],
        returns: 'Returns *true* if feets are bleeding, **false** otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedFootBloodEnabled',
    },
    isPedHeadless: {
        summary: 'With this function, you can check if a ped has a head or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped to check.' },
        ],
        returns: 'Returns *true* if the ped is headless, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedHeadless',
    },
    isPedInVehicle: {
        summary: 'Checks whether or not a given ped is currently in a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check.' },
        ],
        returns: 'Returns *true* if the ped is in a vehicle, *false* if he is on foot or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedInVehicle',
    },
    isPedOnFire: {
        summary: 'This function checks if the specified ped is on fire or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped to check.' },
        ],
        returns: 'returns true if the ped is on fire, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedOnFire',
    },
    isPedOnGround: {
        summary: 'This function is used to determine whether or not a ped is on the ground. This is for on-foot usage only.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you are checking.' },
        ],
        returns: 'Returns *true* if the ped is on foot and on the ground, *false* otherwise, even if he is in a car that stands still or on object outside world map.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedOnGround',
    },
    isPedReloadingWeapon: {
        summary: 'This function is used to determine whether or not a ped is currently reloading their weapon. Useful to stop certain quick reload exploits.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you are checking.' },
        ],
        returns: 'Returns *true* if the ped is currently reloading a weapon, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedReloadingWeapon',
    },
    isPedTargetingMarkerEnabled: {
        summary: 'This function checks whether health target markers are drawn as set by setPedTargetingMarkerEnabled or not.',
        parameters: [],
        returns: 'Returns *true* if the health target markers are enabled, *false* if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedTargetingMarkerEnabled',
    },
    isPedWearingJetpack: {
        summary: 'Checks whether or not a ped is currently wearing a jetpack.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check' },
        ],
        returns: 'Returns *true* if the ped is carrying a jetpack, *false* if he is not or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPedWearingJetpack',
    },
    isPickupSpawned: {
        summary: 'This function checks if a pickup is currently spawned (is visible and can be picked up) or not (a player picked it up recently).',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'the pickup you want to check.' },
        ],
        returns: 'Returns *true* if the pickup is spawned, *false* if it\'s not spawned or an invalid pickup was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPickupSpawned',
    },
    isPlayerCrosshairVisible: {
        summary: 'This function checks if the local player has showing crosshair.',
        parameters: [],
        returns: 'Returns *true* if the player has the crosshair visible, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerCrosshairVisible',
    },
    isPlayerHudComponentVisible: {
        summary: 'This function can be used to check whether an hud component is visable or not.',
        parameters: [
            { name: 'component', isOptional: false, isVariadic: false, summary: 'The component you wish to check. Valid values are:' },
        ],
        returns: 'Returns *true* if the component is visable, *false* if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerHudComponentVisible',
    },
    isPlayerMapForced: {
        summary: 'This function checks if the specified player\'s map (F11) has been forced on or not.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player' },
        ],
        returns: 'Returns *true* if the player\'s map is forced on, *false* otherwise. ```lua bool isPlayerMapForced () ``` Returns *true* if the local player\'s map is forced on, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerMapForced',
    },
    isPlayerMapVisible: {
        summary: 'This function checks if the local player has their map showing (F11).',
        parameters: [],
        returns: 'Returns *true* if the player has the map visible, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerMapVisible',
    },
    isPlayerMuted: {
        summary: 'Use this function to check if a player has been muted.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you are checking.' },
        ],
        returns: 'Returns *true* if the player is muted and *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsPlayerMuted',
    },
};
