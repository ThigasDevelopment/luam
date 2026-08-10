import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_12: ApiDocumentationCatalog = {
    getAccountsByData: {
        summary: 'This function returns a table containing all accounts with specified dataName and value\n(set with setAccountData).',
        parameters: [
            { name: 'dataName', isOptional: false, isVariadic: false, summary: 'The name of the data' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value the dataName should have' },
        ],
        returns: 'returns table containing the accounts associated with specified value at dataname. returns false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountsByData',
    },
    getAccountsByIP: {
        summary: '',
        parameters: [
            { name: 'ip', isOptional: false, isVariadic: false, summary: 'The IP to get accounts from.' },
        ],
        returns: 'returns table containing the accounts associated with specified ip-address. returns false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountsByIP',
    },
    getAccountsBySerial: {
        summary: 'This function returns a table containing all accounts that were logged onto from\nspecified serial. If the serial is empty string, it will return all accounts that were\nnever logged onto.',
        parameters: [
            { name: 'serial', isOptional: false, isVariadic: false, summary: 'The serial to get accounts from' },
        ],
        returns: 'returns table containing the accounts associated with specified serial. returns false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountsBySerial',
    },
    getAccountSerial: {
        summary: 'This function returns the last serial that logged onto the specified account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account to get serial from' },
        ],
        returns: 'returns string containing the serial, the string is empty if the account was never used. returns false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountSerial',
    },
    getAircraftMaxHeight: {
        summary: 'This function gets the maximum height at which aircraft can fly without their engines\nturning off.',
        parameters: [],
        returns: 'returns a float containing the max aircraft height.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAircraftMaxHeight',
    },
    getAircraftMaxVelocity: {
        summary: 'This function returns the maximum velocity at which aircrafts could fly. Using this\nfunction server-side will return the server-side value, not necessarily the same that is\nset client-side.',
        parameters: [],
        returns: 'returns a float being the max velocity that is currently set, depending on which side it is used.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAircraftMaxVelocity',
    },
    getAlivePlayers: {
        summary: 'This function returns a table of all the alive players on the server. Opposite function\nof getDeadPlayers.',
        parameters: [],
        returns: 'returns a table of all the alive players.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAlivePlayers',
    },
    getAllAccountData: {
        summary: 'This function returns a table containing all the user data for the account provided',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to retrieve all data from.' },
        ],
        returns: 'a table containing all the user data. this table might be empty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAllAccountData',
    },
    getAllElementData: {
        summary: 'Returns a table of all element data of an element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element you want to get the element data of.' },
        ],
        returns: 'if successful, returns a table with as keys the names of the element data and as values the corresponding element data values. returns false in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAllElementData',
    },
    getAnalogControlState: {
        summary: 'This retrieves the analog control state of a control.  This is useful for detecting\nsensitive controls, such as those used on a joypad.\nTo get the analog control state for a ped, please use getPedAnalogControlState.',
        parameters: [
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to get the state of. See control names for a list of possible controls.' },
            { name: 'rawValue', isOptional: true, isVariadic: false, summary: 'A bool indicating if it should return the raw player input value.' },
        ],
        returns: 'returns a float between 0 and 1 indicating the amount the control is pressed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAnalogControlState',
    },
    getAttachedElements: {
        summary: 'This function returns a table of all the elements attached to the specified element',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element which you require the information from.' },
        ],
        returns: 'returns a table of all the elements attached to the specified element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAttachedElements',
    },
    getBanAdmin: {
        summary: 'This function will return the responsible admin (nickname of the admin) of the specified\nban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to return the admin of.' },
        ],
        returns: 'returns a string of the admin if everything was successful, false if invalid arguments are specified if there was no admin specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanAdmin',
    },
    getBanIP: {
        summary: 'This function will return the IP of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban in which you want to return the IP of.' },
        ],
        returns: 'returns a string of the ip if everything was successful, false if invalid arguments are specified if there was no ip specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanIP',
    },
    getBanNick: {
        summary: 'This function will return the nickname (nickname that the player had when he was banned)\nof the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban element which nickname you want to return.' },
        ],
        returns: 'returns a string of the nickname if everything was successfull, false if invalid arguments are specified if there was no nickname specified for the ban element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanNick',
    },
    getBanReason: {
        summary: 'This function will return the ban reason of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban in which you want to return the reason of.' },
        ],
        returns: 'returns a string of the reason if everything was successful, false if invalid arguments are specified if there was no reason specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanReason',
    },
    getBans: {
        summary: 'This function will return a table containing all the bans present in the servers\nbanlist.xml.',
        parameters: [],
        returns: 'returns a table containing all the bans.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBans',
    },
    getBanSerial: {
        summary: 'This function will return the serial of the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to retrieve the serial of.' },
        ],
        returns: 'returns a string of the serial if everything was successful, false if invalid arguments are specified or if there was no serial specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBanSerial',
    },
    getBanTime: {
        summary: 'This function will return the time the specified ban was created, in seconds.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban of which you wish to retrieve the time of.' },
        ],
        returns: '* returns an integer of the banning time in the format of seconds from the year 1970. use in conjunction with getrealtime in order to retrieve detailed information. * returns false if invalid arguments were specified or if there was no banning time specified for the ban.',
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
        returns: 'returns true if the birds are enabled or false if the birds are disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBirdsEnabled',
    },
    getBlipColor: {
        summary: 'This function will tell you what color a blip is. This color is only applicable to the\ndefault blip icon (Image:Blipid0s.png|12px, Image:Blipid0u.png|12px or\nImage:Blipid0d.png|12px). All other icons will ignore this.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip whose color you wish to get.' },
        ],
        returns: 'returns four integers in rgba format, with a maximum value of 255 for each. the values are, in order, red, green, blue, and alpha. alpha decides the transparancy where 255 is opaque and 0 is fully transparent. false is returned if the blip is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipColor',
    },
    getBlipIcon: {
        summary: 'This function returns the icon a blip currently has.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: ': the blip were getting the icon number of.' },
        ],
        returns: 'returns an int indicating which icon the blip has. valid values are listed on the radar blips page.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipIcon',
    },
    getBlipOrdering: {
        summary: 'This function gets the Z ordering value of a blip. The Z ordering determines if a blip\nappears on top of or below other blips. Blips with a higher Z ordering value appear on\ntop of blips with a lower value. The default value for all blips is 0.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'the blip to retrieve the Z ordering value of.' },
        ],
        returns: 'returns the z ordering value of the blip if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipOrdering',
    },
    getBlipSize: {
        summary: 'This function gets the size of a blip..',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip you wish to get the size of.' },
        ],
        returns: 'returns an int indicating the size of the blip. the default value is 2. the maximum value is 25.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBlipSize',
    },
    getBlipVisibleDistance: {
        summary: 'This function will tell you what visible distance a blip has.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip whose visible distance you wish to get.' },
        ],
        returns: 'returns one float with the blips visible distance, false if the blip is invalid.',
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
            { name: 'bodyPartID', isOptional: false, isVariadic: false, summary: ': An integer representing the body part ID you wish to retrieve the name of.' },
        ],
        returns: 'this function returns a string containing the body part name if the id is valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBodyPartName',
    },
    getBoundKeys: {
        summary: 'Returns a list of key names that are bound to the specified game Control names|control or\nconsole command.',
        parameters: [
            { name: 'command_control', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'if one or more keys are bound to the specified control or console command, a table is returned indexed by the names of the keys and containing key states as values. if no keys are bound or an invalid name was passed, returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBoundKeys',
    },
    getBrowserProperty: {
        summary: 'This function gets a given property of a specified browser.',
        parameters: [
            { name: 'theBrowser', isOptional: false, isVariadic: false, summary: 'browser element to get the property value of' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The browser property key. It can be: mobile Surfing the web as mobile' },
        ],
        returns: 'returns the value if the property was successfully found, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserProperty',
    },
    getBrowserSettings: {
        summary: 'This function returns a table containing the browser settings.',
        parameters: [],
        returns: 'a table having the following keys: * remoteenabled: true if remote websites are enabled, false otherwise * remotejavascript: true if javascript is enabled on remote websites, false otherwise * pluginsenabled: true if plugins such as flash, silverlight (but not java) are enabled, false otherwise. this setting is false by default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserSettings',
    },
    getBrowserSource: {
        summary: 'This function can be used to retrieve the source code of a website (asynchronously). The\nsize of the source code is limited to 2 MiB (remaining bytes are cut).',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser element you want to get the source of' },
            { name: 'callback', isOptional: false, isVariadic: false, summary: 'a callback function with syntax as described below ```lua function ( string code ) ```' },
        ],
        returns: 'returns true if valid arguments have been passed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserSource',
    },
};
