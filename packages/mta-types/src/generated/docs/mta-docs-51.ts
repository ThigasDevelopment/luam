import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_51: ApiDocumentationCatalog = {
    setWeaponClipAmmo: {
        summary: 'This function sets the ammo left in a custom weapon\'s magazine/clip.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to set the clip ammo of.' },
            { name: 'clipAmmo', isOptional: false, isVariadic: false, summary: 'The amount of ammo in the clip.' },
        ],
        returns: 'This function returns *true* if the arguments are valid and the weapon clip ammo could be changed; *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponClipAmmo',
    },
    setWeaponFiringRate: {
        summary: 'This function sets the firing rate to be used when a custom weapon is in *firing* state.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to modify the firing rate of.' },
            { name: 'firingRate', isOptional: false, isVariadic: false, summary: 'The weapon firing rate. It seems to be a kind of frecuency value, so the lower the quicker the custom weapon will shoot.' },
        ],
        returns: 'Returns *true* on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponFiringRate',
    },
    setWeaponFlags: {
        summary: 'This function sets a custom weapon flags, used to change how it behaves or finds a possible target to shoot.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon element to set the flag of.' },
            { name: 'theFlag', isOptional: false, isVariadic: false, summary: 'the weapon flag to change (all of them can be *true* or *false*):' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'whether to enable or disable the specified flag.' },
        ],
        returns: 'Returns *true* if all arguments are valid and the flags where changed; *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponFlags',
    },
    setWeaponProperty: {
        summary: 'This function sets the weapon property of the specified weapons specified weapon type. See lower down the page for documentation related to weapon creation.',
        parameters: [
            { name: 'weaponName', isOptional: false, isVariadic: false, summary: '' },
            { name: 'weaponSkill', isOptional: false, isVariadic: false, summary: 'Either: "pro", "std" or "poor". The player must have this skill level set to have the effect.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you want to set the value of:' },
            { name: 'theValue', isOptional: false, isVariadic: false, summary: 'The value to set the property to.' },
        ],
        returns: 'On success: **bool:** Returns true if the weapon property was successfully set On failure: **bool:** Returns false if the weapon property was unable to be set The client side function only applies to custom weapons created client sided. Returns *true* if the property was set.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponProperty',
    },
    setWeaponRenderEnabled: {
        summary: 'This function allows you to completely disable/enable GTA weapon rendering for ped and player. It is particularly useful for creating custom weapon systems, where singular weapon ID could have many different models/variations, or to simply get rid of one frame delay when switching weapons.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'Whether weapon render should be enabled.' },
        ],
        returns: 'Always returns **true**.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponRenderEnabled',
    },
    setWeaponState: {
        summary: 'This function sets a custom weapon\'s state.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon you wish to set the state of.' },
            { name: 'theState', isOptional: false, isVariadic: false, summary: 'the state you wish to set:' },
        ],
        returns: 'Returns *true* on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponState',
    },
    setWeaponTarget: {
        summary: 'This function sets the target of a custom weapon. There are 3 different targeting modes, which are explained below.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to clear the target of.' },
            { name: 'theTarget', isOptional: false, isVariadic: false, summary: 'The element to shoot at. It can be a player, ped, vehicle or object.' },
            { name: 'theComponent', isOptional: true, isVariadic: false, summary: 'The component of the target to shoot at. This argument is only relevant when used in the following element types:' },
        ],
        returns: 'Returns *true* on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponTarget',
    },
    setWeather: {
        summary: 'This function sets the current weather to the given valid value. To change the weather gradually, see setWeatherBlended.',
        parameters: [
            { name: 'weatherID', isOptional: false, isVariadic: false, summary: 'The ID of new weather. Valid values are 0 to 255 inclusive.' },
        ],
        returns: 'Returns *true* if the weather was set succesfully, *false* if an invalid *weatherID* was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeather',
    },
    setWeatherBlended: {
        summary: 'This function will change the current weather to another in a smooth manner, over the period of 1-2 in-game hours (unlike setWeather, which sets a new weather instantly). To ensure this transition performs as expected, you should not call this function until getWeather indicates that no transition is already being done.',
        parameters: [
            { name: 'weatherID', isOptional: false, isVariadic: false, summary: 'The ID of the weather state you wish to set. Valid values are 0 to 255 inclusive.' },
        ],
        returns: 'Returns *true* if successful, *false* if an invalid *weatherID* is passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeatherBlended',
    },
    setWindowFlashing: {
        summary: 'This function allows the window to flash in the Windows taskbar.',
        parameters: [
            { name: 'shouldFlash', isOptional: false, isVariadic: false, summary: 'whether the window should flash' },
            { name: 'count', isOptional: true, isVariadic: false, summary: 'the number of times the window should flash, defaults to **10 times**' },
        ],
        returns: 'Returns **false** if: * the window is already in focus * the client has disabled this feature Returns **true** otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWindowFlashing',
    },
    setWindVelocity: {
        summary: 'This function changes the wind velocity. The wind shakes the vegetation and makes particles fly in a direction. The intensity and direction of the effect deppends of the wind velocity in each axis.',
        parameters: [
            { name: 'velocityX', isOptional: false, isVariadic: false, summary: 'The velocity of the wind along the x axis.' },
            { name: 'velocityY', isOptional: false, isVariadic: false, summary: 'The velocity of the wind along the y axis.' },
            { name: 'velocityZ', isOptional: false, isVariadic: false, summary: 'The velocity of the wind along the z axis.' },
        ],
        returns: 'Returns *true* if successful, *false* if bad arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWindVelocity',
    },
    setWorldProperty: {
        summary: 'This function is used to override time cycle and weather related properties. Preview (album): https://imgur.com/a/jeUxx7L',
        parameters: [
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you wish to override.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'At least one value has to be provided.' },
            { name: 'value', isOptional: true, isVariadic: false, summary: 'At least one value has to be provided.' },
            { name: 'value', isOptional: true, isVariadic: false, summary: 'At least one value has to be provided.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWorldProperty',
    },
    setWorldSoundEnabled: {
        summary: 'This function allows you to disable world sounds. A world sound is a sound effect which has ***not*** been caused by playSound or playSound3D.',
        parameters: [
            { name: 'group', isOptional: false, isVariadic: false, summary: 'An integer representing the world sound group.' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'An integer representing an individual sound within the group' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set to *false* to disable, *true* to enable.' },
            { name: 'immediate', isOptional: true, isVariadic: false, summary: 'A boolean if set to true will cancel the sound if it\'s already playing. This parameter only works for stopping the sound.' },
        ],
        returns: 'Returns *true* if the world sound was correctly enabled/disabled, *false* if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWorldSoundEnabled',
    },
    setWorldSpecialPropertyEnabled: {
        summary: 'Added also as a server-side function. Previously only available as a client-side function.\n\nEnables or disables a special world property.',
        parameters: [
            { name: 'propname', isOptional: false, isVariadic: false, summary: 'the name of the property to set. Possible values are:' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'whether or not to enable the property.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWorldSpecialPropertyEnabled',
    },
    sha256: {
        summary: 'Calculates the sha256 hash of the specified string.',
        parameters: [
            { name: 'str', isOptional: false, isVariadic: false, summary: 'the string to hash.' },
        ],
        returns: 'Returns the sha256 hash of the input string if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Sha256',
    },
    shakeCamera: {
        summary: 'This function allows you to trigger camera shake effect (just like explosion does).',
        parameters: [
            { name: 'force', isOptional: false, isVariadic: false, summary: 'Intensity and time of the shake. The higher the value, the longer the camera shakes' },
            { name: 'x', isOptional: true, isVariadic: false, summary: 'Center X coordinate of the shake.' },
            { name: 'y', isOptional: true, isVariadic: false, summary: 'Center Y coordinate of the shake.' },
            { name: 'z', isOptional: true, isVariadic: false, summary: 'Center Z coordinate of the shake.' },
        ],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShakeCamera',
    },
    showChat: {
        summary: 'This function is used to show or hide the player\'s chat.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose chat is to be hidden or shown.' },
            { name: 'show', isOptional: false, isVariadic: false, summary: 'A boolean value determining whether to show (*true*) or hide (*false*) the chat.' },
            { name: 'inputBlocked', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether chat input is blocked/hidden, regardless of chat visibility. If unset, this will keep the default behaviour prior to r20898 (*true* when chat is hidden, *false* when chat is visible).' },
        ],
        returns: 'Returns *true* if the player\'s chat was shown or hidden successfully, *false* otherwise. ```lua bool showChat ( player thePlayer, bool show [, bool inputBlocked ] ) ``` Returns *true* if the player\'s chat was shown or hidden successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowChat',
    },
    showCol: {
        summary: 'Shows collision previews for developers (colshapes in wireframe, useful when writing scripts).',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean indicating if the collision previews should be enabled or disabled.' },
        ],
        returns: '* Returns *true* if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowCol',
    },
    showCursor: {
        summary: 'This function is used to show or hide a player\'s cursor.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you want to show or hide the cursor of.' },
            { name: 'show', isOptional: false, isVariadic: false, summary: 'A boolean value determining whether to show (*true*) or hide (*false*) the cursor.' },
            { name: 'toggleControls', isOptional: true, isVariadic: false, summary: 'A boolean value determining whether to disable controls whilst the cursor is showing. *true* implies controls are disabled, *false* implies controls remain enabled.' },
        ],
        returns: 'Returns *true* if the player\'s cursor was shown or hidden successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowCursor',
    },
    showSound: {
        summary: 'Prints world sound IDs in the debug output window to help when writing scripts with setWorldSoundEnabled.',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean indicating if the world sound IDs should be printed in the debug window or not.' },
        ],
        returns: '* Returns *true* if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ShowSound',
    },
    shutdown: {
        summary: 'This function shuts down the server.\n\nMake sure your server ACL setup has function.shutdown object protected.',
        parameters: [
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'the reason why the server has been shutdown.' },
            { name: 'exitCode', isOptional: true, isVariadic: false, summary: 'the server application exit code to be returned on shutdown.' },
        ],
        returns: 'Returns *false* if it was not possible to shut down the server.',
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
        summary: 'This function spawns the player at an arbitrary point on the map.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you want to spawn.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x co-ordinate to spawn the player at.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y co-ordinate to spawn the player at.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z co-ordinate to spawn the player at.' },
            { name: 'rotation', isOptional: true, isVariadic: false, summary: 'rotation of the player on spawn.' },
            { name: 'skinID', isOptional: true, isVariadic: false, summary: 'player\'s skin on spawn. Character Skins' },
            { name: 'interior', isOptional: true, isVariadic: false, summary: 'interior the player will spawn into. Interior IDs' },
            { name: 'dimension', isOptional: true, isVariadic: false, summary: 'The ID of the dimension that the player should be in.' },
            { name: 'theTeam', isOptional: true, isVariadic: false, summary: 'the team the player will join.' },
        ],
        returns: 'Returns *true* if the player was spawned successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SpawnPlayer',
    },
};
