import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_3: ApiDocumentationCatalog = {
    bitRRotate: {
        summary: 'This functions performs a bitwise circular right-rotation on the integer value by integer\nn positions.\nSee https://en.wikipedia.org/wiki/Bitwise_operation#Rotate_no_carry Bitwise operation for\nmore details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the rotation on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to rotate the value by.' },
        ],
        returns: 'returns the circular right-rotated value as integer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitRRotate',
    },
    bitRShift: {
        summary: 'This functions performs a logical right shift on the integer value by integer n\npositions. In a logical shift, zeros are shifted in to replace the discarded bits.\nSee https://en.wikipedia.org/wiki/Bitwise_operation#Logical_shift Bitwise operation for\nmore details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the shift on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to shift the value by.' },
        ],
        returns: 'returns the logical right shifted value as integer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitRShift',
    },
    bitTest: {
        summary: 'This function performs an AND-conjunction on two or more (unsigned) 32-bit Int|integers\nand checks, whether the conjuncted value is zero or not. See\nhttp://en.wikipedia.org/wiki/Bitwise_operation#AND Bitwise operation for more details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns true if the conjuncted value is not zero, false otherwise. if a bad argument was passed to bittest, youll get nil.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitTest',
    },
    bitXor: {
        summary: 'This function performs a bitwise XOR-conjunction (exclusive OR) on two or more (unsigned)\n32-bit Int|integers. See http://en.wikipedia.org/wiki/Bitwise_operation#XOR Bitwise\noperation for more details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns the conjuncted value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitXor',
    },
    blowVehicle: {
        summary: 'This function will blow up a vehicle. This will cause an explosion and will kill the\ndriver and any passengers inside it.',
        parameters: [
            { name: 'vehicleToBlow', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to blow up.' },
            { name: 'explode', isOptional: true, isVariadic: false, summary: 'if this argument is true then the vehicle will explode, otherwise it will just be blown up silently.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/BlowVehicle',
    },
    breakObject: {
        summary: 'This function breaks a specific object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'an object element' },
        ],
        returns: '* true if the object was successfully broken. * false if the object is not breakable, or a wrong object was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BreakObject',
    },
    call: {
        summary: 'This function is used to call a function from another resource (which must be running).\nThe function which you wish to call must first be exported within the resources meta.\nFor example:\n```lua\n```\nThis enables other resources to call a function from this resource.\nYou cannot call a server function from the client or vice versa. See triggerServerEvent\nand triggerClientEvent for possibilities to do that.\nThere is an easier syntax replacing this function. For example, you can instead of:\n```lua\ncall ( getResourceFromName ( resource ), exportedFunction, 1,\n2, three )\n```\ndo much like a normal call:\n```lua\nexports.resource:exportedFunction ( 1, 2, three\n)\n```\nIf the resource name contains illegal characters (such as hyphens), you can also do:\n```lua\nexportsresource-name:exportedFunction ( 1, 2, three\n)\n```\nTwo extra hidden variables are passed to the exported function:\n* sourceResource - The resource that called the exported function\n* sourceResourceRoot - The resource root element of the resource which called the\nexported function.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'This is a resource pointer which refers to the resource you are calling a function from.' },
            { name: 'theFunction', isOptional: false, isVariadic: false, summary: 'This is a string with the name of the function which you want to call. arguments Any arguments you may want to pass to the function when it is called. Any number of arguments of can be specified, each being passed to the designated function. resource_name Resource name exportedFunction The name of the function you want to call. Its not a string.' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns anything that the designated function has returned, if the function has no return, nil is returned. if the function does not exist, is not exported, or the call was not successful it will return false. returns anything that the designated function has returned, if the function has no return, nil is returned. if the function does not exist, is not exported, or the call was not successful it will return false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Call',
    },
    callRemote: {
        summary: 'This function allows you to call functions that have been exported with HTTP access by\nother MTA servers. The calls are asynchronous so you do not get an immediate result from\nthe call, instead a callback function you specify is called when the call returns.\nYou can also use this function to access a standard web page on a server you own by\nspecifying the URL. The arguments you specify to callRemote are passed to the web page\nusing HTTP POST as a JSON array. This will always have an array as the root element. The\npage must return a JSON formated *array* in the pages body with the results of the call\n(or an empty array if there are no results).\nYou can use the PHP SDK to create PHP pages that can be called by this function. See the\nPHP SDK page for an example.\nIn addition, it is possible to use this function to get information about a resource in\nthe MTA community, besides other things. Check out the Community Resources article.\nIn the case when the call fails, a string containing ERROR followed by an integer\ncontaining the error reason will be passed to the callback function. The reason for\nfailure will be similar to errors found with websites - file not found, server not found\nand timeouts.',
        parameters: [
            { name: 'host', isOptional: false, isVariadic: false, summary: 'This is a host name - including the HTTP port - of the server you wish to connect to.' },
            { name: 'queueName', isOptional: false, isVariadic: false, summary: 'Name of the queue to use. Any name can be used. If not set, the queue name is default. Requests in the same queue are processed in order, one at a time.' },
            { name: 'connectionAttempts', isOptional: false, isVariadic: false, summary: 'Number of times to retry if the remote host does not respond. In the case of a non-responding remote server, each connection attempt will timeout after 6 seconds. Therefore, the default setting of 10 connection attempts means it will be 60 seconds before your script gets a callback about the error. Reducing this value to 2 for example, will decrease that period to 12 seconds' },
            { name: 'connectTimeout', isOptional: false, isVariadic: false, summary: 'Number of milliseconds each connection attempt will take before timing out arguments Any arguments you may want to pass to the function when it is called. Any number of arguments of can be specified, each being passed to the designated function. Most data types can be passed, including tables. The only values that cannot be passed are userdata values such as xmlnodes - elements and resources can be passed though may be misinterpreted on other game servers (or cause warnings).' },
            { name: 'resourceName', isOptional: false, isVariadic: false, summary: 'This is a name of the resource that contains the exported function you want to call.' },
            { name: 'functionName', isOptional: false, isVariadic: false, summary: 'This is a string with the name of the function which you want to call. URL A full URL in the format http://hostname/path/file.ext. A port can be specified with a colon followed by a port number appended to the hostname.' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'This is the function that should receive the data returned from the remote function call. The argument list should match the format of the data returned. The callback function will be passed a string containing ERROR followed by an integer indicating the error code when an error occurs calling the function. A list of error codes Template:Error_codes_for_callRemote_and_fetchRemote |can be found here.' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns true if the function has been called, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CallRemote',
    },
    canBrowserNavigateBack: {
        summary: 'This function checks if the browser can return to the previous page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser you want to check for a previous page.' },
        ],
        returns: 'returns true if the browser can navigate back, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CanBrowserNavigateBack',
    },
    canBrowserNavigateForward: {
        summary: 'This function checks if the browser can go to the next page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser you want check for a next page.' },
        ],
        returns: 'returns true if the browser can go to the next page, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CanBrowserNavigateForward',
    },
    cancelEvent: {
        summary: 'This function is used to stop the automatic internal handling of events, for example this\ncan be used to prevent an item being given to a player when they walk over a pickup, by\ncanceling the onPickupUse event.\ncancelEvent does not have an effect on all events, see the individual events pages for\ninformation on what happens when the event is canceled. cancelEvent does not stop further\nevent handlers from being called, as the order of event handlers being called is\nundefined in many cases. Instead, you can see if the currently active event has been\ncancelled using wasEventCancelled.\nThe use of cancelEvent outside of an event handler has no effect.\nIf you implement your own custom events and want to handle them being cancelled, you\nshould call wasEventCancelled to check after your call to triggerEvent.',
        parameters: [
            { name: 'cancel', isOptional: true, isVariadic: false, summary: '' },
            { name: 'reason', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/CancelEvent',
    },
    cancelLatentEvent: {
        summary: 'Stops a latent event from completing',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who is receiving the event.' },
            { name: 'handle', isOptional: false, isVariadic: false, summary: 'A handle previous got from getLatentEventHandles.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/CancelLatentEvent',
    },
    canPedBeKnockedOffBike: {
        summary: 'This function checks if the given ped can fall off bikes.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check.' },
        ],
        returns: 'returns true if the ped can be knocked off bikes, false if he cannot or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CanPedBeKnockedOffBike',
    },
    clearChatBox: {
        summary: '',
        parameters: [
            { name: 'clearFor', isOptional: true, isVariadic: false, summary: 'The player whose chat is to be cleared. By default, this is set to the root element, which will affect all players.' },
        ],
        returns: 'returns true if the players chat was cleared successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ClearChatBox',
    },
    clearDebugBox: {
        summary: '',
        parameters: [],
        returns: 'always returns true.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ClearDebugBox',
    },
    clearElementVisibleTo: {
        summary: 'This function clears any settings added by setElementVisibleTo and restores an element to\nits default visibility.  This does not work with all entities - vehicles, players and\nobjects are exempt. This is because these objects are required for accurate sync (theyre\nphysical objects). This function is particularily useful for changing the visibility of\nmarkers, radar blips and radar areas.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which you wish to restore to its default visibility' },
        ],
        returns: 'returns true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ClearElementVisibleTo',
    },
    client: {
        summary: 'The client that called the event',
        parameters: [],
        returns: '',
        wiki: '',
    },
    cloneElement: {
        summary: 'This function clones (creates an exact copy of) an already existing element. The root\nnode, and player elements, cannot be cloned. If a player element is a child of an element\nthat is cloned, it will be skipped, along with the elements that exist as a child to the\nplayer element.\nPlayers are not the only elements that cannot be cloned. This list also includes\nremoteclients, and console elements.\nThe cloned element will be placed on the element tree as a child of the same parent as\nthe cloned element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that you wish to clone.' },
            { name: 'xPos', isOptional: true, isVariadic: false, summary: ': A floating point number representing the X coordinate on the map.' },
            { name: 'yPos', isOptional: true, isVariadic: false, summary: ': A floating point number representing the Y coordinate on the map.' },
            { name: 'zPos', isOptional: true, isVariadic: false, summary: ': A floating point number representing the Z coordinate on the map.' },
            { name: 'cloneChildren', isOptional: true, isVariadic: false, summary: ': A boolean value representing whether or not the elements children will be cloned. \'\'\'Note: if \'cloneChildren\' is true, the position floats will be offsets from the cloned element\'s position.\'\'\'' },
        ],
        returns: 'returns the handle of the new cloned element of the parent, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CloneElement',
    },
    copyAccountData: {
        summary: 'This function copies all of the data from one account to another.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to copy the data to.' },
            { name: 'fromAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to copy the data from.' },
        ],
        returns: 'returns a true if the accounts were valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CopyAccountData',
    },
    copyResource: {
        summary: 'This function copies a specified resource with a new name.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource which is going to be copied' },
            { name: 'newResourceName', isOptional: false, isVariadic: false, summary: 'the name that the copied resource will receive' },
            { name: 'organizationalDir', isOptional: true, isVariadic: false, summary: ': A string containing the path where the resource should be copied to (e.g. gamemodes/amx).' },
        ],
        returns: 'returns the resource element of the copy. returns false if the arguments are incorrect.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CopyResource',
    },
    countPlayersInTeam: {
        summary: 'This function is for returning the number of players in the specified team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you wish to retrieve the player count of.' },
        ],
        returns: 'returns an integer containing the number of players in the team, false if it could not be retrieved.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CountPlayersInTeam',
    },
    createBlip: {
        summary: 'This function creates a blip element, which is displayed as an icon on the clients radar.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
            { name: 'icon', isOptional: true, isVariadic: false, summary: '' },
            { name: 'size', isOptional: true, isVariadic: false, summary: '' },
            { name: 'r', isOptional: true, isVariadic: false, summary: '' },
            { name: 'g', isOptional: true, isVariadic: false, summary: '' },
            { name: 'b', isOptional: true, isVariadic: false, summary: '' },
            { name: 'a', isOptional: true, isVariadic: false, summary: '' },
            { name: 'ordering', isOptional: true, isVariadic: false, summary: '' },
            { name: 'visibleDistance', isOptional: true, isVariadic: false, summary: '' },
            { name: 'visibleTo', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateBlip',
    },
    createBlipAttachedTo: {
        summary: 'This function creates a blip that is attached to an element. This blip is displayed as an\nicon on the clients radar and will follow the element that it is attached to around.',
        parameters: [
            { name: 'elementToAttachTo', isOptional: false, isVariadic: false, summary: '' },
            { name: 'icon', isOptional: true, isVariadic: false, summary: '' },
            { name: 'size', isOptional: true, isVariadic: false, summary: '' },
            { name: 'r', isOptional: true, isVariadic: false, summary: '' },
            { name: 'g', isOptional: true, isVariadic: false, summary: '' },
            { name: 'b', isOptional: true, isVariadic: false, summary: '' },
            { name: 'a', isOptional: true, isVariadic: false, summary: '' },
            { name: 'ordering', isOptional: true, isVariadic: false, summary: '' },
            { name: 'visibleDistance', isOptional: true, isVariadic: false, summary: '' },
            { name: 'visibleTo', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateBlipAttachedTo',
    },
    createBrowser: {
        summary: 'This function creates a new web Element/Browser|browser element.',
        parameters: [
            { name: 'width', isOptional: false, isVariadic: false, summary: 'The browsers native width. This should be greater than or equal to 1.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'The browsers native height. This should be greater than or equal to 1.' },
            { name: 'isLocal', isOptional: false, isVariadic: false, summary: 'Sets whether the browser can only show local content or content from the internet (see examples for more information)' },
            { name: 'transparent', isOptional: true, isVariadic: false, summary: 'true if you want the browser transparent, false for opaque.' },
        ],
        returns: 'returns a texture of the browser if it was created successfully, false otherwise. returns also false, if the user disabled remote pages and islocal was set to false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateBrowser',
    },
};
