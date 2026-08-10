import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_34: ApiDocumentationCatalog = {
    passwordHash: {
        summary: 'This function creates a new password hash using a specified hashing algorithm.',
        parameters: [
            { name: 'password', isOptional: false, isVariadic: false, summary: 'The password to hash.' },
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: 'The algorithm to use: bcrypt : use the bcrypt hashing algorithm. Hash length: 60 characters. Note that only the prefix $2y$ is supported (older prefixes can cause security issues).' },
            { name: 'options', isOptional: false, isVariadic: false, summary: 'table with options for the hashing algorithm, as detailed below.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'providing a callback will run this function asynchronously, the arguments to the callback are the same as the returned values below.' },
        ],
        returns: 'returns the hash as a string if hashing was successful, false otherwise. if a callback was provided, the aforementioned values are arguments to the callback, and this function will always return true.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PasswordHash',
    },
    passwordVerify: {
        summary: 'This function verifies whether a password matches a password hash.',
        parameters: [
            { name: 'password', isOptional: false, isVariadic: false, summary: 'The password to check.' },
            { name: 'hash', isOptional: false, isVariadic: false, summary: 'A supported hash (see passwordHash). Note that only the prefix $2y$ is supported for type bcrypt (older prefixes can cause security issues).' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'advanced options insecureBcrypt If set to true, you can use the $2a$ prefix for bcrypt hashes as well. It is strongly not recommended to use it though, because the underlying implementation has a bug that leads to such hashes being relatively easy to crack. This bug was fixed for $2y$.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'providing a callback will run this function asynchronously, the arguments to the callback are the same as the returned values below. |11281' },
        ],
        returns: 'returns true if the password matches the hash. returns false if the password does not match, or if an unknown hash was passed. if a callback was provided, the aforementioned values are arguments to the callback, and this function will always return true.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PasswordVerify',
    },
    playSFX: {
        summary: 'This function plays a sound from GTAs big sound containers.\nIn case of these invalid audio files, this function returns false.\nIt also returns false when trying to play a track deleted in the recent GTA: SA Steam\npatches (and if the client is using a Steam GTA: SA copy).|true',
        parameters: [
            { name: 'containerName', isOptional: false, isVariadic: false, summary: 'The name of the audio container. Possible values are: feet, genrl, pain_a, script, spc_ea, spc_fa, spc_ga, spc_na, spc_pa' },
            { name: 'bankId', isOptional: false, isVariadic: false, summary: 'The audio bank id' },
            { name: 'soundId', isOptional: false, isVariadic: false, summary: 'The sound id within the audio bank' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'A boolean representing whether the sound will be looped' },
        ],
        returns: 'returns a sound element if the sound was successfully created, false otherwise. ```lua element playsfx ( string radio, string radiostation, int trackid , bool looped = false ) ``` *radio: the string radio (used to differentiate to the first syntax) *radiostation: the radio station. possible values are adverts, ambience, police, playback fm, k-rose, k-dst, cutscene, beats, bounce fm, sf-ur, radio los santos, radio x, csr 103.9, k-jah west, master sounds 98.3, wctr. *trackid : the radio track id within the radio station audio file *looped: a boolean representing whether the sound will be looped returns a sound element if the sound was successfully created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySFX',
    },
    playSFX3D: {
        summary: 'This function plays a sound in the GTA world from GTAs big sound containers.\nIn case of these invalid audio files, this function returns false.\nIt also returns false when trying to play a track deleted in the recent GTA: SA Steam\npatches (and if the client is using a Steam GTA: SA copy).|true',
        parameters: [
            { name: 'containerName', isOptional: false, isVariadic: false, summary: 'The name of the audio container. Possible values are: feet, genrl, pain_a, script, spc_ea, spc_fa, spc_ga, spc_na, spc_pa' },
            { name: 'bankId', isOptional: false, isVariadic: false, summary: 'The audio bank id' },
            { name: 'soundId', isOptional: false, isVariadic: false, summary: 'The sound id within the audio bank' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'A boolean representing whether the sound will be looped' },
        ],
        returns: 'returns a sound element if the sound was successfully created, false otherwise. ```lua element playsfx3d( string radio, string radiostation, int trackid, float x, float y, float z , bool looped = false ) ``` *radio: the string radio (used to differentiate to the first syntax) *radiostation: the radio station. possible values are adverts, ambience, police, playback fm, k-rose, k-dst, cutscene, beats, bounce fm, sf-ur, radio los santos, radio x, csr 103.9, k-jah west, master sounds 98.3, wctr. *trackid : the radio track id within the radio station audio file *x: a floating point number representing the x coordinate on the map. *y: a floating point number representing the y coordinate on the map. *z: a floating point number representing the z coordinate on the map. *looped: a boolean representing whether the sound will be looped returns a sound element if the sound was successfully created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySFX3D',
    },
    playSound: {
        summary: 'Creates a sound element and plays it immediately after creation for the local player.\n*The only supported audio formats are MP3, WAV, OGG, FLAC, RIFF, MOD, WEBM, XM, IT, S3M\nand PLS (e.g. Webstream).\n*For performance reasons, when using playSound for effects that will be played lots (i.e.\nweapon fire), it is recommend that you convert your audio file to a one channel (mono)\nWAV with sample rate of 22050 Hz or less. Also consider adding a limit on how often the\neffect can be played e.g. once every 50ms.',
        parameters: [
            { name: 'soundPath', isOptional: false, isVariadic: false, summary: 'filepath, raw data or URL (http://, https:// or ftp://) of the sound file you want to play. (Note: Playing sound files from other resources requires the target resource to be in the running state)' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be looped. To loop the sound, use true. Loop is not available for streaming sounds, only for sound files.' },
            { name: 'throttled', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be throttled (i.e. given reduced download bandwidth). To throttle the sound, use true. Sounds will be throttled per default and only for URLs.' },
        ],
        returns: 'returns a sound element if the sound was successfully created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySound',
    },
    playSound3D: {
        summary: 'Creates a sound element in the GTA world and plays it immediately after creation for the\nlocal player. setElementPosition can be used to move the sound element around after it\nhas been created. Remember to use setElementDimension after creating the sound to play it\noutside of dimension 0.\n*The only supported audio formats are MP3, WAV, OGG, RIFF, MOD, WEBM, XM, IT and S3M.\n*For performance reasons, when using playSound3D for effects that will be played lots\n(i.e. weapon fire), it is recommend that you convert your audio file to a one channel\n(mono) WAV with sample rate of 22050 Hz or less. Also consider adding a limit on how\noften the effect can be played e.g. once every 50ms.',
        parameters: [
            { name: 'soundPath', isOptional: false, isVariadic: false, summary: 'raw data or filepath to the sound file you want to play. (Note: Playing sound files from other resources requires the target resource to be in the running state) soundURL the URL (http://, https:// or ftp://) of the sound file you want to play. (In this version the file does not have to be predefined in the meta.xml)' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'a floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'a floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'a floating point number representing the Z coordinate on the map.' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be looped. To loop the sound, use true. throttled a boolean representing whether the sound will be throttled (i.e. given reduced download bandwidth). To throttle the sound, use true.' },
        ],
        returns: 'returns a sound element if the sound was successfully created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySound3D',
    },
    playSoundFrontEnd: {
        summary: 'This function plays a frontend sound for the specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you want the sound to play for.' },
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a whole int specifying the sound id to play. Valid values are:' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySoundFrontEnd',
    },
    pregFind: {
        summary: 'This function stops at the first occurrence of the pattern in the input string and\nreturns the result of the search.',
        parameters: [
            { name: 'subject', isOptional: false, isVariadic: false, summary: 'The input string' },
            { name: 'pattern', isOptional: false, isVariadic: false, summary: 'The pattern string to search for in the input string.' },
            { name: 'flags', isOptional: true, isVariadic: false, summary: 'Conjuncted value that contains flags ( 1 - ignorecase, 2 - multiline, 4 - dotall, 8 - extended, 16 - unicode ) or ( i - Ignore case, m - Multiline, d - Dotall, e - Extended, u - Unicode )' },
        ],
        returns: 'returns true if the pattern was found in the input string, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PregFind',
    },
    pregMatch: {
        summary: 'This function returns all matches.',
        parameters: [
            { name: 'base', isOptional: false, isVariadic: false, summary: 'The base string for replace.' },
            { name: 'pattern', isOptional: false, isVariadic: false, summary: 'The pattern for match in base string.' },
            { name: 'flags', isOptional: true, isVariadic: false, summary: 'Conjuncted value that contains flags ( 1 - ignorecase, 2 - multiline, 4 - dotall, 8 - extended, 16 - unicode ) or ( i - Ignore case, m - Multiline, d - Dotall, e - Extended, u - Unicode )' },
            { name: 'maxResults', isOptional: true, isVariadic: false, summary: 'Maximum number of results to return' },
        ],
        returns: 'returns a table if one or more match is found, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PregMatch',
    },
    pregReplace: {
        summary: 'This function performs a regular expression search and replace and returns the replaced\nstring.',
        parameters: [
            { name: 'subject', isOptional: false, isVariadic: false, summary: 'The input string.' },
            { name: 'pattern', isOptional: false, isVariadic: false, summary: 'The pattern string to search for in the input string.' },
            { name: 'replacement', isOptional: false, isVariadic: false, summary: 'The replacement string to replace all matches within the input string.' },
            { name: 'flags', isOptional: true, isVariadic: false, summary: 'Conjuncted value that contains flags ( 1 - ignorecase, 2 - multiline, 4 - dotall, 8 - extended, 16 - unicode ) or ( i - Ignore case, m - Multiline, d - Dotall, e - Extended, u - Unicode )' },
        ],
        returns: 'returns the replaced string, or bool false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PregReplace',
    },
    processLineOfSight: {
        summary: 'This function casts a ray between two points in the world, and tells you information\nabout the point that was hit, if any. The two positions must be within the local players\ndraw distance as the collision data is not loaded outside this area, and the call will\njust fail as if the ray didnt hit.\nThis function is relatively expensive to call, so over use of this in scripts may have a\ndetrimental effect on performance.\nThis function is useful for checking for collisions and for editor-style scripts. If you\nwish to find what element is positioned at a particular point on the screen, use this\nfunction combined with getWorldFromScreenPosition. If you wish to just know if something\nis hit, and dont care about what or where was hit, use isLineOfSightClear.',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'The start x position' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'The start y position' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'The start z position' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: 'The end x position' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: 'The end y position' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: 'The end z position' },
            { name: 'checkBuildings', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTAs internally placed buildings, i.e. the world map.' },
            { name: 'checkVehicles', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by Vehicle|vehicles.' },
            { name: 'checkPlayers', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by Player|players.' },
            { name: 'checkObjects', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by Object|objects.' },
            { name: 'checkDummies', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTAs internal dummies. These are not used in the current MTA version so this argument can be set to false.' },
            { name: 'seeThroughStuff', isOptional: true, isVariadic: false, summary: 'Allow the line of sight pass through collision materials that have this flag enabled (By default material IDs 52, 55 and 66 which are some fences that you can shoot throug but still walk on them).' },
            { name: 'ignoreSomeObjectsForCamera', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to pass through objects that have (K) property enabled in object.dat data file. (i.e. Most dynamic objects like boxes or barrels)' },
            { name: 'shootThroughStuff', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to pass through collision materials that have this flag enabled (By default material IDs 28, 29, 31, 32, 33, 74, 75, 76, 77, 78, 79, 96, 97, 98, 99, 100 which are exclusively sand / beach or underwater objects).' },
            { name: 'ignoredElement', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to pass through a certain specified element. This is usually set to the object you are tracing from so it does not interfere with the results.' },
            { name: 'includeWorldModelInformation', isOptional: true, isVariadic: false, summary: 'Include the results of hitting a world model.' },
            { name: 'bIncludeCarTyres', isOptional: true, isVariadic: false, summary: 'Includes car tyre hits.' },
        ],
        returns: '*hit: true if there is a collision, false otherwise the other values are only filled if there is a collision, they contain nil otherwise *hitx, hity, hitz: collision position *hitelement: the mta element hit if any, nil otherwise *normalx, normaly, normalz: the normal of the surface hit *material: an integer representing the material ids|gtasa material id of the surface hit when applicable (world, objects) *lighting: a float between 0 (fully dark) and 1 (bright) representing the amount of light that the hit building surface will transfer to peds or vehicles that are in contact with it. the value can be affected by the game time of day, usually with a lower (darker) value being returned during the night. *piece: an integer representing the part of the element hit if hitelement is a vehicle or a ped/player, 0 otherwise. **for a ped/player, piece represents the body part hit: **for vehicles, piece represents the vehicle part hit: *worldmodelid: if includeworldmodelinformation was set to true and a world model was hit, this will contain the model id. *worldmodelpositionx,y,z: if worldmodelid is set, this will contain the world model position. *worldmodelrotationx,y,z: if worldmodelid is set, this will contain the world model rotation. *worldlodmodelid: if worldmodelid is set, this will contain the lod model id if applicable.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ProcessLineOfSight',
    },
    redirectPlayer: {
        summary: 'This function redirects the player to a specified server.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you want to redirect' },
            { name: 'serverIP', isOptional: false, isVariadic: false, summary: 'The IP address (or domain name that resolves to the IP address) of the server you want to redirect the player to. Use an empty string to reconnect to the same server.' },
            { name: 'serverPort', isOptional: false, isVariadic: false, summary: 'The game port of the server you want to redirect the player to, this is usually 22003. Set to zero to use the same port as the current server.' },
            { name: 'serverPassword', isOptional: true, isVariadic: false, summary: 'The password for the server if its protected' },
        ],
        returns: 'returns true if the player was redirected successfully, false if bad arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RedirectPlayer',
    },
    ref: {
        summary: 'This function will create a reference to the given argument.',
        parameters: [
            { name: 'objectToReference', isOptional: false, isVariadic: false, summary: 'The Lua element, which you want to reference' },
        ],
        returns: 'returns an int if the reference were successfully created. returns false if the parameter were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Ref',
    },
    refreshResources: {
        summary: 'This function finds new resources and checks for changes to the current ones.',
        parameters: [
            { name: 'refreshAll', isOptional: true, isVariadic: false, summary: ': If true MTA will check for changes in all resources. If false, MTA will only check for new resources and try to reload resources with errors' },
            { name: 'targetResource', isOptional: true, isVariadic: false, summary: ': If set, the refresh is restricted to the supplied resource only **Note:** Checking for changes in all resources can result in lag for a short period of time. It should generally be avoided to set refreshAll to \'\'true\'\'.' },
        ],
        returns: 'returns true if refresh was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RefreshResources',
    },
    reloadBans: {
        summary: 'This function will reload the server ban list file.',
        parameters: [],
        returns: 'returns true if the ban list was reloaded successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ReloadBans',
    },
    reloadBrowserPage: {
        summary: 'This function reloads the current browsers page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser that you want to reload.' },
        ],
        returns: 'returns true if the browser has reloaded, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ReloadBrowserPage',
    },
    reloadPedWeapon: {
        summary: 'This function makes a pedestrian reload their weapon.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped who will reload their weapon.' },
        ],
        returns: 'returns true if the pedestrian was made to reload, or false if invalid arguments were passed or that pedestrian has a weapon which cannot be reloaded. note: this will fail but return true if 1) the ped is crouched and moving 2) the ped is using a weapon without clip ammo (or minigun/flamethrower/fire extinguisher) 3) the ped is using his weapon (shooting/aiming) 4) the ped moved while crouching recently due to these circumstances causing problems with this function',
        wiki: 'https://wiki.multitheftauto.com/wiki/ReloadPedWeapon',
    },
    removeAccount: {
        summary: 'This function is used to delete existing player accounts.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to remove' },
        ],
        returns: 'returns true if account was successfully removed, false if the account does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveAccount',
    },
    removeBan: {
        summary: 'This function will remove a specific ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban to be removed.' },
            { name: 'responsibleElement', isOptional: true, isVariadic: false, summary: 'The element that is responsible for removing the ban element. This can be a player or the root (getRootElement()).' },
        ],
        returns: 'returns true if the ban was removed succesfully, false if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveBan',
    },
    removeColPolygonPoint: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to remove a point from.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'The index of the point you wish to remove. The points are indexed in order, with 1 being the first bound point. You cant remove the last 3 points.' },
        ],
        returns: 'returns true if the polygon was changed, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveColPolygonPoint',
    },
    removeCommandHandler: {
        summary: 'This function removes a command handler, that is one that has been added using\naddCommandHandler. This function can only remove command handlers that were added by the\nresource that it is called in.',
        parameters: [
            { name: 'commandName', isOptional: false, isVariadic: false, summary: 'the name of the command you wish to remove.' },
            { name: 'handler', isOptional: true, isVariadic: false, summary: 'the specific handler function to remove. If not specified, all handler functions for the command (from the calling resource) will be removed. This argument is only available in the server.' },
        ],
        returns: 'returns true if the command handler was removed successfully, false if the command doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveCommandHandler',
    },
    removeDebugHook: {
        summary: 'This function removes hooks added by addDebugHook',
        parameters: [
            { name: 'hookType', isOptional: false, isVariadic: false, summary: 'The type of hook to remove. This can be: ** preEvent ** postEvent ** preFunction ** postFunction' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'The callback function to remove' },
        ],
        returns: 'returns true if the hook was successfully removed, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveDebugHook',
    },
    removeElementData: {
        summary: 'This function removes the element data with the given key for that element. The element\ndata removal is synced with all the clients.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to remove the data from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key string you wish to remove.' },
        ],
        returns: 'returns true if the data was removed succesfully, false if the given key does not exist in the element or the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveElementData',
    },
};
