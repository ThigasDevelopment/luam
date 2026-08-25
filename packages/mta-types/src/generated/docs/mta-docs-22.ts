import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_22: ApiDocumentationCatalog = {
    getResourceOrganizationalPath: {
        summary: 'This function returns the organizational file path (e.g. *[admin]*) of a resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource of which you want to know the organizational path' },
        ],
        returns: 'Returns the organizational folder name of the resource. It returns empty string if the resource is on root *resources* folder. It returns **false** if the resource could not be found.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceOrganizationalPath',
    },
    getResourceRootElement: {
        summary: '<!-- i believe this function is unnecessary because there is a constant variable called resourceRoot / iManGaaX / @MTA_DEV -->\n\nThis function retrieves a resource\'s root element. The resource\'s root element is the element in the element tree which is the parent of all elements that belong to a particular resource (except for elements specifically created elsewhere). You can attach event handlers to this element to easily capture events that originate from your resource (and global events that originate from the root element).\n\nNote: every resource has a predefined global variable called *resourceRoot* whose value is the root element of that resource.',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'the resource whose root element we are getting. If not specified, assumes the current resource. (the resource returned from getThisResource)' },
        ],
        returns: 'Returns an *element* representing the resource\'s root, *false* if the specified resource doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceRootElement',
    },
    getResources: {
        summary: 'This function retrieves a table of all the resources that exist on the server.',
        parameters: [],
        returns: 'Returns a table of resources.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResources',
    },
    getResourceState: {
        summary: 'This function returns the state of a given resource',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource you wish to get the state of.' },
        ],
        returns: 'If successful returns a string with the resource state in it, *false* otherwise. The state can be one of: ***loaded** ***running** ***starting** ***stopping** ***failed to load** - Use getResourceLoadFailureReason to find out why it failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceState',
    },
    getRoofPosition: {
        summary: '',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float representing the X world coordinate of the point.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float representing the Y world coordinate of the point.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A float representing the Z world coordinate of the point.' },
        ],
        returns: 'Returns a float with the lowest roof-level Z coord if parameters are valid, *false* if the point you tried to test is outside the loaded world map.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRoofPosition',
    },
    getRootElement: {
        summary: 'This function returns the root node of the element tree, called *root*. This node contains every other element: all resource root elements, players and remote clients. It is never destroyed and cannot be destroyed using destroyElement.\n\nIt is often used to attach handler functions to events triggered for any element, or also to make a scripting function affect all elements.',
        parameters: [],
        returns: 'Returns the root element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRootElement',
    },
    getRuleValue: {
        summary: 'This function gets a rule value. A rule value is a string that can be viewed by server browsers and used for filtering the server list.',
        parameters: [
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the rule' },
        ],
        returns: 'Returns a string containing the value set for the specified *key*, *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRuleValue',
    },
    getScreenFromWorldPosition: {
        summary: 'This function gets the screen position of a point in the world. This is useful for attaching 2D gui elements to parts of the world (e.g. players) or detecting if a point is on the screen (though it does not check if it is actually visible, you should use processLineOfSight for that).',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float value indicating the x position in the world.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float value indicating the y position in the world.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A float value indicating the z position in the world.' },
            { name: 'edgeTolerance', isOptional: true, isVariadic: false, summary: 'A float value indicating the distance the position can be off screen before the function returns false. Note: it\'s clamped down on both axies to the size of screen at the given axis*10' },
            { name: 'relative', isOptional: true, isVariadic: false, summary: 'A boolean value that indicates if edgeTolerance is in pixels [false], or relative to the screen size [true].' },
        ],
        returns: 'Returns two *x*, *y* floats indicating the screen position and float distance between screen and given position if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetScreenFromWorldPosition',
    },
    getSearchLightEndPosition: {
        summary: 'This function gets the end position of a searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: 'the searchlight to get the position where the searchlight\'s light cone ends.' },
        ],
        returns: 'If the specified searchlight element is valid, this function will return three *float*, which are the three coordinates of searchlight\'s end position. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightEndPosition',
    },
    getSearchLightEndRadius: {
        summary: 'This function gets the end radius of a searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: 'the searchlight to get the radius of the searchlight\'s light cone in its end.' },
        ],
        returns: 'If the specified searchlight element is valid, this function will return one *float*, which is the searchlight\'s end radius. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightEndRadius',
    },
    getSearchLightStartPosition: {
        summary: 'This function gets the start position of a searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: 'the searchlight to get the position where the searchlight\'s light cone starts.' },
        ],
        returns: 'If the specified searchlight element is valid, this function will return three *float*, which are the three coordinates of searchlight\'s start position. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightStartPosition',
    },
    getSearchLightStartRadius: {
        summary: 'This function gets the start radius of a searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: 'the searchlight to get the radius of the searchlight\'s light cone in its beginning.' },
        ],
        returns: 'If the specified searchlight element is valid, this function will return one *float*, which is the searchlight\'s start radius. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightStartRadius',
    },
    getServerConfigSetting: {
        summary: 'This function retrieves server settings which are usually stored in the **mtaserver.conf** file.\n\nAvailable in 1.1 and onwards',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the setting (setting names can be found here)' },
        ],
        returns: 'Returns a string containing the current value for the named setting, *table* if **name** is **module** or *false* if the setting does not exist. If the setting name is *serverip*, may return the string *"auto"* on local servers.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerConfigSetting',
    },
    getServerHttpPort: {
        summary: 'This function retrieves the server\'s HTTP port.',
        parameters: [],
        returns: 'An integer corresponding to the server\'s HTTP port.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerHttpPort',
    },
    getServerIp: {
        summary: 'This function returns the IP of the server the client is currently connected to.',
        parameters: [
            { name: 'includePort', isOptional: true, isVariadic: false, summary: 'If set to *true*, the string will include the port of the server at the end of the string, after a colon (:) character.' },
        ],
        returns: 'A string containing the remote address of the server the client is currently connected to.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerIp',
    },
    getServerIpFromMasterServer: {
        summary: 'This function returns the remote address as reported by the first master server that provides this value.',
        parameters: [],
        returns: 'A string containing the remote address of the server as reported, once it\'s available.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerIpFromMasterServer',
    },
    getServerName: {
        summary: 'This function retrieves the server\'s name.',
        parameters: [],
        returns: 'A string containing the server\'s name.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerName',
    },
    getServerPassword: {
        summary: '<!-- Change this to "Client function" or "Server function" appropriately-->\n<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function returns the current password required to join the server.',
        parameters: [],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns the current server password as a string if it has a password, if not it returns *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerPassword',
    },
    getServerPort: {
        summary: 'This function retrieves the server\'s port.',
        parameters: [],
        returns: 'An integer corresponding to the server\'s port.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerPort',
    },
    getSFXStatus: {
        summary: 'This function checks if a big sound container is available to use or not.',
        parameters: [
            { name: 'audioContainer', isOptional: false, isVariadic: false, summary: 'The container name. Possible values are:' },
        ],
        returns: 'Returns **true** if the sound container is available, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSFXStatus',
    },
    getSkyGradient: {
        summary: 'This function will return the current sky color.\n\n**Note:** The server can only return the sky color if it has actually been set by script.',
        parameters: [],
        returns: 'Returns 6 ints, of which the first 3 represent the sky\'s "top" color, (in RGB) and the last 3 represent the bottom colors.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSkyGradient',
    },
    getSlotFromWeapon: {
        summary: 'This function allows you to identify the weapon slot that a weapon belongs to.',
        parameters: [
            { name: 'weaponid', isOptional: false, isVariadic: false, summary: 'Weapon to find the weapon slot of.' },
        ],
        returns: 'Returns an integer representing the given weapon ID\'s associated weapon slot, *false* if the ID was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSlotFromWeapon',
    },
    getSoundBPM: {
        summary: 'This function gets the beats per minute of a specific sound element.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D' },
        ],
        returns: 'Returns the beats per minute of the given sound.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundBPM',
    },
    getSoundBufferLength: {
        summary: 'This function gets the buffer playback length of the specified sound. Works only with streams.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which buffer length you want to get.' },
        ],
        returns: '* A float value indicating the buffer playback length of the sound in seconds. * *false* if the sound is not a stream. * *nil* if the sound is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundBufferLength',
    },
    getSoundEffectParameters: {
        summary: '',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'The sound element to get the sound effect parameters of.' },
            { name: 'effectName', isOptional: false, isVariadic: false, summary: 'The name of the effect whose parameters you want to retrieve:' },
        ],
        returns: 'Returns a table with the parameter names as the keys, and their values. If the specified effect name is not valid, *false* is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundEffectParameters',
    },
    getSoundEffects: {
        summary: 'Returns the states of all effects of a sound.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
        ],
        returns: 'Returns a table with the effect names as the keys, and their states as the values if successful. Otherwise, it returns *false*. **Sound effect names:**',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundEffects',
    },
    getSoundFFTData: {
        summary: 'This function gets the fast fourier transform data for an audio stream which is a table of floats representing the current audio frame. This allows things like visualisations.\nA fast fourier transform generates a table of all the frequencies of the current audio frame which starts at the bass end of the spectrum to mids to highs in that order.\nShould you have any problems there is an example resource located on the resources repository:\n[https://github.com/multitheftauto/mtasa-resources/tree/master/%5Bgameplay%5D/visualiser Visualiser]\n\nJust type "startmusic mystreamurl" in your console and it will play on the cinema billboard near A51. If the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D. Streams are also supported' },
            { name: 'iSamples', isOptional: false, isVariadic: false, summary: 'allowed samples are 256, 512, 1024, 2048, 4096, 8192 and 16384.' },
            { name: 'iBands', isOptional: true, isVariadic: false, summary: 'post processing option allows you to split the samples into the desired amount of bands or bars so if you only need 5 bars this saves a lot of cpu power compared to trying to do it in Lua.' },
        ],
        returns: 'Returns a table of **iSamples**/2 (or **iBands** if **iBands** is used) *floats* representing the current audio frame. Returns *false* if the sound is not playing yet or hasn\'t buffered in the case of streams.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundFFTData',
    },
    getSoundLength: {
        summary: 'This function is used to return the playback length of the specified sound element.\n\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which length you want to return.' },
        ],
        returns: 'Returns an float value indicating the playback length of the sound element in seconds.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundLength',
    },
    getSoundLevelData: {
        summary: 'This function gets the left/right level from a sound element.\n\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which level data you want to return.' },
        ],
        returns: 'Returns a two *integers* in range from 0 to 32768.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundLevelData',
    },
    getSoundMaxDistance: {
        summary: 'Gets a custom sound max distance at which the sound stops.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
        ],
        returns: 'Returns an *integer* of the max distance, *false* if invalid arguments where passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundMaxDistance',
    },
};
