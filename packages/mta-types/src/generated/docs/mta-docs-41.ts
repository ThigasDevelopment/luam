import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_41: ApiDocumentationCatalog = {
    setCameraGoggleEffect: {
        summary: 'This function allows you to set the camera\'s current goggle effect. This means you can activate nightvision or infrared effects by script',
        parameters: [
            { name: 'goggleEffect', isOptional: false, isVariadic: false, summary: 'the goggle effect you wish to set' },
            { name: 'noiseEnabled', isOptional: true, isVariadic: false, summary: 'whether or not there should be a fuzzy noise effect' },
        ],
        returns: '* *true* if the effect was set correctly. * *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraGoggleEffect',
    },
    setCameraInterior: {
        summary: 'Sets the interior of the local camera. Only the interior of the camera is changed, the local player stays in the interior he was in.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player whose camera interior will be set.' },
            { name: 'interior', isOptional: false, isVariadic: false, summary: 'the interior to place the camera in.' },
        ],
        returns: 'Returns *true* if the camera\'s interior was changed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraInterior',
    },
    setCameraMatrix: {
        summary: 'This function sets the camera\'s position and direction. The first three arguments are the point at which the camera lies, the last three are the point the camera faces (or the point it "looks at").',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera is to be changed.' },
            { name: 'positionX', isOptional: false, isVariadic: false, summary: 'The x coordinate of the camera\'s position.' },
            { name: 'positionY', isOptional: false, isVariadic: false, summary: 'The y coordinate of the camera\'s position.' },
            { name: 'positionZ', isOptional: false, isVariadic: false, summary: 'The z coordinate of the camera\'s position.' },
            { name: 'lookAtX', isOptional: true, isVariadic: false, summary: 'The x coordinate of the point the camera faces.' },
            { name: 'lookAtY', isOptional: true, isVariadic: false, summary: 'The y coordinate of the point the camera faces.' },
            { name: 'lookAtZ', isOptional: true, isVariadic: false, summary: 'The z coordinate of the point the camera faces.' },
            { name: 'roll', isOptional: true, isVariadic: false, summary: 'The camera roll angle, -180 to 180. A value of 0 means the camera sits straight, positive values will turn it counter-clockwise and negative values will turn it clockwise. -180 or 180 means the camera is upside down.' },
            { name: 'fov', isOptional: true, isVariadic: false, summary: 'the field of view angle, 0.01 to 180. The higher this value is, the more you will be able to see what is to your sides.' },
        ],
        returns: 'Returns *true* if the arguments are valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraMatrix',
    },
    setCameraShakeLevel: {
        summary: 'This function sets the camera shake level (as seen on the Are you going to San Fierro?\nsingleplayer mission).',
        parameters: [
            { name: 'shakeLevel', isOptional: false, isVariadic: false, summary: ': an integer between 0 and 255, which represents the camera shake intensity level.' },
        ],
        returns: 'returns true if the camera shake level was changed, false if the required argument is incorrect or missing.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraShakeLevel',
    },
    setCameraTarget: {
        summary: 'This function allows you to set a player\'s camera to follow other elements instead. Currently supported element type is:\n*Players\n*Peds\n*Vehicles',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera you wish to modify.' },
            { name: 'target', isOptional: true, isVariadic: false, summary: 'The element who you want the camera to follow. If none is specified, the camera will target the player.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraTarget',
    },
    setCameraViewMode: {
        summary: 'This function allows you to set the camera view modes. This indicates at what distance the camera will follow the player or vehicle.',
        parameters: [
            { name: 'vehicleCameraMode', isOptional: false, isVariadic: false, summary: 'The view mode you wish to use when inside vehicles.' },
            { name: 'pedCameraMode', isOptional: true, isVariadic: false, summary: 'The view mode you wish to use when you are not inside vehicles.' },
        ],
        returns: 'Returns *true* if the view(s) were set correctly, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraViewMode',
    },
    setChatboxCharacterLimit: {
        summary: 'Sets the maximum amount of characters that can be input via chatbox',
        parameters: [
            { name: 'charLimit', isOptional: false, isVariadic: false, summary: 'an integer between 0-255. Passing -1 will reset the character limit (96)' },
        ],
        returns: 'Returns *true* if the character limit was set, *false* otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetChatboxCharacterLimit',
    },
    setClipboard: {
        summary: 'This function sets the players clipboard text (what appears when you paste with CTRL + V)',
        parameters: [
            { name: 'theText', isOptional: false, isVariadic: false, summary: 'The new text to be in the players clipboard when the player pastes with CTRL + V.' },
        ],
        returns: 'Returns *true* if the text in the clip board was set correctly.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetClipboard',
    },
    setCloudsEnabled: {
        summary: 'This function will enable or disable clouds. This is useful for race maps which are placed high up as clouds can cause low FPS.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean value determining if clouds should be shown. Use *true* to show clouds and *false* to hide them.' },
        ],
        returns: 'Returns *true* if the cloud state was changed succesfully, *false* if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCloudsEnabled',
    },
    setColorFilter: {
        summary: 'This function is used to override the default color filtering values.',
        parameters: [
            { name: 'aRed', isOptional: false, isVariadic: false, summary: 'The amount of red (0-255).' },
            { name: 'aGreen', isOptional: false, isVariadic: false, summary: 'The amount of green (0-255).' },
            { name: 'aBlue', isOptional: false, isVariadic: false, summary: 'The amount of blue (0-255).' },
            { name: 'aAlpha', isOptional: false, isVariadic: false, summary: 'The amount of alpha (0-255).' },
            { name: 'bRed', isOptional: false, isVariadic: false, summary: 'The amount of red (0-255).' },
            { name: 'bGreen', isOptional: false, isVariadic: false, summary: 'The amount of green (0-255).' },
            { name: 'bBlue', isOptional: false, isVariadic: false, summary: 'The amount of blue (0-255).' },
            { name: 'bAlpha', isOptional: false, isVariadic: false, summary: 'The amount of alpha (0-255).' },
        ],
        returns: 'Returns *true* if the color filter was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColorFilter',
    },
    setColPolygonHeight: {
        summary: 'This function is used to change the height of an existing colshape polygon.\nBy default, a colshape polygon is infinitely tall.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon.' },
            { name: 'floor', isOptional: false, isVariadic: false, summary: 'The polygon floor (lowest Z coordinate). Parse *false* to reset this value to 0.' },
            { name: 'ceil', isOptional: false, isVariadic: false, summary: 'The polygon ceiling (highest Z coordinate). Parse *false* to reset this value to infinitely tall.' },
        ],
        returns: 'Returns *true* if the polygon was changed, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColPolygonHeight',
    },
    setColPolygonPointPosition: {
        summary: 'This function is used to set the position of a bound point in a colshape polygon.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to change.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'The index of the point you wish to change. The points are indexed in order, with 1 being the first bound point.' },
            { name: 'fX', isOptional: false, isVariadic: false, summary: 'The new X position of the bound point.' },
            { name: 'fY', isOptional: false, isVariadic: false, summary: 'The new Y position of the bound point.' },
        ],
        returns: 'Returns *true* if the polygon was changed, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColPolygonPointPosition',
    },
    setColShapeRadius: {
        summary: 'This function is used to set the radius of a colshape. Valid types are circle, sphere and tube.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to change the radius of.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: 'The radius you want to set.' },
        ],
        returns: 'Returns *true* if the radius was changed, or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColShapeRadius',
    },
    setColShapeSize: {
        summary: 'This function is used to set the size of a colshape. Valid types are rectangle, cuboid and tube.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to change the size of.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'The collision rectangle\'s width.' },
            { name: 'depth', isOptional: false, isVariadic: false, summary: 'The collision cuboid\'s depth.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'The collision tubes\'s height.' },
        ],
        returns: 'Returns *true* if the size was changed, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColShapeSize',
    },
    setControlState: {
        summary: 'Sets a state of a specified player\'s control, as if they pressed or released it.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to set the control state of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to set the state of. See control names for a list of possible controls.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether or not the key will be set to pressed or not.' },
        ],
        returns: 'Returns *true* if the control state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetControlState',
    },
    setCoronaReflectionEnabled: {
        summary: 'This function sets visibility of corona reflection.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'the corona marker that you wish set visibility of corona reflection' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'whenever corona reflection should be visible' },
        ],
        returns: 'Returns *true* if marker type is *corona*, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCoronaReflectionEnabled',
    },
    setCoronaReflectionsEnabled: {
        summary: 'This function sets visibility of corona reflections.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: '** **0**: disabled' },
        ],
        returns: 'Returns *true* if passed arguments are correct, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCoronaReflectionsEnabled',
    },
    setCursorAlpha: {
        summary: 'This function is used to change alpha (transparency) from the client\'s cursor.',
        parameters: [
            { name: 'alpha', isOptional: false, isVariadic: false, summary: 'The alpha value to set. Value can be 0-255, where 255 is fully opaque and 0 is fully transparent.' },
        ],
        returns: 'Returns *true* if the new alpha value was set, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCursorAlpha',
    },
    setCursorPosition: {
        summary: 'This function sets the current position of the mouse cursor.',
        parameters: [
            { name: 'cursorX', isOptional: false, isVariadic: false, summary: 'Position over the X axis' },
            { name: 'cursorY', isOptional: false, isVariadic: false, summary: 'Position over the Y axis' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the position has been successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCursorPosition',
    },
    setDebugViewActive: {
        summary: 'This function enables or disables the debug window.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'true if debug window should be visible, false otherwise.' },
        ],
        returns: 'Returns *true*, *false* if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDebugViewActive',
    },
    setDevelopmentMode: {
        summary: 'This function is used to set the development mode. Setting development mode allows access to special commands which can assist with script debugging.\n\n**Client-side** development mode commands:\n* **showcol**: Enables colshapes to be viewed as a wireframe object.\n* **showsound**: Enables world sound ids to be printed in the debug output window.\n\n**Shared** development mode functions:\n* **debugSleep**: Sets the freeze time for the client/server.',
        parameters: [
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'A boolean to indicate whether development mode is on (*true*) or off (*false*)' },
            { name: 'enableWeb', isOptional: true, isVariadic: false, summary: 'A boolean to indicate whether browser debug messages will be filtered (*false*) or not (*true*)' },
        ],
        returns: 'Returns *true* if the mode was set correctly, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDevelopmentMode',
    },
    setDiscordApplicationID: {
        summary: 'The function can assign your own application to use in Rich Presence.\nYou can create an application **[https://discord.com/developers/applications here]**',
        parameters: [
            { name: 'applicationID', isOptional: false, isVariadic: false, summary: 'a string representing your Discord application\'s ID.' },
        ],
        returns: 'Returns *true* if function succeeds, *false* if the client has disabled rich presence.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordApplicationID',
    },
    setDiscordRichPresenceAsset: {
        summary: 'Using this function you can set the large image asset of the application. The maximum size of assets is *1024x1024*, the minimum is *512x512*.',
        parameters: [
            { name: 'assetImage', isOptional: false, isVariadic: false, summary: 'a string containing the key of the image you uploaded to your application\'s asset list.' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'a string to be displayed when someone hovers over the large image asset in Discord.' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresenceAsset',
    },
    setDiscordRichPresenceButton: {
        summary: 'The function sets a custom button through which we can access the website on Discord.',
        parameters: [
            { name: 'index', isOptional: false, isVariadic: false, summary: 'a int representing the index of the button (possible values: 1 or 2)' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'a string containing the title of the button' },
            { name: 'url', isOptional: false, isVariadic: false, summary: 'a string containing the button URL (only works with **https://** or **mtasa://**)' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresenceButton',
    },
    setDiscordRichPresenceDetails: {
        summary: 'This function sets the details text of Discord Rich Presence.',
        parameters: [
            { name: 'details', isOptional: false, isVariadic: false, summary: 'a string containing the details text' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresenceDetails',
    },
};
