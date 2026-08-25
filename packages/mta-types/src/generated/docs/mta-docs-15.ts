import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_15: ApiDocumentationCatalog = {
    getCameraMatrix: {
        summary: 'This function gets the position of the camera and the position of the point it is facing.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera matrix is to be returned.' },
        ],
        returns: 'This function returns 8 floats if the argument is valid (when applicable); the first three indicate the position of the camera, the next three indicate the position of the point it\'s facing, and the last two are the roll and field of view. Returns *false* if the argument is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraMatrix',
    },
    getCameraShakeLevel: {
        summary: 'This function gets the camera shake level set by setCameraShakeLevel.',
        parameters: [],
        returns: 'returns an integer representing the camera shake level, from 0 (no shaking effect) to 255 (maximum shaking effect). by default, the camera has no shaking effect.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraShakeLevel',
    },
    getCameraTarget: {
        summary: 'This function returns an element that corresponds to the current target of the specified player\'s camera (i.e. what it is following).',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera you wish to receive the target of.' },
        ],
        returns: '* Returns an element of the target if the function was successful, or *false* if bad arguments were specified * Returns *false* if the camera is in Fixed mode and has no target.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraTarget',
    },
    getCameraViewMode: {
        summary: 'This function allows you to get the active camera view modes. This indicates at what distance the camera will follow the player or vehicle.',
        parameters: [],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraViewMode',
    },
    getCancelReason: {
        summary: 'Gets the reason for cancelling an event.',
        parameters: [],
        returns: 'Returns the reason that was given with cancelEvent',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCancelReason',
    },
    getChatboxCharacterLimit: {
        summary: '',
        parameters: [],
        returns: 'Returns a number between 0-255, representing the chatbox input character limit',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetChatboxCharacterLimit',
    },
    getChatboxLayout: {
        summary: 'Returns information about how the chatbox looks.\n\nThese values come from the file called: Chatboxpresets.xml but it depends on what type of preset you currently have, which is chosen from your settings in the \'Interface\' tab.',
        parameters: [
            { name: 'CVar', isOptional: true, isVariadic: false, summary: 'the name of the property you want returned. Can be the following values:' },
        ],
        returns: '*4 numbers if the CVar contains "color" *2 numbers if **chat_scale** was entered *1 number if any other CVar was specified *a table of all CVar values, if CVar was not specified **false* if an invalid CVar was specified',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetChatboxLayout',
    },
    getClothesByTypeIndex: {
        summary: 'This function is used to get the texture and model of clothes by the clothes type and index.\n(Scans through the list of clothes for the specific type).',
        parameters: [
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: 'An integer representing the clothes slot/type to scan through.' },
            { name: 'clothesIndex', isOptional: false, isVariadic: false, summary: 'An integer representing the index (0 based) set of clothes in the list you wish to retrieve. Each type has a different number of valid indexes.' },
        ],
        returns: 'This function returns 2 strings, a texture and model respectively, *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetClothesByTypeIndex',
    },
    getClothesTypeName: {
        summary: 'This function is used to get the name of a certain clothes type.',
        parameters: [
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: 'An integer determining the type of clothes you want to get the clothes of.' },
        ],
        returns: 'This function returns a string (the name of the clothes type) if found, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetClothesTypeName',
    },
    getCloudsEnabled: {
        summary: 'This function will tell you if clouds are enabled or disabled.',
        parameters: [],
        returns: 'Returns *true* if the clouds are enabled or *false* if clouds are disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCloudsEnabled',
    },
    getColorFilter: {
        summary: '',
        parameters: [
            { name: 'isOriginal', isOptional: false, isVariadic: false, summary: 'A bool indicates if the return values of color filter are GTASA original or changed by setColorFilter. If this is set to *false*, the return values would be the color filter that is currently being used.' },
        ],
        returns: 'Returns 8 *integers*, of which the first 4 indicate the color (R,G,B,A) of color filter A, and the last 4 indicate the color (R,G,B,A) of color filter B.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColorFilter',
    },
    getColorFromString: {
        summary: 'This function will extract Red, Green, Blue and Alpha values from a hex string you provide it. These strings follow the same format as used in HTML, with addition of the Alpha values.',
        parameters: [
            { name: 'theColor', isOptional: false, isVariadic: false, summary: 'A string containing a valid color code.' },
        ],
        returns: 'Returns four integers in RGBA format, with a maximum value of 255 for each. Each stands for *red*, *green*, *blue*, and *alpha*. Alpha decides transparancy where 255 is opaque and 0 is transparent. *false* is returned if the string passed is invalid (for example, is missing the preceeding # sign).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColorFromString',
    },
    getColPolygonHeight: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon.' },
        ],
        returns: 'Returns two floats, indicating the floor and ceiling of the colshape height, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColPolygonHeight',
    },
    getColPolygonPointPosition: {
        summary: 'This function is used to get the position of a bound point in a colshape polygon.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to change.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'The index of the point you wish to retrieve. The points are indexed in order, with 1 being the first bound point.' },
        ],
        returns: 'Returns two floats, x and y, indicating the position of the point, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColPolygonPointPosition',
    },
    getColPolygonPoints: {
        summary: 'This function is used to get all bound points in a colshape polygon.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to get the points of.' },
        ],
        returns: 'Returns a table of coordinates, each coordinate being a table containing the x and y position of a bound point, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColPolygonPoints',
    },
    getColShapeRadius: {
        summary: 'This function is used to get the radius of a colshape. Valid types are circle, sphere and tube.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to get the radius of.' },
        ],
        returns: 'Returns a float containing the radius of the colshape, *false* if an invalid colshape was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColShapeRadius',
    },
    getColShapeSize: {
        summary: 'This function is used to get the size of a colshape. Valid types are rectangle, cuboid and tube.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to get the size of.' },
        ],
        returns: 'Returns up to 3 floats depending on the colshape type (see below), *false* if invalid arguments were passed. **cuboid:* width, depth, height. **rectangle:* width, height. **tube:* height.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColShapeSize',
    },
    getColShapeType: {
        summary: 'This function is used to retrieve the type of an colshape.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to get the type of.' },
        ],
        returns: 'Returns *false* if invalid arguments were passed, or an integer of the type of the colshape, which include: ***0:** circle ***1:** cuboid ***2:** sphere ***3:** rectangle ***4:** polygon ***5:** tube',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColShapeType',
    },
    getCommandHandlers: {
        summary: 'This function is used to retrieve a list of all the registered command handlers of a given resource (or of all resources).\n\nFunction also added client-side.',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'The resource from which you wish to retrieve all command handlers. Or leave it empty to retrieve command handlers of all resources.' },
        ],
        returns: 'Returns a *table* containing all the commands of the given resource or a table with subtables containing the command and theResource pointer ( { "command", theResource } ). See examples below if you don\'t understand it.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCommandHandlers',
    },
    getCommandsBoundToKey: {
        summary: 'Gets the commands bound to a key.',
        parameters: [
            { name: 'theKey', isOptional: false, isVariadic: false, summary: 'See key names for a list of possible keys' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'A string that has one of the following values:' },
        ],
        returns: 'Returns a table of the commands bound on that key.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCommandsBoundToKey',
    },
    getControlState: {
        summary: 'This function will check if a player is pressing a particular control. Controls are those that affect GTA. If you wish to get the state of another key, use bindKey and a command function.\n\nNote: Not all control states are sent to the server at all times, as such their state may be given incorrectly. As a rule, keys that move or affect the player or their vehicle are most likely to be accurate. For increased accuracy (and also increased bandwidth usage) use bindKey instead to bind a GTA control name to a function.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to get the control state of. Do not use this parameter when scripting for client.' },
            { name: 'controlName', isOptional: false, isVariadic: false, summary: 'The control that you want to get the state of. See control names for a list of possible controls.' },
        ],
        returns: 'Returns the state of the control, *false* if the control doesn\'t exist or if the player is dead.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetControlState',
    },
    getCoronaReflectionsEnabled: {
        summary: '',
        parameters: [],
        returns: 'One of the following integers will be returned: * **0**: corona reflections are disabled * **1**: corona reflections are enabled (are visible during rain) * **2**: corona reflections are force enabled (are visible even if there is no rain)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCoronaReflectionsEnabled',
    },
    getCursorAlpha: {
        summary: 'This function is used to get the client\'s cursor alpha (transparency).',
        parameters: [],
        returns: 'Returns a int between 0 and 255, where 255 is fully opaque and 0 is fully transparent.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCursorAlpha',
    },
    getCursorPosition: {
        summary: 'This function gets the current position of the mouse cursor. Note that for performance reasons, the world position returned is always 300 units away. If you want the exact world point (similar to onClientClick), use processLineOfSight between the camera position and the worldX/Y/Z result of this function. (See example below)',
        parameters: [],
        returns: 'Returns 5 values: *cursorX*, *cursorY*, *worldX*, *worldY*, *worldZ*. The first two values are the 2D **relative** screen coordinates of the cursor. The 3 values that follow are the 3D world map coordinates that the cursor points at. If the cursor isn\'t showing, returns *false* as the first value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCursorPosition',
    },
    getDeadPlayers: {
        summary: 'This function returns a table of all currently dead players on the server.',
        parameters: [],
        returns: 'Returns a table of all the dead players.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDeadPlayers',
    },
    getDevelopmentMode: {
        summary: 'This function is used to get the development mode of the client or whole server. For more information see setDevelopmentMode',
        parameters: [],
        returns: 'Returns *true* if the development mode is on, *false* if off.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDevelopmentMode',
    },
    getDiscordRichPresenceUserID: {
        summary: 'The function returns the client Discord UserID.',
        parameters: [],
        returns: 'It will return an *empty string ("")* if the user has not given consent or has disabled the Rich Presence synchronization option. Otherwise, it will return the *userid* as a string.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDiscordRichPresenceUserID',
    },
    getDistanceBetweenPoints2D: {
        summary: 'This function returns the distance between two 2 dimensional points using the pythagorean theorem.',
        parameters: [
            { name: 'x1', isOptional: false, isVariadic: false, summary: 'The X position of the first point' },
            { name: 'y1', isOptional: false, isVariadic: false, summary: 'The Y position of the first point' },
            { name: 'x2', isOptional: false, isVariadic: false, summary: 'The X position of the second point' },
            { name: 'y2', isOptional: false, isVariadic: false, summary: 'The Y position of the second point' },
        ],
        returns: 'Returns a float containing the 2D distance between the two points. Returns *false* if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDistanceBetweenPoints2D',
    },
    getDistanceBetweenPoints3D: {
        summary: 'This function returns the distance between two 3 dimensional points using the pythagorean theorem.',
        parameters: [
            { name: 'x1', isOptional: false, isVariadic: false, summary: 'The X position of the first point' },
            { name: 'y1', isOptional: false, isVariadic: false, summary: 'The Y position of the first point' },
            { name: 'z1', isOptional: false, isVariadic: false, summary: 'The Z position of the first point' },
            { name: 'x2', isOptional: false, isVariadic: false, summary: 'The X position of the second point' },
            { name: 'y2', isOptional: false, isVariadic: false, summary: 'The Y position of the second point' },
            { name: 'z2', isOptional: false, isVariadic: false, summary: 'The Z position of the second point' },
        ],
        returns: 'Returns a float containing the distance between the two points as a float. Returns *false* if an argument passed was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDistanceBetweenPoints3D',
    },
    getEasingValue: {
        summary: 'Used for custom Lua based interpolation, returns the easing value (animation time to use in your custom interpolation) given a progress and an easing function.\nIn most cases, either moveObject or interpolateBetween can do the job. getEasingValue is only provided in case you want to do your own custom interpolation based on easing.',
        parameters: [
            { name: 'fProgress', isOptional: false, isVariadic: false, summary: 'float between 0 and 1 indicating the interpolation progress (0 at the beginning of the interpolation, 1 at the end).' },
            { name: 'strEasingType', isOptional: false, isVariadic: false, summary: 'the easing function to use for the interpolation' },
            { name: 'fEasingPeriod', isOptional: true, isVariadic: false, summary: 'the period of the easing function (only some easing functions use this parameter)' },
            { name: 'fEasingAmplitude', isOptional: true, isVariadic: false, summary: 'the amplitude of the easing function (only some easing functions use this parameter)' },
            { name: 'fEasingOvershoot', isOptional: true, isVariadic: false, summary: 'the overshoot of the easing function (only some easing functions use this parameter)' },
        ],
        returns: 'Returns *fAnimationTime * the animation time given by the easing function (can be < 0 or > 1 since some easing functions have overshoot or bounce/spring effects, *false* otherwise (error in parameters).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetEasingValue',
    },
};
