import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_21: ApiDocumentationCatalog = {
    getSoundPan: {
        summary: 'This function is used to get the pan level of the specified sound element.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which pan you want to get.' },
        ],
        returns: 'returns float value with range from -1.0 (left) to 1.0 (right), false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundPan',
    },
    getSoundPosition: {
        summary: 'This function is used to return the current seek position of the specified sound element.\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'The sound element which seek position you want to return.' },
        ],
        returns: 'returns a float value indicating the seek position of the sound element in seconds.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundPosition',
    },
    getSoundProperties: {
        summary: 'This function gets the properties of a specific sound.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D' },
        ],
        returns: 'this function returns 3 float|floats and a boolean value: the first float is the sounds http://en.wikipedia.org/wiki/sampling_rate sample rate, the second one the sounds http://en.wikipedia.org/wiki/tempo tempo, and the third one the http://en.wikipedia.org/wiki/pitch_%28music%29 pitch of the sound. the boolean representing whether the sound is reversed or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundProperties',
    },
    getSoundSpeed: {
        summary: 'This function is used to return the playback speed of the specified sound element.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which playback speed you want to return.' },
        ],
        returns: 'returns an float value indicating the playback speed of the sound element. default sound playback speed is 1.0.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundSpeed',
    },
    getSoundVolume: {
        summary: 'This function is used to return the volume level of the specified sound element.\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which volume you want to return.' },
        ],
        returns: 'returns a float representing the volume level of the sound element, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundVolume',
    },
    getSoundWaveData: {
        summary: 'This function gets the wave form data for an audio stream which is a table of floats\nrepresenting the current audio frame as a wave.\nThis allows things like visualisations.\nIf the element is a player, this function will use the players voice.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D. Streams are also supported' },
            { name: 'iSamples', isOptional: false, isVariadic: false, summary: 'allowed samples are 256, 512, 1024, 2048, 4096, 8192 and 16384.' },
        ],
        returns: 'returns a table of isamples floats representing the current audio frame waveform. returns false if the sound is not playing yet or hasnt buffered in the case of streams.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSoundWaveData',
    },
    getSunColor: {
        summary: 'This function is used to get the color of the sun.',
        parameters: [],
        returns: 'returns the color of the sun as six numbers, false if its default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSunColor',
    },
    getSunSize: {
        summary: 'This function is used to get the size of the sun.',
        parameters: [],
        returns: 'returns the size of the sun as a number, false if the size of the sun is at its default.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetSunSize',
    },
    getTeamColor: {
        summary: 'This function retrieves the color of a team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you want to get the color of.' },
        ],
        returns: 'returns 3 integers representing the red, green, and blue color components of the team if its valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamColor',
    },
    getTeamFriendlyFire: {
        summary: 'This function tells you if friendly fire is turned on for the specified team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team object that will be checked' },
        ],
        returns: 'returns true if friendly fire is on for the specified team, false if it is turned off or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamFriendlyFire',
    },
    getTeamFromName: {
        summary: 'This function finds a team element using the provided team name.',
        parameters: [
            { name: 'teamName', isOptional: false, isVariadic: false, summary: 'A string determining the name of the team you wish to find.' },
        ],
        returns: 'returns the team element if it was found, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamFromName',
    },
    getTeamName: {
        summary: 'This function gets the team name of a team object.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you want to retrieve the name of.' },
        ],
        returns: 'returns a string representing the teams name if the team object was valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTeamName',
    },
    getThisResource: {
        summary: 'This function retrieves the resource from which the function call was made.',
        parameters: [],
        returns: 'returns the resource in which the current script is.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetThisResource',
    },
    getTickCount: {
        summary: 'This function returns amount of time that your system has been running in milliseconds.\nBy comparing two values of getTickCount, you can determine how much time has passed (in\nmilliseconds) between two events. This could be used to determine how efficient your code\nis, or to time how long a player takes to complete a task.',
        parameters: [],
        returns: 'returns an integer containing the number of milliseconds since the system the server is running on started. this has the potential to wrap-around.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTickCount',
    },
    getTime: {
        summary: 'This function is used to get the current time in the game. If you want to get the real\nserver time, use getRealTime.',
        parameters: [],
        returns: 'returns two ints that represent hours and minutes.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTime',
    },
    getTimerDetails: {
        summary: 'This function is for getting the details of a running timer.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'A timer element.' },
        ],
        returns: '* integer one represents the time left in miliseconds (1000th of a second) of the current time left in the loop. * integer two represents the amount of times the timer has left to execute. * integer three represents the time interval of timer. * returns false if the timer doesnt exist or stopped running. also, debugscript will say bad argument @ gettimerdetails. to prevent this, you can check if the timer exists with istimer().',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTimerDetails',
    },
    getTimers: {
        summary: 'This function returns a table of all active timers that the resource that calls it has\ncreated. Alternatively, only the timers with a remaining time less than or equal to a\ncertain value can be retrieved.',
        parameters: [
            { name: 'theTime', isOptional: true, isVariadic: false, summary: 'The maximum time left (in milliseconds) on the timers you wish to retrieve.' },
        ],
        returns: 'returns a table of all the active timers.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTimers',
    },
    gettok: {
        summary: 'This function splits a string using the given separating character and returns one\nspecified substring.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'the string that should be split.' },
            { name: 'tokenNumber', isOptional: false, isVariadic: false, summary: 'which token should be returned (1 for the first, 2 for the second, and so on).' },
            { name: 'separatingCharacter', isOptional: false, isVariadic: false, summary: 'the ASCII|ASCII number representing the character you want to use to separate the tokens. You can easily retrieve this by running string.byte on a string containing the separating character.' },
        ],
        returns: 'returns a string containing the token if it exists, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Gettok',
    },
    getTrafficLightState: {
        summary: 'Gets the current traffic light state. This state controls the traffic light colors. For\ninstance, state 1 will cause the north and south traffic lights to be amber, and the ones\nleft and east will turn red.',
        parameters: [],
        returns: 'returns the current traffic_light_states|state of the traffic lights.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrafficLightState',
    },
    getTrainDirection: {
        summary: 'Gets the direction in which a train is driving (clockwise or counterclockwise).',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train of which to get the driving direction.' },
        ],
        returns: 'returns true if the train is driving clockwise on the train track, false if it is going counterclockwise or a failure occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrainDirection',
    },
    getTrainPosition: {
        summary: 'Gets the position the train is currently on the track',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train to get the position of' },
        ],
        returns: 'returns a float that represents how along the track it is, false if there is problem with train element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrainPosition',
    },
    getTrainSpeed: {
        summary: 'Gets the speed at which a train is traveling on the rails.',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train of which to retrieve the speed.' },
        ],
        returns: 'returns the trains speed if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTrainSpeed',
    },
    getTypeIndexFromClothes: {
        summary: 'This function is used to get the clothes type and index from the texture and model.\n(Scans through the list of clothes for the specific type).',
        parameters: [
            { name: 'clothesTexture', isOptional: false, isVariadic: false, summary: ': A string determining the clothes texture that you wish to retrieve the type and index from. See the CJ Clothes|clothes catalog.' },
            { name: 'clothesModel', isOptional: false, isVariadic: false, summary: ': A string determining the corresponding clothes model that you wish to retrieve the type and index from. See the CJ Clothes|clothes catalog.' },
        ],
        returns: 'this function returns two integers, type and index respectively, false if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetTypeIndexFromClothes',
    },
    getUnbanTime: {
        summary: 'This function will return the unbanning time of the specified ban in seconds.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban in which you wish to retrieve the unban time of.' },
        ],
        returns: '* returns an integer of the unbanning time in the format of seconds from the year 1970. use in conjunction with getrealtime in order to retrieve detailed information. * returns false if invalid arguments are specified or if there was no unbanning time specified for the ban.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetUnbanTime',
    },
    getUserdataType: {
        summary: '',
        parameters: [
            { name: 'value', isOptional: false, isVariadic: false, summary: ': A userdata value to get the type of. Userdata types can be: Shared resource-data : a Resource|resource pointer. xml-node : a Xmlnode|XML node. lua-timer : a timer. vector2 : a 2D vector, used in the Vector/Vector2|Vector2 class. vector3 : a 3D vector, used in the Vector/Vector3|Vector3 class. vector4 : a 4D vector, used in the Vector/Vector4|Vector4 class. matrix : a matrix, used in the Matrix class. request : a userdata type returned via fetchRemote (since https://buildinfo.mtasa.com/?Revision=21436&Branch= r21436) userdata : a fallback userdata type return value, when no other type could be found for the object. Server only account : a Account|player account. db-query : a dbQuery|database query handle. acl : an ACL|ACL entry. acl-group : an Aclgroup|ACL group. ban : a Ban|player ban. text-item : a Textitem|text display item. text-display : a Textdisplay|text display item. Source code commit: https://github.com/multitheftauto/mtasa-blue/commit/df8576fc3f80fa2d7a73e70a68e8f116b591cb 68#diff-09a3546021ff952dc0f94a99aae11356R297 weapon : a Weapon|custom weapon.' },
        ],
        returns: 'returns a string containing the specified userdatas type, or false plus an error message if the given value is not userdata.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetUserdataType',
    },
    getValidPedModels: {
        summary: 'This function returns all valid ped models.',
        parameters: [],
        returns: 'returns a table with all valid ped models.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetValidPedModels',
    },
    getVehicleAdjustableProperty: {
        summary: 'Use this to get the value of a vehicles adjustable property. This property relates to\nmovable parts of a model, for example hydra jets or dump truck tray.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you want to get the adjustable property of.' },
        ],
        returns: 'returns a value from 0 upwards representing adjustment. 0 is default position. maximum varies per vehicle, for example hydra horizontal flight is 5000, while dump truck tray max tilt is 2500. or returns false if the vehicle passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleAdjustableProperty',
    },
    getVehicleColor: {
        summary: 'This function returns the color of the specified vehicle. A vehicle can have up to four\ncolors.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to get the color of.' },
            { name: 'bRGB', isOptional: false, isVariadic: false, summary: 'A boolean specifying whether to return RGB values. A setting of false will result in the function returning color ids instead.' },
        ],
        returns: '*returns 12 int|ints (if brgb is true) indicating the red, green and blue components of each of the 4 vehicle colors. *returns 4 int|ints (if brgb is false) indicating the color ids of each of the 4 vehicle colors. *returns false if the vehicle doesnt exist. valid color ids if brgb is set to false:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleColor',
    },
    getVehicleCompatibleUpgrades: {
        summary: 'This function returns a table of all the compatible upgrades (or all for a specified\nslot, optionally) for a specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to retrieve the list of compatible upgrades of.' },
            { name: 'slot', isOptional: true, isVariadic: false, summary: 'the upgrade slot number for which youre getting the list (from 0 to 16). Compatible upgrades for all slots are listed if this is not specified.' },
        ],
        returns: 'returns a table with all the compatible upgrades, or false if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleCompatibleUpgrades',
    },
    getVehicleComponentPosition: {
        summary: 'This function gets the component position of a vehicle. The vehicle must be streamed in.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component position of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A Vehicle_Components|vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the returned position is relative to. It can be one of the following values: parent The position is relative to the parent component. root The position is relative to the root component. world The position is a world position.' },
        ],
        returns: 'returns three floats indicating the position of the component, x, y and z respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentPosition',
    },
};
