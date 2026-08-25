import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_31: ApiDocumentationCatalog = {
    guiRadioButtonSetSelected: {
        summary: 'This function selects or unselects a radio button.',
        parameters: [
            { name: 'guiRadioButton', isOptional: false, isVariadic: false, summary: 'The GUI radio button in which you wish to change the selection state of' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'The state of the radio button, where *true* indicates selected, and *false* indicates unselected.' },
        ],
        returns: 'Returns *true* if the radio button\'s selection state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiRadioButtonSetSelected',
    },
    guiRoot: {
        summary: 'The root element of all GUI elements.',
        parameters: [],
        returns: '',
        wiki: '',
    },
    guiScrollBarGetScrollPosition: {
        summary: 'This function gets the scroll amount of a scrollbar as a percentage.',
        parameters: [
            { name: 'theScrollBar', isOptional: false, isVariadic: false, summary: 'The scrollbar you want to check.' },
        ],
        returns: 'Returns a float ranging between 0 and 100, representing the amount the scrollbar has been scrolled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollBarGetScrollPosition',
    },
    guiScrollBarSetScrollPosition: {
        summary: 'This function is used to set the scroll amount of a scrollbar as a percentage.',
        parameters: [
            { name: 'theScrollBar', isOptional: false, isVariadic: false, summary: 'The scrollbar you want to change the progress of' },
            { name: 'amount', isOptional: false, isVariadic: false, summary: 'a float ranging from 0 - 100 representing the amount you wish to set the scroll bar.' },
        ],
        returns: 'Returns true if the scroll position was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollBarSetScrollPosition',
    },
    guiScrollPaneGetHorizontalScrollPosition: {
        summary: 'This function is used to get the position of a horizontal scroll pane as a percentage.',
        parameters: [
            { name: 'horizontalScrollPane', isOptional: false, isVariadic: false, summary: 'The scroll pane you want to know the position of' },
        ],
        returns: 'Returns a float ranging between 0 and 100, or **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneGetHorizontalScrollPosition',
    },
    guiScrollPaneGetVerticalScrollPosition: {
        summary: 'This function is used to get the position of a vertical scroll pane as a percentage.',
        parameters: [
            { name: 'verticalScrollPane', isOptional: false, isVariadic: false, summary: 'The scroll pane you want to know the position of' },
        ],
        returns: 'Returns a float ranging between 0 and 100, or **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneGetVerticalScrollPosition',
    },
    guiScrollPaneSetHorizontalScrollPosition: {
        summary: 'This function is used to set the position of a horizontal scroll pane as a percentage.',
        parameters: [
            { name: 'horizontalScrollPane', isOptional: false, isVariadic: false, summary: 'The scroll pane you want to change the position of' },
            { name: 'position', isOptional: false, isVariadic: false, summary: 'a float ranging from 0 - 100' },
        ],
        returns: 'Returns **true** if the position was set, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneSetHorizontalScrollPosition',
    },
    guiScrollPaneSetScrollBars: {
        summary: 'This function allows a scrollpane\'s scrollbars to be forced **on**, or returned to default.',
        parameters: [
            { name: 'scrollPane', isOptional: false, isVariadic: false, summary: 'the GUI scrollpane element you want to set the scrollbars of.' },
            { name: 'horizontal', isOptional: false, isVariadic: false, summary: 'A bool where true forces the horizontal scrollbar on, and false returns them to default.' },
            { name: 'vertical', isOptional: false, isVariadic: false, summary: 'A bool where true forces the vertical scrollbar on, and false returns them to default.' },
        ],
        returns: 'Returns *true* if the call was successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneSetScrollBars',
    },
    guiScrollPaneSetVerticalScrollPosition: {
        summary: 'This function is used to set the position of a vertical scroll pane as a percentage.',
        parameters: [
            { name: 'verticalScrollPane', isOptional: false, isVariadic: false, summary: 'The scroll pane you want to change the position of' },
            { name: 'position', isOptional: false, isVariadic: false, summary: 'a float ranging from 0 - 100' },
        ],
        returns: 'Returns **true** if the position was set, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneSetVerticalScrollPosition',
    },
    guiSetAlpha: {
        summary: 'This changes the alpha level (the visibleness/transparency) of a GUI element',
        parameters: [
            { name: 'guielement', isOptional: false, isVariadic: false, summary: '' },
            { name: 'alpha', isOptional: false, isVariadic: false, summary: 'The visibility/transparency of the GUI element. Ranges from 0 (fully transparent) to 1 (fully opaque). Default value is 0.80.' },
        ],
        returns: 'Returns *true* if the gui element\'s alpha was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetAlpha',
    },
    guiSetEnabled: {
        summary: 'This function enables/disables a GUI element. A disabled GUI element can\'t be used, gets a gray aspect and doesn\'t receive any events.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to enable or disable' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'the new state' },
        ],
        returns: 'If the function succeeds it returns *true*, if it fails it returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetEnabled',
    },
    guiSetFont: {
        summary: 'This function sets the font of a GUI element to be used when drawing text.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The GUI element you wish to change the font of' },
            { name: 'font', isOptional: false, isVariadic: false, summary: 'Either a custom GUI font element or the name of a built-in GUI font. See Standard GUI Font Names' },
        ],
        returns: 'Returns *true* if the font has been successfully set on the gui element, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetFont',
    },
    guiSetInputEnabled: {
        summary: 'This function enables or disables input focus for the GUI.  This means that any keybinds or MTA binds are overidden so that text can be input into an editbox, for example.  In other words, keys such as *t* and *y* which activate the chatbox are disabled.\n\nguiSetInputMode can be used as an extended version of *guiSetInputEnabled* since it provides the same functionality with one added feature.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'true if input should go to GUI, false if it should go to the game.' },
        ],
        returns: 'Returns *true* if input mode could be changed, *false* if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetInputEnabled',
    },
    guiSetInputMode: {
        summary: 'This function controls the input mode to define whether or not (and when) keybinds or MTA binds are overridden (disabled) so that text can be input into an editbox, for example.\nAvailable input modes are:\n* **allow_binds:** never disabled (hence using a key such as t in an editbox will still open the chatbox)\n* **no_binds:** always disabled (hence using a key such as t will never open the chatbox)\n* **no_binds_when_editing:** only disabled when editing an editbox or a memo (binds are enabled except when an editbox or memo has input focus)\n\nThis function can be used as a replacement of guiSetInputEnabled since it provides the same functionality with one added feature.\n* *guiSetInputEnabled ( false )* is the same as *guiSetInputMode ( "allow_binds" )*\n* *guiSetInputEnabled ( true )* is the same as *guiSetInputMode ( "no_binds" )*',
        parameters: [
            { name: 'mode', isOptional: false, isVariadic: false, summary: 'a string representing the desired input mode. Accepted values are:' },
        ],
        returns: 'Returns *true* if input mode could be changed, *false* if invalid parameters are passed.',
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
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the position has been successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetPosition',
    },
    guiSetProperty: {
        summary: 'This function sets the value of a specific CEGUI property of a GUI element. For a list of properties and their meaning, see the [https://web.archive.org/web/20260220180628/http://static.cegui.org.uk/static/WindowsLookProperties.html CEGUI properties page (Internet archive)].',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element you wish to get a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the name of of property you want the value of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'the new value for the property.' },
        ],
        returns: 'If the function succeeds it returns *true*, if it fails it returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetProperty',
    },
    guiSetSelectedTab: {
        summary: 'This function is used to change the currently selected tab in a tab panel.',
        parameters: [
            { name: 'tabPanel', isOptional: false, isVariadic: false, summary: 'The tab panel which current tab you want to change.' },
            { name: 'theTab', isOptional: false, isVariadic: false, summary: 'The tab which will be the new active tab.' },
        ],
        returns: 'Returns *true* if the selected tab was changed to a new one successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetSelectedTab',
    },
    guiSetSize: {
        summary: 'This function sets the dimensions (size) of a GUI element. It refers to the bounding box size for GUI elements. It does not make GUI elements smaller or larger in appearance.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element whose visibility is to be changed' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'The desired width setting for the gui element' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'The desired height setting for the gui element' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'This is whether sizes and positioning are relative. If this is *true*, then all x,y,width,height floats must be between 0 and 1, representing sizes relative to the parent.' },
        ],
        returns: 'Returns *true* if the gui element\'s size was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetSize',
    },
    guiSetText: {
        summary: 'This function sets the text of a GUI element.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'The GUI element you wish to change the text of' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The new text' },
        ],
        returns: 'Returns *true* if text has been successfully set on the gui element, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetText',
    },
    guiSetVisible: {
        summary: 'This function changes the visibility state of a GUI element.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element whose visibility is to be changed' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'the new visibility state' },
        ],
        returns: 'Returns *true* if the element\'s visibility could be changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiSetVisible',
    },
    guiStaticImageGetNativeSize: {
        summary: 'This function gets the native size of image. That means the original size in pixels of the image file.',
        parameters: [
            { name: 'theImage', isOptional: false, isVariadic: false, summary: 'The static image element to get the original size of.' },
        ],
        returns: 'Returns two integers where first is the width and second the height of the image in pixels, *false* if the image element was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiStaticImageGetNativeSize',
    },
    guiStaticImageLoadImage: {
        summary: 'This function allows you to change the image in GUI static image element to another one. **Tip**: If you set other images as children you will have to use setElementCallPropagationEnabled to only affect the parent image.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The static image element to be changed.' },
            { name: 'filename', isOptional: false, isVariadic: false, summary: 'A string specifying the filepath of the image file being loaded in current resource.' },
        ],
        returns: 'Returns *true* if the the image in the static image element was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiStaticImageLoadImage',
    },
    guiWindowIsMovable: {
        summary: 'This function checks if a GUI window is movable.',
        parameters: [
            { name: 'guiWindow', isOptional: false, isVariadic: false, summary: 'the window to check the movable flag of' },
        ],
        returns: 'Returns *true* if the window is movable, *false* if not, *nil* if an invalid window was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowIsMovable',
    },
    guiWindowIsSizable: {
        summary: 'This function checks if a GUI window is sizable.',
        parameters: [
            { name: 'guiWindow', isOptional: false, isVariadic: false, summary: 'the window to check the sizable flag of' },
        ],
        returns: 'Returns *true* if the window is sizable, *false* if not, *nil* if an invalid window was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowIsSizable',
    },
    guiWindowSetMovable: {
        summary: 'This function allows you to specify whether or not a user can move a GUI window.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The window to be changed.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether the window is movable or not.' },
        ],
        returns: 'Returns *true* if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowSetMovable',
    },
    guiWindowSetSizable: {
        summary: 'This function enables or disables user resizing of a GUI window.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The window to be changed.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether user resizing is to be enabled or disabled.' },
        ],
        returns: 'Returns *true* if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiWindowSetSizable',
    },
    hasElementData: {
        summary: 'This function checks if an element has element data available under a certain key.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'This is the element with data you want to check.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the element data entry you want to check for. (Maximum 31 characters.)' },
            { name: 'inherit', isOptional: true, isVariadic: false, summary: '- toggles whether or not the function should go up the hierarchy to find the requested key in case the specified element doesn\'t have it.' },
        ],
        returns: 'This function returns *true* if the element contains element data for *key*, or *false* if the element doesn\'t exist or there is no data associated with the *key*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/HasElementData',
    },
};
