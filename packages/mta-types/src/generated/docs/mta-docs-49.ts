import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_49: ApiDocumentationCatalog = {
    textItemGetPriority: {
        summary: 'This function retrieves the priority of a text item.  Priority defines the rate at whihc\na text item is updated',
        parameters: [
            { name: 'textitemToCheck', isOptional: false, isVariadic: false, summary: 'The text item you wish to retrieve the priority of.' },
        ],
        returns: 'returns a integer of the priority of a text item, 0 = low, 1 = medium, 2 = high.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetPriority',
    },
    textItemGetScale: {
        summary: 'This function allows retrieval of the scale or size of a text item.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'The text item you wish to retrieve the scale of' },
        ],
        returns: 'returns a floating point of the scale of the text. 1.0 is around 12pt.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetScale',
    },
    textItemGetText: {
        summary: 'This function returns the current text of the specified textitem.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'A valid textitem.' },
        ],
        returns: 'returns a string containing the text if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetText',
    },
    textItemSetColor: {
        summary: 'This function sets the color of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The textitem you wish to set the color of. red The amount of red in the text items color (0 - 255). green The amount of green in the text items color (0 - 255). blue The amount of blue in the text items color (0 - 255). alpha The amount of alpha in the text items color (0 - 255). Alpha decides transparency where 255 is opaque and 0 is transparent.' },
            { name: 'r', isOptional: false, isVariadic: false, summary: '' },
            { name: 'g', isOptional: false, isVariadic: false, summary: '' },
            { name: 'b', isOptional: false, isVariadic: false, summary: '' },
            { name: 'a', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the color was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemSetColor',
    },
    textItemSetPosition: {
        summary: 'This function allows the setting of the position of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The text item that you want to move' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number between 0.0 and 1.0 indicating how far across the screen the text should be shown, as a percentage of the width, from the left hand side.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number between 0.0 and 1.0 indicating how far down the screen the text should be shown, as a percentage of the height, from the top.' },
        ],
        returns: 'returns true if the position was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemSetPosition',
    },
    textItemSetPriority: {
        summary: 'This function sets the priority for a text item.  Priority is the importance of sending\nupdated text to the client. The system is implemented as 3 queues, with the high queue\nbeing emptied before the medium queue is processed, and with one update sent per server\nframe. Hence, if you set all your text items to medium priority it has the same effect as\nif you set them all to high or low.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The text item you wish to set priority to.' },
            { name: 'priority', isOptional: false, isVariadic: false, summary: 'The priority you wish to set to the item, which can be high, medium, or low respective of their priority.' },
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
        returns: 'returns true if the scale was successfully set, false otherwise.',
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
        summary: 'This function retrieves the hex number of a specified color, useful for the dx functions.',
        parameters: [
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The amount of http://en.wikipedia.org/wiki/RGBA_color_space red in the color (0-255).' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The amount of http://en.wikipedia.org/wiki/RGBA_color_space green in the color (0-255).' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The amount of http://en.wikipedia.org/wiki/RGBA_color_space blue in the color (0-255).' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: 'The amount of http://en.wikipedia.org/wiki/RGBA_color_space alpha in the color (0-255).' },
        ],
        returns: 'returns a single value representing the color.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Tocolor',
    },
    toggleAllControls: {
        summary: 'Enables or disables the use of all GTA controls for a specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to toggle the control ability of.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether or not the controls will be usable.' },
            { name: 'gtaControls', isOptional: true, isVariadic: false, summary: 'A boolean deciding whether the enabled parameter will affect GTAs internal controls.' },
            { name: 'mtaControls', isOptional: true, isVariadic: false, summary: 'A boolean deciding whether the enabled parameter will affect MTAs own controls., e.g. chatbox.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleAllControls',
    },
    toggleBrowserDevTools: {
        summary: 'This function toggles the visibility of the developer tools pane.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
            { name: 'visible', isOptional: false, isVariadic: false, summary: 'true to show the tools, false to hide' },
        ],
        returns: 'returns true if the visibility was successfully toggled, false if an error occurred',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleBrowserDevTools',
    },
    toggleControl: {
        summary: 'Enables or disables the use of a GTA control for a specific player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to toggle the control ability of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to toggle the ability of. See control names for a list of possible controls.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether or not the key will be usable or not.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleControl',
    },
    toggleObjectRespawn: {
        summary: 'This function is used to toggle if an object should respawn after it got destroyed',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: ': the object you want to toggle the respawn from' },
            { name: 'respawn', isOptional: false, isVariadic: false, summary: ': a bool denoting whether we want to enable (true) or disable (false) respawning' },
        ],
        returns: '* true when the it was changed successfully. * false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleObjectRespawn',
    },
    toggleVehicleRespawn: {
        summary: 'This function toggles whether or not the vehicle will be respawned after blown or idle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to toggle the respawning of.' },
            { name: 'Respawn', isOptional: false, isVariadic: false, summary: ': A boolean determining if the vehicle will respawn or not.' },
        ],
        returns: 'returns true if the vehicle was found and edited.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToggleVehicleRespawn',
    },
    toJSON: {
        summary: 'This function converts a single value (preferably a Lua table) into a JSON encoded\nstring. You can use this to store the data and then load it again using fromJSON.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: '' },
            { name: 'compact', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the string will contain whitespaces. To remove whitespaces from JSON string, use true. String will contain whitespaces per default.' },
            { name: 'prettyType', isOptional: true, isVariadic: false, summary: 'a type string from below: ** spaces ** tabs' },
        ],
        returns: 'returns a json formatted string.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToJSON',
    },
    triggerClientEvent: {
        summary: 'This function triggers an event previously registered on a client. This is the primary\nmeans of passing information between the server and the client. Clients have a similar\ntriggerServerEvent function that can do the reverse. You can treat this function as if it\nwas an asynchronous function call, using triggerServerEvent to pass back any returned\ninformation if necessary.\nAlmost any data types can be passed as expected, including elements and complex nested\ntables. Non-element MTA data types like xmlNodes or resource pointers will not be able to\nbe passed as they do not necessarily have a valid representation on the client.\nEvents are sent reliably, so clients will receive them, but there may be (but shouldnt\nbe) a significant delay before they are received. You should take this into account when\nusing them.\nKeep in mind the bandwidth issues when using events - dont pass a large list of arguments\nunless you really need to. It is marginally more efficient to pass one large event than\ntwo smaller ones.',
        parameters: [
            { name: 'sendTo', isOptional: false, isVariadic: false, summary: 'The event will be sent to all players that are children of the specified element. By default this is the root element, and hence the event is sent to all players. If you specify a single player it will just be sent to that player. This argument can also be a table of player elements. arguments... A list of arguments to trigger with the event. You can pass any lua data type (except functions). You can also pass elements.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger client side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'sourceElement', isOptional: false, isVariadic: false, summary: 'The element that is the Event system#Event handlers|source of the event.' },
            { name: 'args', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns true if the event trigger has been sent, false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerClientEvent',
    },
    triggerEvent: {
        summary: 'This function will trigger a named event on a specific element in the element tree. See\nevent system for more information on how the event system works.\nYou can use the value returned from this function to determine if the event was cancelled\nby one of the event handlers. You should determine what your response (if any) to this\nshould be based on the events purpose. Generally, cancelling an event should prevent any\nfurther code being run that is dependent on whatever triggered that event. For example,\nif you have an onFlagCapture event, cancelling it would be expected to prevent the flag\nbeing able to be captured. Similarly, if you have onPlayerKill as an event you trigger,\ncanceling it would either be expected to prevent the player being killed from dying or at\nleast prevent the player from getting a score for it.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you wish to trigger' },
            { name: 'baseElement', isOptional: false, isVariadic: false, summary: 'The element you wish to trigger the event on. See event system for information on how this works. argument1 The first argument that the event handler expects should be added after the baseElement variable. NOTE This function can have more than one of these arguments specified, once for each argument the event handler is expecting.' },
            { name: 'args', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: '* returns nil if the arguments are invalid or the event could not be found. * returns true if the event was triggered successfully, and was not cancelled using cancelevent. * returns false if the event was triggered successfully, and was cancelled using cancelevent.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerEvent',
    },
    triggerLatentClientEvent: {
        summary: 'This function is the same as triggerClientEvent  except the transmission rate of the data\ncontained in the arguments can be limited\nand other network traffic is not blocked while the data is being transferred.',
        parameters: [
            { name: 'sendTo', isOptional: false, isVariadic: false, summary: 'The event will be sent to all players that are children of the specified element. By default this is the root element, and hence the event is sent to all players. If you specify a single player it will just be sent to that player. This argument can also be a table of player elements.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger client side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'bandwidth', isOptional: false, isVariadic: false, summary: 'The bytes per second rate to send the data contained in the arguments.' },
            { name: 'persist', isOptional: false, isVariadic: false, summary: 'A bool indicating whether the transmission should be allowed to continue even after the resource that triggered it has since stopped. arguments... A list of arguments to trigger with the event. You can pass any Lua data type (except functions). You can also pass elements. The total amount of data should not exceed 100MB.' },
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that is the Event system#Event handlers|source of the event. This could be another player, or if this isnt relevant, use the root element.' },
            { name: 'args', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns true if the event trigger has been sent, false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerLatentClientEvent',
    },
    triggerLatentServerEvent: {
        summary: 'This function is the same as triggerServerEvent except the transmission rate of the data\ncontained in the arguments can be limited and other network traffic is not blocked while\nthe data is being transferred.',
        parameters: [
            { name: 'event', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger server-side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'bandwidth', isOptional: false, isVariadic: false, summary: 'The bytes per second rate to send the data contained in the arguments.' },
            { name: 'persist', isOptional: false, isVariadic: false, summary: 'A bool indicating whether the transmission should be allowed to continue even after the resource that triggered it has since stopped. arguments... A list of arguments to trigger with the event. You can pass any Lua data type (except functions). You can also pass elements. The total amount of data should not exceed 100MB.' },
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that is the Event system#Event handlers|source of the event. This could be another player, or if this isnt relevant, use the root element.' },
            { name: 'args', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns true if the event trigger has been sent, false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerLatentServerEvent',
    },
    triggerServerEvent: {
        summary: 'This function triggers an event previously registered on the server. This is the primary\nmeans of passing information between the client and the server. Servers have a similar\ntriggerClientEvent function that can do the reverse. You can treat this function as if it\nwas an asynchronous function call, using triggerClientEvent to pass back any returned\ninformation if necessary.\nAlmost any data types can be passed as expected, including elements and complex nested\ntables. Non-element MTA data types like xmlNodes or resource pointers will not be able to\nbe passed as they do not necessarily have a valid representation on the client. Elements\nof the Vector or Matrix classes cannot be passed!\nEvents are sent reliably, so the server will receive them, but there may be (but shouldnt\nbe) a significant delay before they are received. You should take this into account when\nusing them.\nKeep in mind the bandwidth issues when using events - dont pass a large list of arguments\nunless you really need to. It is marginally more efficient to pass one large event than\ntwo smaller ones.',
        parameters: [
            { name: 'event', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger server-side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that is the Event system#Event handlers|source of the event. arguments... A list of arguments to trigger with the event. You can pass any lua data type (except functions). You can also pass elements.' },
            { name: 'args', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns true if the event trigger has been sent, false if invalid arguments were specified or a client side element was a parameter.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerServerEvent',
    },
    unbindKey: {
        summary: 'Removes an existing key bind from the specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to unbind the key of.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to unbind. See Key names for a list of valid key names.' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'is optional in Syntax 2. up If the bound key triggered a function when the key was released down If the bound key triggered a function when the key was pressed both If the bound key triggered a function when the key was pressed and released' },
            { name: 'command', isOptional: false, isVariadic: false, summary: '(Syntax 1) The command you wish to unbind. handler (Syntax 2) The function you wish to unbind. Note: If you do not specify \'\'handler\'\', any instances of \'\'key\'\' being bound will be unbound, whatever function they are bound to.' },
        ],
        returns: 'returns true if the key was unbound, false if it was not previously bound or invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UnbindKey',
    },
    updateElementRpHAnim: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to update the bone animations.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UpdateElementRpHAnim',
    },
    updateResourceACLRequest: {
        summary: 'This function changes the access for one ACL request of the given resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource to set the ACL request for.' },
            { name: 'rightName', isOptional: false, isVariadic: false, summary: 'a string with the name of the right to set the access for. This has to match an existing ACL request.' },
            { name: 'access', isOptional: false, isVariadic: false, summary: 'a boolean value setting the access. True is for allow, and false for deny.' },
            { name: 'byWho', isOptional: true, isVariadic: false, summary: 'a string value to identity who is changing the setting.' },
        ],
        returns: 'returns true if the setting was changed, or false if no change was required or there was a problem with the arguments.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UpdateResourceACLRequest',
    },
    usePickup: {
        summary: 'This function is used to simulate the player using a pickup',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: ': The pickup element to be picked up/used.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': The player to use the pickup.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/UsePickup',
    },
};
