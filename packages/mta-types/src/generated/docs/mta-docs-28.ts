import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_28: ApiDocumentationCatalog = {
    guiCreateScrollPane: {
        summary: 'This creates a GUI scroll pane.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'the 2D x offset of the GUI scrollpane from its parent. This is affected by the relative argument.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'the 2D y offset of the GUI scrollpane from its parent. This is affected by the relative argument.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'the width of the GUI scrollpane. This is affected by the relative argument.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'the height of the GUI scrollpane. This is affected by the relative argument.' },
            { name: 'relative', isOptional: true, isVariadic: false, summary: 'whether sizes and positions are relative to their parent\'s. If this is true, then all measures must be between 0 and 1, representing sizes/positions as a fraction of the parent widget\'s size.' },
            { name: 'parent', isOptional: true, isVariadic: false, summary: 'the gui-element this scrollpane is attached to. By default, it is nil, meaning the widget is attached to the background.' },
        ],
        returns: 'The gui-element if created, otherwise false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCreateScrollPane',
    },
    guiCreateStaticImage: {
        summary: 'This function creates a static image using a .png image in the resource.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float of the 2D x position of the image on a player\'s screen. This is affected by the *relative* argument.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float of the 2D y position of the image on a player\'s screen. This is affected by the *relative* argument.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'A float of the width of the image. This is affected by the *relative* argument.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'A float of the height of the image. This is affected by the *relative* argument.' },
            { name: 'path', isOptional: false, isVariadic: false, summary: 'The filepath of the image file that is being loaded.' },
            { name: 'relative', isOptional: true, isVariadic: false, summary: 'This is whether sizes and positioning are relative. If this is *true*, then all x,y,width,height floats must be between 0 and 1, representing measures relative to the parent.' },
            { name: 'parent', isOptional: true, isVariadic: false, summary: 'This is the parent that the image is attached to. If the *relative* argument is true, sizes and positioning will be made relative to this parent. If the *relative* argument is false, positioning will be the number of offset pixels from the parent\'s origin. If no parent is passed, the parent will become the screen - causing positioning and sizing according to screen positioning.' },
        ],
        returns: 'Returns element if image was created successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCreateStaticImage',
    },
    guiCreateTab: {
        summary: 'This function creates a tab on a pre-existing tab panel. A tab is a button as well as a \'dimension\' that can be used to switch between information by clicking on the tabs.  Tabs are sorted on a tab panel in the order that they are created.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The caption for the tab' },
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'The parent tab panel, as a tab panel element type' },
        ],
        returns: 'Returns a tab element if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCreateTab',
    },
    guiCreateTabPanel: {
        summary: 'This function creates a Tab Panel, which acts as a template to create Tabs upon.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float of the 2D x position of the GUI tab panel on a player\'s screen. This is affected by the *relative* argument.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float of the 2D y position of the GUI tab panel on a player\'s screen. This is affected by the *relative* argument.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'A float of the width of the GUI tab panel. This is affected by the *relative* argument.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'A float of the height of the GUI tab panel. This is affected by the *relative* argument.' },
            { name: 'relative', isOptional: true, isVariadic: false, summary: 'This is whether sizes and positioning are relative. If this is *true*, then all x,y,width,height floats must be between 0 and 1, representing sizes relative to the parent.' },
            { name: 'parent', isOptional: true, isVariadic: false, summary: 'This is the parent that the tab panel is attached to. If the *relative* argument is true, sizes and positioning will be made relative to this parent. If the *relative* argument is false, positioning will be the number of offset pixels from the parent\'s origin. If no parent is passed, the parent will become the screen - causing positioning and sizing according to screen positioning.' },
        ],
        returns: 'Returns a GUI tab panel element if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCreateTabPanel',
    },
    guiCreateWindow: {
        summary: 'This function is for creating a new GUI window.  This provides a base for other gui elements to be created within.  However, windows do not have a parent and cannot be created in any GUI elements.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A float of the 2D x position of the GUI window on a player\'s screen. This is affected by the *relative* argument.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A float of the 2D y position of the GUI window on a player\'s screen. This is affected by the *relative* argument.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'A float of the width of the GUI window. This is affected by the *relative* argument.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'A float of the height of the GUI window. This is affected by the *relative* argument.' },
            { name: 'titleBarText', isOptional: false, isVariadic: false, summary: 'A string of the text that will be displayed in the title bar of the window.' },
            { name: 'relative', isOptional: true, isVariadic: false, summary: 'This is whether sizes and positioning are relative. If this is *true*, then all x,y,width,height floats must be between 0 and 1, representing sizes/positions as a fraction of the screen size. If *false*, then the size and co-ordinates are based on client\'s resolution, accessible using guiGetScreenSize.' },
        ],
        returns: 'Returns a gui window element if it was created successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiCreateWindow',
    },
    guiDeleteTab: {
        summary: 'This function deletes a tab from a tab panel.',
        parameters: [
            { name: 'tabToDelete', isOptional: false, isVariadic: false, summary: 'This is an element representing the tab that you want to delete.' },
            { name: 'tabPanel', isOptional: false, isVariadic: false, summary: 'This is the tab panel parent that the tab is attached to.' },
        ],
        returns: 'Returns *true* the tab was successfully deleted, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiDeleteTab',
    },
    guiEditGetCaretIndex: {
        summary: 'This function returns the caret (the text cursor) position within the editbox.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The edit box you want to get the caret position from' },
        ],
        returns: 'Returns the caret index on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditGetCaretIndex',
    },
    guiEditGetMaxLength: {
        summary: 'This function returns the maximum text length that can be typed within an edit box.',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: 'The edit box you want to get the maximum text length of.' },
        ],
        returns: 'Returns the maximum text length on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditGetMaxLength',
    },
    guiEditIsMasked: {
        summary: 'This function checks if an edit box is masked.',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: 'the edit box to check masked flag of.' },
        ],
        returns: 'Returns *true* if the edit box is masked, *false* if not, *nil* if an invalid edit box was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditIsMasked',
    },
    guiEditIsReadOnly: {
        summary: 'This function checks if an edit box is read-only.',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: 'The edit box to check read-only status of.' },
        ],
        returns: 'Returns *true* if the edit box is read-only, *false* if not, *nil* if an invalid edit box was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditIsReadOnly',
    },
    guiEditSetCaretIndex: {
        summary: 'This function sets the current position of the caret (the text cursor) within the edit box.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The edit box to be changed.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'An integer referring to the desired position within the box.' },
        ],
        returns: 'Returns *true* if the index was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetCaretIndex',
    },
    guiEditSetMasked: {
        summary: 'This function sets or removes masking (covering up the text being typed) for password text fields.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The edit box to be changed.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether masking is to be enabled or disabled.' },
        ],
        returns: 'Returns *true* if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetMasked',
    },
    guiEditSetMaxLength: {
        summary: 'This function sets the maximum text length that can be typed into an edit box.',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: '' },
            { name: 'length', isOptional: false, isVariadic: false, summary: 'An integer indicating the maximum number of characters that can be typed into the box.' },
        ],
        returns: 'Returns *true* if the max length was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetMaxLength',
    },
    guiEditSetReadOnly: {
        summary: 'This function allows you to set or remove read-only status for an edit box. If read-only is set to *true*, the box is not editable.',
        parameters: [
            { name: 'editField', isOptional: false, isVariadic: false, summary: 'The element of the edit field to be modified.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether read-only is to be enabled or disabled.' },
        ],
        returns: 'Returns *true* if edit field\'s read-only status was changed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetReadOnly',
    },
    guiFocus: {
        summary: 'This function focuses a defocused GUI element. Used primarily for edit fields and memos.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to focus' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiFocus',
    },
    guiGetAlpha: {
        summary: 'Alpha represents the transparency of a gui element.  This function allows retrieval of a gui element\'s current alpha.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The gui element in which you want to retrieve the alpha of.' },
        ],
        returns: 'This function returns a positive integer in between 0 and 1 of the gui element\'s current alpha, or false if it could not be retrieved.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetAlpha',
    },
    guiGetBrowser: {
        summary: 'This function gets the browser element behind a gui-browser (a browser that has been created via guiCreateBrowser).',
        parameters: [
            { name: 'theBrowser', isOptional: false, isVariadic: false, summary: 'The gui-browser' },
        ],
        returns: 'Returns the Browser element if a correct gui-browser has been passed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetBrowser',
    },
    guiGetCursorType: {
        summary: 'This function is used to get the type of the current cursor image.',
        parameters: [],
        returns: 'Returns a string containing the cursor type: * **"none"** // cursor has no image * **"arrow"** // default cursor * **"sizing_ns"** // N-S (up-down) sizing cursor * **"sizing_ew"** // E-W (left-right) sizing cursor * **"sizing_nwse"** // NW-SE diagonal sizing cursor * **"sizing_nesw"** // NE-SW diagonal sizing cursor * **"sizing_eswe"** // ES-WE horizontal sizing cursor * **"move"** // move cursor * **"container_drag"** // drag container cursor (note: not in use) * **"segment_moving"** // segment moving cursor (note: not in use) * **"segment_sizing"** // segment sizing cursor (note: not in use)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetCursorType',
    },
    guiGetEnabled: {
        summary: 'This function determines if a GUI element is enabled.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element to be checked.' },
        ],
        returns: 'Returns *true* if the element is enabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetEnabled',
    },
    guiGetFont: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function is used to get the current font that is used to draw text in GUI elements.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'element you wish to get the font of.' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> ***string** A string containing the name of the element\'s current font, or false if the gui element passed to the function is invalid. ***element ** The custom GUI font that is used, or nil otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetFont',
    },
    guiGetInputEnabled: {
        summary: 'This function checks whether user input is focused on the GUI or the game.',
        parameters: [],
        returns: 'Returns *true* if input is focused on GUI, *false* if it\'s focused on the game.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetInputEnabled',
    },
    guiGetInputMode: {
        summary: 'This function returns the current input mode as set by guiSetInputMode.\nDefault mode is *"allow_binds"*.\n\nThis function is **not** a replacement of guiGetInputEnabled, indeed for the mode *"no_binds_when_editing"* the actual state of binds depends on the currently focused GUI widget. However:\n* when *guiGetInputMode ( )* returns *"allow_binds"* you can be sure that *guiGetInputEnabled ()* will return *false*\n* when *guiGetInputMode ( )* returns *"no_binds"* you can be sure that *guiGetInputEnabled ()* will return *true*',
        parameters: [],
        returns: 'Returns a string defining the current input mode, potential values are: * **"allow_binds":** binds are enabled, hence using a key such as t in an editbox will still activate the chatbox * **"no_binds":** binds are disabled, hence using a key such as t in an editbox will not activate the chatbox * **"no_binds_when_editing":** binds are always enabled except when an editable editbox or memo has input focus',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetInputMode',
    },
    guiGetPosition: {
        summary: 'This function allows retrieval of a GUI element\'s current position, relative to its parent.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The gui element of which you wish to retrieve the position.' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the position should be relative to the element\'s parent width, or the number of offset pixels from the parent\'s origin.' },
        ],
        returns: 'Returns floats representing the *x* and *y* position of the element, or false if the position could not be retrieved.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetPosition',
    },
    guiGetProperties: {
        summary: 'This function gets a list of the CEGUI property names and values of a GUI element. To find out what the different properties mean, check out the [http://static.cegui.org.uk/static/WindowsLookProperties.html CEGUI properties page].',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to get the properties of.' },
        ],
        returns: 'If the function succeeds, the return value is a table. Its keys are property names, the corresponding values are the values of the properties (both names and values are always strings). If the function fails, it returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetProperties',
    },
    guiGetProperty: {
        summary: 'This function gets the value of a specific CEGUI property of a GUI element. For a list of properties and their meaning, see the [http://static.cegui.org.uk/static/WindowsLookProperties.html CEGUI properties page].',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to get a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the name of of property you want the value of.' },
        ],
        returns: 'If the function succeeds, it returns a string with the value of the property. If it fails, it returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetProperty',
    },
    guiGetScreenSize: {
        summary: 'This function retrieves the local screen size according to the resolution they are using.',
        parameters: [],
        returns: 'This returns two floats representing the player\'s screen resolution, *width* and *height*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetScreenSize',
    },
    guiGetSelectedTab: {
        summary: 'This function returns the currently selected tab in the specified tab panel.',
        parameters: [
            { name: 'tabPanel', isOptional: false, isVariadic: false, summary: 'The tab panel which current tab you want to retrieve.' },
        ],
        returns: 'Returns an element of the tab if a tab was selected or nil if no tab was selected. If passed arguments were invalid or something went wrong, the function will return *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetSelectedTab',
    },
};
