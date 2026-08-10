import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_29: ApiDocumentationCatalog = {
    guiScrollPaneSetVerticalScrollPosition: {
        summary: 'This function is used to set the position of a vertical scroll pane as a percentage.',
        parameters: [
            { name: 'verticalScrollPane', isOptional: false, isVariadic: false, summary: ': The scroll pane you want to change the position of' },
            { name: 'position', isOptional: false, isVariadic: false, summary: ': a float ranging from 0 - 100' },
        ],
        returns: 'returns true if the position was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneSetVerticalScrollPosition',
    },
    guiSetAlpha: {
        summary: 'This changes the alpha level (the visibleness/transparency) of a GUI element',
        parameters: [
            { name: 'guielement', isOptional: false, isVariadic: false, summary: '' },
            { name: 'alpha', isOptional: false, isVariadic: false, summary: 'The visibility/transparency of the GUI element. Ranges from 0 (fully transparent) to 1 (fully opaque). Default value is 0.80.' },
        ],
        returns: 'returns true if the gui elements alpha was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetAlpha',
    },
    guiSetEnabled: {
        summary: 'This function enables/disables a GUI element. A disabled GUI element cant be used, gets a\ngray aspect and doesnt receive any events.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to enable or disable' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'the new state' },
        ],
        returns: 'if the function succeeds it returns true, if it fails it returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetEnabled',
    },
    guiSetFont: {
        summary: 'This function sets the font of a GUI_widgets|GUI element to be used when drawing text.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The GUI element you wish to change the font of' },
            { name: 'font', isOptional: false, isVariadic: false, summary: 'Either a custom GUI font element or the name of a built-in GUI font. See Standard GUI Font Names' },
        ],
        returns: 'returns true if the font has been successfully set on the gui element, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetFont',
    },
    guiSetInputEnabled: {
        summary: 'This function enables or disables input focus for the GUI.  This means that any keybinds\nor MTA binds are overidden so that text can be input into an editbox, for example.  In\nother words, keys such as t and y which activate the chatbox are disabled.\nguiSetInputMode can be used as an extended version of guiSetInputEnabled since it\nprovides the same functionality with one added feature.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'true if input should go to GUI, false if it should go to the game.' },
        ],
        returns: 'returns true if input mode could be changed, false if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetInputEnabled',
    },
    guiSetInputMode: {
        summary: 'This function controls the input mode to define whether or not (and when) keybinds or MTA\nbinds are overridden (disabled) so that text can be input into an editbox, for example.\nThe binds can be either:\n* never disabled (hence using a key such as t in an editbox will still activate the\nchatbox)\n* always disabled (hence using a key such as t in an editbox will not activate the\nchatbox)\n* only disabled when actually editing an editbox or a memo (binds are always enabled\nexcept when an editbox or memo has input focus)',
        parameters: [
            { name: 'mode', isOptional: false, isVariadic: false, summary: 'a string representing the desired input mode. Accepted values are: allow_binds binds are enabled, hence using a key such as t in an editbox will still activate the chatbox (default) no_binds binds are disabled, hence using a key such as t in an editbox will not activate the chatbox no_binds_when_editing binds are always enabled except when an editable editbox or memo has input focus' },
        ],
        returns: 'returns true if input mode could be changed, false if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetInputMode',
    },
    guiSetPosition: {
        summary: 'This function sets the position of a GUI element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The GUI element to change position for' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'Position over the X axis' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'Position over the Y axis' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'Bool that indicates if the x/y positions are relative to the elements parent element.' },
        ],
        returns: 'returns true if the position has been successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetPosition',
    },
    guiSetProperty: {
        summary: 'This function sets the value of a specific CEGUI property of a GUI element. For a list of\nproperties and their meaning, see the\nhttp://static.cegui.org.uk/static/WindowsLookProperties.html CEGUI properties page.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to get a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the name of of property you want the value of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'the new value for the property.' },
        ],
        returns: 'if the function succeeds it returns true, if it fails it returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetProperty',
    },
    guiSetSelectedTab: {
        summary: 'This function is used to change the currently selected Element/GUI/Tab|tab in a\nElement/GUI/Tab panel|tab panel.',
        parameters: [
            { name: 'tabPanel', isOptional: false, isVariadic: false, summary: 'The Element/GUI/Tab panel|tab panel which current tab you want to change.' },
            { name: 'theTab', isOptional: false, isVariadic: false, summary: 'The Element/GUI/Tab|tab which will be the new active tab.' },
        ],
        returns: 'returns true if the selected tab was changed to a new one successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetSelectedTab',
    },
    guiSetSize: {
        summary: 'This function sets the dimensions (size) of a GUI element. It refers to the bounding box\nsize for GUI elements. It does not make GUI elements smaller or larger in appearance.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element whose visibility is to be changed' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'The desired width setting for the gui element' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'The desired height setting for the gui element' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'This is whether sizes and positioning are relative. If this is true, then all x,y,width,height floats must be between 0 and 1, representing sizes relative to the parent.' },
        ],
        returns: 'returns true if the gui elements size was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetSize',
    },
    guiSetText: {
        summary: 'This function sets the text of a GUI element.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The GUI element you wish to change the text of' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The new text' },
        ],
        returns: 'returns true if text has been successfully set on the gui element, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetText',
    },
    guiSetVisible: {
        summary: 'This function changes the visibility state of a GUI element.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element whose visibility is to be changed' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'the new visibility state' },
        ],
        returns: 'returns true if the elements visibility could be changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetVisible',
    },
    guiStaticImageGetNativeSize: {
        summary: 'This function gets the native size of image. That means the original size in pixels of\nthe image file.',
        parameters: [
            { name: 'theImage', isOptional: false, isVariadic: false, summary: 'The static image element to get the original size of.' },
        ],
        returns: 'returns two integers where first is the width and second the height of the image in pixels, false if the image element was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiStaticImageGetNativeSize',
    },
    guiStaticImageLoadImage: {
        summary: 'This function allows you to change the image in GUI static image element to another one.\nTip: If you set other images as children you will have to use\nsetElementCallPropagationEnabled to only affect the parent image.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The static image element to be changed.' },
            { name: 'filename', isOptional: false, isVariadic: false, summary: 'A string specifying the filepath of the image file being loaded in current resource.' },
        ],
        returns: 'returns true if the the image in the static image element was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiStaticImageLoadImage',
    },
    guiWindowIsMovable: {
        summary: '',
        parameters: [
            { name: 'guiWindow', isOptional: false, isVariadic: false, summary: 'the window to check the movable flag of' },
        ],
        returns: 'returns true if the window is movable, false if not, nil if an invalid window was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowIsMovable',
    },
    guiWindowIsSizable: {
        summary: '',
        parameters: [
            { name: 'guiWindow', isOptional: false, isVariadic: false, summary: 'the window to check the sizable flag of' },
        ],
        returns: 'returns true if the window is sizable, false if not, nil if an invalid window was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowIsSizable',
    },
    guiWindowSetMovable: {
        summary: 'This function allows you to specify whether or not a user can move a GUI window.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The window to be changed.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether the window is movable or not.' },
        ],
        returns: 'returns true if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowSetMovable',
    },
    guiWindowSetSizable: {
        summary: 'This function enables or disables user resizing of a GUI window.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The window to be changed.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether user resizing is to be enabled or disabled.' },
        ],
        returns: 'returns true if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowSetSizable',
    },
    hasElementData: {
        summary: 'This function checks if an element has element data available under a certain key.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'This is the element with data you want to check.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the element data entry you want to check for. (Maximum 31 characters.)' },
            { name: 'inherit', isOptional: true, isVariadic: false, summary: '- toggles whether or not the function should go up the hierarchy to find the requested key in case the specified element doesnt have it.' },
        ],
        returns: 'this function returns true if the element contains element data for key, or false if the element doesnt exist or there is no data associated with the key.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HasElementData',
    },
    hasElementDataSubscriber: {
        summary: 'This function is used together with setElementData in subscribe mode.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to check whether the player is subscribed to.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to check whether the player is subscribed to.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to check.' },
        ],
        returns: 'returns true if the player is subscribed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HasElementDataSubscriber',
    },
    hash: {
        summary: 'This function returns a hash of the specified string in the specified algorithm.',
        parameters: [
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: ': A string which must be one of these: md5, sha1, sha224, sha256, sha384, sha512, hmac' },
            { name: 'dataToHash', isOptional: false, isVariadic: false, summary: ': A string of the data to hash.' },
            { name: 'options', isOptional: true, isVariadic: false, summary: ': A table with options and other necessary data for the algorithm, as detailed below.' },
        ],
        returns: 'returns the hash of the data, false if an invalid argument was used.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Hash',
    },
    hasObjectPermissionTo: {
        summary: 'This function returns whether or not the given object has access to perform the given\naction.\nScripts frequently wish to limit access to features to particular users. The naïve way to\ndo this would be to check if the player who is attempting to perform an action is in a\nparticular group (usually the Admin group). The main issue with doing this is that the\nAdmin group is not guaranteed to exist. It also doesnt give the server admin any\nflexibility. He might want to allow his moderators access to the function youre limiting\naccess to, or he may want it disabled entirely.\nThis is where using the ACL properly comes in, and luckily this is very easy. It all\ncomes down to using this function. This, somewhat confusingly named function lets you\ncheck if an ACL object (a player or a resource) has a particular ACL right. In this case,\nwe just care about players.\nSo, first of all, think of a name for your right. Lets say we want a private area only\ncertain people can go in, well call our right accessPrivateArea. Then, all you need to do\nis add one if statement to your code:\n```lua\nif hasObjectPermissionTo ( player,\nresource.YourResourceName.accessPrivateArea, false ) then\n-- Whatever you want to happen if theyre allowed in\nelse\n-- Whatever you want to happen if they arent\nend\n```\nNotice that weve named the right using resource.YourResourceName.accessPrivateArea - this\nis just for neatness, so that the admin knows what resource the right belongs to. Its\nstrongly advised you follow this convention. The false argument specifies the\ndefaultPermission, false indicating that if the user hasnt had the right allowed or\ndissallowed (i.e. the admin hasnt added it to the config), that it should default to\nbeing not allowed.\nThe only downside of using this method is that the admin has to modify his config. The\nupsides are that the admin has much more control and your script will work for any\nserver, however the admin has configured it.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'The object to test if has permission to. This can be a client element (ie. a player), a resource or a string in the form user. or resource..' },
            { name: 'theAction', isOptional: false, isVariadic: false, summary: 'The action to test if the given object has access to. Ie. function.kickPlayer.' },
            { name: 'defaultPermission', isOptional: true, isVariadic: false, summary: 'The default permission if none is specified in either of the groups the given object is a member of. If this is left to true, the given object will have permissions to perform the action unless the opposite is explicitly specified in the ACL. If false, the action will be denied by default unless explicitly approved by the Access Control List.' },
        ],
        returns: 'returns true if the given object has permission to perform the given action, false otherwise. returns nil if the function failed because of bad arguments.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HasObjectPermissionTo',
    },
    injectBrowserMouseDown: {
        summary: 'This function injects a mouse click (state: down).',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser' },
            { name: 'mouseButton', isOptional: false, isVariadic: false, summary: 'The mouse button (Possible values: left, middle, right)' },
        ],
        returns: 'returns true if the click was successfully injected, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseDown',
    },
    injectBrowserMouseMove: {
        summary: 'This function injects a mouse movement.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser which will retrieve the mouse movement' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'Absolute X screen coordinate' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'Absolute Y screen coordinate' },
        ],
        returns: 'returns true if the movement was injected successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseMove',
    },
    injectBrowserMouseUp: {
        summary: 'This function injects a mouse click (state: up).',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser' },
            { name: 'mouseButton', isOptional: false, isVariadic: false, summary: 'The mouse button (Possible values: left, middle, right)' },
        ],
        returns: 'returns true if the click was successfully injected, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseUp',
    },
    injectBrowserMouseWheel: {
        summary: 'This function injects mouse wheel events.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser' },
            { name: 'verticalScroll', isOptional: false, isVariadic: false, summary: ': Amount of units you want the browser to scroll along the Y-axe.' },
            { name: 'horizontalScroll', isOptional: false, isVariadic: false, summary: ': Amount of units you want the browser to scroll along the X-axe.' },
        ],
        returns: 'returns true if the mouse action was successfully injected, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/InjectBrowserMouseWheel',
    },
};
