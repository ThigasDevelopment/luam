import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_26: ApiDocumentationCatalog = {
    guiDeleteTab: {
        summary: 'This function deletes a tab from a tab panel.',
        parameters: [
            { name: 'tabToDelete', isOptional: false, isVariadic: false, summary: 'This is an element representing the tab that you want to delete.' },
            { name: 'tabPanel', isOptional: false, isVariadic: false, summary: 'This is the guiCreateTabPanel|tab panel parent that the tab is attached to.' },
        ],
        returns: 'returns true the tab was successfully deleted, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiDeleteTab',
    },
    guiEditGetCaretIndex: {
        summary: 'This function returns the caret (the text cursor) position within the editbox.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The edit box you want to get the caret position from' },
        ],
        returns: 'returns the caret index on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditGetCaretIndex',
    },
    guiEditGetMaxLength: {
        summary: '',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: 'The edit box you want to get the maximum text length of.' },
        ],
        returns: 'returns the maximum text length on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditGetMaxLength',
    },
    guiEditIsMasked: {
        summary: '',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: 'the edit box to check masked flag of.' },
        ],
        returns: 'returns true if the edit box is masked, false if not, nil if an invalid edit box was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditIsMasked',
    },
    guiEditIsReadOnly: {
        summary: '',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: 'The edit box to check read-only status of.' },
        ],
        returns: 'returns true if the edit box is read-only, false if not, nil if an invalid edit box was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditIsReadOnly',
    },
    guiEditSetCaretIndex: {
        summary: 'This function sets the current position of the caret (the text cursor) within the edit\nbox.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The edit box to be changed.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'An integer referring to the desired position within the box.' },
        ],
        returns: 'returns true if the index was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetCaretIndex',
    },
    guiEditSetMasked: {
        summary: 'This function sets or removes masking (covering up the text being typed) for password\ntext fields.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The edit box to be changed.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether masking is to be enabled or disabled.' },
        ],
        returns: 'returns true if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetMasked',
    },
    guiEditSetMaxLength: {
        summary: 'This function sets the maximum text length that can be typed into an edit box.',
        parameters: [
            { name: 'guiEdit', isOptional: false, isVariadic: false, summary: '' },
            { name: 'length', isOptional: false, isVariadic: false, summary: 'An integer indicating the maximum number of characters that can be typed into the box.' },
        ],
        returns: 'returns true if the max length was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetMaxLength',
    },
    guiEditSetReadOnly: {
        summary: 'This function allows you to set or remove read-only status for an edit box. If read-only\nis set to true, the box is not editable.',
        parameters: [
            { name: 'editField', isOptional: false, isVariadic: false, summary: 'The element of the Element/GUI/Edit field|edit field to be modified.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether read-only is to be enabled or disabled.' },
        ],
        returns: 'returns true if edit fields read-only status was changed successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiEditSetReadOnly',
    },
    guiFocus: {
        summary: '',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to focus' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiFocus',
    },
    guiGetAlpha: {
        summary: 'Alpha represents the transparency of a gui element.  This function allows retrieval of a\ngui elements current alpha.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The gui element in which you want to retrieve the alpha of.' },
        ],
        returns: 'this function returns a positive integer in between 0 and 1 of the gui elements current alpha, or false if it could not be retrieved.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetAlpha',
    },
    guiGetBrowser: {
        summary: 'This function gets the browser element behind a gui-browser (a browser that has been\ncreated via guiCreateBrowser).',
        parameters: [
            { name: 'theBrowser', isOptional: false, isVariadic: false, summary: 'The gui-browser' },
        ],
        returns: 'returns the element/browser|browser element if a correct element/gui-browser|gui-browser has been passed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetBrowser',
    },
    guiGetCursorType: {
        summary: 'This function is used to get the type of the current cursor image.',
        parameters: [],
        returns: 'returns a string containing the cursor type: * none // cursor has no image * arrow // default cursor * sizing_ns // n-s (up-down) sizing cursor * sizing_ew // e-w (left-right) sizing cursor * sizing_nwse // nw-se diagonal sizing cursor * sizing_nesw // ne-sw diagonal sizing cursor * sizing_eswe // es-we horizontal sizing cursor * move // move cursor * container_drag // drag container cursor (note: not in use) * segment_moving // segment moving cursor (note: not in use) * segment_sizing // segment sizing cursor (note: not in use)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetCursorType',
    },
    guiGetEnabled: {
        summary: 'This function determines if a GUI element is enabled.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element to be checked.' },
        ],
        returns: 'returns true if the element is enabled, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetEnabled',
    },
    guiGetFont: {
        summary: 'This function is used to get the current font that is used to draw text in GUI elements.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'element you wish to get the font of.' },
        ],
        returns: '*string a string containing the name of the elements current font, or false if the gui element passed to the function is invalid. *element the custom gui font that is used, or nil otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetFont',
    },
    guiGetInputEnabled: {
        summary: 'This function checks whether user input is focused on the GUI or the game.',
        parameters: [],
        returns: 'returns true if input is focused on gui, false if its focused on the game.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetInputEnabled',
    },
    guiGetInputMode: {
        summary: 'This function returns the current input mode as set by guiSetInputMode.\nDefault mode is allow_binds.',
        parameters: [],
        returns: 'returns a string defining the current input mode, potential values are: * allow_binds: binds are enabled, hence using a key such as t in an editbox will still activate the chatbox * no_binds: binds are disabled, hence using a key such as t in an editbox will not activate the chatbox * no_binds_when_editing: binds are always enabled except when an editable editbox or memo has input focus',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetInputMode',
    },
    guiGetPosition: {
        summary: 'This function allows retrieval of a GUI elements current position, relative to its parent.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The gui element of which you wish to retrieve the position.' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the position should be relative to the elements parent width, or the number of offset pixels from the parents origin.' },
        ],
        returns: 'returns floats representing the x and y position of the element, or false if the position could not be retrieved.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetPosition',
    },
    guiGetProperties: {
        summary: 'This function gets a list of the CEGUI property names and values of a GUI element. To\nfind out what the different properties mean, check out the\nhttp://static.cegui.org.uk/static/WindowsLookProperties.html CEGUI properties page.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to get the properties of.' },
        ],
        returns: 'if the function succeeds, the return value is a table. its keys are property names, the corresponding values are the values of the properties (both names and values are always strings). if the function fails, it returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetProperties',
    },
    guiGetProperty: {
        summary: 'This function gets the value of a specific CEGUI property of a GUI element. For a list of\nproperties and their meaning, see the\nhttp://static.cegui.org.uk/static/WindowsLookProperties.html CEGUI properties page.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to get a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the name of of property you want the value of.' },
        ],
        returns: 'if the function succeeds, it returns a string with the value of the property. if it fails, it returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetProperty',
    },
    guiGetScreenSize: {
        summary: 'This function retrieves the local screen size according to the resolution they are using.',
        parameters: [],
        returns: 'this returns two floats representing the players screen resolution, width and height.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetScreenSize',
    },
    guiGetSelectedTab: {
        summary: 'This function returns the currently selected tab in the specified Element/GUI/Tab\npanel|tab panel.',
        parameters: [
            { name: 'tabPanel', isOptional: false, isVariadic: false, summary: 'The Element/GUI/Tab panel|tab panel which current tab you want to retrieve.' },
        ],
        returns: 'returns an element of the element/gui/tab|tab if a tab was selected or nil if no tab was selected. if passed arguments were invalid or something went wrong, the function will return false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetSelectedTab',
    },
    guiGetSize: {
        summary: 'This function gets the size of a GUI element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The GUI element to get size of.' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the size should be relative to the elements parent width, or an absolute size in pixels.' },
        ],
        returns: 'returns the gui element size x and y if the function has been successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetSize',
    },
    guiGetText: {
        summary: 'This function is used to get the text of GUI elements like edit boxes, labels, buttons\netc.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'element you wish to get text of.' },
        ],
        returns: 'returns a string containing the requested elements text, or false if the gui element passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetText',
    },
    guiGetVisible: {
        summary: 'This function determines if a GUI element is visible.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element to be checked' },
        ],
        returns: 'returns true if the element is visible, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetVisible',
    },
    guiGridListAddColumn: {
        summary: 'This function is used to create columns in grid lists.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
            { name: 'title', isOptional: false, isVariadic: false, summary: 'Title of the column' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'Column width, relative to the grid list width' },
        ],
        returns: 'returns the column id if it was created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListAddColumn',
    },
    guiGridListAddRow: {
        summary: 'Adds a row to a grid list, and optionally add simple text items with your rows.  Use\nguiGridListSetItemText to add row headers.\nATTENTION: Without guiGridListSetItemText there is no row added to the grid.\nLook at the example, first you give the row a name with row = guiGridListAddRow (\nplayerList ), and then you use guiGridListSetItemText.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a row to' },
            { name: 'itemText1', isOptional: true, isVariadic: false, summary: 'The text for the first column item in the row. Either a string or a number can be passed (use numbers for sorting purposes).' },
            { name: 'itemText2', isOptional: true, isVariadic: false, summary: 'The text for the second column item in the row. Either a string or a number can be passed (use numbers for sorting purposes). ... Item text for any other columns' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns the row id if it has been created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListAddRow',
    },
    guiGridListAutoSizeColumn: {
        summary: 'This allows you to automatically size a column to display everything in it correctly,\nwith the most minimal width.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The Element/GUI/Gridlist|grid list element where the column is located.' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'The ID of the column you want to be auto-sized.' },
        ],
        returns: 'returns true if the column was auto-sized, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListAutoSizeColumn',
    },
    guiGridListClear: {
        summary: 'This function clears all the data from a grid list.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element to be cleared' },
        ],
        returns: 'returns true if the grid list element is valid and has been cleared successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListClear',
    },
};
