import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_37: ApiDocumentationCatalog = {
    playPedVoiceLine: {
        summary: 'This function allows playing specific voice lines of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped who will speak the lines.' },
            { name: 'lineId', isOptional: false, isVariadic: false, summary: 'The ID of the line to be spoken (0-359). See [https://github.com/gta-reversed/gta-reversed/blob/de0b162385a92e5545058671a787ea43423cfc4d/source/game_sa/Audio/Enums/PedSpeechContexts.h ID List]' },
            { name: 'probability', isOptional: true, isVariadic: false, summary: 'The probability that the line will be spoken (0 - 1), where 1 means 100%.' },
        ],
        returns: 'The function returns nothing, always *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlayPedVoiceLine',
    },
    playSFX: {
        summary: 'This function plays a sound from GTA\'s big sound containers.',
        parameters: [
            { name: 'containerName', isOptional: false, isVariadic: false, summary: 'The name of the audio container. Possible values are: "feet", "genrl", "pain_a", "script", "spc_ea", "spc_fa", "spc_ga", spc_na", "spc_pa"' },
            { name: 'bankId', isOptional: false, isVariadic: false, summary: 'The audio bank id' },
            { name: 'soundId', isOptional: false, isVariadic: false, summary: 'The sound id within the audio bank' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'A boolean representing whether the sound will be looped' },
        ],
        returns: 'Returns a sound element if the sound was successfully created, *false* otherwise. Returns a sound element if the sound was successfully created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySFX',
    },
    playSFX3D: {
        summary: 'This function plays a sound in the GTA world from GTA\'s big sound containers.',
        parameters: [
            { name: 'containerName', isOptional: false, isVariadic: false, summary: 'The name of the audio container. Possible values are: "feet", "genrl", "pain_a", "script", "spc_ea", "spc_fa", "spc_ga", spc_na", "spc_pa"' },
            { name: 'bankId', isOptional: false, isVariadic: false, summary: 'The audio bank id' },
            { name: 'soundId', isOptional: false, isVariadic: false, summary: 'The sound id within the audio bank' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'A boolean representing whether the sound will be looped' },
        ],
        returns: 'Returns a sound element if the sound was successfully created, *false* otherwise. Returns a sound element if the sound was successfully created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySFX3D',
    },
    playSound: {
        summary: 'Creates a sound element and plays it immediately after creation for the local player.',
        parameters: [
            { name: 'soundPath', isOptional: false, isVariadic: false, summary: 'filepath, raw data or URL (http://, https:// or ftp://) of the sound file you want to play. (**Note:** Playing sound files from other resources requires the target resource to be in the running state)' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be looped. To loop the sound, use *true*. Loop is not available for streaming sounds, only for sound files.' },
            { name: 'throttled', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be throttled (i.e. given reduced download bandwidth). To throttle the sound, use *true*. Sounds will be throttled per default and only for URLs.' },
        ],
        returns: 'Returns a sound element if the sound was successfully created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySound',
    },
    playSound3D: {
        summary: 'Creates a sound element in the GTA world and plays it immediately after creation for the local player. setElementPosition can be used to move the sound element around after it has been created. Remember to use setElementDimension after creating the sound to play it outside of dimension 0.',
        parameters: [
            { name: 'soundPath', isOptional: false, isVariadic: false, summary: 'raw data or filepath to the sound file you want to play. (**Note:** Playing sound files from other resources requires the target resource to be in the running state)' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'a floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'a floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'a floating point number representing the Z coordinate on the map.' },
            { name: 'looped', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be looped. To loop the sound, use *true*.' },
            { name: 'throttled', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be throttled (i.e. given reduced download bandwidth). To throttle the sound, use *true*.' },
        ],
        returns: 'Returns a sound element if the sound was successfully created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySound3D',
    },
    playSoundFrontEnd: {
        summary: 'This function plays a frontend sound for the specified player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you want the sound to play for.' },
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a whole int specifying the sound id to play. Valid values are:' },
        ],
        returns: 'Returns *true* if the sound was successfully played, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PlaySoundFrontEnd',
    },
    pregFind: {
        summary: 'This function stops at the first occurrence of the pattern in the input string and returns the result of the search.',
        parameters: [
            { name: 'subject', isOptional: false, isVariadic: false, summary: 'The input string' },
            { name: 'pattern', isOptional: false, isVariadic: false, summary: 'The pattern string to search for in the input string.' },
            { name: 'flags', isOptional: true, isVariadic: false, summary: 'Conjuncted value that contains flags ( 1 - ignorecase, 2 - multiline, 4 - dotall, 8 - extended, 16 - unicode ) or ( i - Ignore case, m - Multiline, d - Dotall, e - Extended, u - Unicode )' },
        ],
        returns: 'Returns *true* if the pattern was found in the input string, *false* otherwise.',
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
        returns: 'Returns a *table* if one or more match is found, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PregMatch',
    },
    pregReplace: {
        summary: 'This function performs a regular expression search and replace and returns the replaced string.',
        parameters: [
            { name: 'subject', isOptional: false, isVariadic: false, summary: 'The input string.' },
            { name: 'pattern', isOptional: false, isVariadic: false, summary: 'The pattern string to search for in the input string.' },
            { name: 'replacement', isOptional: false, isVariadic: false, summary: 'The replacement string to replace all matches within the input string.' },
            { name: 'flags', isOptional: true, isVariadic: false, summary: 'Conjuncted value that contains flags ( 1 - ignorecase, 2 - multiline, 4 - dotall, 8 - extended, 16 - unicode ) or ( i - Ignore case, m - Multiline, d - Dotall, e - Extended, u - Unicode )' },
        ],
        returns: 'Returns the replaced *string*, or bool *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/PregReplace',
    },
    processLineAgainstMesh: {
        summary: 'Does a raycast against an element\'s renderable mesh model directly\nDoes a raycast against an element\'s renderable mesh model [not the collision model!].\nThe same functionality is already present in processLineOfSight, but the latter is a little buggy due to the fact that the collision model is always simplified, and not exactly the same as the mesh, which leads to situations where no hit is detected, even though the visible mesh is hittable [or vice versa].\nAlso, when one is interested in a specific element the overhead is a lot smaller [as we can skip all the collision detection done by the before-mentioned function].',
        parameters: [
            { name: 'toTest', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: '***hit:** *true* if there is a collision with the given element\'s mesh, *false* otherwise [in which case all other values are nil] ***texU, texV:** the U, V coordinates on the hit geometry\'s texture ***textureName:** name of the hit geometry\'s texture ***frameName:** hit frame\'s name ***worldX, worldY, worldZ:** collision position in world space',
        wiki: 'https://wiki.multitheftauto.com/wiki/ProcessLineAgainstMesh',
    },
    processLineOfSight: {
        summary: 'This function casts a ray between two points in the world, and tells you information about the point that was hit, if any. The two positions **must** be within the local player\'s draw distance as the collision data is not loaded outside this area, and the call will just fail as if the ray didn\'t hit.\n\nThis function is relatively expensive to call, so over use of this in scripts may have a detrimental effect on performance.\n\nThis function is useful for checking for collisions and for editor-style scripts. If you wish to find what element is positioned at a particular point on the screen, use this function combined with getWorldFromScreenPosition. If you wish to just know if something is hit, and don\'t care about what or where was hit, use isLineOfSightClear.',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'The start *x* position' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'The start *y* position' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'The start *z* position' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: 'The end *x* position' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: 'The end *y* position' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: 'The end *z* position' },
            { name: 'checkBuildings', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTA\'s internally placed buildings, i.e. the world map.' },
            { name: 'checkVehicles', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by vehicles.' },
            { name: 'checkPlayers', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by players.' },
            { name: 'checkObjects', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by objects.' },
            { name: 'checkDummies', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to be blocked by GTA\'s internal dummies. These are not used in the current MTA version so this argument can be set to *false*.' },
            { name: 'seeThroughStuff', isOptional: true, isVariadic: false, summary: 'Allow the line of sight **pass through** collision materials that have this flag enabled (By default material IDs 52, 55 and 66 which are some fences that you can shoot throug but still walk on them).' },
            { name: 'ignoreSomeObjectsForCamera', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to **pass through** objects that have (K) property enabled in "object.dat" data file. (i.e. Most dynamic objects like boxes or barrels)' },
            { name: 'shootThroughStuff', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to **pass through** collision materials that have this flag enabled (By default material IDs 28, 29, 31, 32, 33, 74, 75, 76, 77, 78, 79, 96, 97, 98, 99, 100 which are exclusively sand / beach or underwater objects).' },
            { name: 'ignoredElement', isOptional: true, isVariadic: false, summary: 'Allow the line of sight to **pass through** a certain specified element. This is usually set to the object you are tracing from so it does not interfere with the results.' },
            { name: 'includeWorldModelInformation', isOptional: true, isVariadic: false, summary: 'Include the results of hitting a world model.' },
            { name: 'bIncludeCarTyres', isOptional: true, isVariadic: false, summary: 'Includes car tyre hits.' },
            { name: 'bIncludeExtraMateriaInfo', isOptional: true, isVariadic: false, summary: 'Include the material info like UV coords, textureName, frameName and exact position hit on the model.' },
        ],
        returns: '***hit:** *true* if there is a collision, *false* otherwise The other values are only filled if there is a collision, they contain *nil* otherwise ***hitX, hitY, hitZ:** collision position ***hitElement:** the MTA element hit if any, *nil* otherwise ***normalX, normalY, normalZ:** the normal of the surface hit ***material:** an integer representing the GTASA material ID of the surface hit when applicable (world, objects) ***lighting:** a float between 0 (fully dark) and 1 (bright) representing the amount of light that the hit building surface will transfer to peds or vehicles that are in contact with it. The value can be affected by the game time of day, usually with a lower (darker) value being returned during the night. ***piece:** an integer representing the part of the element hit if hitElement is a vehicle or a ped/player, *0* otherwise. **For a ped/player, piece represents the body part hit: **For vehicles, piece represents the vehicle part hit: ***worldModelID:** If includeWorldModelInformation was set to *true* and a world model was hit, this will contain the model ID. ***worldModelPositionX,Y,Z:** If worldModelID is set, this will contain the world model position. ***worldModelRotationX,Y,Z:** If worldModelID is set, this will contain the world model rotation. ***worldLODModelID:** If worldModelID is set, this will contain the LOD model ID if applicable. ***uvX, uvY:** If bIncludeExtraMateriaInfo is set, it contains the texture UV positions of the hit triangle of the hit entity. ***textureName:** Same as above, but contains the texture name. ***frameName:** Same as above, but contains the frame name. (This, for example in case of cars this is (but not limited to) a Vehicle Components) ***modelHitX, modelHitY, modelHitZ:** Same as above, but contains the exact position hit on the model itself (It is much more precise than the `hitX, hitY, hitZ` returned above, as those are only processed against the much more simpler collision mesh, while these are obtained from processing the visual mesh itself (the DFF))',
        wiki: 'https://wiki.multitheftauto.com/wiki/ProcessLineOfSight',
    },
    redirectPlayer: {
        summary: 'This function redirects the player to a specified server.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you want to redirect' },
            { name: 'serverIP', isOptional: true, isVariadic: false, summary: 'The IP address (or domain name that resolves to the IP address) of the server you want to redirect the player to. **Use an empty string to reconnect to the same server.**' },
            { name: 'serverPort', isOptional: true, isVariadic: false, summary: 'The game port of the server you want to redirect the player to, this is usually 22003. **Set to zero to use the same port as the current server.**' },
            { name: 'serverPassword', isOptional: true, isVariadic: false, summary: 'The password for the server if it\'s protected' },
        ],
        returns: 'Returns *true* if the player was redirected successfully, *false* if bad arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RedirectPlayer',
    },
    ref: {
        summary: 'This function will create a reference to the given argument.',
        parameters: [
            { name: 'objectToReference', isOptional: false, isVariadic: false, summary: 'The Lua element, which you want to reference' },
        ],
        returns: 'Returns an *int* if the reference were successfully created. Returns *false* if the parameter were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Ref',
    },
    refreshResources: {
        summary: 'This function finds new resources and checks for changes to the current ones.',
        parameters: [
            { name: 'refreshAll', isOptional: true, isVariadic: false, summary: 'If *true* MTA will check for changes in all resources. If *false*, MTA will only check for new resources and try to reload resources with errors' },
            { name: 'targetResource', isOptional: true, isVariadic: false, summary: 'If set, the refresh is restricted to the supplied resource only' },
        ],
        returns: 'Returns true if refresh was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RefreshResources',
    },
    reloadBans: {
        summary: 'This function will reload the server ban list file.',
        parameters: [],
        returns: 'Returns *true* if the ban list was reloaded successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ReloadBans',
    },
    reloadBrowserPage: {
        summary: 'This function reloads the current browser\'s page.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser that you want to reload.' },
            { name: 'ignoreCache', isOptional: true, isVariadic: false, summary: 'Ignoring cached content, Equivalent to "Shift + F5" in most browsers' },
        ],
        returns: 'Returns *true* if the browser has reloaded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ReloadBrowserPage',
    },
    reloadPedWeapon: {
        summary: 'This function makes a pedestrian reload their weapon.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped who will reload their weapon.' },
        ],
        returns: 'Returns *true* if the pedestrian was made to reload, or *false* if invalid arguments were passed or that pedestrian has a weapon which cannot be reloaded. **Note:** this will fail but return true if 1) the ped is crouched and moving 2) the ped is using a weapon without clip ammo (or minigun/flamethrower/fire extinguisher) 3) the ped is using his weapon (shooting/aiming) 4) the ped moved while crouching recently Due to these circumstances causing problems with this function',
        wiki: 'https://wiki.multitheftauto.com/wiki/ReloadPedWeapon',
    },
    removeAccount: {
        summary: 'This function is used to delete existing player accounts.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to remove' },
        ],
        returns: 'Returns *true* if account was successfully removed, *false* if the account does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveAccount',
    },
    removeBan: {
        summary: 'This function will remove a specific ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban to be removed.' },
            { name: 'responsibleElement', isOptional: true, isVariadic: false, summary: 'The element that is responsible for removing the ban element. This can be a player or the root (getRootElement()).' },
        ],
        returns: 'Returns *true* if the ban was removed succesfully, *false* if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveBan',
    },
    removeColPolygonPoint: {
        summary: 'This function is used to remove a point from an existing colshape polygon.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to remove a point from.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'The index of the point you wish to remove. The points are indexed in order, with 1 being the first bound point. You can\'t remove the last 3 points.' },
        ],
        returns: 'Returns *true* if the polygon was changed, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveColPolygonPoint',
    },
    removeCommandHandler: {
        summary: 'This function removes a command handler, that is one that has been added using addCommandHandler. This function can only remove command handlers that were added by the resource that it is called in.',
        parameters: [
            { name: 'commandName', isOptional: false, isVariadic: false, summary: 'the name of the command you wish to remove.' },
            { name: 'handler', isOptional: true, isVariadic: false, summary: 'the specific handler function to remove. If not specified, all handler functions for the command (from the calling resource) will be removed. *This argument is only available in the server.*' },
        ],
        returns: 'Returns *true* if the command handler was removed successfully, *false* if the command doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveCommandHandler',
    },
    removeDebugHook: {
        summary: 'This function removes hooks added by addDebugHook',
        parameters: [
            { name: 'hookType', isOptional: false, isVariadic: false, summary: 'The type of hook to remove. This can be:' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'The callback function to remove' },
        ],
        returns: 'Returns *true* if the hook was successfully removed, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RemoveDebugHook',
    },
};
