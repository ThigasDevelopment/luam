import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_20: ApiDocumentationCatalog = {
    getPedWeapon: {
        summary: 'This function tells you which weapon type is in a certain **weapon slot** of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to get the weapon type from.' },
            { name: 'weaponSlot', isOptional: true, isVariadic: false, summary: 'an integer representing the weapon slot (set to the ped\'s current slot if not given).' },
        ],
        returns: 'Returns an int indicating the type of the weapon the ped has in the specified slot. If the slot is empty, it returns 0. It should be noted that if a ped runs out of ammo for a weapon, it will still return the ID of that weapon in the slot (even if it appears as if the ped does not have a weapon at all), though getPedTotalAmmo will return **0**. Therefore, getPedTotalAmmo should be used in conjunction with getPedWeapon in order to check if a ped has a weapon.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWeapon',
    },
    getPedWeaponMuzzlePosition: {
        summary: 'Returns the world position of the muzzle of the weapon that a ped is currently carrying. The weapon muzzle is the end of the gun barrel where the bullets/rockets/... come out.\n\nThe position may not be accurate if the ped is off screen.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose weapon muzzle position to retrieve.' },
        ],
        returns: 'If successful, returns the x/y/z coordinates of the weapon muzzle. Returns *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWeaponMuzzlePosition',
    },
    getPedWeaponSlot: {
        summary: 'This function gets a ped\'s selected weapon slot.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped to get the current weapon slot of.' },
        ],
        returns: 'Returns the selected weapon slot ID on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWeaponSlot',
    },
    getPerformanceStats: {
        summary: 'This function returns performance information.',
        parameters: [
            { name: 'category', isOptional: false, isVariadic: false, summary: 'Performance statistics category. If empty string is given, list of all categories is returned.See categories for more information.' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'Category specific \',\' separated options. All categories supports \'h\' option for help.' },
            { name: 'filter', isOptional: true, isVariadic: false, summary: 'Case-sensitive filter used to select returned rows. Only \'name\' column is filtered.' },
        ],
        returns: 'Returns two tables. First contains column names. The second contains result rows. Each row is table of cells.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPerformanceStats',
    },
    getPickupAmmo: {
        summary: 'This function retrieves the amount of ammo in a weapon pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup in which you wish to retrieve the ammo of' },
        ],
        returns: 'Returns an *integer* of the amount of ammo in the pickup, *false* if the pickup element is invalid, 0 if it\'s no weapon pickup.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupAmmo',
    },
    getPickupAmount: {
        summary: 'This function retrieves the amount of health or armor given from a pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup you wish to retrieve the amount from.' },
        ],
        returns: 'Returns an *integer* of the amount the pickup is set to, *false* if it\'s invalid, 0 if it\'s no health or amor pickup.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupAmount',
    },
    getPickupRespawnInterval: {
        summary: 'Returns the time it takes before a pickup respawns after a player picked it up. The time is specified in milliseconds.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'the pickup you want the respawn time of' },
        ],
        returns: 'Returns the respawn time of the pickup if successful, *false* in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupRespawnInterval',
    },
    getPickupType: {
        summary: 'This function retrieves the type of a pickup, either a health, armour or weapon pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup you wish to retrieve the type of.' },
        ],
        returns: 'Returns *false* if the pickup is invalid, or an integer of the type of the pickup, which include: ***0:** Health pickup ***1:** Armour pickup ***2:** Weapon pickup ***3:** Custom Pickup',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupType',
    },
    getPickupWeapon: {
        summary: 'This function retrieves the weapon ID of a weapon pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup of which you wish to retrieve the weapon' },
        ],
        returns: 'Returns the Weapon ID of the pickup, or *false* if the pickup is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupWeapon',
    },
    getPlayerAccount: {
        summary: 'This function returns the specified player\'s account object.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player element you want to get the account of.' },
        ],
        returns: 'Returns the player\'s account object, or *false* if the player passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerAccount',
    },
    getPlayerACInfo: {
        summary: 'This function returns anti-cheat info for a player. The info returned by this function\ncan change over time, so use the server event onPlayerACInfo instead.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose anti-cheat info you want to check.' },
        ],
        returns: 'returns a table with the following entries: * detectedac: a string containing a comma separated list of anti-cheat_guide|anti-cheat codes the player has triggered. *d3d9size: a number representing the file size of any custom d3d9.dll the player may have installed. *d3d9md5: a string containing the md5 of any custom d3d9.dll the player may have installed. *d3d9sha256: a string containing the sha256 of any custom d3d9.dll the player may have installed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerACInfo',
    },
    getPlayerAnnounceValue: {
        summary: 'This function retrieves a players ASE announce value under a certain key.|',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'This is the Player whos value you want to retrieve.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the key.' },
        ],
        returns: 'This function returns a *string* containing the requested value if a valid key was specified or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerAnnounceValue',
    },
    getPlayerBlurLevel: {
        summary: 'This function allows you to check the current blur level of a specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose blur level you want to check.' },
        ],
        returns: 'Returns the player\'s blur level if successful, *false* if an invalid player was given. ```lua int getBlurLevel () ``` Returns the local blur level.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerBlurLevel',
    },
    getPlayerCount: {
        summary: 'This function returns the number of players currently connected to the server.',
        parameters: [],
        returns: 'Returns the number of players connected to the server as an int.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerCount',
    },
    getPlayerFromName: {
        summary: 'This function returns a player element for the player with the name passed to the function.',
        parameters: [
            { name: 'playerName', isOptional: false, isVariadic: false, summary: 'A string containing the name of the player you want to reference' },
        ],
        returns: 'Returns a player element for the player with the nickname provided. If there is no player with that name, *false* is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerFromName',
    },
    getPlayerHudComponentProperty: {
        summary: 'This function gets the value of the specified HUD property.',
        parameters: [
            { name: 'component', isOptional: false, isVariadic: false, summary: 'The component whose property you want to retrieve. See HUD Components.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The name of the property you want to read. See HUD Properties.' },
        ],
        returns: 'Returns different values depending on the type. It can be *bool*, *string*, *int*, *int int*, or *int int int int*. If something goes wrong, it returns **false**.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerHudComponentProperty',
    },
    getPlayerIdleTime: {
        summary: 'This function gets the amount of time in milliseconds that a players position has not changed.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to get the idle time of.' },
        ],
        returns: 'Returns the amount of **time in milliseconds** that a player has been idle, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerIdleTime',
    },
    getPlayerIP: {
        summary: 'This function returns a string containing the IP address of the player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player element you want to get the IP of.' },
        ],
        returns: 'Returns a string containing the requested players\'s IP, or *false* if the player passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerIP',
    },
    getPlayerMapBoundingBox: {
        summary: 'This function gets the GUI bounding box of the player map (F11) texture.',
        parameters: [],
        returns: '* If the player\'s map is showing, it returns four integers: *minX*, *minY*, *maxX*, *maxY*. These are **absolute** position coordinates of where the player\'s map is drawn on the screen. ** *minX, minY* represent the world coordinates *-3000, 3000* (upper-left corner of the world map). ** *maxX, maxY* represent the world coordinates *3000, -3000* (lower-right corner of the world map). ** Negative values may be returned if these coordinates are off screen. * If the map is not showing, a *false* boolean value is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerMapBoundingBox',
    },
    getPlayerMapOpacity: {
        summary: 'This function allows to get the opacity of the player map (F11).',
        parameters: [],
        returns: 'Returns an integer with a value from 0 to 255, where 0 is fully transparent and 255 is fully opaque.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerMapOpacity',
    },
    getPlayerMoney: {
        summary: 'Returns the amount of money a player currently has.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish the retrieve the amount of money from.' },
        ],
        returns: 'Returns an integer with the amount of money the specified player has, *false* if the player is invalid. ```lua int getPlayerMoney ( ) ``` Returns an integer with the amount of money the local player has.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerMoney',
    },
    getPlayerName: {
        summary: 'This function returns a string containing the name of the specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you want to get the name of' },
        ],
        returns: 'Returns a string containing the requested player\'s name, or *false* if the player passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerName',
    },
    getPlayerNametagColor: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function gets the current color of a player\'s name tag as RGB values. These are in the range 0-255.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose name tag RGB color values you wish to retrieve.' },
        ],
        returns: 'Returns *red*, *green* and *blue* values if an existent player was specified, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerNametagColor',
    },
    getPlayerNametagText: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis will allow you to retrieve the name tag a player is currently using.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The person whose name tag you want to retrieve' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns a *string* with the nametag text, *false* if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerNametagText',
    },
    getPlayerPing: {
        summary: 'This function returns the ping of a specified player. The ping is the number of milliseconds that data takes to travel from the player\'s client to the server or vice versa. If a player is using a VPN their ping will still be returned correctly.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose ping you want to determine.' },
        ],
        returns: 'Returns the ping as an int, or *false* if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerPing',
    },
    getPlayerScriptDebugLevel: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\n\nThis will allow you to retrieve the player current debug script level.\n\nThis function has a client-sided variant, which can only retrieve the local player\'s script debug level.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The person whose debug script level you want' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns an *int* with the player debug script level, *false* if the player is invalid. ```lua int getPlayerScriptDebugLevel() ``` <!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns an *int* with the local player\'s debug script level.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerScriptDebugLevel',
    },
    getPlayerSerial: {
        summary: 'This function returns the serial for a specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player.' },
        ],
        returns: 'Returns the serial as a *string* if it was found, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerSerial',
    },
    getPlayersInTeam: {
        summary: 'This function retrieves all the players of the specified team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you wish to retrieve all the players from.' },
        ],
        returns: 'Returns a table of all the players in the team, or an empty one if there are none else false if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayersInTeam',
    },
    getPlayerTeam: {
        summary: 'This function gets the current team a player is on.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose team you want to find out.' },
        ],
        returns: 'Returns a *team* element representing the team the player is on, *false* if the player is not part of a team.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerTeam',
    },
    getPlayerVersion: {
        summary: 'This function gets the client version of the specified player as a **sortable string**. The string is always 15 characters long and is formatted as follows:\n\n* 1 character representing the major version\n* 1 dot character\n* 1 character representing the minor version\n* 1 dot character\n* 1 character representing the maintenance version\n* 1 dash character\n* 1 character representing the build type\n* 1 dot character\n* 5 characters representing the build number\n* 1 dot character\n* 1 character representing the build revision\n\nAn example of a version string would be: 1.0.4-9.01746.0\n\nWhere the first three numbers represent the major/minor/maintenance version, i.e. 1.0.4\n\nThe fourth number is 9, which means it\'s a release build, (Development and beta builds have lower numbers here)\n\nAnd the fifth and sixth numbers represent the build number.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose client version you wish to get.' },
        ],
        returns: 'Returns a string containing the client version, or false if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerVersion',
    },
};
