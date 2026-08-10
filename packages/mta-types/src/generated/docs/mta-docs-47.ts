import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_47: ApiDocumentationCatalog = {
    setWeaponState: {
        summary: 'This function sets a Element/Weapon|custom weapons state.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: ': the weapon you wish to set the state of.' },
            { name: 'theState', isOptional: false, isVariadic: false, summary: ': the state you wish to set: reloading : makes the weapon reload. firing : makes the weapon constantly fire its target (unless any shooting blocking flags are set) according to its assigned firing rate. ready : makes the weapon stop reloading or firing.' },
        ],
        returns: 'returns true on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponState',
    },
    setWeaponTarget: {
        summary: 'This function sets the target of a Element/Weapon|custom weapon. There are 3 different\ntargeting modes, which are explained below.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to clear the target of.' },
            { name: 'theTarget', isOptional: false, isVariadic: false, summary: 'The element to shoot at. It can be a player, ped, vehicle or object.' },
            { name: 'theComponent', isOptional: true, isVariadic: false, summary: 'The component of the target to shoot at. This argument is only relevant when used in the following element types: Vehicle|Vehicles : 0 : front left tire. 1 BONE_PELVIS1 position. 2 BONE_PELVIS position. 3 BONE_SPINE1 position. 255 : center of the ped (position returned by getElementPosition). Ped|Peds (players not included; see getPedBonePosition to know where each bone is located): 4 BONE_UPPERTORSO position. 5 BONE_NECK position. 6 BONE_HEAD2 position. 7 BONE_HEAD1 position. 8 BONE_HEAD position. 21 BONE_RIGHTUPPERTORSO position. 22 BONE_RIGHTSHOULDER position. 23 BONE_RIGHTELBOW position. 24 BONE_RIGHTWRIST position. 25 BONE_RIGHTHAND position. 26 BONE_RIGHTTHUMB position. 31 BONE_LEFTUPPERTORSO position. 32 BONE_LEFTSHOULDER position. 33 BONE_LEFTELBOW position. 34 BONE_LEFTWRIST position. 35 BONE_LEFTHAND position. 36 BONE_LEFTTHUMB position. 41 BONE_LEFTHIP position. 42 BONE_LEFTKNEE position. 43 BONE_LEFTANKLE position. 44 BONE_LEFTFOOT position. 51 BONE_RIGHTHIP position. 52 BONE_RIGHTKNEE position. 53 BONE_RIGHTANKLE position. 54 BONE_RIGHTFOOT position. targetX The target X. targetY The target Y. targetZ The target Z.' },
        ],
        returns: 'returns true on success, false otherwise. returns true on success, false otherwise. returns true on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponTarget',
    },
    setWeather: {
        summary: 'This function sets the current weather to the given valid value. To change the weather\ngradually, see setWeatherBlended.',
        parameters: [
            { name: 'weatherID', isOptional: false, isVariadic: false, summary: ': The ID of new weather. Valid values are 0 to 255 inclusive.' },
        ],
        returns: 'returns true if the weather was set succesfully, false if an invalid weatherid was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeather',
    },
    setWeatherBlended: {
        summary: 'This function will change the current weather to another in a smooth manner, over the\nperiod of 1-2 in-game hours (unlike setWeather, which sets a new weather instantly). To\nensure this transition performs as expected, you should not call this function until\ngetWeather indicates that no transition is already being done.',
        parameters: [
            { name: 'weatherID', isOptional: false, isVariadic: false, summary: 'The ID of the weather state you wish to set. Valid values are 0 to 255 inclusive.' },
        ],
        returns: 'returns true if successful, false if an invalid weatherid is passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeatherBlended',
    },
    setWindowFlashing: {
        summary: '',
        parameters: [
            { name: 'shouldFlash', isOptional: false, isVariadic: false, summary: 'whether the window should flash' },
            { name: 'count', isOptional: true, isVariadic: false, summary: 'the number of times the window should flash, defaults to 10 times' },
        ],
        returns: 'returns false if: * the window is already in focus * the client has disabled this feature returns true otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWindowFlashing',
    },
    setWindVelocity: {
        summary: 'This function changes the wind velocity. The wind shakes the vegetation and makes\nparticles fly in a direction. The intensity and direction of the effect deppends of the\nwind velocity in each axis.',
        parameters: [
            { name: 'velocityX', isOptional: false, isVariadic: false, summary: ': The velocity of the wind along the x axis.' },
            { name: 'velocityY', isOptional: false, isVariadic: false, summary: ': The velocity of the wind along the y axis.' },
            { name: 'velocityZ', isOptional: false, isVariadic: false, summary: ': The velocity of the wind along the z axis.' },
        ],
        returns: 'returns true if successful, false if bad arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWindVelocity',
    },
    setWorldSoundEnabled: {
        summary: 'This function allows you to disable world sounds. A world sound is a sound effect which\nhas not been caused by playSound or playSound3D.\n*The values for group and index can be determined by using the client command\nClient_Commands#showsound|showsound in conjunction with setDevelopmentMode.\n*This function does not affect sounds which are already playing, such as the wind sound\nthat can only be stopped by entering an interior.\n* See also: setAmbientSoundEnabled.',
        parameters: [
            { name: 'group', isOptional: false, isVariadic: false, summary: 'An int|integer representing the World sound groups|world sound group.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'An int|integer representing an individual sound within the group' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set to false to disable, true to enable.' },
            { name: 'immediate', isOptional: true, isVariadic: false, summary: 'A boolean if set to true will cancel the sound if its already playing. This parameter only works for stopping the sound.' },
        ],
        returns: 'returns true if the world sound was correctly enabled/disabled, false if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWorldSoundEnabled',
    },
    setWorldSpecialPropertyEnabled: {
        summary: 'Enables or disables a special world property.',
        parameters: [
            { name: 'propname', isOptional: false, isVariadic: false, summary: 'the name of the property to set. Possible values are: hovercars - equivalent of the JBGVNB cheat, and allows cars to drive on water. (default: false) aircars - equivalent of the RIPAZHA cheat, and allows cars to fly. (default: false) extrabunny - equivalent of the CJPHONEHOME or JHJOECW cheat, and allows you to bunny hop on bicycles much higher. (default: false) extrajump - equivalent of the KANGAROO cheat, and allows you to jump on foot much higher. (default: false) randomfoliage - toggle randomly generated foliage on the GTA:SA map (default: true) snipermoon - toggle the GTA:SA easter egg, which increases the size of the moon every time you shoot it with a sniper rifle (default: false) extraairresistance - toggle the vehicle speed limit on cross-country roads (default: true) **New feature/item|3.0156|1.5.5|12286|**underworldwarp** - toggle warp of peds and vehicles when fall under map (default: true) **New feature/item|3.0160|1.5.9|21125|**vehiclesunglare** - toggle the vehicle sun glare effect (default: false) **New feature/item|3.0160|1.5.9|21313| **coronaztest** - disable big sun lensflare effect (default: true)' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'whether or not to enable the property.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWorldSpecialPropertyEnabled',
    },
    sha256: {
        summary: '* The sha module and this function may conflict with eachother, if you use this function\nuninstall the module!\n* This function returns an uppercase string, so make sure you string.upper() anything\nelse you are checking against that has been sha256d elsewhere.\nCalculates the sha256 hash of the specified string.',
        parameters: [
            { name: 'str', isOptional: false, isVariadic: false, summary: 'the string to hash.' },
        ],
        returns: 'returns the sha256 hash of the input string if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Sha256',
    },
    showChat: {
        summary: 'This function is used to show or hide the players chat.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose chat is to be hidden or shown.' },
            { name: 'show', isOptional: false, isVariadic: false, summary: 'A boolean value determining whether to show (true) or hide (false) the chat.' },
            { name: 'inputBlocked', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether chat input is blocked/hidden, regardless of chat visibility. If unset, this will keep the default behaviour prior to r20898 (true when chat is hidden, false when chat is visible).' },
        ],
        returns: 'returns true if the players chat was shown or hidden successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowChat',
    },
    showCol: {
        summary: '',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean indicating if the collision previews should be enabled or disabled.' },
        ],
        returns: '* returns true if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowCol',
    },
    showCursor: {
        summary: 'This function is used to show or hide a players cursor.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you want to show or hide the cursor of.' },
            { name: 'show', isOptional: false, isVariadic: false, summary: 'A boolean value determining whether to show (true) or hide (false) the cursor.' },
            { name: 'toggleControls', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether to disable controls whilst the cursor is showing. true implies controls are disabled, false implies controls remain enabled.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowCursor',
    },
    showSound: {
        summary: '',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean indicating if the world sound IDs should be printed in the debug window or not.' },
        ],
        returns: '* returns true if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowSound',
    },
    shutdown: {
        summary: 'This function shuts down the server.\nMake sure your server ACL setup has function.shutdown object protected.',
        parameters: [
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'the reason why the server has been shutdown. exitCode the server application exit code to be returned on shutdown. |20915' },
        ],
        returns: 'returns false if it was not possible to shut down the server.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Shutdown',
    },
    source: {
        summary: 'The player or element the event was attached to',
        parameters: [],
        returns: '',
        wiki: '',
    },
    sourceResource: {
        summary: 'The resource that called the event',
        parameters: [],
        returns: '',
        wiki: '',
    },
    sourceResourceRoot: {
        summary: 'The root of the resource that called the event',
        parameters: [],
        returns: '',
        wiki: '',
    },
    sourceTimer: {
        summary: 'Current timer in callback function.',
        parameters: [],
        returns: '',
        wiki: '',
    },
    spawnPlayer: {
        summary: 'This function spawns the player at an arbitary point on the map.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you want to spawn.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x co-ordinate to spawn the player at.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y co-ordinate to spawn the player at.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z co-ordinate to spawn the player at.' },
            { name: 'rotation', isOptional: true, isVariadic: false, summary: 'rotation of the player on spawn.' },
            { name: 'skinID', isOptional: true, isVariadic: false, summary: 'players skin on spawn. Character Skins' },
            { name: 'interior', isOptional: true, isVariadic: false, summary: 'interior the player will spawn into. Interior IDs' },
            { name: 'dimension', isOptional: true, isVariadic: false, summary: 'The ID of the dimension that the player should be in.' },
            { name: 'theTeam', isOptional: true, isVariadic: false, summary: 'the team the player will join.' },
        ],
        returns: 'returns true if the player was spawned successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SpawnPlayer',
    },
    spawnVehicle: {
        summary: 'Spawns a vehicle at any given position and rotation',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to spawn' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x position you wish to spawn the vehicle at' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The x position you wish to spawn the vehicle at' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The x position you wish to spawn the vehicle at' },
            { name: 'rx', isOptional: true, isVariadic: false, summary: 'The x rotation you wish to spawn the vehicle at' },
            { name: 'ry', isOptional: true, isVariadic: false, summary: 'The y rotation you wish to spawn the vehicle at' },
            { name: 'rz', isOptional: true, isVariadic: false, summary: 'The z rotation you wish to spawn the vehicle at' },
        ],
        returns: 'returns true if the vehicle spawned successfully, false if the passed argument does not exist or is not a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SpawnVehicle',
    },
    split: {
        summary: 'This function splits a string into substrings. You specify a character that will act as a\nseparating character; this will determine where to split the sub-strings. For example, it\ncan split the string Hello World into two strings containing the two words, by spliting\nusing a space as a separator.\nNote: You can use the function gettok to retrieve a single token from the string at a\nspecific index. This may be faster for one-off lookups, but considerably slower if you\nare going to check each token in a long string.',
        parameters: [
            { name: 'stringToSplit', isOptional: false, isVariadic: false, summary: 'The string you wish to split into parts.' },
            { name: 'separatingChar', isOptional: false, isVariadic: false, summary: 'A string of the character you want to split, or the ASCII|ASCII number representing the character you want to use to split.' },
        ],
        returns: 'returns a table of substrings split from the original string if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Split',
    },
    startResource: {
        summary: 'This function starts a resource either persistently or as a dependency of the current\nresource. If you start the resource persistently, the resource will run until stopped\neither using stopResource or by the server admin. A resource started as a dependency will\nstop when your resource stops, if no other resources have it as a depdendency. This is\nthe same effect as using an include in your meta.xml file.\nThe function also allows you to specify a number of boolean options. These allow you to\ndisable the loading of various aspects of the resource. This is generally useful for\neditors rather than for actual gamemodes. It could also be used as a way to preview a\nresource before enabling the scripting aspects, though this could produce unreliable\nresults. There is no way for a resource to tell if it is being run with any of these\nbooleans set.',
        parameters: [
            { name: 'resourceToStart', isOptional: false, isVariadic: false, summary: 'The resource that should be started.' },
            { name: 'persistent', isOptional: true, isVariadic: false, summary: 'A boolean specifying if the resource should continue to run even after the current resource has been stopped or not. If this is true then the resource will run until another resource or user terminates it or the server shuts down. If this is false then resourceToStart will stop when thisResource stops.' },
            { name: 'startIncludedResources', isOptional: true, isVariadic: false, summary: 'A boolean specifying if the resources included/dependant resources will be started.' },
            { name: 'loadServerConfigs', isOptional: true, isVariadic: false, summary: 'A boolean specifying if server side config (XML) files should be loaded with the resource.' },
            { name: 'loadMaps', isOptional: true, isVariadic: false, summary: 'A boolean specifying if any .map files will be started with the resource.' },
            { name: 'loadServerScripts', isOptional: true, isVariadic: false, summary: 'A boolean specifying if server side script files should be started alongside the resource.' },
            { name: 'loadHTML', isOptional: true, isVariadic: false, summary: 'A boolean specifying if HTML files should be started alongside the resource.' },
            { name: 'loadClientConfigs', isOptional: true, isVariadic: false, summary: 'A boolean specifying if client configs should be loaded alongside the resource.' },
            { name: 'loadClientScripts', isOptional: true, isVariadic: false, summary: 'A boolean specifying if client scripts should be loaded and started alongside the resource.' },
            { name: 'loadFiles', isOptional: true, isVariadic: false, summary: 'A boolean specifying if client-side files should be loaded alongside the resource.' },
        ],
        returns: 'returns true if the resource has been started successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StartResource',
    },
    stopObject: {
        summary: 'This will allow you to stop an object that is currently moving.',
        parameters: [
            { name: 'theobject', isOptional: false, isVariadic: false, summary: 'the object whose movement you wish to stop' },
        ],
        returns: '* true if successful. * false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StopObject',
    },
    stopResource: {
        summary: 'This function stops a running resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource that should be stopped.' },
        ],
        returns: 'returns true if the resource was stopped, false if the stopping failed, or an invalid resource was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StopResource',
    },
    stopSound: {
        summary: 'Stops the sound playback for specified sound element. The sound element is also destroyed.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element you want to stop playing.' },
        ],
        returns: 'returns true if the sound was successfully stopped, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StopSound',
    },
};
