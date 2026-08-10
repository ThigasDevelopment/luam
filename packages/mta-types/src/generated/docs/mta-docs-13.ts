import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_13: ApiDocumentationCatalog = {
    getBrowserTitle: {
        summary: 'This function returns the title of the passed Element/Browser|browser.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'returns the title as a string. returns false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserTitle',
    },
    getBrowserURL: {
        summary: 'This function returns the URL of the specified Element/Browser|browser.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'returns the web browser url.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetBrowserURL',
    },
    getCamera: {
        summary: 'This function returns an element that corresponds to the game camera',
        parameters: [],
        returns: 'returns an element that corresponds to the game camera',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCamera',
    },
    getCameraClip: {
        summary: '',
        parameters: [],
        returns: '*objects: if you want the camera to clip on objects. *vehicles: if you want the camera to clip on vehicles.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraClip',
    },
    getCameraFieldOfView: {
        summary: '',
        parameters: [
            { name: 'cameraMode', isOptional: false, isVariadic: false, summary: 'the camera mode to get the field of view of ** "player": whilst walking/running ** "vehicle": whilst in vehicle ** "vehicle_max": the max the field of view can go to when the vehicle is moving at a high speed (must be higher than "vehicle")' },
        ],
        returns: 'returns one float - the field of view angle',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraFieldOfView',
    },
    getCameraGoggleEffect: {
        summary: 'This function returns what goggle effect is currently affecting the camera.',
        parameters: [],
        returns: '* string indicating the current camera goggle effect. their meanings can be seen below.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraGoggleEffect',
    },
    getCameraInterior: {
        summary: 'Returns the interior of the local camera (independent of the interior of the local\nplayer).',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': The player whose camera interior you want to get.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraInterior',
    },
    getCameraMatrix: {
        summary: 'This function gets the position of the camera and the position of the point it is facing.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera matrix is to be returned.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraMatrix',
    },
    getCameraShakeLevel: {
        summary: 'This function gets the camera shake level set by setCameraShakeLevel.',
        parameters: [],
        returns: 'returns an integer representing the camera shake level, from 0 (no shaking effect) to 255 (maximum shaking effect). by default, the camera has no shaking effect.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraShakeLevel',
    },
    getCameraTarget: {
        summary: 'This function returns an element that corresponds to the current target of the specified\nplayers camera (i.e. what it is following).',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera you wish to receive the target of.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraTarget',
    },
    getCameraViewMode: {
        summary: 'This function allows you to get the active camera view modes. This indicates at what\ndistance the camera will follow the player or vehicle.',
        parameters: [],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCameraViewMode',
    },
    getCancelReason: {
        summary: 'Gets the reason for cancelling an event.',
        parameters: [],
        returns: 'returns the reason that was given with cancelevent',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCancelReason',
    },
    getChatboxCharacterLimit: {
        summary: 'Gets the current maximum amount of characters that can be input via chatbox',
        parameters: [],
        returns: 'returns a number between 0-255, representing the chatbox input character limit',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetChatboxCharacterLimit',
    },
    getChatboxLayout: {
        summary: 'Returns information about how the chatbox looks.\nThese values come from the file called: Chatboxpresets.xml but it depends on what type of\npreset you currently have, which is chosen from your settings in the Interface tab.',
        parameters: [
            { name: 'CVar', isOptional: true, isVariadic: false, summary: 'the name of the property you want returned. Can be the following values: chat_font - Returns the chatbox font chat_lines - Returns how many lines the chatbox has chat_color - Returns the background color of the chatbox chat_text_color - Returns the chatbox text color chat_input_color - Returns the background color of the chatbox input chat_input_prefix_color - Returns the color of the input prefix text chat_input_text_color - Returns the color of the text in the chatbox input chat_scale - Returns the scale of the text in the chatbox chat_position_offset_x - Returns the x position offset setting chat_position_offset_y - Returns the y position offset setting chat_position_horizontal - Returns the horizontal alignment setting chat_position_vertical - Returns the vertical alignment setting chat_text_alignment - Returns the text alignment setting chat_width - Returns the scale of the background width chat_css_style_text - Returns whether text fades out over time chat_css_style_background - Returns whether the background fades out over time chat_line_life - Returns how long it takes for text to start fading out chat_line_fade_out - Returns how long takes for text to fade out chat_use_cegui - Returns whether CEGUI is used to render the chatbox text_scale - Returns text scale **Added feature/item|1.6.0|1.5.9|21160|**chat_text_outline** - Returns whether text black/white outline is used' },
        ],
        returns: '*4 numbers if the cvar contains color *2 numbers if chat_scale was entered *1 number if any other cvar was specified *a table of all cvar values, if cvar was not specified *false if an invalid cvar was specified',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetChatboxLayout',
    },
    getClothesByTypeIndex: {
        summary: 'This function is used to get the texture and model of clothes by the clothes type and\nindex.\n(Scans through the list of clothes for the specific type).',
        parameters: [
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: ': An integer representing the clothes slot/type to scan through.' },
            { name: 'clothesIndex', isOptional: false, isVariadic: false, summary: ': An integer representing the index (0 based) set of clothes in the list you wish to retrieve. Each type has a different number of valid indexes.' },
        ],
        returns: 'this function returns 2 strings, a texture and model respectively, false if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetClothesByTypeIndex',
    },
    getClothesTypeName: {
        summary: 'This function is used to get the name of a certain clothes type.',
        parameters: [
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: ': An integer determining the type of clothes you want to get the clothes of.' },
        ],
        returns: 'this function returns a string (the name of the clothes type) if found, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetClothesTypeName',
    },
    getCloudsEnabled: {
        summary: 'This function will tell you if clouds are enabled or disabled.',
        parameters: [],
        returns: 'returns true if the clouds are enabled or false if clouds are disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCloudsEnabled',
    },
    getColorFromString: {
        summary: 'This function will extract Red, Green, Blue and Alpha values from a hex string you\nprovide it. These strings follow the same format as used in HTML, with addition of the\nAlpha values.',
        parameters: [
            { name: 'theColor', isOptional: false, isVariadic: false, summary: 'A string containing a valid color code. :Valid strings are: #RRGGBB : Colors specified, Alpha assumed to be 255. #RRGGBBAA : All values specified. #RGB : Shortened form, will be expanded internally to RRGGBB, as such it provides a smaller number of colors. #RGBA : As above, shortened - each character is duplicated. :For example: #FF00FF is Red: 255, Green: 0, Blue: 255, Alpha: 255 #F0F is Red: 255, Green: 0, Blue: 255, Alpha: 255 (the same as the example above) #34455699 is Red: 52, Green: 69, Blue: 86, Alpha: 153 All colors used must begin with a # sign.' },
        ],
        returns: 'returns four integers in rgba format, with a maximum value of 255 for each. each stands for red, green, blue, and alpha. alpha decides transparancy where 255 is opaque and 0 is transparent. false is returned if the string passed is invalid (for example, is missing the preceeding # sign).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColorFromString',
    },
    getColPolygonHeight: {
        summary: 'By default, a colshape polygon is infinitely tall.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon.' },
        ],
        returns: 'returns two floats, indicating the floor and ceiling of the colshape height, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColPolygonHeight',
    },
    getColPolygonPointPosition: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to change.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'The index of the point you wish to retrieve. The points are indexed in order, with 1 being the first bound point.' },
        ],
        returns: 'returns two floats, x and y, indicating the position of the point, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColPolygonPointPosition',
    },
    getColPolygonPoints: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to get the points of.' },
        ],
        returns: 'returns a table of coordinates, each coordinate being a table containing the x and y position of a bound point, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColPolygonPoints',
    },
    getColShapeRadius: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to get the radius of.' },
        ],
        returns: 'returns a float containing the radius of the colshape, false if an invalid colshape was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColShapeRadius',
    },
    getColShapeSize: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to get the size of.' },
        ],
        returns: 'returns up to 3 floats depending on the colshape type (see below), false if invalid arguments were passed. *cuboid: width, depth, height. *rectangle: width, height. *tube: height.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColShapeSize',
    },
    getColShapeType: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to get the type of.' },
        ],
        returns: 'returns false if invalid arguments were passed, or an integer of the type of the colshape, which include: *0: circle *1: cuboid *2: sphere *3: rectangle *4: polygon *5: tube',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetColShapeType',
    },
    getCommandHandlers: {
        summary: 'This function is used to retrieve a list of all the registered command handlers of a\ngiven resource (or of all resources).',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'The resource from which you wish to retrieve all command handlers. Or leave it empty to retrieve command handlers of all resources.' },
        ],
        returns: 'returns a table containing all the commands of the given resource or a table with subtables containing the command and theresource pointer ( { command, theresource } ). see examples below if you dont understand it.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCommandHandlers',
    },
    getCommandsBoundToKey: {
        summary: 'Gets the commands bound to a key.',
        parameters: [
            { name: 'theKey', isOptional: false, isVariadic: false, summary: 'See key names for a list of possible keys' },
            { name: 'keyState', isOptional: false, isVariadic: false, summary: 'A string that has one of the following values: up If the bound key should trigger the function when the key is released down If the bound key should trigger the function when the key is pressed both If the bound key should trigger the function when the key is pressed or released' },
        ],
        returns: 'returns a table of the commands bound on that key.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCommandsBoundToKey',
    },
    getControlState: {
        summary: 'This function will check if a player is pressing a particular control. Controls are those\nthat affect GTA. If you wish to get the state of another key, use bindKey and a command\nfunction.\nNote: Not all control states are sent to the server at all times, as such their state may\nbe given incorrectly. As a rule, keys that move or affect the player or their vehicle are\nmost likely to be accurate. For increased accuracy (and also increased bandwidth usage)\nuse bindKey instead to bind a GTA control name to a function.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to get the control state of. Do not use this parameter when scripting for client.' },
            { name: 'controlName', isOptional: false, isVariadic: false, summary: 'The control that you want to get the state of. See control names for a list of possible controls. **Note:** several controls are not synched with the server, therefore the function will always return \'\'false\'\' for these controls serverside. These controls are: *next_weapon *previous_weapon *jump *zoom_in *zoom_out *look_behind *change_camera *conversation_yes *conversation_no *group_control_forwards *group_control_back *sub_mission *radio_next *radio_previous *vehicle_look_left *vehicle_look_right *vehicle_look_behind *vehicle_mouse_look *special_control_*' },
        ],
        returns: 'returns the state of the control, false if the control doesnt exist or if the player is dead.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetControlState',
    },
    getCoronaReflectionsEnabled: {
        summary: '',
        parameters: [],
        returns: 'one of the following integers will be returned: * 0: corona reflections are disabled * 1: corona reflections are enabled (are visible during rain) * 2: corona reflections are force enabled (are visible even if there is no rain)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCoronaReflectionsEnabled',
    },
    getCursorAlpha: {
        summary: 'This function is used to get the clients cursor alpha (transparency).',
        parameters: [],
        returns: 'returns a int between 0 and 255, where 255 is fully opaque and 0 is fully transparent.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCursorAlpha',
    },
    getCursorPosition: {
        summary: 'This function gets the current position of the mouse cursor. Note that for performance\nreasons, the world position returned is always 300 units away. If you want the exact\nworld point (similar to onClientClick), use processLineOfSight between the camera\nposition and the worldX/Y/Z result of this function. (See example below)',
        parameters: [],
        returns: 'returns 5 values: cursorx, cursory, worldx, worldy, worldz. the first two values are the 2d relative screen coordinates of the cursor. the 3 values that follow are the 3d world map coordinates that the cursor points at. if the cursor isnt showing, returns false as the first value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetCursorPosition',
    },
    getDeadPlayers: {
        summary: 'This function returns a table of all currently dead players on the server.',
        parameters: [],
        returns: 'returns a table of all the dead players.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDeadPlayers',
    },
    getDevelopmentMode: {
        summary: 'This function is used to get the development mode of the client. For more information see\nsetDevelopmentMode',
        parameters: [],
        returns: 'returns true if the development mode is on, false if off.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDevelopmentMode',
    },
};
