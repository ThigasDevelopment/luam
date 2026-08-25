import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_2: ApiDocumentationCatalog = {
    addCommandHandler: {
        summary: 'This function will attach a scripting function (handler) to a console command, so that whenever a player or administrator uses the command the function is called.\n\nMultiple command handlers can be attached to a single command, and they will be called in the order that the handlers were attached. Equally, multiple commands can be handled by a single function, and the *commandName* parameter used to decide the course of action.\n\nFor users, a command is in the format:\n\n*commandName* *argument1* *argument2*\n\nThis can be triggered from the player\'s console or directly from the chat box by prefixing the message with a forward slash (*/*). For server side handlers, the server admin is also able to trigger these directly from the server\'s console in the same way as they are triggered from a player\'s console.',
        parameters: [
            { name: 'commandName', isOptional: false, isVariadic: false, summary: 'This is the name of the command you wish to attach a handler to. This is what must be typed into the console to trigger the function.' },
            { name: 'handlerFunction', isOptional: false, isVariadic: false, summary: 'This is the function that you want the command to trigger, which has to be defined before you add the handler. This function can take commandName parameter, followed by as many parameters as you expect after your command (see below). These are all optional.' },
            { name: 'restricted', isOptional: true, isVariadic: false, summary: 'Specify whether or not this command should be restricted by default. Use this on commands that should be inaccessible to everyone as default except special users specified in the ACL (Access Control List). This is to make sure admin commands such as ie. \'punish\' won\'t be available to everyone if a server administrator forgets masking it in ACL. Make sure to add the command to your ACL under the proper group for it to be usefull (i.e ). This argument defaults to false if nothing is specified.' },
            { name: 'caseSensitive', isOptional: true, isVariadic: false, summary: 'Specifies if the command handler will ignore the case for this command name.' },
        ],
        returns: 'Returns *true* if the command handler was added successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddCommandHandler',
    },
    addDebugHook: {
        summary: 'This function allows tracing of MTA functions and events. It should only be used when debugging scripts as it may degrade script performance.\n\nDebug hooks are not recursive, so functions and events triggered inside the hook callback will not be traced.',
        parameters: [
            { name: 'hookType', isOptional: false, isVariadic: false, summary: 'The type of hook to add. This can be:' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'The function to call' },
            { name: 'nameList', isOptional: true, isVariadic: false, summary: 'Table of strings for restricting which functions and events the hook will be triggered on' },
        ],
        returns: 'Returns *true* if the hook was successfully added, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddDebugHook',
    },
    addElementDataSubscriber: {
        summary: 'This function subscribes a player to specific element data.\nThis function is used together with setElementData in *"subscribe"* mode.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to subscribe the player to.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to subscribe the player to.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to subscribe.' },
        ],
        returns: 'Returns *true* if the player was subscribed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddElementDataSubscriber',
    },
    addEvent: {
        summary: 'This function allows you to register a custom event. Custom events function exactly like the built-in events. See event system for more information on the event system.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you wish to create.' },
            { name: 'allowRemoteTrigger', isOptional: true, isVariadic: false, summary: 'A boolean specifying whether this event can be called remotely using triggerClientEvent / triggerServerEvent or not.' },
        ],
        returns: 'Returns *true* if the event was added successfully, *false* if the event was already added.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddEvent',
    },
    addEventHandler: {
        summary: 'This function will add an event handler. An event handler is a function that will be called when the event it\'s attached to is triggered. See event system for more information on how the event system works.\n\nEvent handlers are functions that are called when a particular event happens. Each event specifies a specific set of variables that are passed to the event handler and can be read by your function. The following global variables are available for use in handler functions:\n***source**: the element that triggered the event\n***this**: the element that the event handler is attached to\n***sourceResource**: the resource that triggered the event.\n***sourceResourceRoot**: the root element (dynamic element root on client) of the resource that triggered the event.\n***client**: the client that triggered the event using triggerServerEvent. Not set if the event was not triggered from a client.\n\nIt is important to remember that events pass up and down the element tree. An event triggered on the root element is triggered on every element in the tree. An event triggered on any other element is triggered on its ancestors (its parent element and its parent\'s parent etc) and its children, grandchildren and great-grandchildren. You can use the *propagate* argument to specify if you wish your handler to receive events that have propagated up or down the tree.\n\nThe order in which event handlers are triggered is undefined, you should not rely on one event handler being executed before another.\nEach function closure can only be added once to each event. On the second attempt to add the function closure to the same event a warning will be emitted to the debug console and the call to addEventHandler will fail.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you want to attach the handler function to. **Note: The maximum allowed length is 100 ASCII characters (that is, English letters and numerals)**' },
            { name: 'attachedTo', isOptional: false, isVariadic: false, summary: 'The element you wish to attach the handler to. The handler will only be called when the event it is attached to is triggered for this element, or one of its children. Often, this can be the root element (meaning the handler will be called when the event is triggered for *any* element).' },
            { name: 'handlerFunction', isOptional: false, isVariadic: false, summary: 'The handler function you wish to call when the event is triggered. This function will be passed all of the event\'s parameters as arguments, but it isn\'t required that it takes all of them.' },
            { name: 'propagate', isOptional: true, isVariadic: false, summary: 'A boolean representing whether the handler will be triggered if the event was propagated down or up the element tree (starting from the source), and not triggered directly on attachedTo (that is, handlers attached with this argument set to *false* will only be triggered if *source == this*). In GUI events you will probably want to set this to *false*.' },
            { name: 'priority', isOptional: true, isVariadic: false, summary: 'A string representing the trigger order priority relative to other event handlers of the same name. Possible values are:' },
        ],
        returns: 'Returns *true* if the event handler was attached successfully. Returns *false* if the specified event could not be found or any parameters were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddEventHandler',
    },
    addPedClothes: {
        summary: 'This function is used to set the current clothes on a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose clothes you want to change.' },
            { name: 'clothesTexture', isOptional: false, isVariadic: false, summary: 'A string determining the clothes texture that will be added. See the clothes catalog.' },
            { name: 'clothesModel', isOptional: false, isVariadic: false, summary: 'A string determining the clothes model that will be added. See the clothes catalog.' },
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: 'A integer representing the clothes slot/type the clothes should be added to. See the clothes catalog.' },
        ],
        returns: 'This function returns *true* if the clothes were successfully added to the ped, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddPedClothes',
    },
    addResourceConfig: {
        summary: 'This function adds a new empty config file to an existing resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file to be created in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file is in, and \'path\' is the path from the root directory of the resource to the file.' },
            { name: 'filetype', isOptional: true, isVariadic: false, summary: 'a string indicating whether the file is serverside ("server") or clientside ("client").' },
        ],
        returns: 'Returns the new config\'s root xmlnode if the config was added successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddResourceConfig',
    },
    addResourceMap: {
        summary: 'This function adds a new empty mapfile to an existing resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the resource map in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the map file will be in, and \'path\' is the path from the root directory of the resource to the file.' },
            { name: 'dimension', isOptional: true, isVariadic: false, summary: 'the dimension in which the map\'s objects will be placed.' },
        ],
        returns: 'Returns the new map\'s root xmlnode if the map was added successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddResourceMap',
    },
    addVehicleSirens: {
        summary: 'This function adds sirens to a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to add sirens' },
            { name: 'sirenCount', isOptional: false, isVariadic: false, summary: 'The amount of siren points on the vehicle (8 maximum)' },
            { name: 'sirenType', isOptional: false, isVariadic: false, summary: 'An integer between 1 and 6 (1: invisible, 2: single, 3+: dual)' },
            { name: 'flag360', isOptional: true, isVariadic: false, summary: 'Visible from all directions (applies to single type only)' },
            { name: 'checkLosFlag', isOptional: true, isVariadic: false, summary: 'Check line of sight between camera and light so it won\'t draw if blocked' },
            { name: 'useRandomiser', isOptional: true, isVariadic: false, summary: 'Randomise the light order, false for sequential' },
            { name: 'silentFlag', isOptional: true, isVariadic: false, summary: 'If you want the siren to be silent set this to true' },
        ],
        returns: 'Returns *true* if sirens were successfully added to the vehicle, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddVehicleSirens',
    },
    addVehicleUpgrade: {
        summary: 'This function adds an upgrade to a vehicle, e.g. nitrous, hydraulics.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The element representing the vehicle you wish to add the upgrade to.' },
            { name: 'upgrade', isOptional: false, isVariadic: false, summary: 'The id of the upgrade you wish to add: 1000 to 1193 (*see Vehicle Upgrades*) or "**all"** to add all upgrades.' },
        ],
        returns: 'Returns *true* if the upgrade was successfully added to the vehicle, otherwise *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddVehicleUpgrade',
    },
    areTrafficLightsLocked: {
        summary: 'Gets whether the traffic lights are currently locked or not. If the lights are locked, it means they won\'t change unless you do setTrafficLightState.',
        parameters: [],
        returns: 'Returns *true* the traffic lights are currently locked, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AreTrafficLightsLocked',
    },
    areVehicleLightsOn: {
        summary: 'This function is used to find out whether the lights of the vehicle are on.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to retrieve the lights state of.' },
        ],
        returns: 'Returns *true* if the lights are on, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AreVehicleLightsOn',
    },
    attachElements: {
        summary: 'This function attaches one element to another, so that the first one follows the second whenever it moves.\n\nIf an attempt is made to attach two elements that are already attached the opposite way (eg theElement becomes theAttachToElement and vice versa), the 1st attachment order is automatically detached in favor of the 2nd attachment order. For example, if carA was attached to carB, now carB is attached to carA. Also, an element cannot be attached to two separate elements at one time. For example, two cars can be attached to one single car, but one single car cannot be attached to two separate cars. If you attempt to do this, the existing attachment will automatically be dropped in favor of the new attachment. For example, if carA is asked to attached to carB then carC, it is only attached to carC.\n\nThis is not compatible with all elements.  The following elements are compatible:\n* Peds\n* Players\n* Blips\n* Vehicles\n* Objects\n* Markers\n* Pickups\n* Sounds\n* Colshapes\n* Weapons\n* Cameras',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to be attached.' },
            { name: 'theAttachToElement', isOptional: false, isVariadic: false, summary: 'The element to attach the first to.' },
            { name: 'xPosOffset', isOptional: true, isVariadic: false, summary: 'The x offset, if you want the elements to be a certain distance from one another (default 0).' },
            { name: 'yPosOffset', isOptional: true, isVariadic: false, summary: 'The y offset (default 0).' },
            { name: 'zPosOffset', isOptional: true, isVariadic: false, summary: 'The z offset (default 0).' },
            { name: 'xRotOffset', isOptional: true, isVariadic: false, summary: 'The x rotation offset (default 0).' },
            { name: 'yRotOffset', isOptional: true, isVariadic: false, summary: 'The y rotation offset (default 0).' },
            { name: 'zRotOffset', isOptional: true, isVariadic: false, summary: 'The z rotation offset (default 0).' },
        ],
        returns: 'Returns *true* if the attaching process was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AttachElements',
    },
    attachTrailerToVehicle: {
        summary: 'This function attaches a trailer type vehicle to a trailer-towing-type vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to attach a trailer to.' },
            { name: 'theTrailer', isOptional: false, isVariadic: false, summary: 'the trailer you wish to be attached.' },
        ],
        returns: 'Returns *true* if the vehicle\'s were successfully attached, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AttachTrailerToVehicle',
    },
    banPlayer: {
        summary: 'This function will ban the specified player by either IP, serial or username',
        parameters: [
            { name: 'bannedPlayer', isOptional: false, isVariadic: false, summary: 'The player that will be banned from the server.' },
            { name: 'IP', isOptional: true, isVariadic: false, summary: 'Will player be banned by IP?' },
            { name: 'Username', isOptional: true, isVariadic: false, summary: 'Will player be banned by [http://community.mtasa.com/ MTA Community] username (obsolete, set to *false*)?' },
            { name: 'Serial', isOptional: true, isVariadic: false, summary: 'Will player be banned by serial?' },
            { name: 'responsiblePlayer', isOptional: true, isVariadic: false, summary: '' },
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'The reason the player will be banned from the server.' },
            { name: 'seconds', isOptional: true, isVariadic: false, summary: 'The amount of seconds the player will be banned from the server for. This can be 0 for an infinite amount of time.' },
        ],
        returns: 'Returns a ban object if banned successfully, or *false* if unsuccessful.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BanPlayer',
    },
    base64Decode: {
        summary: 'This function returns the decrypted data from https://en.wikipedia.org/wiki/Base64 base64\nrepresentation of the encrypted block',
        parameters: [
            { name: 'data', isOptional: false, isVariadic: false, summary: 'The block of data you want to decrypt' },
        ],
        returns: 'returns the decrypted data from https://en.wikipedia.org/wiki/base64 base64 representation of the encrypted block if the decryption process was successfully completed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Base64Decode',
    },
    base64Encode: {
        summary: 'This function returns the https://en.wikipedia.org/wiki/Base64 base64 representation of\nthe encoded block of data',
        parameters: [
            { name: 'data', isOptional: false, isVariadic: false, summary: 'The block of data you want to encode' },
        ],
        returns: 'returns the https://en.wikipedia.org/wiki/base64 base64 representation of the encoded data if the encoding process was successfully completed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Base64Encode',
    },
    bindKey: {
        summary: 'Binds a player\'s key to a handler function or command, which will be called when the key is pressed.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to bind the key of.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key or control you wish to bind to the command. See key names for a list of possible keys.' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'A string that has one of the following values:' },
            { name: 'handlerFunction', isOptional: false, isVariadic: false, summary: 'The function that will be triggered when the player\'s key is pressed. This function should have the form:' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns *true* if the key was bound, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BindKey',
    },
    bitAnd: {
        summary: 'This function performs a bitwise AND-conjunction on two or more (unsigned) 32-bit integers. See [http://en.wikipedia.org/wiki/Bitwise_operation#AND Bitwise operation] for more details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns the conjuncted value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitAnd',
    },
    bitArShift: {
        summary: 'This functions performs an arithmetic shift on the integer **value** by integer **n** positions. In an *arithmetic shift*, zeros are shifted in to replace the discarded bits. In a *right arithmetic* shift, the [https://en.wikipedia.org/wiki/Sign_bit sign bit] is shifted in on the left, thus preserving the sign of the operand.\nSee [https://en.wikipedia.org/wiki/Bitwise_operation#Arithmetic_shift Bitwise operation] for more details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the arithmetic shift on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to shift the value by.' },
        ],
        returns: 'Returns the arithmetic shifted value as *integer*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitArShift',
    },
    bitExtract: {
        summary: 'This function returns the unsigned number formed by the bits field to field + width - 1 (range: 0-31).',
        parameters: [
            { name: 'var', isOptional: false, isVariadic: false, summary: 'The value' },
            { name: 'field', isOptional: false, isVariadic: false, summary: 'The field number' },
            { name: 'width', isOptional: true, isVariadic: false, summary: 'Number of bits to extract' },
        ],
        returns: 'Returns the extracted value/bit sequence.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitExtract',
    },
    bitLRotate: {
        summary: 'This functions performs a bitwise circular left-rotation on the integer **value** by integer **n** positions.\nSee [https://en.wikipedia.org/wiki/Bitwise_operation#Rotate_no_carry Bitwise operation] for more details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the rotation on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to rotate the value by.' },
        ],
        returns: 'Returns the circular left-rotated value as *integer*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitLRotate',
    },
    bitLShift: {
        summary: 'This functions performs a logical left shift on the integer **value** by integer **n** positions. In a *logical shift*, zeros are shifted in to replace the discarded bits.\nSee [https://en.wikipedia.org/wiki/Bitwise_operation#Logical_shift Bitwise operation] for more details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the shift on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to shift the value by.' },
        ],
        returns: 'Returns the logical left shifted value as *integer*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitLShift',
    },
    bitNot: {
        summary: 'This function performs a bitwise NOT on an (unsigned) 32-bit integer. See [http://en.wikipedia.org/wiki/Bitwise_operation#NOT Bitwise operation] for more details.',
        parameters: [
            { name: 'var', isOptional: false, isVariadic: false, summary: 'The value you want to perform a bitwise NOT on' },
        ],
        returns: 'Returns the value on which the operation has been performed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitNot',
    },
};
