import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_33: ApiDocumentationCatalog = {
    isVehicleNitroActivated: {
        summary: 'This function checks if nitro is activated on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to check for an activation.' },
        ],
        returns: 'returns true if the nitro is currently activated on the vehicle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleNitroActivated',
    },
    isVehicleNitroRecharging: {
        summary: 'This function checks if nitro is recharging on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to check for recharging.' },
        ],
        returns: 'returns true if the nitro is currently recharging on the vehicle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleNitroRecharging',
    },
    isVehicleOnGround: {
        summary: 'Checks to see if a vehicle has contact with the ground.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to check.' },
        ],
        returns: 'returns true if vehicle is on the ground, false if it is not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleOnGround',
    },
    isVehicleTaxiLightOn: {
        summary: 'This function will get the taxi light state of a taxi (vehicle IDs 420 and 438)',
        parameters: [
            { name: 'taxi', isOptional: false, isVariadic: false, summary: 'The vehicle element of the taxi that you wish to get the light state of.' },
        ],
        returns: 'returns true if the light is on, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleTaxiLightOn',
    },
    isVehicleWheelOnGround: {
        summary: 'This function returns a boolean whether the vehicles wheel is on ground (true) or in air\n(false).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to check.' },
            { name: 'wheel', isOptional: false, isVariadic: false, summary: 'The wheel name or number, see list below: ** "front_left" or 0 ** "rear_left" or 1 ** "front_right" or 2 ** "rear_right" or 3' },
        ],
        returns: 'returns true if the vehicle wheel is on ground/collided, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleWheelOnGround',
    },
    isVehicleWindowOpen: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to get the window state.' },
            { name: 'window', isOptional: false, isVariadic: false, summary: 'An int|integer representing a vehicle window. It can be: 0 motorbike shield 1 rear window 2 right front window 3 right back window 4 left front (driver) window 5 left back window 6 windshield' },
        ],
        returns: 'this function returns a boolean which represents window open state.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVehicleWindowOpen',
    },
    isVoiceEnabled: {
        summary: 'Added to client side.\nThis function allows you to make the server reveal whether or not voice is currently\nenabled.',
        parameters: [],
        returns: 'returns true if the voice is enabled on the server, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsVoiceEnabled',
    },
    isWaterDrawnLast: {
        summary: 'This function determines whether water is drawn last in the rendering order.',
        parameters: [],
        returns: 'returns true if water is drawn last in the rendering order, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsWaterDrawnLast',
    },
    isWorldSoundEnabled: {
        summary: '',
        parameters: [
            { name: 'group', isOptional: false, isVariadic: false, summary: 'An integer representing the World sound groups|world sound group' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'An integer representing an individual sound within the group' },
        ],
        returns: 'returns true if the world sounds are enabled, false if they are disabled or invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsWorldSoundEnabled',
    },
    isWorldSpecialPropertyEnabled: {
        summary: 'Checks if a special world property (cheat) is enabled or not.',
        parameters: [
            { name: 'propname', isOptional: false, isVariadic: false, summary: 'the name of the property to retrieve. Possible values are listed on SetWorldSpecialPropertyEnabled.' },
        ],
        returns: 'returns true if the property is enabled, false if it is disabled or the specified property name is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsWorldSpecialPropertyEnabled',
    },
    kickPlayer: {
        summary: 'This function will kick the specified player from the server.',
        parameters: [
            { name: 'kickedPlayer', isOptional: false, isVariadic: false, summary: 'The player that will be kicked from the server' },
            { name: 'responsiblePlayer', isOptional: true, isVariadic: false, summary: 'The player that is responsible for the event. Note: If left out as in the second syntax, responsible player for the kick will be Console (Maximum 30 characters if using a string).' },
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'The reason for the kick. (Maximum 64 characters before 1.5.8, Maximum 128 characters after 1.5.8)' },
        ],
        returns: 'returns true if the player was kicked succesfully, false if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/KickPlayer',
    },
    killPed: {
        summary: 'This function kills the specified ped.\nFrom v1.5.3 onwards this function is now available client side. Only works on client side\npeds.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped to kill' },
            { name: 'theKiller', isOptional: true, isVariadic: false, summary: 'The ped responsible for the kill' },
            { name: 'weapon', isOptional: true, isVariadic: false, summary: 'The ID of the weapon or Damage Types that should appear to have killed the ped (doesnt affect how they die)' },
            { name: 'bodyPart', isOptional: true, isVariadic: false, summary: 'The ID of the body part that should appear to have been hit by the weapon (doesnt affect how they die)' },
            { name: 'stealth', isOptional: true, isVariadic: false, summary: 'Boolean value, representing whether or not this a stealth kill' },
        ],
        returns: 'returns true if the ped was killed, false if the ped specified could not be killed or is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/KillPed',
    },
    killTimer: {
        summary: 'This function allows you to kill/halt existing timers.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'The timer you wish to halt.' },
        ],
        returns: 'returns true if the timer was successfully killed, false if no such timer existed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/KillTimer',
    },
    loadBrowserURL: {
        summary: 'This function loads the specified URL.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The Element/Browser|browser element which will load the URL' },
            { name: 'url', isOptional: false, isVariadic: false, summary: 'The url you want to load. It can either contain a remote website (http:// prefix) or a website stored within a local resource (http://mta/local/gui.html for example, see Local_Scheme_Handler|Local Scheme Handler for details).' },
            { name: 'postData', isOptional: true, isVariadic: false, summary: 'The post data passed to the website. Its content type can be any type (e.g. JSON) if urlEncoded is set to false' },
            { name: 'urlEncoded', isOptional: true, isVariadic: false, summary: 'If set to true, it will be available f.e. in PHPs $_POST variable (the content type is: application/x-www-form-urlencoded)' },
        ],
        returns: 'returns true if the url was successfully loaded.',
        wiki: 'https://wiki.multitheftauto.com/wiki/LoadBrowserURL',
    },
    loadMapData: {
        summary: 'This function is intended to load data from a loaded XML file into the element tree. This\ncould be used for loading an external map, or part of another map.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'The node that you wish to load into the element tree.' },
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'The node you wish to be the parent of the new map data.' },
        ],
        returns: 'returns an element object that corresponds to the root of the new data added, i.e. an element that represents the node xmlnode passed to the function. returns false if the arguments are invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/LoadMapData',
    },
    localPlayer: {
        summary: 'The player element of the local player.',
        parameters: [],
        returns: '',
        wiki: '',
    },
    logIn: {
        summary: 'This functions logs the given player in to the given account. You need to provide the\npassword needed to log into that account.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player to log into an account' },
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account to log the player into' },
            { name: 'thePassword', isOptional: false, isVariadic: false, summary: 'The password needed to sign into this account' },
        ],
        returns: 'returns true if the player was successfully logged into the given account. returns false or nil if the log in failed for some reason, ie. the player was already logged in to some account (use logout first), if the account was already in use or if it failed for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/LogIn',
    },
    logOut: {
        summary: 'This function logs the given player out of his current account.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player to log out of his current account' },
        ],
        returns: 'returns true if the player was successfully logged out, false or nil if it failed for some reason, ie. the player was never logged in.',
        wiki: 'https://wiki.multitheftauto.com/wiki/LogOut',
    },
    md5: {
        summary: 'Calculates the MD5 hash of the specified string and returns its hexadecimal\nrepresentation.',
        parameters: [
            { name: 'str', isOptional: false, isVariadic: false, summary: 'the string to hash.' },
        ],
        returns: 'returns the md5 hash of the input string if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Md5',
    },
    moveObject: {
        summary: 'This function will smoothly move an object from its current position to a specified\nrotation and position.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object that will be moved.' },
            { name: 'time', isOptional: false, isVariadic: false, summary: 'the time in milliseconds the object will arrive at the destination.' },
            { name: 'targetx', isOptional: false, isVariadic: false, summary: 'the X value of the target position' },
            { name: 'targety', isOptional: false, isVariadic: false, summary: 'the Y value of the target position' },
            { name: 'targetz', isOptional: false, isVariadic: false, summary: 'the Z value of the target position' },
            { name: 'moverx', isOptional: true, isVariadic: false, summary: 'the rotation along the X axis relative to its current rotation, which is its starting angle.' },
            { name: 'movery', isOptional: true, isVariadic: false, summary: 'the rotation along the Y axis relative to its current rotation, which is its starting angle.' },
            { name: 'moverz', isOptional: true, isVariadic: false, summary: 'the rotation along the Z axis relative to its current rotation, which is its starting angle.' },
            { name: 'strEasingType', isOptional: true, isVariadic: false, summary: 'the Easing|easing function to use for the interpolation (default is Linear)' },
            { name: 'fEasingPeriod', isOptional: true, isVariadic: false, summary: 'the period of the Easing|easing function (only some easing functions use this parameter)' },
            { name: 'fEasingAmplitude', isOptional: true, isVariadic: false, summary: 'the amplitude of the Easing|easing function (only some easing functions use this parameter)' },
            { name: 'fEasingOvershoot', isOptional: true, isVariadic: false, summary: 'the overshoot of the Easing|easing function (only some easing functions use this parameter)' },
        ],
        returns: '* true if the function moved the object succesfully. * false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/MoveObject',
    },
    navigateBrowserBack: {
        summary: 'Returns the browser to the previous page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser that you want return to the previous page.' },
        ],
        returns: 'returns true if the browser has returned to the previous page, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/NavigateBrowserBack',
    },
    navigateBrowserForward: {
        summary: 'This function takes the browser to the next page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser that you want to take to the next page.' },
        ],
        returns: 'returns true if the browser has gone to the next page, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/NavigateBrowserForward',
    },
    outputChatBox: {
        summary: 'This outputs the specified text string to the chatbox. It can be specified as a message\nto certain player(s) or all players.\nIt can optionally allow you to embed color changes into the string by setting the\ncolorCoded boolean to true. This allows:\n```lua\noutputChatBox ( #FF0000Hello #00FF00World, root, 255, 255, 255, true )\n```\nThis will display as: Hello World',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The text string that you wish to send to the chat window. If more than 256 characters it will not be showed in chat.' },
            { name: 'visibleTo', isOptional: true, isVariadic: false, summary: 'Can also be a table of players or team.' },
            { name: 'r', isOptional: true, isVariadic: false, summary: 'The amount of red in the color of the text. Default value is 231.' },
            { name: 'g', isOptional: true, isVariadic: false, summary: 'The amount of green in the color of the text. Default value is 217.' },
            { name: 'b', isOptional: true, isVariadic: false, summary: 'The amount of blue in the color of the text. Default value is 176.' },
            { name: 'colorCoded', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether or not #RRGGBB tags should be used. Note: The #RRGGBB format must contain capital letters a-f is not acceptable but A-F is. Default RGB values in this format are: \'#E7D9B0\'.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OutputChatBox',
    },
    outputConsole: {
        summary: 'This outputs the specified text string to the console window (accessed with F8 or ~ key).\nIt can be specified as a message to certain player(s) or all players.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The text string that you wish to send to the console window' },
            { name: 'visibleTo', isOptional: true, isVariadic: false, summary: 'This specifies who the chat is visible to. Any players in this element will see the chat message. See visibility.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OutputConsole',
    },
    outputDebugString: {
        summary: 'This function outputs scripting debug messages, which can be read by enabling the debug\ntextbox. The debug display level can then be set so that info or warning messages get\nfiltered out.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'the text to be output to the debug box.' },
            { name: 'level', isOptional: true, isVariadic: false, summary: 'the debug message level. Possible values are: 0 Custom message 1 Error message 2 Warning message 3 Information message (default) 4 Custom message (omits file path and line number)' },
            { name: 'red', isOptional: true, isVariadic: false, summary: 'The amount of red in the color of the text. Default value is 255.' },
            { name: 'green', isOptional: true, isVariadic: false, summary: 'The amount of green in the color of the text. Default value is 255.' },
            { name: 'blue', isOptional: true, isVariadic: false, summary: 'The amount of blue in the color of the text. Default value is 255.' },
        ],
        returns: 'returns true if the debug message was successfully output, false if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OutputDebugString',
    },
    outputServerLog: {
        summary: 'This outputs a line of text to the servers log. This could be useful for debugging.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The text to be output to the log.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OutputServerLog',
    },
};
