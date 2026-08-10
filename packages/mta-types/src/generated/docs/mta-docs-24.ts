import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_24: ApiDocumentationCatalog = {
    getWeaponFlags: {
        summary: 'This function gets the flags of a Element/Weapon|custom weapon.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon to get the flag of.' },
            { name: 'theFlag', isOptional: false, isVariadic: false, summary: 'the weapon flag to get: disable_model : makes the weapon and muzzle effect invisible or not. flags : returns the flags used to get where the gun shoots at. These flags are (by order): checkBuildings : allows the shoot to be blocked by GTAs internally placed buildings, i.e. the world map. checkCarTires : allows the shoot to be blocked by vehicle tires. checkDummies : allows the shoot to be blocked by GTAs internal dummies. These are not used in the current MTA version so this argument can be set to false. checkObjects : allows the shoot to be blocked by object|objects. checkPeds : allows the shoot to be blocked by ped|peds and player|players. checkVehicles : allows the shoot to be blocked by vehicle|vehicles. checkSeeThroughStuff : allows the shoot to be blocked by translucent game objects, e.g. glass. checkShootThroughStuff : allows the shoot to be blocked by things that can be shot through. instant_reload : if enabled, the weapon reloads instantly rather than waiting the reload time until shooting again. shoot_if_out_of_range : if enabled, the weapon still fires its target beyond the weapon range distance. shoot_if_blocked : if enabled, the weapon still fires its target even if its blocked by something.' },
        ],
        returns: 'returns the true or false on success (flags flag returns 8 values) if the flag is enabled or not. returns false if the weapon element isnt valid or an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponFlags',
    },
    getWeaponIDFromName: {
        summary: 'This function will obtain the ID of a particular weapon from its name.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'A string containing the name of the weapon. Names can be: (Case is ignored)' },
        ],
        returns: 'returns an int if the name matches that of a weapon, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponIDFromName',
    },
    getWeaponNameFromID: {
        summary: 'This function allows you to retrieve the name of a weapon from an ID.',
        parameters: [
            { name: 'id', isOptional: false, isVariadic: false, summary: 'The ID you wish to retrieve the name of' },
        ],
        returns: 'returns a string of the name of the weapon or death type, false otherwise. names will be like these: (ignoring case)',
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
        summary: 'This function gets a weapon property of the specified Element/Weapon|custom weapon\n(clientside only) or specified Weapons|player-held weapon (both client and server).',
        parameters: [
            { name: 'weaponID', isOptional: false, isVariadic: false, summary: 'or weaponName The ID or name of the weapon you want to get info of. Names can be:' },
            { name: 'weaponSkill', isOptional: false, isVariadic: false, summary: 'Either: pro, std or poor' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you want to get the value of: The following properties are get only:' },
        ],
        returns: 'on success: int: the weapon property on failure: bool: false if the passed arguments were invalid',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponProperty',
    },
    getWeaponState: {
        summary: 'This function gets the state of a Element/Weapon|custom weapon.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the Element/Weapon|weapon to get the state of.' },
        ],
        returns: '* a string if the element/weapon|weapon is valid, indicating the weapon state, which can be: ** reloading: the weapon is reloading. ** firing: the weapon is constantly shooting (unless any shooting blocking flags are set) according to its assigned firing rate. ** ready: the weapon is idle. * false if an error occured or the element/weapon|weapon is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponState',
    },
    getWeaponTarget: {
        summary: 'This functions gets the target of a Element/Weapon|custom weapon.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to get the target of.' },
        ],
        returns: '* returns the target of the element/weapon|custom weapon, which can be: **nil if the weapon is in rotation based targeting. **3 float|floats if the weapon is firing at a fixed point. **an element if the weapon is firing an entity. * returns false if the weapon element is not valid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponTarget',
    },
    getWeather: {
        summary: 'This function returns the current Weather ID.',
        parameters: [],
        returns: 'returns two integers indicating the weather type that is currently active. the first integer says what weather is currently considered to be active. the second integer is the weather id that is being blended into if any, otherwise it is nil.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeather',
    },
    getWindVelocity: {
        summary: 'This function gets the wind velocity in San Andreas.',
        parameters: [],
        returns: '*velocityx: the velocity on the x-coordinate or false if the wind velocity is default. *velocityy: the velocity on the y-coordinate or nil if the wind velocity is default. *velocityz: the velocity on the z-coordinate or nil if the wind velocity is default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWindVelocity',
    },
    getWorldFromScreenPosition: {
        summary: 'This function allows you to retrieve the world position corresponding to a 2D position on\nthe screen, at a certain depth.\nIf you want to detect what element is at a particular point on the screen, use\nprocessLineOfSight between the camera position and the position returned from this\nfunction when passed a high depth value (100 or so, depending how far away you want to\ndetect elements at).\nAs expected, setting 0 as the distance will cause the point retrived to be within the\ncamera itself. That means that drawing any 3D thing in that point would result in it not\nbeing visible. Depending on the camera near clip distance, however, the minimum distance\nto be able to view it can vary.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float value indicating the x position on the screen, in pixels.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float value indicating the y position on the screen, in pixels.' },
            { name: 'depth', isOptional: false, isVariadic: false, summary: 'A float value indicating the distance from the camera of the point whose coordinates we are retrieving, in units.' },
        ],
        returns: 'returns three x, y, z floats indicating the world position if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWorldFromScreenPosition',
    },
    getZoneName: {
        summary: 'This function allows you to retrieve the zone name of a certain location.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The X axis position' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The Y axis position' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The Z axis position' },
            { name: 'citiesonly', isOptional: true, isVariadic: false, summary: ': An optional argument to choose if you want to return one of the following city names: ** Tierra Robada ** Bone County ** Las Venturas ** San Fierro ** Red County ** Whetstone ** Flint County ** Los Santos' },
        ],
        returns: 'returns the string of the zone name.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetZoneName',
    },
    givePedWeapon: {
        summary: 'This function gives the specified weapon to the specified ped. This function cant be used\non players, use giveWeapon for that.\nThis function is mainly useful for client side created peds however you can use it on a\nserver side ped, though note that the weapon wouldnt be synced between clients unless\nyour script gives the weapon to the ped on every client.\nThere is an optional argument to specify ammunition and whether to set as the current\nweapon. If you dont specify an ammo value it will give 30 ammo by default and for a melee\nweapon you can specify just 1 or above.\n*When setting ammo for Weapon|weapons in slot 0,1,10,11 or 12 the maximum ammo is 1\n*When setting ammo for Weapon|weapons in slot 3,4,5 the ammo is added\n*When setting ammo for Weapon|weapons in slot 2,6,7,8,9 and the slot weapon is changing,\nthe ammo is replaced',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'A ped element.' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'A whole number integer that refers to a Weapon ID. Click Weapon|here for a list of possible weapon IDs.' },
            { name: 'ammo', isOptional: true, isVariadic: false, summary: 'A whole number integer serving as the ammo amount for the given weapon. For weapons that do not require ammo, such as melee, this should be at least 1.' },
            { name: 'setAsCurrent', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether or not the weapon will be set as the peds currently selected weapon.' },
        ],
        returns: 'returns true if weapon was successfully given to the ped, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GivePedWeapon',
    },
    givePlayerMoney: {
        summary: 'This function adds money to a players current money amount.  To set absolute values,\nsetPlayerMoney can be used.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you are giving the money to.' },
            { name: 'amount', isOptional: false, isVariadic: false, summary: 'a positive integer number specifying the amount of money to give to the player.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GivePlayerMoney',
    },
    giveWeapon: {
        summary: 'giveWeapon gives a specified weapon to a certain player or ped. There is an optional\nargument to specify ammunition. For example, a melee weapon doesnt need an ammo argument.\n*When setting ammo for Weapon|weapons in slot 0,1,10,11 or 12, the ammo max is 1\n*When setting ammo for Weapon|weapons in slot 3,4,5, the ammo is added\n*When setting ammo for Weapon|weapons in slot 2,6,7,8,9 and the slot weapon is changing,\nthe ammo is replaced',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player or ped object referencing the specified player (or ped)' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'A whole number integer that refers to a Weapon ID.' },
            { name: 'ammo', isOptional: true, isVariadic: false, summary: 'A whole number integer serving as the ammo amount for the given weapon. For weapons that do not require ammo, such as melee, this should be at least 1.' },
            { name: 'setAsCurrent', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether or not the weapon will be set as the players current.' },
        ],
        returns: 'returns true if weapon was successfully acquired, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GiveWeapon',
    },
    guiBlur: {
        summary: '',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to defocus' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiBlur',
    },
    guiBringToFront: {
        summary: 'This function brings a GUI element on top of others.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to move to the front.' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiBringToFront',
    },
    guiCheckBoxGetSelected: {
        summary: 'This function gets a checkboxs selection state.',
        parameters: [
            { name: 'theCheckbox', isOptional: false, isVariadic: false, summary: 'The checkbox you wish to retrieve the selection state of.' },
        ],
        returns: 'returns true if the checkbox is selected, false if it is not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCheckBoxGetSelected',
    },
    guiCheckBoxSetSelected: {
        summary: 'This function selects (ticks) or unselects a checkbox.',
        parameters: [
            { name: 'theCheckbox', isOptional: false, isVariadic: false, summary: 'The GUI element in which you wish to change the selection state of' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'The state of the checkbox, where true indicates selected, and false indicates unselected.' },
        ],
        returns: 'returns true if the checkboxs selection state was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCheckBoxSetSelected',
    },
    guiComboBoxAddItem: {
        summary: 'Adds an item to a combobox.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox you want to add a row to' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The text that the item will contain.' },
        ],
        returns: 'returns the item id if it has been created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxAddItem',
    },
    guiComboBoxClear: {
        summary: 'This function removes all the items from a combobox.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox element to be cleared' },
        ],
        returns: 'returns true if the combobox element is valid and has been cleared successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxClear',
    },
    guiComboBoxGetItemCount: {
        summary: '',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combo box to get the number of items from.' },
        ],
        returns: 'returns the number of items if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxGetItemCount',
    },
    guiComboBoxGetItemText: {
        summary: 'This function retrieves the text from a specific combobox item.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox containing the item youre interested in' },
            { name: 'itemId', isOptional: false, isVariadic: false, summary: 'The index of the item' },
        ],
        returns: 'returns the text of the item if the arguments are right, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxGetItemText',
    },
    guiComboBoxGetSelected: {
        summary: 'This function returns the index of the selected combobox item.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'the combobox you want to know the selected item index of' },
        ],
        returns: 'returns the index of the selected item if the specified combobox is valid and has a selected item, -1 if no item is selected, nil otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxGetSelected',
    },
    guiComboBoxIsOpen: {
        summary: '',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combo box to get the state.' },
        ],
        returns: 'returns true if combobox is opened, false if combobox is closed, nil otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxIsOpen',
    },
    guiComboBoxRemoveItem: {
        summary: 'This function removes an item from a combobox.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox containing the item youre interested in' },
            { name: 'itemId', isOptional: false, isVariadic: false, summary: 'The index of the item to remove' },
        ],
        returns: 'returns true if the item was removes successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxRemoveItem',
    },
    guiComboBoxSetItemText: {
        summary: 'This function changes the text of a combobox item.',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox containing the item youre interested in' },
            { name: 'itemId', isOptional: false, isVariadic: false, summary: 'The index of the item' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The text you want to put in (does NOT accept numbers, use tostring() for that)' },
        ],
        returns: 'returns true if the text was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxSetItemText',
    },
    guiComboBoxSetOpen: {
        summary: '',
        parameters: [
            { name: 'comboBox', isOptional: false, isVariadic: false, summary: 'The combobox to be opened or closed.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'The state of combobox. true, if the combobox is to be opened. false if the combobox is to be closed.' },
        ],
        returns: 'returns true if is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiComboBoxSetOpen',
    },
};
