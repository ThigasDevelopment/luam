import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_37: ApiDocumentationCatalog = {
    setBanAdmin: {
        summary: 'This function sets a new admin for a ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to change the admin of.' },
            { name: 'theAdmin', isOptional: false, isVariadic: false, summary: 'The new admin.' },
        ],
        returns: 'returns true if changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBanAdmin',
    },
    setBanNick: {
        summary: '',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to change the nick of.' },
            { name: 'theNick', isOptional: false, isVariadic: false, summary: 'A string representing the nick you want to set the ban to.' },
        ],
        returns: 'returns true if changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBanNick',
    },
    setBanReason: {
        summary: 'This function sets the reason for the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban that you wish to set the reason of.' },
            { name: 'theReason', isOptional: false, isVariadic: false, summary: 'the new reason (max 60 characters).' },
        ],
        returns: 'returns true if the new reason was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBanReason',
    },
    setBirdsEnabled: {
        summary: 'This function allows you to disable the flying birds.',
        parameters: [
            { name: 'enable', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the birds state was changed succesfully, false if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBirdsEnabled',
    },
    setBlipColor: {
        summary: 'This function will let you change the color of a blip. This color is only applicable to\nthe default blip icon (Image:Blipid0s.png|12px, Image:Blipid0u.png|12px or\nImage:Blipid0d.png|12px). All other icons will ignore this.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip whos color you wish to set.' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The amount of red in the blips color (0 - 255).' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The amount of green in the blips color (0 - 255).' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The amount of blue in the blips color (0 - 255).' },
            { name: 'alpha', isOptional: false, isVariadic: false, summary: 'The amount of alpha in the blips color (0 - 255). Alpha decides transparancy where 255 is opaque and 0 is transparent.' },
        ],
        returns: 'returns true if the blips color was set successfully. returns false if the blip passed to the function is invalid, or any of the colors are out of the valid range.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipColor',
    },
    setBlipIcon: {
        summary: 'This function sets the icon for an existing blip element.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip you wish to set the icon of.' },
            { name: 'icon', isOptional: false, isVariadic: false, summary: 'A number indicating the icon you wish to change it do. Valid values are listed on the Radar Blips page.' },
        ],
        returns: 'returns true if the icon was successfully set, false if the element passed was not a valid blip or the icon value was not a valid icon number.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipIcon',
    },
    setBlipOrdering: {
        summary: 'This function sets the Z ordering of a blip. It allows you to make a blip appear on top\nof or below other blips.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'the blip whose Z ordering to change.' },
            { name: 'ordering', isOptional: false, isVariadic: false, summary: 'the new Z ordering value. Blips with higher values will appear on top of blips with lower values. Possible range: -32767 to 32767. Default: 0.' },
        ],
        returns: 'returns true if the blip ordering was changed successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipOrdering',
    },
    setBlipSize: {
        summary: 'This function sets the size of a blips icon.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip you wish to get the size of.' },
            { name: 'iconSize', isOptional: false, isVariadic: false, summary: 'The size you wish the icon to be. 2 is the default value. 25 is the maximum value. Value gets clamped between 0 and 25.' },
        ],
        returns: 'returns an true if the blips size was set successfully. returns false if the element passed was not a blip or if the icon size passed was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipSize',
    },
    setBlipVisibleDistance: {
        summary: 'This function will set the visible distance of a blip.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip whose visible distance you wish to get.' },
            { name: 'theDistance', isOptional: false, isVariadic: false, summary: 'The distance you want the blip to be visible for. Value gets clamped between 0 and 65535.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipVisibleDistance',
    },
    setBlurLevel: {
        summary: 'Sets the motion blur level on the clients screen. Accepts a value between 0 and 255.',
        parameters: [
            { name: 'level', isOptional: false, isVariadic: false, summary: 'The level to set the blur to (default: 36)' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPlayerBlurLevel',
    },
    setBrowserAjaxHandler: {
        summary: 'This function provides a requestable ajax resource for Lua/Javascript communication for a\nElement/Browser|browser.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser which will execute the Javascript code' },
            { name: 'url', isOptional: false, isVariadic: false, summary: 'The URL endpoint to handle' },
            { name: 'handler', isOptional: true, isVariadic: false, summary: 'The function to call if the webBrowser attempts to open the ajax endpoint. If this parameter is nil or omitted, the ajax handler for the url will be deleted.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBrowserAjaxHandler',
    },
    setBrowserProperty: {
        summary: 'This function sets a given property of a specified browser.',
        parameters: [
            { name: 'theBrowser', isOptional: false, isVariadic: false, summary: 'The browser element you want to set a property of' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The browser property key. It can be: mobile Surfing the web as mobile' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'A value indicating whether to enable (1) the property or not (0)' },
        ],
        returns: 'returns true if the property was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBrowserProperty',
    },
    setBrowserRenderingPaused: {
        summary: 'This function sets the rendering state of a browser.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
            { name: 'paused', isOptional: false, isVariadic: false, summary: 'true to pause rendering, false to continue' },
        ],
        returns: 'returns true if the state was successfully changed',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBrowserRenderingPaused',
    },
    setBrowserVolume: {
        summary: 'This function sets either a specific Element/Browser|browsers volume, or the overall\nvolume for browsers.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'A browser element' },
            { name: 'volume', isOptional: false, isVariadic: false, summary: 'A float|floating point number representing the desired volume level. Range is from 0.0 to 1.0' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBrowserVolume',
    },
    setCameraClip: {
        summary: 'This function sets if the camera will collide with any objects or vehicles in its way.\nThis means that if object clip is enabled an object is in the way of where the camera\nactually wants to be, the camera will try to be in front of it. This function can disable\nthat.',
        parameters: [
            { name: 'objects', isOptional: true, isVariadic: false, summary: 'Sets if you want the camera to clip on objects.' },
            { name: 'vehicles', isOptional: true, isVariadic: false, summary: 'Sets if you want the camera to clip on vehicles.' },
        ],
        returns: 'always returns true.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraClip',
    },
    setCameraFieldOfView: {
        summary: '',
        parameters: [
            { name: 'cameraMode', isOptional: false, isVariadic: false, summary: 'the camera mode to get the field of view of ** "player": whilst walking/running ** "vehicle": whilst in vehicle ** "vehicle_max": the max the field of view can go to when the vehicle is moving at a high speed (must be higher than "vehicle")' },
            { name: 'fieldOfView', isOptional: false, isVariadic: false, summary: 'The field of view angle, 0 to 179.' },
        ],
        returns: 'returns true if the arguments are valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraFieldOfView',
    },
    setCameraGoggleEffect: {
        summary: 'This function allows you to set the cameras current goggle effect. This means you can\nactivate nightvision or infrared effects by script',
        parameters: [
            { name: 'goggleEffect', isOptional: false, isVariadic: false, summary: ': the goggle effect you wish to set' },
            { name: 'noiseEnabled', isOptional: true, isVariadic: false, summary: ': whether or not there should be a fuzzy noise effect' },
        ],
        returns: '* true if the effect was set correctly. * false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraGoggleEffect',
    },
    setCameraInterior: {
        summary: 'Sets the interior of the local camera. Only the interior of the camera is changed, the\nlocal player stays in the interior he was in.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player whose camera interior will be set.' },
            { name: 'interior', isOptional: false, isVariadic: false, summary: 'the interior to place the camera in.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraInterior',
    },
    setCameraMatrix: {
        summary: 'This function sets the cameras position and direction. The first three arguments are the\npoint at which the camera lies, the last three are the point the camera faces (or the\npoint it looks at).',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera is to be changed.' },
            { name: 'positionX', isOptional: false, isVariadic: false, summary: 'The x coordinate of the cameras position.' },
            { name: 'positionY', isOptional: false, isVariadic: false, summary: 'The y coordinate of the cameras position.' },
            { name: 'positionZ', isOptional: false, isVariadic: false, summary: 'The z coordinate of the cameras position. New feature/item|3.0141|1.4.1|7005|Instead of six coordinates, or two vectors, a Matrix can be supplied.' },
            { name: 'lookAtX', isOptional: true, isVariadic: false, summary: 'The x coordinate of the point the camera faces.' },
            { name: 'lookAtY', isOptional: true, isVariadic: false, summary: 'The y coordinate of the point the camera faces.' },
            { name: 'lookAtZ', isOptional: true, isVariadic: false, summary: 'The z coordinate of the point the camera faces.' },
            { name: 'roll', isOptional: true, isVariadic: false, summary: 'The camera roll angle, -180 to 180. A value of 0 means the camera sits straight, positive values will turn it counter-clockwise and negative values will turn it clockwise. -180 or 180 means the camera is upside down.' },
            { name: 'fov', isOptional: true, isVariadic: false, summary: 'the field of view angle, 0.01 to 180. The higher this value is, the more you will be able to see what is to your sides.' },
        ],
        returns: '',
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
        summary: 'This function allows you to set a players camera to follow other elements instead.\nCurrently supported element type is:\n*Players',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera you wish to modify.' },
            { name: 'target', isOptional: true, isVariadic: false, summary: 'The player who you want the camera to follow. If none is specified, the camera will target the player.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraTarget',
    },
    setCameraViewMode: {
        summary: 'This function allows you to set the camera view modes. This indicates at what distance\nthe camera will follow the player or vehicle.',
        parameters: [
            { name: 'vehicleCameraMode', isOptional: false, isVariadic: false, summary: ': The view mode you wish to use when inside vehicles.' },
            { name: 'pedCameraMode', isOptional: true, isVariadic: false, summary: ': The view mode you wish to use when you are not inside vehicles.' },
        ],
        returns: 'returns true if the view(s) were set correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraViewMode',
    },
    setChatboxCharacterLimit: {
        summary: 'Sets the maximum amount of characters that can be input via chatbox',
        parameters: [
            { name: 'charLimit', isOptional: false, isVariadic: false, summary: 'an integer between 0-255. Passing -1 will reset the character limit (96)' },
        ],
        returns: 'returns true if the character limit was set, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetChatboxCharacterLimit',
    },
    setClipboard: {
        summary: 'This function sets the players clipboard text (what appears when you paste with CTRL + V)',
        parameters: [
            { name: 'theText', isOptional: false, isVariadic: false, summary: 'The new text to be in the players clipboard when the player pastes with CTRL + V.' },
        ],
        returns: 'returns true if the text in the clip board was set correctly.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetClipboard',
    },
    setCloudsEnabled: {
        summary: 'This function will enable or disable clouds. This is useful for race maps which are\nplaced high up as clouds can cause low FPS.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean value determining if clouds should be shown. Use true to show clouds and false to hide them.' },
        ],
        returns: 'returns true if the cloud state was changed succesfully, false if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCloudsEnabled',
    },
};
