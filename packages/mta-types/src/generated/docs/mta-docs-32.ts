import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_32: ApiDocumentationCatalog = {
    hasElementDataSubscriber: {
        summary: 'This function returns whether a player is subscribed to specific element data.\nThis function is used together with setElementData in *"subscribe"* mode.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to check whether the player is subscribed to.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to check whether the player is subscribed to.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to check.' },
        ],
        returns: 'Returns *true* if the player is subscribed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HasElementDataSubscriber',
    },
    hash: {
        summary: 'This function returns a hash of the specified string in the specified algorithm.',
        parameters: [
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: 'A string which must be one of these: "md5", "sha1", "sha224", "sha256", "sha384", "sha512", "hmac"' },
            { name: 'dataToHash', isOptional: false, isVariadic: false, summary: 'A string of the data to hash.' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'A table with options and other necessary data for the algorithm, as detailed below.' },
        ],
        returns: 'Returns the hash of the data, false if an invalid argument was used.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Hash',
    },
    hasObjectPermissionTo: {
        summary: 'This function returns whether or not the given object has access to perform the given action.\n\nScripts frequently wish to limit access to features to particular users. The naive way to do this would be to check if the player who is attempting to perform an action is in a particular group (usually the Admin group). The main issue with doing this is that the Admin group is not guaranteed to exist. It also doesn\'t give the server admin any flexibility. He might want to allow his \'moderators\' access to the function you\'re limiting access to, or he may want it disabled entirely.\n\nThis is where using the ACL properly comes in, and luckily this is very easy. It all comes down to using this function. This, somewhat confusingly named function lets you check if an ACL object (a player or a resource) has a particular ACL right. In this case, we just care about players.\n\nSo, first of all, think of a name for your \'right\'. Let\'s say we want a private area only certain people can go in, we\'ll call our right accessPrivateArea. Then, all you need to do is add one \'if\' statement to your code:\n```lua\nif hasObjectPermissionTo ( player, "resource.YourResourceName.accessPrivateArea", false ) then\n-- Whatever you want to happen if they\'re allowed in\nelse\n-- Whatever you want to happen if they aren\'t\nend\n```\nNotice that we\'ve named the *right* using *resource.YourResourceName.accessPrivateArea* - this is just for neatness, so that the admin knows what resource the right belongs to. It\'s strongly advised you follow this convention. The *false* argument specifies the \'defaultPermission\', false indicating that if the user hasn\'t had the right allowed or dissallowed (i.e. the admin hasn\'t added it to the config), that it should default to being not allowed.\n\nThe only downside of using this method is that the admin has to modify his config. The upsides are that the admin has much more control and your script will work for any server, however the admin has configured it.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'The object to test if has permission to. This can be a client element (ie. a player), a resource or a string in the form "user." or "resource.".' },
            { name: 'theAction', isOptional: false, isVariadic: false, summary: 'The action to test if the given object has access to. Ie. "function.kickPlayer".' },
            { name: 'defaultPermission', isOptional: true, isVariadic: false, summary: 'The default permission if none is specified in either of the groups the given object is a member of. If this is left to true, the given object will have permissions to perform the action unless the opposite is explicitly specified in the ACL. If false, the action will be denied by default unless explicitly approved by the Access Control List.' },
        ],
        returns: 'Returns *true* if the given object has permission to perform the given action, *false* otherwise. Returns *nil* if the function failed because of bad arguments.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HasObjectPermissionTo',
    },
    httpClear: {
        summary: 'This function removes all text from the current HTML output.',
        parameters: [],
        returns: 'Returns *true* if the output buffer was cleared successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HttpClear',
    },
    httpRequestLogin: {
        summary: 'This function makes the user\'s browser show a \'basic authentication\' login box. The result of the login is handled automatically by the server. If the user has not logged in satisfactorily, you should just call the httpRequestLogin function again. It is the script\'s responsibility to judge when the user is logged in satisfactorily - you can use the *user* variable can be used to check if the user has logged in with an account you are happy with. If the logged in user doesn\'t meet whatever criteria you have, you can just call httpRequestLogin again and they will be re-promoted for their password.\n\nThis function works by setting a header (\'Authentication\') and a return code (403 - Authentication required). As such, nothing happens until you finish the page. The content of the page is generally not displayed unless the login fails.',
        parameters: [],
        returns: 'Returns *true* if the relevant headers and return codes have been set, *false* otherwise. Essentially, always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HttpRequestLogin',
    },
    httpSetResponseCode: {
        summary: 'This function sets the HTTP status code that will be sent for the current HTML page.',
        parameters: [
            { name: 'code', isOptional: false, isVariadic: false, summary: 'the HTTP status code to be set.' },
        ],
        returns: 'Returns *true* if the code was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HttpSetResponseCode',
    },
    httpSetResponseCookie: {
        summary: 'This function sets the value for the specified HTTP cookie of the current HTML page.',
        parameters: [
            { name: 'cookieName', isOptional: false, isVariadic: false, summary: 'the HTTP cookie whose value is being set.' },
            { name: 'cookieValue', isOptional: false, isVariadic: false, summary: 'the new value for the specified cookie.' },
        ],
        returns: 'Returns *true* if the cookie value was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HttpSetResponseCookie',
    },
    httpSetResponseHeader: {
        summary: 'This function sets the value for the specified HTTP response header of the current HTML page.',
        parameters: [
            { name: 'headerName', isOptional: false, isVariadic: false, summary: 'the HTTP header whose value is being set. You can find a list of header names [http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html here]. Header names should be all *lower case* letters.' },
            { name: 'headerValue', isOptional: false, isVariadic: false, summary: 'the new value for the specified header.' },
        ],
        returns: 'Returns *true* if the header value was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HttpSetResponseHeader',
    },
    httpWrite: {
        summary: 'This function adds text to the output of the current HTTP file of the HTTP interface. The function can only be used on parsed (i.e not marked as *raw*) HTTP pages. httpWrite can support outputing binary data, if you specify the length of the data you are outtputing. If you do this, you should ensure you set an accurate content-type using httpSetResponseHeader otherwise it may be displayed inconsistently by browsers.',
        parameters: [
            { name: 'data', isOptional: false, isVariadic: false, summary: 'the data to be added to the page\'s output.' },
            { name: 'length', isOptional: true, isVariadic: false, summary: 'The length of the data being written. Generally only should be required for writing binary data.' },
        ],
        returns: 'Returns *true* if the text was added to the output buffer successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HttpWrite',
    },
    injectBrowserMouseDown: {
        summary: 'This function injects a mouse click (state: down).',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser' },
            { name: 'mouseButton', isOptional: false, isVariadic: false, summary: 'The mouse button (Possible values: *left*, *middle*, *right*)' },
            { name: 'doubleClick', isOptional: true, isVariadic: false, summary: 'Specifies whether it is a double click or not.' },
        ],
        returns: 'Returns *true* if the click was successfully injected, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseDown',
    },
    injectBrowserMouseMove: {
        summary: 'This function injects a mouse movement.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser which will retrieve the mouse movement' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'Absolute X screen coordinate' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'Absolute Y screen coordinate' },
        ],
        returns: 'Returns *true* if the movement was injected successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseMove',
    },
    injectBrowserMouseUp: {
        summary: 'This function injects a mouse click (state: up).',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser' },
            { name: 'mouseButton', isOptional: false, isVariadic: false, summary: 'The mouse button (Possible values: *left*, *middle*, *right*)' },
        ],
        returns: 'Returns *true* if the click was successfully injected, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseUp',
    },
    injectBrowserMouseWheel: {
        summary: 'This function injects mouse wheel events.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser' },
            { name: 'verticalScroll', isOptional: false, isVariadic: false, summary: 'Amount of units you want the browser to scroll along the Y-axe.' },
            { name: 'horizontalScroll', isOptional: false, isVariadic: false, summary: 'Amount of units you want the browser to scroll along the X-axe.' },
        ],
        returns: 'Returns *true* if the mouse action was successfully injected, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseWheel',
    },
    inspect: {
        summary: 'This function returns human-readable representations of tables and MTA datatypes as a string.',
        parameters: [
            { name: 'var', isOptional: false, isVariadic: false, summary: 'A variable of any datatype.' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'A table of options. It is not mandatory, but when it is provided, it must be a table. For a list of options, see the [https://github.com/kikito/inspect.lua#options Inspect\'s GitHub page].' },
        ],
        returns: 'Always returns a string. The contents can change if we update the inspect library, so it is not expected to be consistent across Lua versions.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Inspect',
    },
    interpolateBetween: {
        summary: 'Interpolates a 3D Vector between a source value and a target value using either linear interpolation or any other easing function.\nIt can also be used to interpolate 2D vectors or scalars by only setting some of the x, y, z values and putting 0 to the others.',
        parameters: [
            { name: 'x1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'x2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'fProgress', isOptional: false, isVariadic: false, summary: 'float between 0 and 1 indicating the interpolation progress (0 at the beginning of the interpolation, 1 at the end). If it is higher than 1, it will start from the beginning.' },
            { name: 'strEasingType', isOptional: false, isVariadic: false, summary: 'the easing function to use for the interpolation' },
            { name: 'fEasingPeriod', isOptional: true, isVariadic: false, summary: 'the period of the easing function (only some easing functions use this parameter)' },
            { name: 'fEasingAmplitude', isOptional: true, isVariadic: false, summary: 'the amplitude of the easing function (only some easing functions use this parameter)' },
            { name: 'fEasingOvershoot', isOptional: true, isVariadic: false, summary: 'the overshoot of the easing function (only some easing functions use this parameter)' },
        ],
        returns: 'Returns *x, y, z* the interpolated 3D vector/value if successful, *false* otherwise (error in parameters). As mentioned before, interpolateBetween can be used on 2D vectors or scalars in which case only some (x, y or just x) of the returned values are to be used (cf. alpha interpolation in marker example or size interpolation in window example).',
        wiki: 'https://wiki.multitheftauto.com/wiki/InterpolateBetween',
    },
    iprint: {
        summary: 'This function intelligently outputs debug messages into the Debug Console.  It is similar to outputDebugString, but outputs useful information for **any** variable type, and does not require use of Lua\'s tostring.  This includes information about element types, and table structures.  It is especially useful for quick debug tasks.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: 'A variable of any type to print intelligent information for.' },
            { name: 'var2', isOptional: true, isVariadic: false, summary: '' },
            { name: 'var3', isOptional: true, isVariadic: false, summary: '' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Always returns *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Iprint',
    },
    isAmbientSoundEnabled: {
        summary: 'This function allows you to check if some background sound effects are enabled.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'The type of ambient sound to test. Can be either "gunfire" or "general".' },
        ],
        returns: 'Returns *true* if the ambient sound is enabled, *false* if it is disabled or invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsAmbientSoundEnabled',
    },
    isBan: {
        summary: 'This function checks whether the passed value is valid ban or not.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The value to check' },
        ],
        returns: 'Returns *true* if the value is a ban, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBan',
    },
    isBrowserDomainBlocked: {
        summary: 'This function checks if the specified URL is blocked from being loaded.',
        parameters: [
            { name: 'address', isOptional: false, isVariadic: false, summary: 'A website URL' },
            { name: 'isURL', isOptional: true, isVariadic: false, summary: '*true* if *address* should be parsed as URL, *false* otherwise.' },
        ],
        returns: 'Returns *false* if the URL is able to be loaded, *true* if it is blocked and *nil* if an invalid domain/URL was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserDomainBlocked',
    },
    isBrowserFocused: {
        summary: 'This function checks if a browser is focused.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'Returns *true* if the browser is focused, *false* otherwise and *nil* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserFocused',
    },
    isBrowserGPUEnabled: {
        summary: 'This function checks if the client has the "Enable GPU rendering" setting enabled, which allows the usage of things like WebGL in browsers.\n\n**Note**: this is a global setting, not specific to any browser instance and can only be changed by the client.',
        parameters: [],
        returns: 'Returns *true* if the client has browser GPU rendering enabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserGPUEnabled',
    },
    isBrowserLoading: {
        summary: 'This function checks if a browser is currently loading a website.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'Returns *true* if the browser is loading a website, *false* otherwise and *nil* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserLoading',
    },
    isBrowserRenderingPaused: {
        summary: 'This function gets the rendering state of a browser element.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser element to get the rendering state of.' },
        ],
        returns: 'Returns *true* if the browser rendering is paused, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserRenderingPaused',
    },
    isCapsLockEnabled: {
        summary: 'This function returns the state of the caps lock.',
        parameters: [],
        returns: 'Returns *true* if caps lock is toggled (on), *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsCapsLockEnabled',
    },
    isChatBoxInputActive: {
        summary: 'This function returns whether the ingame chatbox is being used (accepting chatbox input) or not.',
        parameters: [],
        returns: 'Returns *true* if the chatbox is receiving input, *false* if not active.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsChatBoxInputActive',
    },
    isChatInputBlocked: {
        summary: 'This function checks if the player\'s chat input is blocked.',
        parameters: [],
        returns: 'Returns *true* if the chat input is blocked, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsChatInputBlocked',
    },
    isChatVisible: {
        summary: 'This function checks if player\'s chat is visible.',
        parameters: [],
        returns: 'Returns *true* if the chat is visible, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsChatVisible',
    },
    isConsoleActive: {
        summary: 'This function returns whether the ingame console window is visible or not.',
        parameters: [],
        returns: 'Returns *true* if the console is visible, *false* if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsConsoleActive',
    },
};
