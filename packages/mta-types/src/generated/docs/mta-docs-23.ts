import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_23: ApiDocumentationCatalog = {
    getSoundMetaTags: {
        summary: 'Used to get the meta tags attached to a sound. These provide information about the sound, for instance the title or the artist.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
            { name: 'format', isOptional: true, isVariadic: false, summary: 'a filter string to get a specific meta tag.' },
        ],
        returns: 'Returns a table, but only a string if **format** is given, with all data available (keys are listed below) for the sound if successful, *false* otherwise. If any data is unavailable then the associated key is not written to the table.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundMetaTags',
    },
    getSoundMinDistance: {
        summary: 'Gets a custom sound Minimum distance at which the sound stops getting louder.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
        ],
        returns: 'Returns an *integer* of the minimum distance, *false* if invalid arguements where passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundMinDistance',
    },
    getSoundPan: {
        summary: 'This function is used to get the pan level of the specified sound element.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which pan you want to get.' },
        ],
        returns: 'Returns *float* value with range from *-1.0 (left)* to *1.0 (right)*, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundPan',
    },
    getSoundPosition: {
        summary: 'This function is used to return the current seek position of the specified sound element.\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'The sound element which seek position you want to return.' },
        ],
        returns: 'Returns a float value indicating the seek position of the sound element in seconds.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundPosition',
    },
    getSoundProperties: {
        summary: 'This function gets the properties of a specific sound.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D' },
        ],
        returns: 'This function returns 3 floats and a boolean value: The first float is the sound\'s [http://en.wikipedia.org/wiki/Sampling_rate sample rate], the second one the sound\'s [http://en.wikipedia.org/wiki/Tempo tempo], and the third one the [http://en.wikipedia.org/wiki/Pitch_%28music%29 pitch] of the sound. The boolean representing whether the sound is reversed or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundProperties',
    },
    getSoundSpeed: {
        summary: 'This function is used to return the playback speed of the specified sound element.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which playback speed you want to return.' },
        ],
        returns: 'Returns an float value indicating the playback speed of the sound element. Default sound playback speed is **1.0**.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundSpeed',
    },
    getSoundVolume: {
        summary: 'This function is used to return the volume level of the specified sound element.\n\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which volume you want to return.' },
        ],
        returns: 'Returns a float representing the volume level of the sound element, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundVolume',
    },
    getSoundWaveData: {
        summary: 'This function gets the wave form data for an audio stream which is a table of floats representing the current audio frame as a wave.\nThis allows things like visualisations.\n\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D. Streams are also supported' },
            { name: 'iSamples', isOptional: false, isVariadic: false, summary: 'allowed samples are 256, 512, 1024, 2048, 4096, 8192 and 16384.' },
        ],
        returns: 'Returns a table of **iSamples** *floats* representing the current audio frame waveform. Returns *false* if the sound is not playing yet or hasn\'t buffered in the case of streams.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundWaveData',
    },
    getSunColor: {
        summary: 'This function is used to get the color of the sun.',
        parameters: [],
        returns: 'Returns the color of the sun as six numbers, false if its default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSunColor',
    },
    getSunSize: {
        summary: 'This function is used to get the size of the sun.',
        parameters: [],
        returns: 'Returns the size of the sun as a number, false if the size of the sun is at its default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSunSize',
    },
    getTeamColor: {
        summary: 'This function retrieves the color of a team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you want to get the color of.' },
        ],
        returns: 'Returns 3 integers representing the red, green, and blue color components of the team if it\'s valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamColor',
    },
    getTeamFriendlyFire: {
        summary: 'This function tells you if friendly fire is turned on for the specified team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team object that will be checked' },
        ],
        returns: 'Returns *true* if friendly fire is on for the specified team, *false* if it is turned off or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamFriendlyFire',
    },
    getTeamFromName: {
        summary: 'This function finds a team element using the provided team name.',
        parameters: [
            { name: 'teamName', isOptional: false, isVariadic: false, summary: 'A string determining the name of the team you wish to find.' },
        ],
        returns: 'Returns the team element if it was found, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamFromName',
    },
    getTeamName: {
        summary: 'This function gets the team name of a team object.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you want to retrieve the name of.' },
        ],
        returns: 'Returns a string representing the team\'s name if the team object was valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamName',
    },
    getThisResource: {
        summary: 'This function retrieves the resource from which the function call was made.',
        parameters: [],
        returns: 'Returns the resource in which the current script is.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetThisResource',
    },
    getTickCount: {
        summary: 'This function returns amount of time that your system has been running in milliseconds. By comparing two values of getTickCount, you can determine how much time has passed (in milliseconds) between two events. This could be used to determine how efficient your code is, or to time how long a player takes to complete a task.',
        parameters: [],
        returns: 'Returns an integer containing the number of milliseconds since the system the server is running on started. This has the potential to wrap-around.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTickCount',
    },
    getTime: {
        summary: 'This function is used to get the current time in the game. If you want to get the real server time, use getRealTime.',
        parameters: [],
        returns: 'Returns two *ints* that represent hours and minutes.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTime',
    },
    getTimerDetails: {
        summary: 'This function is for getting the details of a running timer.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'A timer element.' },
        ],
        returns: '* Integer one represents the time left in miliseconds (1000th of a second) of the current time left in the loop. * Integer two represents the amount of times the timer has left to execute. * Integer three represents the time interval of timer. * Returns false if the timer doesn\'t exist or stopped running. Also, debugscript will say "Bad Argument @ \'getTimerDetails\'". To prevent this, you can check if the timer exists with isTimer().',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTimerDetails',
    },
    getTimers: {
        summary: 'This function returns a table of all active timers that the resource that calls it has created. Alternatively, only the timers with a remaining time less than or equal to a certain value can be retrieved.',
        parameters: [
            { name: 'theTime', isOptional: true, isVariadic: false, summary: 'The maximum time left (in milliseconds) on the timers you wish to retrieve.' },
        ],
        returns: 'Returns a table of all the active timers.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTimers',
    },
    gettok: {
        summary: 'This function splits a string using the given separating character and returns one specified substring.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'the string that should be split.' },
            { name: 'tokenNumber', isOptional: false, isVariadic: false, summary: 'which token should be returned (1 for the first, 2 for the second, and so on).' },
            { name: 'separatingCharacter', isOptional: false, isVariadic: false, summary: 'the ASCII number representing the character you want to use to separate the tokens. You can easily retrieve this by running string.byte on a string containing the separating character.' },
        ],
        returns: 'Returns a string containing the token if it exists, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Gettok',
    },
    getTrafficLightState: {
        summary: 'Gets the current traffic light state. This state controls the traffic light colors. For instance, state **1** will cause the north and south traffic lights to be amber, and the ones left and east will turn red.',
        parameters: [],
        returns: 'Returns the current state of the traffic lights.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrafficLightState',
    },
    getTrainDirection: {
        summary: 'Gets the direction in which a train is driving (clockwise or counterclockwise).',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train of which to get the driving direction.' },
        ],
        returns: 'Returns *true* if the train is driving clockwise on the train track, *false* if it is going counterclockwise or a failure occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrainDirection',
    },
    getTrainPosition: {
        summary: 'Gets the position the train is currently on the track',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train to get the position of' },
        ],
        returns: 'Returns a float that represents how along the track it is, *false* if there is problem with train element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrainPosition',
    },
    getTrainSpeed: {
        summary: 'Gets the speed at which a train is traveling on the rails.',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train of which to retrieve the speed.' },
        ],
        returns: 'Returns the train\'s speed if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrainSpeed',
    },
    getTypeIndexFromClothes: {
        summary: 'This function is used to get the clothes type and index from the texture and model.\n(Scans through the list of clothes for the specific type).',
        parameters: [
            { name: 'clothesTexture', isOptional: false, isVariadic: false, summary: 'A string determining the clothes texture that you wish to retrieve the type and index from. See the clothes catalog.' },
            { name: 'clothesModel', isOptional: false, isVariadic: false, summary: 'A string determining the corresponding clothes model that you wish to retrieve the type and index from. See the clothes catalog.' },
        ],
        returns: 'This function returns two integers, type and index respectively, *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTypeIndexFromClothes',
    },
    getUnbanTime: {
        summary: 'This function will return the unbanning time of the specified ban in **seconds**.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban in which you wish to retrieve the unban time of.' },
        ],
        returns: '* Returns an integer of the unbanning time in the format of seconds from the year 1970. Use in conjunction with getRealTime in order to retrieve detailed information. * Returns **false** if invalid arguments are specified or if there was no unbanning time specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetUnbanTime',
    },
    getUserdataType: {
        summary: 'This function gets the type of a userdata value, which is not always a element in the element tree.',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: 'A userdata value to get the type of. Userdata types can be:' },
        ],
        returns: 'Returns a string containing the specified userdata\'s type, or *false* plus an error message if the given value is not userdata.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetUserdataType',
    },
    getValidPedModels: {
        summary: 'This function returns all valid ped models. The syntax is different for server and client sides.',
        parameters: [],
        returns: 'Returns a table with all valid ped models that exist on the client, containing the custom model IDs unless **includeCustom** is false. ```lua table getValidPedModels ( ) ``` Returns a table with all valid ped models that exist on the server.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetValidPedModels',
    },
    getVehicleAdjustableProperty: {
        summary: 'Use this to get the value of a vehicles adjustable property. This property relates to movable parts of a model, for example hydra jets or dump truck tray.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you want to get the adjustable property of.' },
        ],
        returns: 'Returns a value from 0 upwards representing adjustment. 0 is default position. Maximum varies per vehicle, for example hydra horizontal flight is 5000, while dump truck tray max tilt is 2500. Or returns *false* if the vehicle passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleAdjustableProperty',
    },
    getVehicleColor: {
        summary: 'This function returns the color of the specified vehicle. A vehicle can have up to four colors.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to get the color of.' },
            { name: 'bRGB', isOptional: false, isVariadic: false, summary: 'A boolean specifying whether to return RGB values. A setting of *false* will result in the function returning color ids instead.' },
        ],
        returns: '*Returns 12 ints (if bRGB is *true*) indicating the red, green and blue components of each of the 4 vehicle colors. *Returns 4 ints (if bRGB is *false*) indicating the color ids of each of the 4 vehicle colors. *Returns *false* if the vehicle doesn\'t exist. Valid color ids if bRGB is set to false:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleColor',
    },
};
