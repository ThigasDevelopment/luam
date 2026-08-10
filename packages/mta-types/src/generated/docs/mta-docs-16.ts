import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_16: ApiDocumentationCatalog = {
    getJetpackMaxHeight: {
        summary: 'This function gets the maximum height at which your jetpack can fly without failing to go\nhigher.',
        parameters: [],
        returns: 'returns a float containing the max jetpack height.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetJetpackMaxHeight',
    },
    getJetpackWeaponEnabled: {
        summary: 'This function checks if a weapon is usable while on a Jetpack.',
        parameters: [
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'The weapon thats being checked if its usable on a Jetpack.' },
        ],
        returns: 'returns true if the weapon is enabled, else false if the weapon isnt or invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetJetpackWeaponEnabled',
    },
    getKeyboardLayout: {
        summary: '',
        parameters: [],
        returns: 'returns a table with keyboard layout properties: {| class=wikitable style=cellpadding: 10px; |- ! property || values and description |- | readinglayout || {| class=prettytable |- | ltr || left to right (english) |- | rtl || right to left (arabic, hebrew) |- | ttb-rtl-ltr || either read vertically from top to bottom with columns going from right to left, or read in horizontal rows from left to right, as for the japanese (japan) locale. |- | ttb-ltr || read vertically from top to bottom with columns going from left to right, as for the mongolian (mongolian) locale. |} |}',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyboardLayout',
    },
    getKeyBoundToCommand: {
        summary: 'This function allow you get first key bound to command.',
        parameters: [
            { name: 'command', isOptional: false, isVariadic: false, summary: 'command what you need check.' },
        ],
        returns: 'returns a string of first key binded to current command.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyBoundToCommand',
    },
    getKeyBoundToFunction: {
        summary: 'getKeyBoundToFunction allows retrieval of the first key bound to a function.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you are checking the function bound to a key' },
            { name: 'theFunction', isOptional: false, isVariadic: false, summary: 'The function in which you would like to check the bound key' },
        ],
        returns: 'returns a string of the first key the function was bound to.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyBoundToFunction',
    },
    getKeyState: {
        summary: 'This function determines if a certain key is pressed or not.\nNote: ralt may trigger both ralt and lctrl, this is due to AltGr',
        parameters: [
            { name: 'keyName', isOptional: false, isVariadic: false, summary: 'The name of the key youre checking state of. See Key names.' },
        ],
        returns: 'returns true if the specified key is pressed, false if it isnt or if an invalid key name is passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetKeyState',
    },
    getLatentEventHandles: {
        summary: 'Gets the currently queued latent events. The last one in the table is always the latest\nevent queued. Each returned handle can be used with getLatentEventStatus or\ncancelLatentEvent',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who is receiving the events.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLatentEventHandles',
    },
    getLatentEventStatus: {
        summary: 'Gets the status of one queued latent event.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player who is receiving the event.' },
            { name: 'handle', isOptional: false, isVariadic: false, summary: 'A handle previous got from getLatentEventHandles.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLatentEventStatus',
    },
    getLightColor: {
        summary: 'This function returns the color for a Element/Light|light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The Element/Light|light that you wish to retrieve the color of.' },
        ],
        returns: 'returns three ints corresponding to the amount of red, green and blue (respectively) of the light, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightColor',
    },
    getLightDirection: {
        summary: 'This function returns the direction for a Element/Light|light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The Element/Light|light that you wish to retrieve the direction of.' },
        ],
        returns: 'returns three ints corresponding to the x, y and z coordinates (respectively) of the light direction, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightDirection',
    },
    getLightRadius: {
        summary: 'This function returns the radius for a Element/Light|light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The Element/Light|light that you wish to retrieve the radius of.' },
        ],
        returns: 'returns a float containing the radius of the specified light, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightRadius',
    },
    getLightType: {
        summary: 'This function returns the type for a Element/Light|light element.',
        parameters: [
            { name: 'theLight', isOptional: false, isVariadic: false, summary: 'The Element/Light|light that you wish to retrieve the type of.' },
        ],
        returns: 'returns an int containing the type of the specified light, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLightType',
    },
    getLoadedModules: {
        summary: 'This function returns all the currently loaded modules of the server.',
        parameters: [],
        returns: 'returns a table of all the currently loaded modules. if no modules are loaded, the table will be empty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLoadedModules',
    },
    getLocalization: {
        summary: 'This function gets the players localization setting as set in the MTA client.',
        parameters: [],
        returns: 'returns a table with the following entries: *code : the language code (eg. en_us for english (united states) or ar for arabic). *name : the name of the language (eg. english (united states) or arabic).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLocalization',
    },
    getLocalPlayer: {
        summary: 'This function gets the player element of the client running the current script.\nYou can use the predefined variable localPlayer instead of typing getLocalPlayer()',
        parameters: [],
        returns: 'returns the local player element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLocalPlayer',
    },
    getLowLODElement: {
        summary: 'This function return the low LOD element that an element is associated with.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose low LOD version we want to get.' },
        ],
        returns: 'returns a low lod element if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetLowLODElement',
    },
    getMapName: {
        summary: 'This function retrieves the current mapname as set by setMapName.',
        parameters: [],
        returns: 'returns the mapname as a string. if no mapname is set it returns nil.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMapName',
    },
    getMarkerColor: {
        summary: 'This function returns the color and transparency for a marker element. Not all marker\ntypes support transparency.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: ': The marker that you wish to retrieve the color of.' },
        ],
        returns: 'returns four ints corresponding to the amount of red, green, blue and alpha (respectively) of the marker, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerColor',
    },
    getMarkerCount: {
        summary: 'Returns the number of markers that currently exist in the world.',
        parameters: [],
        returns: 'returns the number of markers that currently exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerCount',
    },
    getMarkerIcon: {
        summary: 'This function returns the icon name for a marker.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: ': A marker element referencing the specified marker.' },
        ],
        returns: 'returns false if the marker passed is invalid or a string containing one of the following: * none: no icon * arrow: arrow icon * finish: finish (end-race) icon',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerIcon',
    },
    getMarkerSize: {
        summary: 'This function returns a float containing the size of the specified marker.',
        parameters: [
            { name: 'myMarker', isOptional: false, isVariadic: false, summary: ': The marker that you wish to retrieve the size of.' },
        ],
        returns: 'returns a float containing the size of the specified marker.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerSize',
    },
    getMarkerTarget: {
        summary: 'This function returns the position of the specified markers target, the position it\npoints to. This only works for checkpoint markers and ring markers. For checkpoints it\nreturns the position the arrow is pointing to, for ring markers it returns the position\nthe ring is facing. You can set this target with setMarkerTarget.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker you wish to retrieve the target position of.' },
        ],
        returns: 'returns three floats if a target is set, or false in the first variable and nil in the two others if the marker is invalid or no target is set.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerTarget',
    },
    getMarkerType: {
        summary: 'This function returns a markers type.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: ': A marker element referencing the specified marker.' },
        ],
        returns: '* returns one of the following strings: if an invalid marker is specified, false is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMarkerType',
    },
    getMaxPlayers: {
        summary: 'This function returns the maximum number of player slots on the server.',
        parameters: [],
        returns: 'returns the maximum number of players allowed on the server.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMaxPlayers',
    },
    getMinuteDuration: {
        summary: 'Tells you how long an ingame minute takes in real-world milliseconds. The default GTA\nvalue is 1000.',
        parameters: [],
        returns: 'returns the number of real-world milliseconds that go in an ingame minute.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMinuteDuration',
    },
    getModelHandling: {
        summary: 'This function returns a table containing the handling data of the specified vehicle model.\nNote: the data returned may not reflect the actual handling of a particular vehicle,\nsince this may be overriden by the setVehicleHandling function.',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: 'the vehicle model you wish to get the handling data of.' },
        ],
        returns: 'returns a table containing all the handling data, false if an invalid vehicle model is specified. here is a list of valid table properties and what they return:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetModelHandling',
    },
    getModuleInfo: {
        summary: 'This function returns information about the specified Modules|module.',
        parameters: [
            { name: 'moduleName', isOptional: false, isVariadic: false, summary: 'A string containing the module you wish to get information of e.g. hashing.dll' },
        ],
        returns: 'returns a table containing information about module. these keys are present in the table: *version: module version in format x.xx *name: module name *author: module author if invalid name for module is passed, it will return false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetModuleInfo',
    },
    getMoonSize: {
        summary: 'This function returns the moon size.',
        parameters: [],
        returns: 'returns a integer being the moon size that is currently set, depending on which side it is used.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetMoonSize',
    },
    getNearClipDistance: {
        summary: '',
        parameters: [],
        returns: 'this function returns a float containing the actual near clip distance.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetNearClipDistance',
    },
    getNetworkStats: {
        summary: 'This function returns network status information.',
        parameters: [
            { name: 'thePlayer', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetNetworkStats',
    },
    getNetworkUsageData: {
        summary: 'This function returns a table containing network usage information about inbound and\noutbound packets.',
        parameters: [],
        returns: 'returns a table with two fields: in and out. each of these contain a table with two fields: bits and count. each of these contain a table with 256 numeric fields ranging from 0 to 255, containing the appropriate network usage data for such packet id.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetNetworkUsageData',
    },
    getObjectMass: {
        summary: 'This function returns the mass of a specified object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object whose mass you want to get.' },
        ],
        returns: '* a float representing the mass of the object. * false if invalid arguments were passed. * -1 if object was never streamed in.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetObjectMass',
    },
};
