import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_26: ApiDocumentationCatalog = {
    getWaterColor: {
        summary: 'This function returns the water color of the GTA world.\n\n**Note:** The server can only return the water color, if it has actually been set by script.',
        parameters: [],
        returns: 'Returns 4 ints, indicating the color of the water. (RGBA)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaterColor',
    },
    getWaterLevel: {
        summary: 'This function allows you to retrieve the water level from a certain location. The water level is 0 in most places though it can vary (e.g. it\'s higher near the dam).',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'ignoreDistanceToWaterThreshold', isOptional: true, isVariadic: false, summary: 'If set to false, this function returns false, if the difference between water level (without waves) and posZ is greater than 3.0' },
        ],
        returns: 'Returns an *integer* of the water level if the localPlayer/position is near the water (-3 to 20 on the Z coordinate) else *false* if there\'s no water near the localPlayer/position.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaterLevel',
    },
    getWaterVertexPosition: {
        summary: 'Gets the world position of a vertex (i.e. corner) of a water area. Each water area is either a triangle or quad (rectangle) so each has 3 or 4 corners.',
        parameters: [
            { name: 'theWater', isOptional: false, isVariadic: false, summary: 'the water element to get the vertex of' },
            { name: 'vertexIndex', isOptional: false, isVariadic: false, summary: 'the index of the vertex whose position to get. Values range from 1 to 4 for a water quad, or 1 to 3 for a triangle.' },
        ],
        returns: 'Returns the x, y and z coordinates of the specified vertex if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaterVertexPosition',
    },
    getWaveHeight: {
        summary: 'This function returns the current wave height.',
        parameters: [],
        returns: 'Returns the height as a float, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaveHeight',
    },
    getWeaponAmmo: {
        summary: 'This function gets the total ammo a custom weapon has.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to get the ammo of.' },
        ],
        returns: 'Returns an integer containing how many ammo left has the weapon. Returns *false* if an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponAmmo',
    },
    getWeaponClipAmmo: {
        summary: 'This function gets the amount of ammo left in a custom weapon\'s magazine/clip.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon to get the clip ammo of.' },
        ],
        returns: 'Returns the amount of ammo in the custom weapon\'s clip, *false* if an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponClipAmmo',
    },
    getWeaponFiringRate: {
        summary: 'This gets the firing rate to be used when a custom weapon opens fire.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to modify the firing rate of.' },
        ],
        returns: 'Returns an *integer* with the firing rate of the custom weapon, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponFiringRate',
    },
    getWeaponFlags: {
        summary: 'This function gets the flags of a custom weapon.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon to get the flag of.' },
            { name: 'theFlag', isOptional: false, isVariadic: false, summary: 'the weapon flag to get:' },
        ],
        returns: 'Returns the *true* or *false* on success (*flags* flag returns 8 values) if the flag is enabled or not. Returns *false* if the weapon element isn\'t valid or an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponFlags',
    },
    getWeaponIDFromName: {
        summary: 'This function will obtain the ID of a particular weapon from its name.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'A string containing the name of the weapon. Names can be: (Case is ignored)' },
        ],
        returns: 'Returns an int if the name matches that of a weapon, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponIDFromName',
    },
    getWeaponNameFromID: {
        summary: 'This function allows you to retrieve the name of a weapon from an ID.',
        parameters: [
            { name: 'id', isOptional: false, isVariadic: false, summary: 'The ID you wish to retrieve the name of' },
        ],
        returns: 'Returns a string of the name of the weapon or death type, *false* otherwise. Names will be like these: (Ignoring case)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponNameFromID',
    },
    getWeaponOwner: {
        summary: 'This function gets the owner of a Element/Weapon|custom weapon. Weapon ownership system\nwas, however, disabled, so this function always returns false. Please refer to\nsetWeaponOwner for details.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to get the owner of.' },
        ],
        returns: 'this function was intended to return the player which owns the element/weapon|custom weapon, and false if an error occured. however, at the moment it always returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponOwner',
    },
    getWeaponProperty: {
        summary: 'This function gets a weapon property of the specified custom weapon (clientside only) or specified player-held weapon (both client and server).',
        parameters: [
            { name: 'weaponName', isOptional: false, isVariadic: false, summary: '' },
            { name: 'weaponSkill', isOptional: false, isVariadic: false, summary: 'Either: "pro", "std" or "poor"' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you want to get the value of:' },
        ],
        returns: 'On success: **int:** The weapon property On failure: **bool:** False if the passed arguments were invalid',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponProperty',
    },
    getWeaponState: {
        summary: 'This function gets the state of a custom weapon.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon to get the state of.' },
        ],
        returns: '* A string if the weapon is valid, indicating the weapon state, which can be: ** **reloading**: the weapon is reloading. ** **firing**: the weapon is constantly shooting (unless any shooting blocking flags are set) according to its assigned firing rate. ** **ready**: the weapon is idle. * *false* if an error occured or the weapon is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponState',
    },
    getWeaponTarget: {
        summary: 'This functions gets the target of a custom weapon.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to get the target of.' },
        ],
        returns: '* Returns the *target* of the custom weapon, which can be: ***nil* if the weapon is in rotation based targeting. **3 floats if the weapon is firing at a fixed point. **an element if the weapon is firing an entity. * Returns *false* if the weapon element is not valid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponTarget',
    },
    getWeather: {
        summary: 'This function returns the current Weather ID.',
        parameters: [],
        returns: 'Returns two integers indicating the weather type that is currently active. The first integer says what weather is currently considered to be active. The second integer is the weather id that is being blended into if any, otherwise it is *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeather',
    },
    getWindVelocity: {
        summary: 'This function gets the wind velocity in San Andreas.',
        parameters: [],
        returns: '***velocityX**: The velocity on the x-coordinate or false if the wind velocity is default. ***velocityY**: The velocity on the y-coordinate or nil if the wind velocity is default. ***velocityZ**: The velocity on the z-coordinate or nil if the wind velocity is default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWindVelocity',
    },
    getWorldFromScreenPosition: {
        summary: 'This function allows you to retrieve the world position corresponding to a 2D position on the screen, at a certain depth.\n\nIf you want to detect what element is at a particular point on the screen, use processLineOfSight between the camera position and the position returned from this function when passed a high depth value (100 or so, depending how far away you want to detect elements at).\n\nAs expected, setting 0 as the distance will cause the point retrived to be within the camera itself. That means that drawing any 3D thing in that point would result in it not being visible. Depending on the camera near clip distance, however, the minimum distance to be able to view it can vary.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float value indicating the x position on the screen, in pixels.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float value indicating the y position on the screen, in pixels.' },
            { name: 'depth', isOptional: false, isVariadic: false, summary: 'A float value indicating the distance from the camera of the point whose coordinates we are retrieving, in units.' },
        ],
        returns: 'Returns three *x*, *y*, *z* floats indicating the world position if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWorldFromScreenPosition',
    },
    getWorldProperty: {
        summary: 'This function is used to get the values of time cycle and weather related properties.',
        parameters: [
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you wish to retrieve.' },
        ],
        returns: 'Returns the value of property represented by either 1 or 3 numbers (RGB, FLOAT, INT) if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWorldProperty',
    },
    getZoneName: {
        summary: 'This function allows you to retrieve the zone name of a certain location.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The X axis position' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The Y axis position' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The Z axis position' },
            { name: 'citiesonly', isOptional: true, isVariadic: false, summary: 'An optional argument to choose if you want to return one of the following city names:' },
        ],
        returns: 'Returns the string of the zone name.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetZoneName',
    },
    givePedWeapon: {
        summary: 'This function gives the specified weapon to the specified ped. This function can\'t be used on players, use giveWeapon for that.\n\nThis function is mainly useful for client side created peds however you can use it on a server side ped, though note that the weapon wouldn\'t be synced between clients unless your script gives the weapon to the ped on every client.\n\nThere is an optional argument to specify ammunition and whether to set as the current weapon. If you don\'t specify an ammo value it will give 30 ammo by default and for a melee weapon you can specify just 1 or above.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'A ped element.' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'A whole number integer that refers to a Weapon ID. Click here for a list of possible weapon IDs.' },
            { name: 'ammo', isOptional: true, isVariadic: false, summary: 'A whole number integer serving as the ammo amount for the given weapon. For weapons that do not require ammo, such as melee, this should be at least 1.' },
            { name: 'setAsCurrent', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether or not the weapon will be set as the peds currently selected weapon.' },
        ],
        returns: 'Returns *true* if weapon was successfully given to the ped, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GivePedWeapon',
    },
    givePlayerMoney: {
        summary: 'This function adds money to a player\'s current money amount.  To set absolute values, setPlayerMoney can be used.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you are giving the money to.' },
            { name: 'amount', isOptional: false, isVariadic: false, summary: 'a positive integer number specifying the amount of money to give to the player.' },
        ],
        returns: 'Returns *true* if the money was added, or *false* if invalid parameters were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GivePlayerMoney',
    },
    giveWeapon: {
        summary: 'giveWeapon gives a specified weapon to a certain player or ped. There is an optional argument to specify ammunition. For example, a melee weapon doesn\'t need an ammo argument.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player or ped object referencing the specified player (or ped)' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'A whole number integer that refers to a Weapon ID.' },
            { name: 'ammo', isOptional: true, isVariadic: false, summary: 'A whole number integer serving as the ammo amount for the given weapon. For weapons that do not require ammo, such as melee, this should be at least 1.' },
            { name: 'setAsCurrent', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether or not the weapon will be set as the players current.' },
        ],
        returns: 'Returns *true* if weapon was successfully acquired, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GiveWeapon',
    },
    guiBlur: {
        summary: 'This function defocuses a focused GUI element. Used primarily for edit fields and memos.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to defocus' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiBlur',
    },
    guiBringToFront: {
        summary: 'This function brings a GUI element on top of others.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to move to the front.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiBringToFront',
    },
    guiCheckBoxGetSelected: {
        summary: 'This function gets a checkbox\'s selection state.',
        parameters: [
            { name: 'theCheckbox', isOptional: false, isVariadic: false, summary: 'The checkbox you wish to retrieve the selection state of.' },
        ],
        returns: 'Returns *true* if the checkbox is selected, *false* if it is not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCheckBoxGetSelected',
    },
    guiCheckBoxSetSelected: {
        summary: 'This function selects (ticks) or unselects a checkbox.',
        parameters: [
            { name: 'theCheckbox', isOptional: false, isVariadic: false, summary: 'The GUI element in which you wish to change the selection state of' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'The state of the checkbox, where *true* indicates selected, and *false* indicates unselected.' },
        ],
        returns: 'Returns *true* if the checkbox\'s selection state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCheckBoxSetSelected',
    },
    guiComboBoxAddItem: {
        summary: 'Adds an item to a combobox.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox you want to add a row to' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The text that the item will contain.' },
        ],
        returns: 'Returns the item ID if it has been created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxAddItem',
    },
    guiComboBoxClear: {
        summary: 'This function removes all the items from a combobox.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox element to be cleared' },
        ],
        returns: 'Returns *true* if the combobox element is valid and has been cleared successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxClear',
    },
};
