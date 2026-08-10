import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_42: ApiDocumentationCatalog = {
    setPedStat: {
        summary: '*Things like infinite run, fire proof CJ, 150 armor have special activation flags. They\nneed a way to be triggered on/off.\nThis function allows you to set the value of a specific statistic for a ped. Visual stats\n(FAT and BODY_MUSCLE) can only be used on the CJ skin, they have no effect on other\nskins. When this function is used client-side, it can only be used on client-side created\npeds.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': the ped whose statistic you want to modify.' },
            { name: 'stat', isOptional: false, isVariadic: false, summary: ': the stat ID.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: ': the new value of the stat. It must be between 0 and 1000.' },
        ],
        returns: 'returns true if the statistic was changed succesfully. returns false if an invalid player is specified, if the stat id/value is out of acceptable range or if the fat or body_muscle stats are used on non-cj players.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedStat',
    },
    setPedTargetingMarkerEnabled: {
        summary: 'This function is used to toggle the health target marker on top of all pedestrians.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean denoting whether we want to enable (true) or disable (false) the markers.' },
        ],
        returns: 'returns true if the markers were enabled, false if werent or if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedTargetingMarkerEnabled',
    },
    setPedVoice: {
        summary: 'Changes the voice of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose voice to change.' },
            { name: 'voiceType', isOptional: false, isVariadic: false, summary: 'the voice type. See ped voices for possible types.' },
            { name: 'voiceName', isOptional: false, isVariadic: false, summary: 'the voice name within the specified type. See ped voices for possible voices.' },
        ],
        returns: 'returns true when the voice was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedVoice',
    },
    setPedWalkingStyle: {
        summary: 'Sets the walking style of a ped. A walking style consists of a set of animations that are\nused for walking, running etc.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose walking style to change.' },
            { name: 'style', isOptional: false, isVariadic: false, summary: 'the walking style to set. The possible walking styles are:' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedWalkingStyle',
    },
    setPedWeaponSlot: {
        summary: 'This function changes the selected weapon slot of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose weapon slot you want to set. In a clientside script, this cannot be used on remote players.' },
            { name: 'weaponSlot', isOptional: false, isVariadic: false, summary: 'the weapon slot to set.' },
        ],
        returns: 'returns true if successful in setting the peds equipped weapon slot, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedWeaponSlot',
    },
    setPedWearingJetpack: {
        summary: 'This function is used to give or take a jetpack from a ped, it wont work if the ped is in\na vehicle.\nAs such, you should either expect it to fail sometimes, or repeatedly try to give a\njetpack every second or so until isPedWearingJetpack returns true. Alternatively, you can\nforce the ped into a safe position (e.g. standing on the ground) before giving the\njetpack, or use a pickup to handle it.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you want to give a jetpack to.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean representing whether to give or take the jetpack.' },
        ],
        returns: 'returns true if a jetpack was successfully set for the ped, false if setting it failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedWearingJetpack',
    },
    setPickupRespawnInterval: {
        summary: 'Sets the time it takes for a pickup to respawn after a player picked it up.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'the pickup to set the respawn time of' },
            { name: 'ms', isOptional: false, isVariadic: false, summary: 'the new respawn time in ms' },
        ],
        returns: 'returns true if the new respawn time was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPickupRespawnInterval',
    },
    setPickupType: {
        summary: 'This function allows changing the type of a pickup to a Weapon, Armour or Health pickup,\nand allows you to set the health points or the weapon and ammo that the pickup will give.',
        parameters: [
            { name: 'thePickup', isOptional: false, isVariadic: false, summary: 'The pickup which you wish to change the settings of' },
            { name: 'theType', isOptional: false, isVariadic: false, summary: ': An integer representing the type of pickup. You can choose from: 0 : Health Pickup 1 : Armour Pickup 2 : Weapon Pickup 3 : Custom Pickup amount : This is an integer representing the amount of Health points or Armour points a pickup has. **OR** weapon : If the type is a Weapon pickup, then it represents the Weapon|weapon ID of the weapon pickup the ammo field must be entered if the type is Weapon Pickup. **OR** model : If the pickup is a custom model, this is the model id to use. Many non-pickup models can be used, though some may cause crashes. The following is a list of models designed to be used as pickups. 370 Jetpack 1240 Health (heart) 1242 Armour 1272 House (blue) 1273 House (green) 1274 Money (dollar symbol) 1277 Save (floppy disk)' },
            { name: 'amount_weapon_model', isOptional: false, isVariadic: false, summary: '' },
            { name: 'ammo', isOptional: true, isVariadic: false, summary: ': An integer representing the amount of ammo a pickup contains. This argument is only valid when the pickup type is a Weapon Pickup, and must be specified in that case.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPickupType',
    },
    setPlayerAnnounceValue: {
        summary: 'This function allows you to change ASE announce values for any player using a specified\nkey.\nAs an example this can be used to change the score value which will be shown at\nhttps://www.game-state.com/ game-state.coms server list.\nFor server-wide changes you can use setRuleValue!',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whos announce value you wish to change.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key which the value will be stored at.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you wish to store.' },
        ],
        returns: 'returns true if the value was set succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerAnnounceValue',
    },
    setPlayerBlurLevel: {
        summary: 'Sets the motion blur level on the clients screen. Accepts a value between 0 and 255.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose blur level will be changed.' },
            { name: 'level', isOptional: false, isVariadic: false, summary: 'The level to set the blur to (default: 36)' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerBlurLevel',
    },
    setPlayerHudComponentVisible: {
        summary: 'This function will show or hide a part of the players HUD.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player element for which you wish to show/hide a HUD component' },
            { name: 'component', isOptional: false, isVariadic: false, summary: 'The component you wish to show or hide. Valid values are: all All of the following at the same time ammo The display showing how much ammo the player has in their weapon area_name The text that appears containing the name of the area a player has entered armour The display showing the players armor breath The display showing the players breath clock The display showing the in-game time health The display showing the players health money The display showing how much money the player has radar The bottom-left corner miniradar vehicle_name The text that appears containing the players vehicle name when the player enters a vehicle weapon The display showing the players weapon radio The display showing the radio label wanted The display showing the players wanted level crosshair The weapon crosshair and sniper scope' },
            { name: 'show', isOptional: false, isVariadic: false, summary: 'Specify if the component should be shown (true) or hidden (false)' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerHudComponentVisible',
    },
    setPlayerMoney: {
        summary: 'Sets a players money to a certain value, regardless of current player money. It should be\nnoted that setting negative values does not work and in fact gives the player large\namounts of money.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'Which player to set the money of.' },
            { name: 'amount', isOptional: false, isVariadic: false, summary: 'A whole integer specifying the new amount of money the player will have.' },
            { name: 'instant', isOptional: true, isVariadic: false, summary: 'If set to true money will be set instantly without counting up/down like in singleplayer.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerMoney',
    },
    setPlayerMuted: {
        summary: 'Use this function to mute or unmute the player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you are muting or unmuting.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'Use true to mute and false to unmute the player.' },
        ],
        returns: 'returns true if the player was successfully muted or unmuted, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerMuted',
    },
    setPlayerName: {
        summary: 'This function changes the specified players name. Note that any change made to a players\nname with this function is not saved in their settings so the name change only lasts till\nthey disconnect.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player that will have its name set.' },
            { name: 'newName', isOptional: false, isVariadic: false, summary: 'the new name to set for the player.' },
        ],
        returns: 'returns true if the player name was changed succesfully, false if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerName',
    },
    setPlayerNametagColor: {
        summary: 'This allows you to change the RGB color mixture in the name tags of players.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose name tag text you wish to change the color of' },
            { name: 'r', isOptional: false, isVariadic: false, summary: 'The amount of red you want in the mixture of RGB (0-255 is valid)' },
            { name: 'g', isOptional: false, isVariadic: false, summary: 'The amount of green you want in the mixture of RGB (0-255 is valid)' },
            { name: 'b', isOptional: false, isVariadic: false, summary: 'The amount of blue you want in the mixture of RGB (0-255 is valid) false If false is specified instead of the colors, the nametag color will reset to defaulting to your team color.' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerNametagColor',
    },
    setPlayerNametagShowing: {
        summary: 'Use this to define whether the players name tag is visible or invisible.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'Define the player whos tag visiblity status you want to change' },
            { name: 'showing', isOptional: false, isVariadic: false, summary: 'Use true or false to show/hide the tag' },
        ],
        returns: 'returns true if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerNametagShowing',
    },
    setPlayerNametagText: {
        summary: 'This will change the text of a players nickname in the world to something besides the\nnickname he chose. This will not change the players actual nickname, it only changes the\nvisible aspect inside the world (you will see his original nickname in the scoreboard and\nwill refer to his original name in scripts).',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose nickname text you wish to change' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The new nickname text that will be displayed' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerNametagText',
    },
    setPlayerScriptDebugLevel: {
        summary: 'This will set players debug level, equivalent to Debugging|debugscript .',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose debug level you wish to change' },
            { name: 'level', isOptional: false, isVariadic: false, summary: '0: close debug console, 1: only errors, 2: errors and warnings, 3: errors, warnings and info messages' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerScriptDebugLevel',
    },
    setPlayerTeam: {
        summary: 'This function adds a player to an existing team. The player will automatically be removed\nfrom his current team if hes on one.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to add to a team.' },
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you want to add the player to, or nil if you wish to unassign a player from his team.' },
        ],
        returns: 'returns true if the player was successfully added to the specified team or removed from his previous one, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerTeam',
    },
    setPlayerVoiceBroadcastTo: {
        summary: 'This function allows you to change who can hear the voice of a player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to change' },
            { name: 'broadcastTo', isOptional: false, isVariadic: false, summary: 'Element or table of elements who should hear the voice from this player' },
        ],
        returns: 'returns true if the value was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerVoiceBroadcastTo',
    },
    setPlayerVoiceIgnoreFrom: {
        summary: 'This function allows you to mute voices for a player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to change' },
            { name: 'ignoreFrom', isOptional: false, isVariadic: false, summary: 'Element or table of elements which the player should not hear voices from. Use nil if no one should be ignored.' },
        ],
        returns: 'returns true if the value was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerVoiceIgnoreFrom',
    },
    setPlayerWantedLevel: {
        summary: 'This function is used to set a players wanted level. The wanted level is indicated by the\namount of stars a player has on the GTA HUD.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose wanted level is to be set' },
            { name: 'stars', isOptional: false, isVariadic: false, summary: 'An integer from 0 to 6 representing the wanted level' },
        ],
        returns: 'returns true if the wanted level was set successfully, false if any of the arguments were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerWantedLevel',
    },
    setProjectileCounter: {
        summary: 'Will change the projectile counter timer which depending on the projectile type will do\ndifferent things:\n* Rockets and Grenades will explode when it hits 0\n* Teargas may be a duration timer\n* Satchels restart (we currently assume it doesnt cause an effect)\n* Molotov will explode with search ground level when it hits 0',
        parameters: [
            { name: 'projectile', isOptional: false, isVariadic: false, summary: 'The projectile to edit the timer of.' },
            { name: 'timeToDetonate', isOptional: false, isVariadic: false, summary: 'The time in milliseconds to detonation.' },
        ],
        returns: 'returns true on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetProjectileCounter',
    },
    setRadarAreaColor: {
        summary: 'Sets the color of an existing radar area.',
        parameters: [
            { name: 'theRadarArea', isOptional: false, isVariadic: false, summary: 'the radararea element whose color you wish to set.' },
            { name: 'r', isOptional: false, isVariadic: false, summary: 'an integer representing the amount of red in the color (0 for no red, 255 for solid red)' },
            { name: 'g', isOptional: false, isVariadic: false, summary: 'an integer representing the amount of green in the color (0 for no green, 255 for solid green)' },
            { name: 'b', isOptional: false, isVariadic: false, summary: 'an integer representing the amount of blue in the color (0 for no blue, 255 for solid blue)' },
            { name: 'a', isOptional: false, isVariadic: false, summary: 'an integer representing the colors alpha (0 for transparent, 255 for opaque)' },
        ],
        returns: 'returns true if the color was set successfully, false if the radar area doesnt exist or the color arguments are improper.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetRadarAreaColor',
    },
    setRadarAreaFlashing: {
        summary: 'This function makes an existing radar area flash in transparency.',
        parameters: [
            { name: 'theRadarArea', isOptional: false, isVariadic: false, summary: 'the radararea element we want to change flashing state of.' },
            { name: 'flash', isOptional: false, isVariadic: false, summary: 'a bool indicating whether the radar area should flash (true to flash, false to not flash).' },
        ],
        returns: 'returns true if the new flash state was successfully set, false if the radar area doesnt exist or invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetRadarAreaFlashing',
    },
};
