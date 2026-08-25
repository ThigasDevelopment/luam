import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_54: ApiDocumentationCatalog = {
    toJSON: {
        summary: 'This function converts a **single** value (preferably a Lua table) into a JSON encoded string. You can use this to store the data and then load it again using fromJSON.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: '' },
            { name: 'compact', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the string will contain whitespaces. To remove whitespaces from JSON string, use *true*. String will contain whitespaces per default.' },
            { name: 'prettyType', isOptional: true, isVariadic: false, summary: 'a type string from below:' },
        ],
        returns: 'Returns a JSON formatted string.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ToJSON',
    },
    triggerClientEvent: {
        summary: '<!--\n-->__NOTOC__\n\nThis function triggers an event previously registered on a client. This is the primary means of passing information between the server and the client. Clients have a similar triggerServerEvent function that can do the reverse. You can treat this function as if it was an asynchronous function call, using triggerServerEvent to pass back any returned information if necessary.\n\nAlmost any data types can be passed as expected, including elements and complex nested tables. Non-element MTA data types like xmlNodes or resource pointers will not be able to be passed as they do not necessarily have a valid representation on the client.\n\nEvents are sent reliably, so clients will receive them, but there may be (but shouldn\'t be) a significant delay before they are received. You should take this into account when using them.\n\nKeep in mind the bandwidth issues when using events - don\'t pass a large list of arguments unless you really need to. **It is marginally more efficient to pass one large event than two smaller ones**.',
        parameters: [
            { name: 'sendTo', isOptional: true, isVariadic: false, summary: 'The event will be sent to all players that are children of the specified element. By default this is the root element, and hence the event is sent to all players. If you specify a single player it will just be sent to that player. This argument can also be a table of player elements.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger client side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'sourceElement', isOptional: false, isVariadic: false, summary: 'The element that is the source of the event.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns *true* if the event trigger has been sent, *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerClientEvent',
    },
    triggerEvent: {
        summary: 'This function will trigger a named event on a specific element in the element tree. See event system for more information on how the event system works.\n\nYou can use the value returned from this function to determine if the event was cancelled by one of the event handlers. You should determine what your response (if any) to this should be based on the event\'s purpose. Generally, cancelling an event should prevent any further code being run that is dependent on whatever triggered that event. For example, if you have an *onFlagCapture* event, cancelling it would be expected to prevent the flag being able to be captured. Similarly, if you have *onPlayerKill* as an event you trigger, canceling it would either be expected to prevent the player being killed from dying or at least prevent the player from getting a score for it.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you wish to trigger' },
            { name: 'baseElement', isOptional: false, isVariadic: false, summary: 'The element you wish to trigger the event on. See event system for information on how this works.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: '* Returns **nil** if the arguments are invalid or the event could not be found. * Returns **true** if the event was triggered successfully, and *was not* cancelled using cancelEvent. * Returns **false** if the event was triggered successfully, and *was* cancelled using cancelEvent.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerEvent',
    },
    triggerLatentClientEvent: {
        summary: 'This function is the same as triggerClientEvent  except the transmission rate of the data contained in the arguments can be limited\nand other network traffic is not blocked while the data is being transferred.',
        parameters: [
            { name: 'sendTo', isOptional: true, isVariadic: false, summary: 'The event will be sent to all players that are children of the specified element. By default this is the root element, and hence the event is sent to all players. If you specify a single player it will just be sent to that player. This argument can also be a table of player elements.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger client side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'bandwidth', isOptional: true, isVariadic: false, summary: 'The bytes per second rate to send the data contained in the arguments.' },
            { name: 'persist', isOptional: true, isVariadic: false, summary: 'A bool indicating whether the transmission should be allowed to continue even after the resource that triggered it has since stopped.' },
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that is the source of the event. This could be another player, or if this isn\'t relevant, use the root element.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns *true* if the event trigger has been sent, *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerLatentClientEvent',
    },
    triggerLatentServerEvent: {
        summary: 'This function is the same as triggerServerEvent except the transmission rate of the data contained in the arguments can be limited and other network traffic is not blocked while the data is being transferred.',
        parameters: [
            { name: 'event', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger server-side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'bandwidth', isOptional: true, isVariadic: false, summary: 'The bytes per second rate to send the data contained in the arguments.' },
            { name: 'persist', isOptional: true, isVariadic: false, summary: 'A bool indicating whether the transmission should be allowed to continue even after the resource that triggered it has since stopped.' },
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that is the source of the event. This could be another player, or if this isn\'t relevant, use the root element.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns *true* if the event trigger has been sent, *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerLatentServerEvent',
    },
    triggerServerEvent: {
        summary: '<!---->__NOTOC__\n\nThis function triggers an event previously registered on the server. This is the primary means of passing information between the client and the server. Servers have a similar triggerClientEvent function that can do the reverse. You can treat this function as if it was an asynchronous function call, using triggerClientEvent to pass back any returned information if necessary.\n\nAlmost any data types can be passed as expected, including elements and complex nested tables. Non-element MTA data types like xmlNodes or resource pointers will not be able to be passed as they do not necessarily have a valid representation on the client. **Elements of the Vector or Matrix classes cannot be passed!**\n\nEvents are sent reliably, so the server will receive them, but there may be (but shouldn\'t be) a significant delay before they are received. You should take this into account when using them.\n\nKeep in mind the bandwidth issues when using events - don\'t pass a large list of arguments unless you really need to. **It is marginally more efficient to pass one large event than two smaller ones**.',
        parameters: [
            { name: 'event', isOptional: false, isVariadic: false, summary: 'The name of the event to trigger server-side. You should register this event with addEvent and add at least one event handler using addEventHandler.' },
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that is the source of the event.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns *true* if the event trigger has been sent, *false* if invalid arguments were specified or a client side element was a parameter.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TriggerServerEvent',
    },
    unbindKey: {
        summary: 'Removes an existing key bind from the specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to unbind the key of.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to unbind. See Key names for a list of valid key names.' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'is optional in Syntax 2.' },
            { name: 'command', isOptional: false, isVariadic: false, summary: '(Syntax 1) The command you wish to unbind.' },
        ],
        returns: 'Returns \'*true* if the key was unbound, *false* if it was not previously bound or invalid arguments were passed to the function. ```lua bool unbindKey ( string key, string keyState, string command ) ``` ```lua bool unbindKey ( string key [, string keyState, function handler ] ) ``` Returns \'*true* if the key was unbound, *false* if it was not previously bound or invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UnbindKey',
    },
    updateElementRpHAnim: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to update the bone animations.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
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
        returns: 'Returns true if the setting was changed, or *false* if no change was required or there was a problem with the arguments.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UpdateResourceACLRequest',
    },
    usePickup: {
        summary: 'This function is used to simulate the player using a pickup',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup element to be picked up/used.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player to use the pickup.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/UsePickup',
    },
    utfChar: {
        summary: 'The function returns the string of the specified UTF code.',
        parameters: [
            { name: 'characterCode', isOptional: false, isVariadic: false, summary: 'The UTF code, to get the string of.' },
        ],
        returns: 'Returns a *string* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfChar',
    },
    utfCode: {
        summary: 'The function returns the UTF codes of the given string.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string to get the UTF code of.' },
        ],
        returns: 'Returns an *int* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfCode',
    },
    utfLen: {
        summary: 'The function gets the real length of a string, in characters.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string to get the length of.' },
        ],
        returns: 'Returns an *int* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfLen',
    },
    utfSeek: {
        summary: 'The function returns the byte position at specified character position.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string.' },
            { name: 'position', isOptional: false, isVariadic: false, summary: 'An int with the specified character position.' },
        ],
        returns: 'Returns an *int* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfSeek',
    },
    utfSub: {
        summary: 'The function returns a sub string, from the specified positions on a character.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string.' },
            { name: 'Start', isOptional: false, isVariadic: false, summary: 'An int with the start position.' },
            { name: 'End', isOptional: false, isVariadic: false, summary: 'An int with the end position.' },
        ],
        returns: 'Returns a *string* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfSub',
    },
    warpPedIntoVehicle: {
        summary: 'This function is used to warp or force a ped into a vehicle.  There are no animations involved when this happens.\n\n**Available client side from 1.3.1** (It will only work with client side vehicles and peds)',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped which you wish to force inside the vehicle' },
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to force the ped into' },
            { name: 'seat', isOptional: true, isVariadic: false, summary: 'An integer representing the seat ID.' },
        ],
        returns: 'Returns *true* if the operation is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/WarpPedIntoVehicle',
    },
    wasEventCancelled: {
        summary: 'This function checks if the last completed event was cancelled. This is mainly useful for custom events created by scripts.\n\nEvents can be cancelled using cancelEvent, this indicates that the resource which triggered the event should do whatever it can to reverse any changes made by whatever caused the event. See triggerEvent for a more detailed explanation of this.',
        parameters: [],
        returns: 'Returns *true* if the event was cancelled, *false* if it wasn\'t or doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/WasEventCancelled',
    },
    xmlCopyFile: {
        summary: 'This function copies all contents of a certain node in a XML document to a new document file, so the copied node becomes the new file\'s root node.\nThe new file will not be saved to file system until xmlSaveFile() is called',
        parameters: [
            { name: 'nodeToCopy', isOptional: false, isVariadic: false, summary: 'the xmlnode that is to be copied to a new document.' },
            { name: 'newFilePath', isOptional: false, isVariadic: false, summary: 'the path of the file that is to be created, in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file is in, and \'path\' is the path from the root directory of the resource to the file.' },
        ],
        returns: 'Returns the xmlnode of the copy if the node was successfully copied, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlCopyFile',
    },
    xmlCreateChild: {
        summary: 'This function creates a new child node under an XML node.',
        parameters: [
            { name: 'parentNode', isOptional: false, isVariadic: false, summary: 'the xmlnode you want to create a new child node under.' },
            { name: 'tagName', isOptional: false, isVariadic: false, summary: 'the type of the child node that will be created.' },
        ],
        returns: 'Returns the created xmlnode if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlCreateChild',
    },
    xmlCreateFile: {
        summary: 'This function creates a new XML document, which can later be saved to a file by using xmlSaveFile. This function will overwrite the file specified if it already exists.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file will be in, and \'path\' is the path from the root directory of the resource to the file.' },
            { name: 'rootNodeName', isOptional: false, isVariadic: false, summary: 'the name of the root node in the XML document.' },
        ],
        returns: 'Returns the root xmlnode object of the new XML file if successful, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlCreateFile',
    },
    xmlDestroyNode: {
        summary: 'This function destroys a XML node from the XML node tree.',
        parameters: [
            { name: 'theXMLNode', isOptional: false, isVariadic: false, summary: 'The xml node you want to destroy.' },
        ],
        returns: 'Returns *true* if the xml node was successfully destroyed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlDestroyNode',
    },
    xmlFindChild: {
        summary: 'This function returns a named child node of an XML node.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'This is an xmlnode that you want to find the child node under.' },
            { name: 'tagName', isOptional: false, isVariadic: false, summary: 'This is the name of the child node you wish to find (case-sensitive).' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'This is the 0-based index of the node you wish to find. For example, to find the 5th subnode with a particular name, you would use 4 as the index value. To find the first occurence, use 0.' },
        ],
        returns: 'Returns an xmlnode if the node was found, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlFindChild',
    },
    xmlLoadFile: {
        summary: 'This function provides an alternative way to load XML files to getResourceConfig.\nThis function loads an XML file and returns the node by specifying a specific file path, while getResourceConfig allows for loading an XML file from a resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file is in, and \'path\' is the path from the root directory of the resource to the file.' },
            { name: 'readOnly', isOptional: true, isVariadic: false, summary: 'By default, the XML file is opened with reading and writing access. You can specify *true* for this parameter if you only need reading access.' },
        ],
        returns: 'Returns the root xmlnode object of an xml file if successful, or *false* otherwise. Print error if something wrong with xml. |7485',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlLoadFile',
    },
    xmlLoadString: {
        summary: 'This function creates an Xmlnode from a string input.',
        parameters: [
            { name: 'xmlString', isOptional: false, isVariadic: false, summary: 'A string containing XML data' },
        ],
        returns: 'Returns the root xmlnode object of an xml string if successful, or *false* otherwise (invalid XML string).',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlLoadString',
    },
    xmlNodeGetAttribute: {
        summary: 'This function is used to return an attribute of a node in a configuration file.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'The node from which you wish to return the attribute' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the attribute.' },
        ],
        returns: 'Returns the attribute in string form or *false*, if the attribute is not defined.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetAttribute',
    },
};
