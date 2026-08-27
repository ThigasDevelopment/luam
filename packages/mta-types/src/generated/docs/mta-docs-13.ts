import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_13: ApiDocumentationCatalog = {
    fxAddTankFire: {
        summary: 'This function creates a tank firing particle effect.',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirZ', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddTankFire',
    },
    fxAddTyreBurst: {
        summary: 'Creates a tyre burst particle effect (a small white smoke puff).',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirZ', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddTyreBurst',
    },
    fxAddWaterHydrant: {
        summary: 'This function creates a water hydrant particle effect.',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'A float representing the **x** position of the hydrant' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'A float representing the **y** position of the hydrant' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: 'A float representing the **z** position of the hydrant' },
        ],
        returns: 'Returns a true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddWaterHydrant',
    },
    fxAddWaterSplash: {
        summary: 'This function creates a water splash particle effect.',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'A float representing the **x** position of the splash' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'A float representing the **y** position of the splash' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: 'A float representing the **z** position of the splash' },
        ],
        returns: 'Returns a true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddWaterSplash',
    },
    fxAddWood: {
        summary: 'Creates a wood splinter particle effect.',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'count', isOptional: true, isVariadic: false, summary: 'the number of splinters to create.' },
            { name: 'brightness', isOptional: true, isVariadic: false, summary: 'the brightness. Ranges from 0 (black) to 1 (normal color).' },
        ],
        returns: 'Returns a true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddWood',
    },
    fxCreateParticle: {
        summary: 'Creates the given particles of the specified color. Can be useful for creating flares, toxic fumes, reward effects, etc.',
        parameters: [
            { name: 'particle', isOptional: false, isVariadic: false, summary: 'The name of the particle to create. See particles list.' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'r', isOptional: false, isVariadic: false, summary: '' },
            { name: 'g', isOptional: false, isVariadic: false, summary: '' },
            { name: 'b', isOptional: false, isVariadic: false, summary: '' },
            { name: 'a', isOptional: false, isVariadic: false, summary: '' },
            { name: 'randomizeColors', isOptional: true, isVariadic: false, summary: 'Specifies whether the color should be fixed (r,g,b) or randomly calculated for each particle based on the given color. This allows to create colorful effects.' },
            { name: 'count', isOptional: true, isVariadic: false, summary: 'the number of flying particles to create. Depending on the particle, a very large count may cause the game to lag or freeze (50k+).' },
            { name: 'brightness', isOptional: true, isVariadic: false, summary: 'the brightness. Ranges from 0 (almost black) to 1 (normal color).' },
            { name: 'size', isOptional: true, isVariadic: false, summary: 'Particles size. If *randomSizes* is set then when 0 is specified the minimum size is 0.3.' },
            { name: 'randomSizes', isOptional: true, isVariadic: false, summary: 'Specifies whether all particles should be the same fixed size or each particle should have a random size.' },
            { name: 'life', isOptional: true, isVariadic: false, summary: 'the higher this value, the longer the particles survive before they disappear. This parameter may be ignored by some particles.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxCreateParticle',
    },
    generateKeyPair: {
        summary: 'This function creates a new public key and private key for encrypting data',
        parameters: [
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: 'The algorithm to use:' },
            { name: 'options', isOptional: false, isVariadic: false, summary: 'table with options for the hashing algorithm, as detailed below.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'providing a callback will run this function asynchronously, the arguments to the callback are the same as the returned values below.' },
        ],
        returns: 'Returns 2 strings if successful: **private key** and **public key**. Otherwise returns **false**',
        wiki: 'https://wiki.multitheftauto.com/wiki/GenerateKeyPair',
    },
    get: {
        summary: 'This function gets a setting\'s value, or a group of settings\' values, from the settings registry.',
        parameters: [
            { name: 'settingName', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns the value of the setting if a single setting was specified and found, or a *table* (in associative-array form) containing: *the list of global setting name/value pairs if "." is passed as a setting name, *the list of resource settings if a resource name followed by a "." is passed, *the list of the script\'s resource settings if an empty string is passed. It returns *false* if the specified setting or settings group doesn\'t exist, or if the settings group you are trying to retrieve doesn\'t have any public or protected settings.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Get',
    },
    getAccount: {
        summary: 'This function returns an account for a specific user.',
        parameters: [
            { name: 'username', isOptional: false, isVariadic: false, summary: 'The username of the account you want to retrieve' },
            { name: 'password', isOptional: true, isVariadic: false, summary: 'The password for the account. If this argument is not specified, you can get the account whatever password it is, otherwise the password must match the account\'s.' },
            { name: 'caseSensitive', isOptional: true, isVariadic: false, summary: 'Specifies whether to ignore the case when searching for an account.' },
        ],
        returns: 'Returns an account or *false* if an account matching the username specified (and password, if specified) could not be found.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccount',
    },
    getAccountByID: {
        summary: 'This function returns the account with the specific ID.',
        parameters: [
            { name: 'id', isOptional: false, isVariadic: false, summary: 'The ID to get account from' },
        ],
        returns: 'Returns *account* associated with specified ID. Returns *false* if invalid arguments were specified or there is no account with this ID.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountByID',
    },
    getAccountData: {
        summary: 'This function retrieves a string that has been stored using setAccountData. Data stored as account data is persistent across user\'s sessions and maps, unless they are logged into a guest account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to retrieve the data from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key under which the data is stored' },
        ],
        returns: 'Returns a string containing the stored data or *false* if no data was stored under that key.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountData',
    },
    getAccountID: {
        summary: 'This function retrieves the ID of an account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to get the ID of.' },
        ],
        returns: 'Returns a int containing the account\'s ID, *false* if the account does not exist or an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountID',
    },
    getAccountIP: {
        summary: 'This function retrieves the IP address of an account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to get the IP of.' },
        ],
        returns: 'Returns a string containing the account\'s IP, *false* if the account does not exist or an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountIP',
    },
    getAccountName: {
        summary: 'This function retrieves the name of an account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to get the name of.' },
        ],
        returns: 'Returns a string containing the account\'s name, *false* if the account does not exist or an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountName',
    },
    getAccountPlayer: {
        summary: 'This function returns the player element that is currently using a specified account, i.e. is logged into it. Only one player can use an account at a time.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to get the player of.' },
        ],
        returns: 'Returns a player element if the account is currently in use, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountPlayer',
    },
    getAccounts: {
        summary: 'This function returns a table over all the accounts that exist in the server internal.db file. (Note: accounts.xml is no longer used after version 1.0.4)',
        parameters: [],
        returns: 'A table over the accounts that exist in the server internal.db file. This table might be empty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccounts',
    },
    getAccountsByData: {
        summary: 'This function returns a table containing all accounts with specified dataName and value (set with setAccountData).',
        parameters: [
            { name: 'dataName', isOptional: false, isVariadic: false, summary: 'The name of the data' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value the dataName should have' },
        ],
        returns: 'Returns *table* containing the accounts associated with specified value at dataName. Returns *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountsByData',
    },
    getAccountsByIP: {
        summary: 'This function returns a table containing all accounts that were logged onto from specified IP-address.',
        parameters: [
            { name: 'ip', isOptional: false, isVariadic: false, summary: 'The IP to get accounts from.' },
        ],
        returns: 'Returns *table* containing the accounts associated with specified IP-address. Returns *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountsByIP',
    },
    getAccountsBySerial: {
        summary: 'This function returns a table containing all accounts that were logged onto from specified serial. If the serial is empty string, it will return all accounts that were never logged onto.',
        parameters: [
            { name: 'serial', isOptional: false, isVariadic: false, summary: 'The serial to get accounts from' },
        ],
        returns: 'Returns *table* containing the accounts associated with specified serial. Returns *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountsBySerial',
    },
    getAccountSerial: {
        summary: 'This function returns the last serial that logged onto the specified account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account to get serial from' },
        ],
        returns: 'Returns *string* containing the serial, the string is empty if the account was never used. Returns *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountSerial',
    },
    getAccountType: {
        summary: 'This function returns an account type.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'An account you want to get info from' },
        ],
        returns: 'Returns *string* containing the type of the account if the account is valid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAccountType',
    },
    getAircraftMaxHeight: {
        summary: 'This function gets the maximum height at which aircraft can fly without their engines turning off.',
        parameters: [],
        returns: 'Returns a float containing the max aircraft height.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAircraftMaxHeight',
    },
    getAircraftMaxVelocity: {
        summary: 'This function returns the maximum velocity at which aircrafts could fly. Using this function server-side will return the server-side value, not necessarily the same that is set client-side.',
        parameters: [],
        returns: 'Returns a float being the max velocity that is currently set, depending on which side it is used.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAircraftMaxVelocity',
    },
    getAlivePlayers: {
        summary: 'This function returns a table of all the alive players on the server. Opposite function of getDeadPlayers.',
        parameters: [],
        returns: 'Returns a table of all the alive players.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAlivePlayers',
    },
    getAllAccountData: {
        summary: 'This function returns a table containing all the user data for the account provided',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to retrieve all data from.' },
        ],
        returns: 'A table containing all the user data. This table might be empty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetAllAccountData',
    },
};
