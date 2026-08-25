import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_53: ApiDocumentationCatalog = {
    textCreateTextItem: {
        summary: 'This function creates a text item. A text item represents a single area of text, much like a label does in standard GUI programming. A text item can only be seen by players if it is added to a textdisplay using textDisplayAddText. Each text item can be added to multiple displays, if need be.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'A string of text you want to display' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number between 0.0 and 1.0 indicating how far across the screen the text should be shown, as a percentage of the width, from the left hand side.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number between 0.0 and 1.0 indicating how far down the screen the text should be shown, as a percentage of the height, from the top.' },
            { name: 'priority', isOptional: true, isVariadic: false, summary: 'How important it is that this text should be up to date on client\'s screens. Valid values are: "low", "medium", "high" which are aliases for 0, 1 and 2 respectively.' },
            { name: 'red', isOptional: true, isVariadic: false, summary: 'A value between 0 and 255 indicating how red the text should be.' },
            { name: 'green', isOptional: true, isVariadic: false, summary: 'A value between 0 and 255 indicating how green the text should be.' },
            { name: 'blue', isOptional: true, isVariadic: false, summary: 'A value between 0 and 255 indicating how blue the text should be.' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: 'A value between 0 and 255 indicating how transparent the text should be, with 0 being fully transparent, and 255 being opaque.' },
            { name: 'scale', isOptional: true, isVariadic: false, summary: 'A floating point value indicating the scale of the text. The default is 1.0, which is around 12pt.' },
            { name: 'alignX', isOptional: true, isVariadic: false, summary: 'A string representing the X-alignment of the text. ("left", "center", "right")' },
            { name: 'alignY', isOptional: true, isVariadic: false, summary: 'A string representing the Y-alignment of the text. ("top", "center", "bottom")' },
            { name: 'shadowAlpha', isOptional: true, isVariadic: false, summary: 'A value between 0 and 255 indicating how dark the drop shadow should be.' },
        ],
        returns: 'Returns a textitem object.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextCreateTextItem',
    },
    textDestroyDisplay: {
        summary: 'This function destroys a text display and will unlink all the textitems on it. This does not stop the textitems existing, but anyone who was observing the textitems through this display will stop seeing them.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: 'This is the textdisplay that you wish to have destroyed.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDestroyDisplay',
    },
    textDestroyTextItem: {
        summary: 'This function destroys a textitem object.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'The text item you wish to destroy.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDestroyTextItem',
    },
    textDisplayAddObserver: {
        summary: 'This function adds a player as an observer of a textdisplay. This allows the player to see any textitems that the textdisplay contains.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: 'The textdisplay to add the player to as an observer.' },
            { name: 'playerToAdd', isOptional: false, isVariadic: false, summary: 'The player that should observe the textdisplay.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayAddObserver',
    },
    textDisplayAddText: {
        summary: 'This function adds a textitem to a textdisplay. This allows any observers of the textdisplay to see the textitem.',
        parameters: [
            { name: 'displayToAddTo', isOptional: false, isVariadic: false, summary: 'The textdisplay to add the textitem to.' },
            { name: 'itemToAdd', isOptional: false, isVariadic: false, summary: 'The textitem to add to the display.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayAddText',
    },
    textDisplayGetObservers: {
        summary: 'This function can be used to retrieve all the players  currently observing a specified textdisplay.',
        parameters: [
            { name: 'theDisplay', isOptional: false, isVariadic: false, summary: 'The textdisplay of which observers you want to get.' },
        ],
        returns: 'Returns a table of players that are observers of the display or *false* if invalid textdisplay is passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayGetObservers',
    },
    textDisplayIsObserver: {
        summary: 'This function checks if a player can see the specified textdisplay.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: 'The textdisplay.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player.' },
        ],
        returns: 'Return true if textdisplay is showing, or false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayIsObserver',
    },
    textDisplayRemoveObserver: {
        summary: 'This function removes a player observer of a textdisplay. This stops the player from being able to see textitems that the textdisplay contains.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: 'The textdisplay to remove the player from as an observer.' },
            { name: 'playerToRemove', isOptional: false, isVariadic: false, summary: 'The player that should be removed from the textdisplay.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayRemoveObserver',
    },
    textDisplayRemoveText: {
        summary: 'This function removes a textitem from a textdisplay. This stops any observers of the textdisplay from being able to see the textitem.',
        parameters: [
            { name: 'displayToRemoveFrom', isOptional: false, isVariadic: false, summary: 'The textdisplay to remove the textitem from.' },
            { name: 'itemToRemove', isOptional: false, isVariadic: false, summary: 'The textitem to remove from the display.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayRemoveText',
    },
    textItemGetColor: {
        summary: 'This function allows you to retrieve the color of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The text item you wish to retrieve the color of.' },
        ],
        returns: 'Returns four integers in RGBA format, with a maximum value of 255 for each. The values are, in order, *red*, *green*, *blue*, and *alpha*. Alpha decides transparency where 255 is opaque and 0 is transparent. *false* is returned if the text item is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetColor',
    },
    textItemGetPosition: {
        summary: 'This function allows retrieval of the position of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The textitem you wish to retrieve the position of' },
        ],
        returns: 'Returns two floats of the *x* and *y* position on the screen, where the maximum value is 1.0.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetPosition',
    },
    textItemGetPriority: {
        summary: 'This function retrieves the priority of a text item.  Priority defines the rate at whihc a text item is updated',
        parameters: [
            { name: 'textitemToCheck', isOptional: false, isVariadic: false, summary: 'The text item you wish to retrieve the priority of.' },
        ],
        returns: 'Returns a integer of the priority of a text item, 0 = low, 1 = medium, 2 = high.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetPriority',
    },
    textItemGetScale: {
        summary: 'This function allows retrieval of the scale or size of a text item.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'The text item you wish to retrieve the scale of' },
        ],
        returns: 'Returns a floating point of the scale of the text. 1.0 is around 12pt.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetScale',
    },
    textItemGetText: {
        summary: 'This function returns the current text of the specified textitem.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'A valid textitem.' },
        ],
        returns: 'Returns a string containing the text if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetText',
    },
    textItemSetColor: {
        summary: 'This function sets the color of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The textitem you wish to set the color of.' },
            { name: 'r', isOptional: false, isVariadic: false, summary: '' },
            { name: 'g', isOptional: false, isVariadic: false, summary: '' },
            { name: 'b', isOptional: false, isVariadic: false, summary: '' },
            { name: 'a', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the color was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemSetColor',
    },
    textItemSetPosition: {
        summary: 'This function allows the setting of the position of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The text item that you want to move' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number between 0.0 and 1.0 indicating how far across the screen the text should be shown, as a percentage of the width, from the left hand side.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number between 0.0 and 1.0 indicating how far down the screen the text should be shown, as a percentage of the height, from the top.' },
        ],
        returns: 'Returns *true* if the position was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemSetPosition',
    },
    textItemSetPriority: {
        summary: 'This function sets the priority for a text item.  Priority is the importance of sending updated text to the client. The system is implemented as 3 queues, with the *high* queue being emptied before the *medium* queue is processed, and with one update sent per server frame. Hence, if you set all your text items to *medium* priority it has the same effect as if you set them all to *high* or *low*.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The text item you wish to set priority to.' },
            { name: 'priority', isOptional: false, isVariadic: false, summary: 'The priority you wish to set to the item, which can be *"high"*, *"medium"*, or *"low"* respective of their priority.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemSetPriority',
    },
    textItemSetScale: {
        summary: 'This function allows the setting of the scale of a text item.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'The text item you wish to set the scale of.' },
            { name: 'scale', isOptional: false, isVariadic: false, summary: 'A floating point value indicating the scale of the text you wish to set to. 1.0 is around 12pt.' },
        ],
        returns: 'Returns *true* if the scale was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemSetScale',
    },
    textItemSetText: {
        summary: 'Overwrites a previously created text item with the specified text.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'An existing text item that was previously created with textCreateTextItem' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The new text for the text item' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemSetText',
    },
    tocolor: {
        summary: 'This function retrieves the hex number of a specified color, useful for the dx functions.\nAdded server-side.',
        parameters: [
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The amount of [http://en.wikipedia.org/wiki/RGBA_color_space red] in the color (0-255).' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The amount of [http://en.wikipedia.org/wiki/RGBA_color_space green] in the color (0-255).' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The amount of [http://en.wikipedia.org/wiki/RGBA_color_space blue] in the color (0-255).' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: 'The amount of [http://en.wikipedia.org/wiki/RGBA_color_space alpha] in the color (0-255).' },
        ],
        returns: 'Returns a single value representing the color.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Tocolor',
    },
    toggleAllControls: {
        summary: 'Enables or disables the use of all GTA controls for a specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to toggle the control ability of.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether or not the controls will be usable.' },
            { name: 'gtaControls', isOptional: true, isVariadic: false, summary: 'A boolean deciding whether the *enabled* parameter will affect GTA\'s internal controls.' },
            { name: 'mtaControls', isOptional: true, isVariadic: false, summary: 'A boolean deciding whether the *enabled* parameter will affect MTA\'s own controls., e.g. chatbox.' },
        ],
        returns: 'This function returns *true* if controls were toggled successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleAllControls',
    },
    toggleBrowserDevTools: {
        summary: 'This function toggles the visibility of the developer tools pane.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
            { name: 'visible', isOptional: false, isVariadic: false, summary: '*true* to show the tools, *false* to hide' },
        ],
        returns: 'Returns *true* if the visibility was successfully toggled, *false* if an error occurred',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleBrowserDevTools',
    },
    toggleControl: {
        summary: 'Enables or disables the use of a GTA control for a specific player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to toggle the control ability of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to toggle the ability of. See control names for a list of possible controls.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether or not the key will be usable or not.' },
        ],
        returns: 'This function *true* if the control was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleControl',
    },
    toggleObjectRespawn: {
        summary: 'This function is used to toggle if an object should respawn after it got destroyed\n\nThis function is now also available on the server side.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object you want to toggle the respawn from' },
            { name: 'respawn', isOptional: false, isVariadic: false, summary: 'a bool denoting whether we want to enable (*true*) or disable (*false*) respawning' },
        ],
        returns: '* *true* when the it was changed successfully. * *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleObjectRespawn',
    },
    toggleVehicleRespawn: {
        summary: 'This function toggles whether or not the vehicle will be respawned after blown or idle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to toggle the respawning of.' },
            { name: 'Respawn', isOptional: false, isVariadic: false, summary: 'A boolean determining if the vehicle will respawn or not.' },
        ],
        returns: 'Returns *true* if the vehicle was found and edited.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleVehicleRespawn',
    },
};
