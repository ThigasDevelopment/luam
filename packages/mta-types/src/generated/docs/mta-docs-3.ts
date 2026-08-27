import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_3: ApiDocumentationCatalog = {
    bitOr: {
        summary: 'This function performs a bitwise OR-conjunction on two or more (unsigned) 32-bit integers. See [http://en.wikipedia.org/wiki/Bitwise_operation#OR Bitwise operation] for more details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns the conjuncted value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitOr',
    },
    bitReplace: {
        summary: 'This function returns the unsigned number formed by var value with replacement specified at bits field to field + width - 1',
        parameters: [
            { name: 'var', isOptional: false, isVariadic: false, summary: 'The value' },
            { name: 'replaceValue', isOptional: false, isVariadic: false, summary: 'The replaceValue' },
            { name: 'field', isOptional: false, isVariadic: false, summary: 'The field number' },
            { name: 'width', isOptional: true, isVariadic: false, summary: 'Number of bits to extract' },
        ],
        returns: 'Returns the replaced value/bit sequence.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitReplace',
    },
    bitRRotate: {
        summary: 'This functions performs a bitwise circular right-rotation on the integer **value** by integer **n** positions.\nSee [https://en.wikipedia.org/wiki/Bitwise_operation#Rotate_no_carry Bitwise operation] for more details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the rotation on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to rotate the value by.' },
        ],
        returns: 'Returns the circular right-rotated value as *integer*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitRRotate',
    },
    bitRShift: {
        summary: 'This functions performs a logical right shift on the integer **value** by integer **n** positions. In a *logical shift*, zeros are shifted in to replace the discarded bits.\nSee [https://en.wikipedia.org/wiki/Bitwise_operation#Logical_shift Bitwise operation] for more details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the shift on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to shift the value by.' },
        ],
        returns: 'Returns the logical right shifted value as *integer*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitRShift',
    },
    bitTest: {
        summary: 'This function performs an AND-conjunction on two or more (unsigned) 32-bit integers and checks, whether the conjuncted value is zero or not. See [http://en.wikipedia.org/wiki/Bitwise_operation#AND Bitwise operation] for more details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns *true* if the conjuncted value is **not** zero, *false* otherwise. If a bad argument was passed to bitTest, you\'ll get *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitTest',
    },
    bitXor: {
        summary: 'This function performs a bitwise XOR-conjunction (exclusive OR) on two or more (unsigned) 32-bit integers. See [http://en.wikipedia.org/wiki/Bitwise_operation#XOR Bitwise operation] for more details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns the conjuncted value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitXor',
    },
    blowVehicle: {
        summary: 'This function will blow up a vehicle. This will cause an explosion and will kill the driver and any passengers inside it.',
        parameters: [
            { name: 'vehicleToBlow', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to blow up.' },
            { name: 'explode', isOptional: true, isVariadic: false, summary: 'if this argument is *true* then the vehicle will explode, otherwise it will just be blown up silently.' },
        ],
        returns: 'Returns *true* if the vehicle was blown up, *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BlowVehicle',
    },
    breakObject: {
        summary: 'This function breaks a specific object. This function is now also available on the server side.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'an object element' },
        ],
        returns: '* *true* if the object was successfully broken. * *false* if the object is not breakable, or a wrong object was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BreakObject',
    },
    call: {
        summary: 'This function is used to call a function from another resource (which must be running).\n\nThe function which you wish to call **must** first be exported within the resource\'s meta.  For example:\n```lua\n```\nThis enables other resources to call a function from this resource.\n\nYou cannot call a server function from the client or vice versa. See triggerServerEvent and triggerClientEvent for possibilities to do that.\n\nThere is an easier syntax replacing this function. For example, you can instead of:\n```lua\ncall ( getResourceFromName ( "resource" ), "exportedFunction", 1, "2", "three" )\n```\ndo much like a normal call:\n```lua\nexports.resource:exportedFunction ( 1, "2", "three" )\n```\nIf the resource name contains illegal characters (such as hyphens), you can also do:\n```lua\nexports["resource-name"]:exportedFunction ( 1, "2", "three" )\n```\nTwo extra "hidden" variables are passed to the exported function:\n* **sourceResource** - The resource that called the exported function\n* **sourceResourceRoot** - The resource root element of the resource which called the exported function.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'This is a resource pointer which refers to the resource you are calling a function from.' },
            { name: 'theFunction', isOptional: false, isVariadic: false, summary: 'This is a string with the name of the function which you want to call.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns anything that the designated function has returned, if the function has no return, nil is returned. If the function does not exist, is not exported, or the call was not successful it will return false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Call',
    },
    callRemote: {
        summary: 'This function allows you to call functions that have been exported with HTTP access by other MTA servers. The calls are asynchronous so you do not get an immediate result from the call, instead a callback function you specify is called when the call returns.\n\nYou can also use this function to access a standard web page on a server you own by specifying the URL. The arguments you specify to callRemote are passed to the web page using HTTP POST as a JSON array. This will always have an array as the root element. The page must return a JSON formated *array* in the page\'s body with the results of the call (or an empty array if there are no results).\n\nYou can use the PHP SDK to create PHP pages that can be called by this function. See the PHP SDK page for an example.\n\nIn addition, it is possible to use this function to get information about a resource in the MTA community, besides other things. Check out the Community Resources article.\n\nIn the case when the call fails, a string containing "ERROR" followed by an integer containing the error reason will be passed to the callback function. The reason for failure will be similar to errors found with websites - file not found, server not found and timeouts.',
        parameters: [
            { name: 'host', isOptional: false, isVariadic: false, summary: 'This is a host name - including the **HTTP** port - of the server you wish to connect to.' },
            { name: 'queueName', isOptional: true, isVariadic: false, summary: 'Name of the queue to use. Any name can be used. If not set, the queue name is "default". Requests in the same queue are processed in order, one at a time.' },
            { name: 'connectionAttempts', isOptional: true, isVariadic: false, summary: 'Number of times to retry if the remote host does not respond. *In the case of a non-responding remote server, each connection attempt will timeout after 6 seconds. Therefore, the default setting of 10 connection attempts means it will be 60 seconds before your script gets a callback about the error. Reducing this value to 2 for example, will decrease that period to 12 seconds*' },
            { name: 'connectTimeout', isOptional: true, isVariadic: false, summary: 'Number of milliseconds each connection attempt will take before timing out' },
            { name: 'resourceName', isOptional: false, isVariadic: false, summary: 'This is a name of the resource that contains the exported function you want to call.' },
            { name: 'functionName', isOptional: false, isVariadic: false, summary: 'This is a string with the name of the function which you want to call.' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'This is the function that should receive the data returned from the remote function call. The argument list should match the format of the data returned. The callback function will be passed a string containing "ERROR" followed by an integer indicating the error code when an error occurs calling the function. A list of error codes can be found here.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns *true* if the function has been called, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CallRemote',
    },
    canBrowserNavigateBack: {
        summary: 'This function checks if the browser can return to the previous page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser you want to check for a previous page.' },
        ],
        returns: 'Returns *true* if the browser can navigate back, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CanBrowserNavigateBack',
    },
    canBrowserNavigateForward: {
        summary: 'This function checks if the browser can go to the next page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser you want check for a next page.' },
        ],
        returns: 'Returns *true* if the browser can go to the next page, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CanBrowserNavigateForward',
    },
    cancelEvent: {
        summary: 'This function is used to stop the automatic internal handling of events, for example this can be used to prevent an item being given to a player when they walk over a pickup, by canceling the onPickupUse event.\n\ncancelEvent does not have an effect on all events, see the individual event\'s pages for information on what happens when the event is canceled. cancelEvent does not stop further event handlers from being called, as the order of event handlers being called is undefined in many cases. Instead, you can see if the currently active event has been cancelled using wasEventCancelled.\n\nThe use of cancelEvent outside of an event handler has no effect.\n\nIf you implement your own custom events and want to handle them being cancelled, you should call wasEventCancelled to check after your call to triggerEvent.',
        parameters: [
            { name: 'cancel', isOptional: true, isVariadic: false, summary: 'True to cancel, false to uncancel.' },
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'The reason for cancelling the event.' },
        ],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CancelEvent',
    },
    cancelLatentEvent: {
        summary: 'Stops a latent event from completing',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who is receiving the event.' },
            { name: 'handle', isOptional: false, isVariadic: false, summary: 'A handle previous got from getLatentEventHandles.' },
        ],
        returns: 'Returns a true if the latent event was successfully cancelled, or false if it was not',
        wiki: 'https://wiki.multitheftauto.com/wiki/CancelLatentEvent',
    },
    canPedBeKnockedOffBike: {
        summary: 'This function checks if the given ped can fall off bikes.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check.' },
        ],
        returns: 'Returns *true* if the ped can be knocked off bikes, *false* if he cannot or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CanPedBeKnockedOffBike',
    },
    clearChatBox: {
        summary: 'This function clears the chatbox. It does not clear the console (F8)',
        parameters: [
            { name: 'clearFor', isOptional: true, isVariadic: false, summary: 'The player whose chat is to be cleared. By default, this is set to the root element, which will affect all players.' },
        ],
        returns: 'Returns *true* if the player\'s chat was cleared successfully, *false* otherwise. ```lua bool clearChatBox ( [ element clearFor = getRootElement() ]) ``` Returns *true* if the player\'s chat was cleared successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ClearChatBox',
    },
    clearDebugBox: {
        summary: 'This function clears the debug box.',
        parameters: [],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ClearDebugBox',
    },
    clearElementVisibleTo: {
        summary: 'This function clears any settings added by setElementVisibleTo and restores an element to its default visibility.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which you wish to restore to its default visibility' },
        ],
        returns: 'Returns *true* if the operation was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ClearElementVisibleTo',
    },
    client: {
        summary: 'The client that called the event',
        parameters: [],
        returns: '',
        wiki: '',
    },
    cloneElement: {
        summary: 'This function clones (creates an exact copy of) an already existing element. The root node, and player elements, cannot be cloned. If a player element is a child of an element that is cloned, it will be skipped, along with the elements that exist as a child to the player element.\n\nPlayers are not the only elements that cannot be cloned. This list also includes remoteclients, and console elements.\n\nThe cloned element will be placed on the element tree as a child of the same parent as the cloned element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that you wish to clone.' },
            { name: 'xPos', isOptional: true, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'yPos', isOptional: true, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'zPos', isOptional: true, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'cloneChildren', isOptional: true, isVariadic: false, summary: 'A boolean value representing whether or not the element\'s children will be cloned.' },
        ],
        returns: 'Returns the handle of the new cloned element of the parent, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CloneElement',
    },
    copyAccountData: {
        summary: 'This function copies all of the data from one account to another.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to copy the data *to*.' },
            { name: 'fromAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to copy the data *from*.' },
        ],
        returns: 'Returns a *true* if the accounts were valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CopyAccountData',
    },
    copyResource: {
        summary: 'This function copies a specified resource with a new name.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource which is going to be copied' },
            { name: 'newResourceName', isOptional: false, isVariadic: false, summary: 'the name that the copied resource will receive' },
            { name: 'organizationalDir', isOptional: true, isVariadic: false, summary: 'A string containing the path where the resource should be copied to (e.g. "[gamemodes]/[amx]").' },
        ],
        returns: 'Returns the resource element of the copy. Returns *false* if the arguments are incorrect.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CopyResource',
    },
    countPlayersInTeam: {
        summary: 'This function is for returning the number of players in the specified team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you wish to retrieve the player count of.' },
        ],
        returns: 'Returns an integer containing the number of players in the team, *false* if it could not be retrieved.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CountPlayersInTeam',
    },
    createBlip: {
        summary: 'This function creates a blip element, which is displayed as an icon on the client\'s radar.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x position of the blip, in world coordinates.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y position of the blip, in world coordinates.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z position of the blip, in world coordinates.' },
            { name: 'icon', isOptional: true, isVariadic: false, summary: 'The icon that the radar blips should be. Default is 0. Valid values can be seen at Radar Blips' },
            { name: 'size', isOptional: true, isVariadic: false, summary: 'The size of the radar blip. Only applicable to the *Marker* icon. Default is 2. Maximum is 25.' },
            { name: 'r', isOptional: true, isVariadic: false, summary: 'The amount of red in the blip\'s color (0–255). Only applicable to the *Marker* icon. Default is 255.' },
            { name: 'g', isOptional: true, isVariadic: false, summary: 'The amount of green in the blip\'s color (0–255). Only applicable to the *Marker* icon. Default is 0.' },
            { name: 'b', isOptional: true, isVariadic: false, summary: 'The amount of blue in the blip\'s color (0–255). Only applicable to the *Marker* icon. Default is 0.' },
            { name: 'a', isOptional: true, isVariadic: false, summary: 'The amount of alpha in the blip\'s color (0–255). Only applicable to the *Marker* icon. Default is 255.' },
            { name: 'ordering', isOptional: true, isVariadic: false, summary: 'This defines the blip\'s Z-level ordering (-32768–32767). Default is 0.' },
            { name: 'visibleDistance', isOptional: true, isVariadic: false, summary: 'The maximum distance from the camera at which the blip is still visible (0–65535).' },
            { name: 'visibleTo', isOptional: true, isVariadic: false, summary: 'This defines which elements can see the blip. Defaults to visible to everyone. See visibility.' },
        ],
        returns: 'Returns an element of the blip if it was created successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateBlip',
    },
};
