import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_2: ApiDocumentationCatalog = {
    addElementDataSubscriber: {
        summary: 'This function is used together with setElementData in subscribe mode.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to subscribe the player to.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to subscribe the player to.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to subscribe.' },
        ],
        returns: 'returns true if the player was subscribed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddElementDataSubscriber',
    },
    addEvent: {
        summary: 'This function allows you to register a custom event. Custom events function exactly like\nthe built-in events. See event system for more information on the event system.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you wish to create.' },
            { name: 'allowRemoteTrigger', isOptional: true, isVariadic: false, summary: 'A boolean specifying whether this event can be called remotely using triggerClientEvent / triggerServerEvent or not.' },
        ],
        returns: 'returns true if the event was added successfully, false if the event was already added.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddEvent',
    },
    addEventHandler: {
        summary: 'This function will add an event handler. An event handler is a function that will be\ncalled when the event its attached to is triggered. See event system for more information\non how the event system works.\nEvent handlers are functions that are called when a particular event happens. Each event\nspecifies a specific set of variables that are passed to the event handler and can be\nread by your function. The following global variables are available for use in handler\nfunctions:\n*source: the element that triggered the event\n*this: the element that the event handler is attached to\n*sourceResource: the resource that triggered the event\n*sourceResourceRoot: the root element of the resource that triggered the event\n*client: the client that triggered the event using triggerServerEvent. Not set if the\nevent was not triggered from a client.\n*eventName: the name of the event which triggered the handler function.\nIt is important to remember that events pass up and down the element tree. An event\ntriggered on the root element is triggered on every element in the tree. An event\ntriggered on any other element is triggered on its ancestors (its parent element and its\nparents parent etc) and its children, grandchildren and great-grandchildren. You can use\nthe propagate argument to specify if you wish your handler to receive events that have\npropagated up or down the tree.\nThe order in which event handlers are triggered is undefined, you should not rely on one\nevent handler being executed before another.\nEach function closure can only be added once to each event. On the second attempt to add\nthe function closure to the same event a warning will be emitted to the debug console and\nthe call to addEventHandler will fail.',
        parameters: [
            { name: 'eventName', isOptional: false, isVariadic: false, summary: 'The name of the event you want to attach the handler function to. Note: The maximum allowed length is 100 ASCII characters (that is, English letters and numerals)' },
            { name: 'attachedTo', isOptional: false, isVariadic: false, summary: 'The element you wish to attach the handler to. The handler will only be called when the event it is attached to is triggered for this element, or one of its children. Often, this can be the root element (meaning the handler will be called when the event is triggered for any element).' },
            { name: 'handlerFunction', isOptional: false, isVariadic: false, summary: 'The handler function you wish to call when the event is triggered. This function will be passed all of the events parameters as arguments, but it isnt required that it takes all of them.' },
            { name: 'propagate', isOptional: true, isVariadic: false, summary: 'A boolean representing whether the handler will be triggered if the event was propagated down or up the element tree (starting from the source), and not triggered directly on attachedTo (that is, handlers attached with this argument set to false will only be triggered if source == this). In GUI events you will probably want to set this to false.' },
            { name: 'priority', isOptional: true, isVariadic: false, summary: 'A string representing the trigger order priority relative to other event handlers of the same name. Possible values are: high normal low \'\'It is also possible to add finer priority control by appending a positive or negative number to the priority string. For example (in priority order for reference): "high+4" "high" "high-1" "normal-6" "normal-7" "low+1" "low" "low-1"\'\'' },
        ],
        returns: 'returns true if the event handler was attached successfully. returns false if the specified event could not be found or any parameters were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddEventHandler',
    },
    addPedClothes: {
        summary: 'This function is used to set the current clothes on a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose clothes you want to change.' },
            { name: 'clothesTexture', isOptional: false, isVariadic: false, summary: ': A string determining the clothes texture that will be added. See the CJ Clothes|clothes catalog.' },
            { name: 'clothesModel', isOptional: false, isVariadic: false, summary: ': A string determining the clothes model that will be added. See the CJ Clothes|clothes catalog.' },
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: ': A integer representing the clothes slot/type the clothes should be added to. See the CJ Clothes|clothes catalog.' },
        ],
        returns: 'this function returns true if the clothes were successfully added to the ped, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddPedClothes',
    },
    addResourceConfig: {
        summary: 'This function adds a new empty config file to an existing resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file to be created in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. :For example, if you want to create a config named \'settings.xml\' in the resource \'ctf\', it can be created from another resource this way: \'\'addResourceConfig(":ctf/settings.xml", "server")\'\'. :If you want to create the file in the current resource, only the file path is necessary, e.g. \'\'addResourceConfig("settings.xml", "server")\'\'.' },
            { name: 'filetype', isOptional: true, isVariadic: false, summary: 'a string indicating whether the file is serverside (server) or clientside (client).' },
        ],
        returns: 'returns the new configs root xmlnode if the config was added successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddResourceConfig',
    },
    addResourceMap: {
        summary: 'This function adds a new empty mapfile to an existing resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the resource map in the following format: :resourceName/path. resourceName is the name of the resource the map file will be in, and path is the path from the root directory of the resource to the file. :For example, if you want to create a map file named \'manycars.map\' in the resource \'cdm\', it can be created from another resource this way: \'\'addResourceMap(":cdm/manycars.map")\'\'. :If you want to create the map file in the current resource, only the file path is necessary, e.g. \'\'addResourceMap("manycars.map")\'\'.' },
            { name: 'dimension', isOptional: true, isVariadic: false, summary: 'the dimension in which the maps objects will be placed.' },
        ],
        returns: 'returns the new maps root xmlnode if the map was added successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddResourceMap',
    },
    addVehicleSirens: {
        summary: 'This function adds sirens to a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to add sirens' },
            { name: 'sirenCount', isOptional: false, isVariadic: false, summary: 'The amount of siren points on the vehicle (8 maximum)' },
            { name: 'sirenType', isOptional: false, isVariadic: false, summary: 'An integer between 1 and 6 (1: invisible, 2: single, 3+: dual)' },
            { name: 'flag360', isOptional: true, isVariadic: false, summary: 'Visible from all directions (applies to single type only)' },
            { name: 'checkLosFlag', isOptional: true, isVariadic: false, summary: 'Check line of sight between camera and light so it wont draw if blocked' },
            { name: 'useRandomiser', isOptional: true, isVariadic: false, summary: 'Randomise the light order, false for sequential' },
            { name: 'silentFlag', isOptional: true, isVariadic: false, summary: 'If you want the siren to be silent set this to true' },
        ],
        returns: 'returns true if sirens were successfully added to the vehicle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddVehicleSirens',
    },
    addVehicleUpgrade: {
        summary: 'This function adds an upgrade to a vehicle, e.g. nitrous, hydraulics.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The element representing the vehicle you wish to add the upgrade to.' },
            { name: 'upgrade', isOptional: false, isVariadic: false, summary: ': The id of the upgrade you wish to add: 1000 to 1193 (see Vehicle Upgrades) or all to add all upgrades. **Note:** setCameraTarget will behave strangely if you use hydraulics (upgrade id: 1087) server sided and when your camera target is the player inside the vehicle with hydraulics and if the player is not you.' },
        ],
        returns: 'returns true if the upgrade was successfully added to the vehicle, otherwise false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddVehicleUpgrade',
    },
    areTrafficLightsLocked: {
        summary: 'Gets whether the traffic lights are currently locked or not. If the lights are locked, it\nmeans they wont change unless you do setTrafficLightState.',
        parameters: [],
        returns: 'returns true the traffic lights are currently locked, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AreTrafficLightsLocked',
    },
    areVehicleLightsOn: {
        summary: '*This is different to getVehicleOverrideLights because this function will return true if\nthe lights were turned on by natural causes.\n* Unless setVehicleOverrideLights is used, vehicles always automatically disable their\nlights at 06:25 and enable them at 20:26.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': the vehicle you wish to retrieve the lights state of.' },
        ],
        returns: 'returns true if the lights are on, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AreVehicleLightsOn',
    },
    attachElements: {
        summary: 'This function attaches one element to another, so that the first one follows the second\nwhenever it moves.\nIf an attempt is made to attach two elements that are already attached the opposite way\n(eg theElement becomes theAttachToElement and vice versa), the 1st attachment order is\nautomatically detached in favor of the 2nd attachment order. For example, if carA was\nattached to carB, now carB is attached to carA. Also, an element cannot be attached to\ntwo separate elements at one time. For example, two cars can be attached to one single\ncar, but one single car cannot be attached to two separate cars. If you attempt to do\nthis, the existing attachment will automatically be dropped in favor of the new\nattachment. For example, if carA is asked to attached to carB then carC, it is only\nattached to carC.\nThis is not compatible with all elements.  The following elements are compatible:\n* Peds\n* Players\n* Blips\n* Vehicles\n* Objects\n* Markers\n* Pickups\n* Sounds\n* Colshapes\n* createWeapon|Weapons\n* Cameras\n*The offset coodinates reflect the object space, not the world space. This means that you\ncannot calculate the exact offsets between two objects by pre-positioning them in the map\neditor as a reference. Please see attachElementsOffsets for more details.\n*Due to a limitation in GTA, unexpected attach rotations may occur if all rotation\noffsets are non-zero. (i.e. Try to ensure at least one of xRotOffset, yRotOffset or\nzRotOffset is zero).',
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
        returns: 'returns true if the attaching process was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AttachElements',
    },
    attachTrailerToVehicle: {
        summary: 'This function attaches a trailer type vehicle to a trailer-towing-type vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': the vehicle you wish to attach a trailer to.' },
            { name: 'theTrailer', isOptional: false, isVariadic: false, summary: ': the trailer you wish to be attached.' },
        ],
        returns: 'returns true if the vehicles were successfully attached, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AttachTrailerToVehicle',
    },
    banPlayer: {
        summary: 'This function will ban the specified player by either IP, serial or username\nThis function will ban the specified player from the server by IP.',
        parameters: [
            { name: 'bannedPlayer', isOptional: false, isVariadic: false, summary: 'The player that will be banned from the server.' },
            { name: 'IP', isOptional: true, isVariadic: false, summary: 'Will player be banned by IP?' },
            { name: 'Username', isOptional: true, isVariadic: false, summary: 'Will player be banned by username?' },
            { name: 'Serial', isOptional: true, isVariadic: false, summary: 'Will player be banned by serial? responsibleElement The element that is responsible for banning the player. This can be a player or the root (getRootElement()) (Maximum 30 characters if using a string).' },
            { name: 'responsiblePlayer', isOptional: true, isVariadic: false, summary: '' },
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'The reason the player will be banned from the server.' },
            { name: 'seconds', isOptional: true, isVariadic: false, summary: 'The amount of seconds the player will be banned from the server for. This can be 0 for an infinite amount of time.' },
        ],
        returns: 'returns a ban object if banned successfully, or false if unsuccessful.',
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
        summary: 'Binds a players key to a handler function or command, which will be called when the key\nis pressed.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to bind the key of.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key that was pressed' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'The state of the key that was pressed, down if it was pressed, up if it was released. up If the bound key should trigger the function when the key is released down If the bound key should trigger the function when the key is pressed both If the bound key should trigger the function when the key is pressed or released' },
            { name: 'handlerFunction', isOptional: false, isVariadic: false, summary: 'The function that will be triggered when the players key is pressed. This function should have the form: : ```lua function functionName ( player keyPresser, string key, string keyState, [ var arguments, ... ] ) ``` :The values passed to this function are: keyPresser The player who pressed the key arguments The optional arguments you specified when calling bindKey (see below).' },
            { name: 'args', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/BindKey',
    },
    bitAnd: {
        summary: 'This function performs a bitwise AND-conjunction on two or more (unsigned) 32-bit\nInt|integers. See http://en.wikipedia.org/wiki/Bitwise_operation#AND Bitwise operation\nfor more details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns the conjuncted value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitAnd',
    },
    bitArShift: {
        summary: 'This functions performs an arithmetic shift on the integer value by integer n positions.\nIn an arithmetic shift, zeros are shifted in to replace the discarded bits. In a right\narithmetic shift, the https://en.wikipedia.org/wiki/Sign_bit sign bit is shifted in on\nthe left, thus preserving the sign of the operand.\nSee https://en.wikipedia.org/wiki/Bitwise_operation#Arithmetic_shift Bitwise operation\nfor more details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the arithmetic shift on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to shift the value by.' },
        ],
        returns: 'returns the arithmetic shifted value as integer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitArShift',
    },
    bitExtract: {
        summary: 'This function returns the unsigned number formed by the bits field to field + width - 1\n(range: 0-31).',
        parameters: [
            { name: 'variable', isOptional: false, isVariadic: false, summary: '' },
            { name: 'field', isOptional: false, isVariadic: false, summary: 'The field number' },
            { name: 'width', isOptional: true, isVariadic: false, summary: 'Number of bits to extract' },
        ],
        returns: 'returns the extracted value/bit sequence.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitExtract',
    },
    bitLRotate: {
        summary: 'This functions performs a bitwise circular left-rotation on the integer value by integer\nn positions.\nSee https://en.wikipedia.org/wiki/Bitwise_operation#Rotate_no_carry Bitwise operation for\nmore details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the rotation on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to rotate the value by.' },
        ],
        returns: 'returns the circular left-rotated value as integer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitLRotate',
    },
    bitLShift: {
        summary: 'This functions performs a logical left shift on the integer value by integer n positions.\nIn a logical shift, zeros are shifted in to replace the discarded bits.\nSee https://en.wikipedia.org/wiki/Bitwise_operation#Logical_shift Bitwise operation for\nmore details.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you want to perform the shift on.' },
            { name: 'n', isOptional: false, isVariadic: false, summary: 'The amount of positions to shift the value by.' },
        ],
        returns: 'returns the logical left shifted value as integer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitLShift',
    },
    bitNot: {
        summary: 'This function performs a bitwise NOT on an (unsigned) 32-bit Int|integer. See\nhttp://en.wikipedia.org/wiki/Bitwise_operation#NOT Bitwise operation for more details.',
        parameters: [
            { name: 'variable', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns the value on which the operation has been performed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitNot',
    },
    bitOr: {
        summary: 'This function performs a bitwise OR-conjunction on two or more (unsigned) 32-bit\nInt|integers. See http://en.wikipedia.org/wiki/Bitwise_operation#OR Bitwise operation for\nmore details.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'var2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns the conjuncted value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitOr',
    },
    bitReplace: {
        summary: 'This function returns the unsigned number formed by var value with replacement specified\nat bits field to field + width - 1',
        parameters: [
            { name: 'variable', isOptional: false, isVariadic: false, summary: '' },
            { name: 'replaceValue', isOptional: false, isVariadic: false, summary: 'The replaceValue' },
            { name: 'field', isOptional: false, isVariadic: false, summary: 'The field number' },
            { name: 'width', isOptional: true, isVariadic: false, summary: 'Number of bits to extract' },
        ],
        returns: 'returns the replaced value/bit sequence.',
        wiki: 'https://wiki.multitheftauto.com/wiki/BitReplace',
    },
};
