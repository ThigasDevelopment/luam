import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_20: ApiDocumentationCatalog = {
    getResourceOrganizationalPath: {
        summary: 'This function returns the organizational file path (e.g. admin) of a resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource of which you want to know the organizational path' },
        ],
        returns: 'returns the organizational folder name of the resource. it returns empty string if the resource is on root resources folder. it returns false if the resource could not be found.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceOrganizationalPath',
    },
    getResourceRootElement: {
        summary: 'This function retrieves a resources root element. The resources root element is the\nelement in the element tree which is the parent of all elements that belong to a\nparticular resource (except for elements specifically created elsewhere). You can attach\nevent handlers to this element to easily capture events that originate from your resource\n(and global events that originate from the root element).\nNote: every resource has a Predefined_variables_list|predefined global variable called\nresourceRoot whose value is the root element of that resource.',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'the resource whose root element we are getting. If not specified, assumes the current resource. (the resource returned from getThisResource)' },
        ],
        returns: 'returns an element representing the resources root, false if the specified resource doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceRootElement',
    },
    getResources: {
        summary: 'This function retrieves a table of all the resources that exist on the server.',
        parameters: [],
        returns: 'returns a table of resources.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResources',
    },
    getResourceState: {
        summary: 'This function returns the state of a given resource',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource you wish to get the state of.' },
        ],
        returns: 'if successful returns a string with the resource state in it, false otherwise. the state can be one of: *loaded *running *starting *stopping *failed to load - use getresourceloadfailurereason to find out why it failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceState',
    },
    getRoofPosition: {
        summary: '',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: ': A float representing the X world coordinate of the point.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: ': A float representing the Y world coordinate of the point.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: ': A float representing the Z world coordinate of the point.' },
        ],
        returns: 'returns a float with the lowest roof-level z coord if parameters are valid, false if the point you tried to test is outside the loaded world map.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRoofPosition',
    },
    getRootElement: {
        summary: 'This function returns the root node of the element tree, called root. This node contains\nevery other element: all resource root elements, players and remote clients. It is never\ndestroyed and cannot be destroyed using destroyElement.\nIt is often used to attach handler functions to events triggered for any element, or also\nto make a scripting function affect all elements.',
        parameters: [],
        returns: 'returns the root element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRootElement',
    },
    getRuleValue: {
        summary: 'This function gets a rule value. A rule value is a string that can be viewed by server\nbrowsers and used for filtering the server list.',
        parameters: [
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the rule' },
        ],
        returns: 'returns a string containing the value set for the specified key, false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRuleValue',
    },
    getScreenFromWorldPosition: {
        summary: 'This function gets the screen position of a point in the world. This is useful for\nattaching 2D gui elements to parts of the world (e.g. players) or detecting if a point is\non the screen (though it does not check if it is actually visible, you should use\nprocessLineOfSight for that).',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float value indicating the x position in the world.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float value indicating the y position in the world.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A float value indicating the z position in the world.' },
            { name: 'edgeTolerance', isOptional: true, isVariadic: false, summary: 'A float value indicating the distance the position can be off screen before the function returns false. Note: its clamped down on both axies to the size of screen at the given axis*10' },
            { name: 'relative', isOptional: true, isVariadic: false, summary: 'A boolean value that indicates if edgeTolerance is in pixels false, or relative to the screen size true.' },
        ],
        returns: 'returns two x, y floats indicating the screen position and float distance between screen and given position if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetScreenFromWorldPosition',
    },
    getSearchLightEndPosition: {
        summary: 'This function gets the end position of a Element/Searchlight|searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: ': the searchlight to get the position where the searchlights light cone ends.' },
        ],
        returns: 'if the specified searchlight element is valid, this function will return three float, which are the three coordinates of searchlights end position. if not, it will return false plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightEndPosition',
    },
    getSearchLightEndRadius: {
        summary: 'This function gets the end radius of a Element/Searchlight|searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: ': the searchlight to get the radius of the searchlights light cone in its end.' },
        ],
        returns: 'if the specified searchlight element is valid, this function will return one float, which is the searchlights end radius. if not, it will return false plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightEndRadius',
    },
    getSearchLightStartPosition: {
        summary: 'This function gets the start position of a Element/Searchlight|searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: ': the searchlight to get the position where the searchlights light cone starts.' },
        ],
        returns: 'if the specified searchlight element is valid, this function will return three float, which are the three coordinates of searchlights start position. if not, it will return false plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightStartPosition',
    },
    getSearchLightStartRadius: {
        summary: 'This function gets the start radius of a Element/Searchlight|searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: ': the searchlight to get the radius of the searchlights light cone in its beginning.' },
        ],
        returns: 'if the specified searchlight element is valid, this function will return one float, which is the searchlights start radius. if not, it will return false plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSearchLightStartRadius',
    },
    getServerConfigSetting: {
        summary: 'This function retrieves server settings which are usually stored in the mtaserver.conf\nfile.\nAvailable in 1.1 and onwards',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the setting (setting names can be found Server_mtaserver.conf|here)' },
        ],
        returns: 'returns a string containing the current value for the named setting, or false if the setting does not exist. if the setting name is serverip, may return the string auto on local servers.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerConfigSetting',
    },
    getServerHttpPort: {
        summary: 'This function retrieves the servers HTTP port.',
        parameters: [],
        returns: 'an integer corresponding to the servers http port.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerHttpPort',
    },
    getServerName: {
        summary: 'This function retrieves the servers name.',
        parameters: [],
        returns: 'a string containing the servers name.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerName',
    },
    getServerPassword: {
        summary: 'This function returns the current password required to join the server.',
        parameters: [],
        returns: 'returns the current server password as a string if it has a password, if not it returns nil.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerPassword',
    },
    getServerPort: {
        summary: 'This function retrieves the servers port.',
        parameters: [],
        returns: 'an integer corresponding to the servers port.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetServerPort',
    },
    getSFXStatus: {
        summary: 'This function checks if a big sound container is available to use or not.\nIn case of these invalid audio files, this function returns false.|true',
        parameters: [
            { name: 'audioContainer', isOptional: false, isVariadic: false, summary: 'The container name. Possible values are: feet, genrl, pain_a, script, spc_ea, spc_fa, spc_ga, spc_na, spc_pa' },
        ],
        returns: 'returns true if the sound container is available, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSFXStatus',
    },
    getSkyGradient: {
        summary: 'This function will return the current sky color.\nNote: The server can only return the sky color if it has actually been set by script.',
        parameters: [],
        returns: 'returns 6 int|ints, of which the first 3 represent the skys top color, (in rgb) and the last 3 represent the bottom colors.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSkyGradient',
    },
    getSlotFromWeapon: {
        summary: 'This function allows you to identify the weapon slot that a weapon belongs to.',
        parameters: [
            { name: 'weaponid', isOptional: false, isVariadic: false, summary: 'Weapon to find the weapon slot of.' },
        ],
        returns: 'returns an integer representing the given weapon ids associated weapon slot, false if the id was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSlotFromWeapon',
    },
    getSoundBPM: {
        summary: 'This function gets the beats per minute of a specific sound element.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D' },
        ],
        returns: 'returns the beats per minute of the given sound.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundBPM',
    },
    getSoundBufferLength: {
        summary: '',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which buffer length you want to get.' },
        ],
        returns: '* a float value indicating the buffer playback length of the sound in seconds. * false if the sound is not a stream. * nil if the sound is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundBufferLength',
    },
    getSoundEffectParameters: {
        summary: '',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: ': The sound element to get the sound effect parameters of.' },
            { name: 'effectName', isOptional: false, isVariadic: false, summary: ': The name of the effect whose parameters you want to retrieve:' },
        ],
        returns: 'returns a table with the parameter names as the keys, and their values. if the specified effect name is not valid, false is returned.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundEffectParameters',
    },
    getSoundEffects: {
        summary: 'Returns the states of all effects of a sound.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
        ],
        returns: 'returns a table with the effect names as the keys, and their states as the values if successful. otherwise, it returns false. sound effect names:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundEffects',
    },
    getSoundFFTData: {
        summary: 'This function gets the fast fourier transform data for an audio stream which is a table\nof floats representing the current audio frame. This allows things like visualisations.\nA fast fourier transform generates a table of all the frequencies of the current audio\nframe which starts at the bass end of the spectrum to mids to highs in that order.\nShould you have any problems there is an example resource located on the resources\nrepository:\nhttps://github.com/multitheftauto/mtasa-resources/tree/master/%5Bgameplay%5D/visualiser\nVisualiser\nJust type startmusic mystreamurl in your console and it will play on the cinema billboard\nnear A51. If the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D. Streams are also supported' },
            { name: 'iSamples', isOptional: false, isVariadic: false, summary: 'allowed samples are 256, 512, 1024, 2048, 4096, 8192 and 16384.' },
            { name: 'iBands', isOptional: true, isVariadic: false, summary: 'post processing option allows you to split the samples into the desired amount of bands or bars so if you only need 5 bars this saves a lot of cpu power compared to trying to do it in Lua.' },
        ],
        returns: 'returns a table of isamples/2 (or ibands if ibands is used) floats representing the current audio frame. returns false if the sound is not playing yet or hasnt buffered in the case of streams.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundFFTData',
    },
    getSoundLength: {
        summary: 'This function is used to return the playback length of the specified sound element.\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which length you want to return.' },
        ],
        returns: 'returns an float value indicating the playback length of the sound element in seconds.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundLength',
    },
    getSoundLevelData: {
        summary: 'This function gets the left/right level from a sound element.\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which level data you want to return.' },
        ],
        returns: 'returns a two integers in range from 0 to 32768.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundLevelData',
    },
    getSoundMaxDistance: {
        summary: 'Gets a custom sound max distance at which the sound stops.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
        ],
        returns: 'returns an integer of the max distance, false if invalid arguments where passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundMaxDistance',
    },
    getSoundMetaTags: {
        summary: 'Used to get the meta tags attached to a sound. These provide information about the sound,\nfor instance the title or the artist.\n*This function does not work on remote WAV files',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
            { name: 'format', isOptional: true, isVariadic: false, summary: 'a filter string to get a specific meta tag.' },
        ],
        returns: 'returns a table, but only a string if format is given, with all data available (keys are listed below) for the sound if successful, false otherwise. if any data is unavailable then the associated key is not written to the table.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundMetaTags',
    },
    getSoundMinDistance: {
        summary: 'Gets a custom sound Minimum distance at which the sound stops getting louder.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
        ],
        returns: 'returns an integer of the minimum distance, false if invalid arguements where passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundMinDistance',
    },
};
