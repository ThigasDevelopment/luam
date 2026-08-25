import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_40: ApiDocumentationCatalog = {
    saveMapData: {
        summary: 'This converts a set of elements in the element tree into XML. This is a format that can then be loaded as a map file. Each element represents a single XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'An existing node that should contain the contents of baseElement' },
            { name: 'baseElement', isOptional: false, isVariadic: false, summary: 'The first element to output to the XML tree. This element and all its children (and their children, etc) will be output.' },
            { name: 'childrenOnly', isOptional: true, isVariadic: false, summary: 'Defines if you want to only save children of the specified element.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SaveMapData',
    },
    set: {
        summary: 'This function is used to save arbitrary data under a certain name on the settings registry.\n\nIt\'s important to note that set *always* writes to the settings.xml file, even if get read the value from a resource\'s meta.xml. This means that the admin can specify settings in the settings.xml that override the resource\'s defaults, but that the defaults can still be retrieved if need be. As a general principle, resources should not be designed so that the admin is required to modify them, they should be \'black boxes\'.',
        parameters: [
            { name: 'settingName', isOptional: false, isVariadic: false, summary: 'The name of the setting you want to set. See setting names for information on settings names.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value to set the setting to. This can be any Lua data type, except for functions, most userdata (only resources can\'t be stored) and threads.' },
        ],
        returns: 'Returns *true* if the setting has been set, *false* if you do not have access to the setting or invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Set',
    },
    setAccountData: {
        summary: 'This function sets a string to be stored in an account. This can then be retrieved using getAccountData. Data stored as account data is persistent across user\'s sessions and maps, unless they are logged into a guest account. Even if logged into a guest account, account data can be useful as a way to store a reference to your own account system, though it\'s persistence is equivalent to that of using setElementData on the player\'s element.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to retrieve the data from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key under which you wish to store the data' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you wish to store. Set to false to remove the data. **NOTE:** you cannot store tables as values, but you can use toJSON strings.' },
        ],
        returns: 'Returns a *true* if the account data was set, *false* if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAccountData',
    },
    setAccountName: {
        summary: 'This function sets the name of an account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to change the name.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The new name.' },
            { name: 'allowCaseVariations', isOptional: true, isVariadic: false, summary: 'Whether the username is case sensitive (if this is set to true, usernames "Bob" and "bob" will refer to different accounts)' },
        ],
        returns: 'Returns a *true* if the account name was set, *false* if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAccountName',
    },
    setAccountPassword: {
        summary: 'This function sets the password of the specified account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'the account whose password you want to set' },
            { name: 'password', isOptional: false, isVariadic: false, summary: 'the password' },
        ],
        returns: 'Returns *true* if the password was set correctly, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAccountPassword',
    },
    setAircraftMaxHeight: {
        summary: 'This function changes the maximum flying height of aircraft.',
        parameters: [
            { name: 'Height', isOptional: false, isVariadic: false, summary: 'The height you want aircraft to be able to go.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAircraftMaxHeight',
    },
    setAircraftMaxVelocity: {
        summary: 'This function sets the maximum velocity at which aircrafts could fly. Using this function server-side will overwrite the value that was previously set client-side.',
        parameters: [
            { name: 'velocity', isOptional: false, isVariadic: false, summary: 'The max velocity, can be 0 or any positive value. Default is **1.5**.' },
        ],
        returns: 'Returns true if the max velocity was set correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAircraftMaxVelocity',
    },
    setAmbientSoundEnabled: {
        summary: 'This function allows you to disable some background sound effects. See also: setWorldSoundEnabled.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'The type of ambient sound to toggle. Can be either "gunfire" or "general".' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set *false* to turn off, *true* to turn on' },
        ],
        returns: 'Returns *true* if the ambient sound was set correctly, *false* if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAmbientSoundEnabled',
    },
    setAnalogControlState: {
        summary: 'This sets the analog control state of a control for the local player. To change the analog controls for a ped, please use setPedAnalogControlState.',
        parameters: [
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to set the state of. See control names for a list of possible controls.' },
            { name: 'state', isOptional: true, isVariadic: false, summary: 'A float between 0 and 1 indicating the amount the control is pressed. If no value is provided, the analog control is removed.' },
            { name: 'forceOverrideNextFrame', isOptional: true, isVariadic: false, summary: 'A bool indicating if the player input should force fully overriden for the next frame.' },
        ],
        returns: 'Returns *true* if the control state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAnalogControlState',
    },
    setBanAdmin: {
        summary: 'This function sets a new admin for a ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to change the admin of.' },
            { name: 'theAdmin', isOptional: false, isVariadic: false, summary: 'The new admin.' },
        ],
        returns: 'Returns *true* if changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBanAdmin',
    },
    setBanNick: {
        summary: 'This function sets a new nick for a ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban you want to change the nick of.' },
            { name: 'theNick', isOptional: false, isVariadic: false, summary: 'A string representing the nick you want to set the ban to.' },
        ],
        returns: 'Returns *true* if changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBanNick',
    },
    setBanReason: {
        summary: 'This function sets the reason for the specified ban.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban that you wish to set the reason of.' },
            { name: 'theReason', isOptional: false, isVariadic: false, summary: 'the new reason (max 60 characters).' },
        ],
        returns: 'Returns *true* if the new reason was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBanReason',
    },
    setBirdsEnabled: {
        summary: 'This function allows you to disable the flying birds.',
        parameters: [
            { name: 'enable', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the birds state was changed succesfully, *false* if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBirdsEnabled',
    },
    setBlipColor: {
        summary: 'This function will let you change the color of a blip. This color is only applicable to the default blip icon (,  or ). All other icons will ignore this.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip who\'s color you wish to set.' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The amount of red in the blip\'s color (0 - 255).' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The amount of green in the blip\'s color (0 - 255).' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The amount of blue in the blip\'s color (0 - 255).' },
            { name: 'alpha', isOptional: false, isVariadic: false, summary: 'The amount of alpha in the blip\'s color (0 - 255). Alpha decides transparancy where 255 is opaque and 0 is transparent.' },
        ],
        returns: 'Returns *true* if the blip\'s color was set successfully. Returns *false* if the blip passed to the function is invalid, or any of the colors are out of the valid range.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipColor',
    },
    setBlipIcon: {
        summary: 'This function sets the icon for an existing blip element.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip you wish to set the icon of.' },
            { name: 'icon', isOptional: false, isVariadic: false, summary: 'A number indicating the icon you wish to change it do. Valid values are listed on the Radar Blips page.' },
        ],
        returns: 'Returns *true* if the icon was successfully set, *false* if the element passed was not a valid blip or the icon value was not a valid icon number.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipIcon',
    },
    setBlipOrdering: {
        summary: 'This function sets the Z ordering of a blip. It allows you to make a blip appear on top of or below other blips.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'the blip whose Z ordering to change.' },
            { name: 'ordering', isOptional: false, isVariadic: false, summary: 'the new Z ordering value. Blips with higher values will appear on top of blips with lower values. Possible range: -32767 to 32767. Default: 0.' },
        ],
        returns: 'Returns *true* if the blip ordering was changed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipOrdering',
    },
    setBlipSize: {
        summary: 'This function sets the size of a blip\'s icon.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip you wish to get the size of.' },
            { name: 'iconSize', isOptional: false, isVariadic: false, summary: 'The size you wish the icon to be. 2 is the default value. 25 is the maximum value. Value gets clamped between 0 and 25.' },
        ],
        returns: 'Returns an *true* if the blip\'s size was set successfully. Returns *false* if the element passed was not a blip or if the icon size passed was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBlipSize',
    },
    setBlipVisibleDistance: {
        summary: 'This function will set the visible distance of a blip.',
        parameters: [
            { name: 'theBlip', isOptional: false, isVariadic: false, summary: 'The blip whose visible distance you wish to get.' },
            { name: 'theDistance', isOptional: false, isVariadic: false, summary: 'The distance you want the blip to be visible for. Value gets clamped between 0 and 65535.' },
        ],
        returns: 'Returns true if successful, false otherwise.',
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
        summary: 'This function provides a requestable ajax resource for Lua/Javascript communication for a browser.',
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
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The browser property key. It can be:' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'A value indicating whether to enable ("1") the property or not ("0")' },
        ],
        returns: 'Returns *true* if the property was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBrowserProperty',
    },
    setBrowserRenderingPaused: {
        summary: 'This function sets the rendering state of a browser.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
            { name: 'paused', isOptional: false, isVariadic: false, summary: '*true* to pause rendering, *false* to continue' },
        ],
        returns: 'Returns *true* if the state was successfully changed',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBrowserRenderingPaused',
    },
    setBrowserVolume: {
        summary: 'This function sets either a specific browser\'s volume, or the overall volume for browsers.',
        parameters: [
            { name: 'webBrowser', isOptional: true, isVariadic: false, summary: 'A browser element' },
            { name: 'volume', isOptional: false, isVariadic: false, summary: 'A floating point number representing the desired volume level. Range is from **0.0** to **1.0**' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetBrowserVolume',
    },
    setCameraClip: {
        summary: 'This function sets if the camera will "collide" with any objects or vehicles in its way. This means that if object clip is enabled an object is in the way of where the camera actually wants to be, the camera will try to be in front of it. This function can disable that.',
        parameters: [
            { name: 'objects', isOptional: true, isVariadic: false, summary: 'Sets if you want the camera to clip on objects.' },
            { name: 'vehicles', isOptional: true, isVariadic: false, summary: 'Sets if you want the camera to clip on vehicles.' },
        ],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraClip',
    },
    setCameraDrunkLevel: {
        summary: 'This function sets the camera drunk level (as seen on the *Are you going to San Fierro?* singleplayer mission). This function was renamed from setCameraShakeLevel.\n\nDrunk effect is a wavy motion of the camera depicting the player being drunk. This function used to be called setCameraShakeLevel which has since been deprecated.',
        parameters: [
            { name: 'shakeLevel', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the camera drunk level was changed, *false* if the required argument is incorrect or missing.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraDrunkLevel',
    },
    setCameraFieldOfView: {
        summary: 'This function sets the field of view of the *dynamic camera* - this is the field of view of the *non-fixed camera* - yes, the camera that the user can control whilst on foot or in a vehicle. The higher the field of view angle, the more you will be able to see to your sides.',
        parameters: [
            { name: 'cameraMode', isOptional: false, isVariadic: false, summary: 'the camera mode to set the field of view of:' },
            { name: 'fieldOfView', isOptional: false, isVariadic: false, summary: 'The field of view angle, 0 to 179.' },
            { name: 'instant', isOptional: true, isVariadic: false, summary: 'If set to *true*, the value is applied immediately, without delay (does not work with "vehicle_max").' },
        ],
        returns: 'Returns *true* if the arguments are valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCameraFieldOfView',
    },
};
