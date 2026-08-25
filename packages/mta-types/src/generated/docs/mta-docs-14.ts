import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_14: ApiDocumentationCatalog = {
    getAllElementData: {
        summary: 'Added also as a client-side function. Previously only available as a server-side function.\n\nReturns a table of all element data of an element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element you want to get the element data of.' },
        ],
        returns: 'If successful, returns a table with as keys the names of the element data and as values the corresponding element data values. Returns *false* in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAllElementData',
    },
    getAnalogControlState: {
        summary: 'This retrieves the analog control state of a control.  This is useful for detecting sensitive controls, such as those used on a joypad.\n\nTo get the analog control state for a ped, please use getPedAnalogControlState.',
        parameters: [
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to get the state of. See control names for a list of possible controls.' },
            { name: 'rawValue', isOptional: true, isVariadic: false, summary: 'A bool indicating if it should return the raw player input value.' },
        ],
        returns: 'Returns a float between 0 and 1 indicating the amount the control is pressed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAnalogControlState',
    },
    getAttachedElements: {
        summary: 'This function returns a table of all the elements attached to the specified element',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which you require the information from.' },
        ],
        returns: 'Returns a table of all the elements attached to the specified element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAttachedElements',
    },
    getBanAdmin: {
        summary: 'This function will return the responsible admin (nickname of the admin) of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to return the admin of.' },
        ],
        returns: 'Returns a *string* of the admin if everything was successful, *false* if invalid arguments are specified if there was no admin specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanAdmin',
    },
    getBanIP: {
        summary: 'This function will return the IP of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban in which you want to return the IP of.' },
        ],
        returns: 'Returns a *string* of the IP if everything was successful, *false* if invalid arguments are specified if there was no IP specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanIP',
    },
    getBanNick: {
        summary: 'This function will return the nickname (nickname that the player had when he was banned) of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban element which nickname you want to return.' },
        ],
        returns: 'Returns a *string* of the nickname if everything was successfull, *false* if invalid arguments are specified if there was no nickname specified for the ban element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanNick',
    },
    getBanReason: {
        summary: 'This function will return the ban reason of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban in which you want to return the reason of.' },
        ],
        returns: 'Returns a *string* of the reason if everything was successful, *false* if invalid arguments are specified if there was no reason specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanReason',
    },
    getBans: {
        summary: 'This function will return a table containing all the bans present in the server\'s banlist.xml.',
        parameters: [],
        returns: 'Returns a table containing all the bans.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBans',
    },
    getBanSerial: {
        summary: 'This function will return the serial of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to retrieve the serial of.' },
        ],
        returns: 'Returns a *string* of the serial if everything was successful, *false* if invalid arguments are specified or if there was no serial specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanSerial',
    },
    getBanTime: {
        summary: 'This function will return the time the specified ban was created, in **seconds**.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban of which you wish to retrieve the time of.' },
        ],
        returns: '* Returns an integer of the banning time in the format of seconds from the year 1970. Use in conjunction with getRealTime in order to retrieve detailed information. * Returns **false** if invalid arguments were specified or if there was no banning time specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanTime',
    },
    getBanUsername: {
        summary: 'This function will return the username of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban in which you wish to retrieve the username of.' },
        ],
        returns: 'returns a string of the username if everything was successful, false if invalid arguments are specified if there was no username specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanUsername',
    },
    getBirdsEnabled: {
        summary: 'This function will tell you if the birds are enabled or disabled.',
        parameters: [],
        returns: 'Returns *true* if the birds are enabled or *false* if the birds are disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBirdsEnabled',
    },
    getBlipColor: {
        summary: 'This function will tell you what color a blip is. This color is only applicable to the default blip icon (,  or ). All other icons will ignore this.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip whose color you wish to get.' },
        ],
        returns: 'Returns four integers in RGBA format, with a maximum value of 255 for each. The values are, in order, *red*, *green*, *blue*, and *alpha*. Alpha decides the transparancy where 255 is opaque and 0 is fully transparent. *false* is returned if the blip is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipColor',
    },
    getBlipIcon: {
        summary: 'This function returns the icon a blip currently has.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'the blip we\'re getting the icon number of.' },
        ],
        returns: 'Returns an int indicating which icon the blip has. Valid values are listed on the Radar Blips page.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipIcon',
    },
    getBlipOrdering: {
        summary: 'This function gets the Z ordering value of a blip. The Z ordering determines if a blip appears on top of or below other blips. Blips with a higher Z ordering value appear on top of blips with a lower value. The default value for all blips is 0.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'the blip to retrieve the Z ordering value of.' },
        ],
        returns: 'Returns the Z ordering value of the blip if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipOrdering',
    },
    getBlipSize: {
        summary: 'This function gets the size of a blip..',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip you wish to get the size of.' },
        ],
        returns: 'Returns an int indicating the size of the blip. The default value is 2. The maximum value is 25.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipSize',
    },
    getBlipVisibleDistance: {
        summary: 'This function will tell you what visible distance a blip has.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip whose visible distance you wish to get.' },
        ],
        returns: 'Returns one float with the blips visible distance, false if the blip is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipVisibleDistance',
    },
    getBlurLevel: {
        summary: 'This function allows you to check the current blur level of a specified player.',
        parameters: [],
        returns: 'returns the local blur level.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerBlurLevel',
    },
    getBodyPartName: {
        summary: 'This function is used to get the name of a body part on a player.',
        parameters: [
            { name: 'bodyPartID', isOptional: false, isVariadic: false, summary: 'An integer representing the body part ID you wish to retrieve the name of.' },
        ],
        returns: 'This function returns a string containing the body part name if the ID is valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBodyPartName',
    },
    getBoundKeys: {
        summary: 'Returns a list of key names that are bound to the specified game control or console command.',
        parameters: [
            { name: 'command/control', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'If one or more keys are bound to the specified control or console command, a table is returned indexed by the names of the keys and containing key states as values. If no keys are bound or an invalid name was passed, returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBoundKeys',
    },
    getBrowserProperty: {
        summary: 'This function gets a given property of a specified browser.',
        parameters: [
            { name: 'theBrowser', isOptional: false, isVariadic: false, summary: 'browser element to get the property value of' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The browser property key. It can be:' },
        ],
        returns: 'Returns the value if the property was successfully found, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserProperty',
    },
    getBrowserSettings: {
        summary: 'This function returns a table containing the browser settings.',
        parameters: [],
        returns: 'A table having the following keys: * **RemoteEnabled**: *true* if remote websites are enabled, *false* otherwise * **RemoteJavascript**: *true* if Javascript is enabled on remote websites, *false* otherwise * **PluginsEnabled**: *true* if plugins such as Flash, Silverlight (but not Java) are enabled, *false* otherwise. This setting is *false* by default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserSettings',
    },
    getBrowserSource: {
        summary: 'This function can be used to retrieve the source code of a website (asynchronously). The size of the source code is limited to 2 MiB (remaining bytes are cut).',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser element you want to get the source of' },
            { name: 'callback', isOptional: false, isVariadic: false, summary: 'a callback function with syntax as described below' },
        ],
        returns: 'Returns *true* if valid arguments have been passed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserSource',
    },
    getBrowserTitle: {
        summary: 'This function returns the title of the passed browser.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'Returns the title as a string. Returns false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserTitle',
    },
    getBrowserURL: {
        summary: 'This function returns the URL of the specified browser.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'Returns the web browser URL.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserURL',
    },
    getCamera: {
        summary: 'This function returns an element that corresponds to the game camera',
        parameters: [],
        returns: 'Returns an element that corresponds to the game camera',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCamera',
    },
    getCameraClip: {
        summary: 'This function checks if the camera will "collide" with any objects or vehicles in its way. Read more about this here.',
        parameters: [],
        returns: '***objects:** if you want the camera to clip on objects. ***vehicles:** if you want the camera to clip on vehicles.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraClip',
    },
    getCameraDrunkLevel: {
        summary: 'This function gets the camera drunk level set by setCameraDrunkLevel. This function was renamed from getCameraShakeLevel.',
        parameters: [],
        returns: 'Returns an integer representing the camera drunk level, from 0 (no drunk effect) to 255 (maximum drunk effect). By default, the camera has no drunk effect. Drunk effect is a wavy motion of the camera depicting the player being drunk. This function used to be called getCameraShakeLevel which has since been deprecated.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraDrunkLevel',
    },
    getCameraFieldOfView: {
        summary: 'This function returns the field of view of the *dynamic camera* as set by setCameraFieldOfView.',
        parameters: [
            { name: 'cameraMode', isOptional: false, isVariadic: false, summary: 'the camera mode to get the field of view of:' },
        ],
        returns: 'Returns one float - the field of view angle',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraFieldOfView',
    },
    getCameraGoggleEffect: {
        summary: 'This function returns what goggle effect is currently affecting the camera.',
        parameters: [],
        returns: '* String indicating the current camera goggle effect. Their meanings can be seen below.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraGoggleEffect',
    },
    getCameraInterior: {
        summary: 'Returns the interior of the local camera (independent of the interior of the local player).',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera interior you want to get.' },
        ],
        returns: 'Returns an *integer* indicating the camera\'s interior, *false* if the argument is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraInterior',
    },
};
