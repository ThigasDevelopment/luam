import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_18: ApiDocumentationCatalog = {
    getPedTotalAmmo: {
        summary: 'This function returns an integer that contains the total ammo in a specified peds weapon.\nSee weapon|Weapon Info',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose ammo you want to check.' },
            { name: 'weaponSlot', isOptional: true, isVariadic: false, summary: ': an integer representing the weapon slot (set to the peds current slot if not given)' },
        ],
        returns: 'returns an int containing the total amount of ammo for the specified peds weapon, or 0 if the ped specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTotalAmmo',
    },
    getPedVoice: {
        summary: 'Gets the current voice of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped to get the voice of.' },
        ],
        returns: 'if successul, returns the current voice type name and the voice name of the ped (see ped voices for possible names). returns false in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedVoice',
    },
    getPedWalkingStyle: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose walking style to retrieve.' },
        ],
        returns: 'returns the walking style id if successful, false otherwise. the possible walking styles are as follows:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWalkingStyle',
    },
    getPedWeapon: {
        summary: 'This function tells you which weapon type is in a certain weapon|weapon slot of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': the ped you want to get the weapon type from.' },
            { name: 'weaponSlot', isOptional: true, isVariadic: false, summary: ': an integer representing the weapon|weapon slot (set to the peds current slot if not given).' },
        ],
        returns: 'returns an int indicating the type of the weapon the ped has in the specified slot. if the slot is empty, it returns 0. it should be noted that if a ped runs out of ammo for a weapon, it will still return the id of that weapon in the slot (even if it appears as if the ped does not have a weapon at all), though getpedtotalammo will return 0. therefore, getpedtotalammo should be used in conjunction with getpedweapon in order to check if a ped has a weapon.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWeapon',
    },
    getPedWeaponMuzzlePosition: {
        summary: 'Returns the world position of the muzzle of the weapon that a ped is currently carrying.\nThe weapon muzzle is the end of the gun barrel where the bullets/rockets/... come out.\nThe position may not be accurate if the ped is off screen.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose weapon muzzle position to retrieve.' },
        ],
        returns: 'if successful, returns the x/y/z coordinates of the weapon muzzle. returns false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWeaponMuzzlePosition',
    },
    getPedWeaponSlot: {
        summary: 'This function gets a peds selected weapon slot.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped to get the current weapon slot of.' },
        ],
        returns: 'returns the selected weapon slot id on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWeaponSlot',
    },
    getPerformanceStats: {
        summary: 'This function returns performance information.',
        parameters: [
            { name: 'category', isOptional: false, isVariadic: false, summary: 'Performance statistics category. If empty string is given, list of all categories is returned.See categories for more information.' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'Category specific , separated options. All categories supports h option for help.' },
            { name: 'filter', isOptional: true, isVariadic: false, summary: 'Case-sensitive filter used to select returned rows. Only name column is filtered.' },
        ],
        returns: 'returns two tables. first contains column names. the second contains result rows. each row is table of cells.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPerformanceStats',
    },
    getPickupAmmo: {
        summary: 'This function retrieves the amount of ammo in a weapon pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup in which you wish to retrieve the ammo of' },
        ],
        returns: 'returns an integer of the amount of ammo in the pickup, false if the pickup element is invalid, 0 if its no weapon pickup.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupAmmo',
    },
    getPickupAmount: {
        summary: 'This function retrieves the amount of health or armor given from a pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup you wish to retrieve the amount from.' },
        ],
        returns: 'returns an integer of the amount the pickup is set to, false if its invalid, 0 if its no health or amor pickup.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupAmount',
    },
    getPickupRespawnInterval: {
        summary: 'Returns the time it takes before a pickup respawns after a player picked it up. The time\nis specified in milliseconds.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'the pickup you want the respawn time of' },
        ],
        returns: 'returns the respawn time of the pickup if successful, false in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupRespawnInterval',
    },
    getPickupType: {
        summary: 'This function retrieves the type of a pickup, either a health, armour or weapon pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup you wish to retrieve the type of.' },
        ],
        returns: 'returns false if the pickup is invalid, or an integer of the type of the pickup, which include: *0: health pickup *1: armour pickup *2: weapon pickup *3: custom pickup',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupType',
    },
    getPickupWeapon: {
        summary: 'This function retrieves the weapon ID of a weapon pickup.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup of which you wish to retrieve the weapon' },
        ],
        returns: 'returns the weapons|weapon id of the pickup, or false if the pickup is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPickupWeapon',
    },
    getPlayerAccount: {
        summary: 'This function returns the specified players account object.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player element you want to get the account of.' },
        ],
        returns: 'returns the players account object, or false if the player passed to the function is invalid.',
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
        summary: '',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'This is the Player whos value you want to retrieve.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the key.' },
        ],
        returns: 'this function returns a string containing the requested value if a valid key was specified or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerAnnounceValue',
    },
    getPlayerBlurLevel: {
        summary: 'This function allows you to check the current blur level of a specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose blur level you want to check.' },
        ],
        returns: 'returns the players blur level if successful, false if an invalid player was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerBlurLevel',
    },
    getPlayerCount: {
        summary: 'This function returns the number of players currently connected to the server.',
        parameters: [],
        returns: 'returns the number of players connected to the server as an int.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerCount',
    },
    getPlayerFromName: {
        summary: 'This function returns a player element for the player with the name passed to the\nfunction.',
        parameters: [
            { name: 'playerName', isOptional: false, isVariadic: false, summary: ': A string containing the name of the player you want to reference' },
        ],
        returns: 'returns a player element for the player with the nickname provided. if there is no player with that name, false is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerFromName',
    },
    getPlayerIdleTime: {
        summary: 'This function gets the amount of time in milliseconds that a players position has not\nchanged.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': The player you wish to get the idle time of.' },
        ],
        returns: 'returns the amount of time in milliseconds that a player has been idle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerIdleTime',
    },
    getPlayerIP: {
        summary: 'This function returns a string containing the IP address of the player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player element you want to get the IP of.' },
        ],
        returns: 'returns a string containing the requested playerss ip, or false if the player passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerIP',
    },
    getPlayerMapBoundingBox: {
        summary: 'This function gets the GUI bounding box of the radar map texture.',
        parameters: [],
        returns: '* if the players map is showing, it returns four integers: minx, miny, maxx, maxy. these are absolute position coordinates of where the players map is drawn on the screen. ** minx, miny represent the world coordinates -3000, 3000 (upper-left corner of the world map). ** maxx, maxy represent the world coordinates 3000, -3000 (lower-right corner of the world map). ** negative values may be returned if these coordinates are off screen. * if the map is not showing, a false boolean value is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerMapBoundingBox',
    },
    getPlayerMapOpacity: {
        summary: '',
        parameters: [],
        returns: 'returns an integer with a value from 0 to 255, where 0 is fully transparent and 255 is fully opaque.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerMapOpacity',
    },
    getPlayerMoney: {
        summary: 'Returns the amount of money a player currently has.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish the retrieve the amount of money from.' },
        ],
        returns: 'returns an integer with the amount of money the specified player has, false if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerMoney',
    },
    getPlayerName: {
        summary: 'This function returns a string containing the name of the specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you want to get the name of' },
        ],
        returns: 'returns a string containing the requested players name, or false if the player passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerName',
    },
    getPlayerNametagColor: {
        summary: 'This function gets the current color of a players name tag as RGB values. These are in\nthe range 0-255.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose name tag RGB color values you wish to retrieve.' },
        ],
        returns: 'returns red, green and blue values if an existent player was specified, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerNametagColor',
    },
    getPlayerNametagText: {
        summary: 'This will allow you to retrieve the name tag a player is currently using.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The person whose name tag you want to retrieve' },
        ],
        returns: 'returns a string with the nametag text, false if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerNametagText',
    },
    getPlayerPing: {
        summary: 'This function returns the ping of a specified player. The ping is the number of\nmilliseconds that data takes to travel from the players client to the server or vice\nversa. If a player is using a VPN their ping will still be returned correctly.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': The player whose ping you want to determine.' },
        ],
        returns: 'returns the ping as an int, or false if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerPing',
    },
    getPlayerScriptDebugLevel: {
        summary: 'This will allow you to retrieve the player current debug script level.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The person whose debug script level you want' },
        ],
        returns: 'returns an int with the player debug script level, false if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerScriptDebugLevel',
    },
    getPlayerSerial: {
        summary: 'This function returns the serial for a specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player.' },
        ],
        returns: 'returns the serial as a string if it was found, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerSerial',
    },
    getPlayersInTeam: {
        summary: 'This function retrieves all the players of the specified team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you wish to retrieve all the players from.' },
        ],
        returns: 'returns a table of all the players in the team, or an empty one if there are none else false if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayersInTeam',
    },
};
