import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_18: ApiDocumentationCatalog = {
    getKeyBoundToCommand: {
        summary: 'This function allow you get first key bound to command.',
        parameters: [
            { name: 'command', isOptional: false, isVariadic: false, summary: 'command what you need check.' },
        ],
        returns: 'Returns a string of first key binded to current command.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyBoundToCommand',
    },
    getKeyBoundToFunction: {
        summary: 'getKeyBoundToFunction allows retrieval of the first key bound to a function.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you are checking the function bound to a key' },
            { name: 'theFunction', isOptional: false, isVariadic: false, summary: 'The function in which you would like to check the bound key' },
        ],
        returns: 'Returns a string of the first key the function was bound to. ```lua string getKeyBoundToFunction( function theFunction ) ``` Returns a string of the first key the function was bound to.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyBoundToFunction',
    },
    getKeyState: {
        summary: 'This function determines if a certain key is pressed or not.\n\n**Note:** \'ralt\' may trigger both \'ralt\' and \'lctrl\', this is due to AltGr',
        parameters: [
            { name: 'keyName', isOptional: false, isVariadic: false, summary: 'The name of the key you\'re checking state of. See Key names.' },
        ],
        returns: 'Returns *true* if the specified key is pressed, *false* if it isn\'t or if an invalid key name is passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyState',
    },
    getLatentEventHandles: {
        summary: 'Gets the currently queued latent events. The last one in the table is always the latest event queued. Each returned handle can be used with getLatentEventStatus or cancelLatentEvent',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who is receiving the events.' },
        ],
        returns: 'Returns a table of handles or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLatentEventHandles',
    },
    getLatentEventStatus: {
        summary: 'Gets the status of one queued latent event.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who is receiving the event.' },
            { name: 'handle', isOptional: false, isVariadic: false, summary: 'A handle previous got from getLatentEventHandles.' },
        ],
        returns: 'Returns a table with the following info or false if invalid arguments were passed: ***tickStart:** A number estimating how many ticks until the data transfer starts (Negative means the transfer has already started) ***tickEnd:** A number estimating how many ticks until the data transfer completes ***totalSize:** A number representing how many bytes in total this transfer will transfer ***percentComplete:** A number between 0-100 saying how much is done',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLatentEventStatus',
    },
    getLightColor: {
        summary: 'This function returns the color for a light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The light that you wish to retrieve the color of.' },
        ],
        returns: 'Returns three ints corresponding to the amount of red, green and blue (respectively) of the light, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightColor',
    },
    getLightDirection: {
        summary: 'This function returns the direction for a light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The light that you wish to retrieve the direction of.' },
        ],
        returns: 'Returns three ints corresponding to the x, y and z coordinates (respectively) of the light direction, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightDirection',
    },
    getLightRadius: {
        summary: 'This function returns the radius for a light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The light that you wish to retrieve the radius of.' },
        ],
        returns: 'Returns a float containing the radius of the specified light, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightRadius',
    },
    getLightType: {
        summary: 'This function returns the type for a light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The light that you wish to retrieve the type of.' },
        ],
        returns: 'Returns an int containing the type of the specified light, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightType',
    },
    getLoadedModules: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function returns all the currently loaded modules of the server.',
        parameters: [],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns a table of all the currently loaded modules. If no modules are loaded, the table will be empty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLoadedModules',
    },
    getLocalization: {
        summary: 'This function gets the player\'s localization setting as set in the MTA client.',
        parameters: [],
        returns: 'Returns a table with the following entries: ***code :** The language code *(eg. "en_US" for "English (United States)" or "ar" for "Arabic")*. ***name :** The name of the language *(eg. "English (United States)" or "Arabic")*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLocalization',
    },
    getLocalPlayer: {
        summary: 'This function gets the player element of the client running the current script.\n\nYou should use predefined variable **localPlayer** instead of typing getLocalPlayer() for better readability.',
        parameters: [],
        returns: 'Returns the local player element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLocalPlayer',
    },
    getLowLODElement: {
        summary: 'This function return the low LOD element that an element is associated with.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose low LOD version we want to get.' },
        ],
        returns: 'Returns a low LOD element if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLowLODElement',
    },
    getMapName: {
        summary: 'This function retrieves the current mapname as set by setMapName.',
        parameters: [],
        returns: 'Returns the mapname as a string. If no mapname is set it returns *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMapName',
    },
    getMarkerColor: {
        summary: 'This function returns the color and transparency for a marker element.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker that you wish to retrieve the color of.' },
        ],
        returns: 'Returns four ints corresponding to the amount of *red*, *green*, *blue* and *alpha* (respectively) of the marker, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerColor',
    },
    getMarkerCount: {
        summary: 'Returns the number of markers that currently exist in the world.\n\n<!-- Sorry, but I think this should be deleted, it\'s useless, i can use #getElementsByType("marker") [iManGaaX :)] -->',
        parameters: [],
        returns: 'Returns the number of markers that currently exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerCount',
    },
    getMarkerIcon: {
        summary: 'This function returns the icon name for a marker.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'A marker element referencing the specified marker.' },
        ],
        returns: 'Returns *false* if the marker passed is invalid or a string containing one of the following: * **"none"**: No icon * **"arrow"**: Arrow icon * **"finish"**: Finish (end-race) icon',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerIcon',
    },
    getMarkerSize: {
        summary: 'This function returns a float containing the size of the specified marker.',
        parameters: [
            { name: 'myMarker', isOptional: false, isVariadic: false, summary: 'The marker that you wish to retrieve the size of.' },
        ],
        returns: 'Returns a float containing the size of the specified marker.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerSize',
    },
    getMarkerTarget: {
        summary: 'This function returns the position of the specified marker\'s target, the position it points to. This only works for checkpoint markers and ring markers. For checkpoints it returns the position the arrow is pointing to, for ring markers it returns the position the ring is facing. You can set this target with setMarkerTarget.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker you wish to retrieve the target position of.' },
        ],
        returns: 'Returns three *float*s if a target is set, or *false* in the first variable and *nil* in the two others if the marker is invalid or no target is set.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerTarget',
    },
    getMarkerTargetArrowProperties: {
        summary: 'function returns the color, transparency and size for a checkpoint marker\'s target arrow.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker that you wish to retrieve the color and size of.' },
        ],
        returns: 'Returns five ints corresponding to the amount of *red*, *green*, *blue*, *alpha* and *size* of the marker\'s target arrow, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerTargetArrowProperties',
    },
    getMarkerType: {
        summary: 'This function returns a marker\'s type.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'A marker element referencing the specified marker.' },
        ],
        returns: '* Returns one of the following strings: If an invalid marker is specified, *false* is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerType',
    },
    getMaxPlayers: {
        summary: 'This function returns the maximum number of player slots on the server.',
        parameters: [],
        returns: 'Returns the maximum number of players allowed on the server.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMaxPlayers',
    },
    getMinuteDuration: {
        summary: 'Tells you how long an ingame minute takes in real-world milliseconds. The default GTA value is 1000.',
        parameters: [],
        returns: 'Returns the number of real-world milliseconds that go in an ingame minute.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMinuteDuration',
    },
    getModelHandling: {
        summary: 'This function returns a table containing the handling data of the specified vehicle model.\n\nNote: the data returned may not reflect the actual handling of a particular vehicle, since this may be overriden by the setVehicleHandling function.',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: 'the vehicle model you wish to get the handling data of.' },
        ],
        returns: 'Returns a *table* containing all the handling data, *false* if an invalid vehicle model is specified. Here is a list of valid table properties and what they return:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetModelHandling',
    },
    getModuleInfo: {
        summary: 'This function returns information about the specified module.',
        parameters: [
            { name: 'moduleName', isOptional: false, isVariadic: false, summary: 'A string containing the module you wish to get information of e.g. "hashing.dll"' },
        ],
        returns: 'Returns a table containing information about module. These keys are present in the table: ***version**: Module version in format X.XX ***name**: Module name ***author**: Module author If invalid name for module is passed, it will return *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetModuleInfo',
    },
    getMoonSize: {
        summary: 'This function returns the moon size.',
        parameters: [],
        returns: 'Returns a integer being the moon size that is currently set, depending on which side it is used.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMoonSize',
    },
    getNearClipDistance: {
        summary: 'This function gets the distance from the camera at which the world starts rendering. For more information about this please refer to setNearClipDistance.',
        parameters: [],
        returns: 'This function returns a *float* containing the actual near clip distance.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetNearClipDistance',
    },
    getNetworkStats: {
        summary: 'This function returns network status information.',
        parameters: [
            { name: 'thePlayer', isOptional: true, isVariadic: false, summary: 'The player you want to retrieve network stats from.' },
        ],
        returns: 'Returns a table, the indexes in the table are the following: * **bytesReceived** - Total number of bytes received since the connection was started * **bytesSent** - Total number of bytes sent since the connection was started * **packetsReceived** - Total number of packets received since the connection was started * **packetsSent** - Total number of packets sent since the connection was started * **packetlossTotal** - (0-100) Total packet loss percentage of sent data, since the connection was started * **packetlossLastSecond** - (0-100) Packet loss percentage of sent data, during the previous second * **messagesInSendBuffer** * **messagesInResendBuffer** - Number of packets queued to be resent (due to packet loss) * **isLimitedByCongestionControl** * **isLimitedByOutgoingBandwidthLimit** * **encryptionStatus**',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetNetworkStats',
    },
    getNetworkUsageData: {
        summary: 'This function returns a table containing network usage information about inbound and outbound packets.',
        parameters: [],
        returns: 'Returns a table with two fields: "in" and "out". Each of these contain a table with two fields: "bits" and "count". Each of these contain a table with 256 numeric fields ranging from 0 to 255, containing the appropriate network usage data for such packet id.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetNetworkUsageData',
    },
    getObjectMass: {
        summary: 'This function returns the mass of a specified object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object whose mass you want to get.' },
        ],
        returns: '* A float representing the mass of the object. * *false* if invalid arguments were passed. * *-1* if object was never streamed in.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetObjectMass',
    },
    getObjectProperty: {
        summary: 'This function gets a property of the specified object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object you wish to get a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the property you want to get the value of:' },
        ],
        returns: 'On success: table for **all**, 3 floats for **center_of_mass** or float for other properties On failure: *false*',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetObjectProperty',
    },
    getObjectScale: {
        summary: 'This function returns the visible size of an object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object you wish to return the scale of.' },
        ],
        returns: '* Three float values indicating the scale of the object on the x, y, and z axis if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetObjectScale',
    },
};
