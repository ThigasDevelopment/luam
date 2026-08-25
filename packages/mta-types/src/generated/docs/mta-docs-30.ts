import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_30: ApiDocumentationCatalog = {
    guiGridListSetHorizontalScrollPosition: {
        summary: 'This function is used to set the horizontal scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The grid list you want to set the horizontal scroll position from' },
            { name: 'fPosition', isOptional: false, isVariadic: false, summary: 'A float representing the horizontal scroll position (0-100)' },
        ],
        returns: 'Returns *true* if the horizontal scroll position was set, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetHorizontalScrollPosition',
    },
    guiGridListSetItemColor: {
        summary: 'This function changes the color of a gridlist item.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'Row ID' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The amount of red in the color (0-255)' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The amount of green in the color (0-255)' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The amount of blue in the color (0-255)' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: 'The amount of alpha in the color (0-255).' },
        ],
        returns: 'Returns *true* if the item color was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetItemColor',
    },
    guiGridListSetItemData: {
        summary: 'This function sets a Item Data associated to a grid list item.\n\n**Note:** This function will only work **after** you set the item\'s text using guiGridListSetItemText!',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'A gridlist element of the data you wish to set to' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'The row of the item you wish to set to' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'The column of the item you wish to set to' },
            { name: 'data', isOptional: false, isVariadic: false, summary: 'The data you wish to set to the item.' },
        ],
        returns: 'Returns *true* if the data was set successfully, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetItemData',
    },
    guiGridListSetItemText: {
        summary: 'This function changes the text of a gridlist item.\n\nNotice: This function doesn\'t work well with Sorting. If you are using sorting, please use the optional arguments of guiGridListAddRow as much as possible.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'Row ID' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The text you want to put in (does NOT accept numbers, use tostring() for that)' },
            { name: 'section', isOptional: false, isVariadic: false, summary: 'Determines if the item is a section' },
            { name: 'number', isOptional: false, isVariadic: false, summary: 'Tells whether the text item is a number value or not (used for sorting)' },
        ],
        returns: 'Returns *true* if the item text was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetItemText',
    },
    guiGridListSetScrollBars: {
        summary: 'This function allows a gridlist\'s scrollbar to be forced **on**, or returned to default.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The GUI gridlist you wish to change the state of scrollbars' },
            { name: 'horizontalBar', isOptional: false, isVariadic: false, summary: 'A bool where *true* forces the horizontal scrollbar on, and *false* returns them to default.' },
            { name: 'verticalBar', isOptional: false, isVariadic: false, summary: 'A bool where *true* forces the verical scrollbar on, and *false* returns them to default.' },
        ],
        returns: 'Returns *true* if the scrollbars were successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetScrollBars',
    },
    guiGridListSetSelectedItem: {
        summary: 'This function selects an item from a gridlist. If you wish to deselect whatever item is selected, pass *0* as both the *rowIndex* and  *columnIndex* arguments.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the grid list you want to select an item from' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'the row you want to select (index 0 is the first row)' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'the column you want to select (index 1 is the first column)' },
            { name: 'bReset', isOptional: true, isVariadic: false, summary: 'set to false for multiple selections' },
        ],
        returns: 'Returns *true* if the passed arguments are correct and the item has been selected, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetSelectedItem',
    },
    guiGridListSetSelectionMode: {
        summary: 'This function sets the selection mode of a gui gridlist.  For example, the MTA *server browser* selects a whole row, while the *Controls* dialog selects a single cell. To select multiple items you must be holding down \'ctrl\'.',
        parameters: [
            { name: 'gridlist', isOptional: false, isVariadic: false, summary: 'The gridlist in which you wish to set the selection mode.' },
            { name: 'mode', isOptional: false, isVariadic: false, summary: 'The mode of the selection. Can be the following values:' },
        ],
        returns: 'Returns *true* if the selection mode was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetSelectionMode',
    },
    guiGridListSetSortingEnabled: {
        summary: 'This function allows the disabling or enabling of *sorting* within a gridlist.  Sorting is achieved by clicking a column header.  Gridlist items will be sorted according to the clicked column.  By default, gridlists have sorting enabled.  This function will allow you to toggle this.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The GUI gridlist you wish to toggle the sorting of.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the sorting is enabled, or disabled.' },
        ],
        returns: 'Returns *true* if sorting was successfully toggled., *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetSortingEnabled',
    },
    guiGridListSetVerticalScrollPosition: {
        summary: 'This function is used to set the vertical scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The grid list you want to set the vertical scroll position from' },
            { name: 'fPosition', isOptional: false, isVariadic: false, summary: 'A float representing the vertical scroll position (0-100)' },
        ],
        returns: 'Returns *true* if the vertical scroll position was set, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetVerticalScrollPosition',
    },
    guiLabelGetColor: {
        summary: 'This function gets the color of a label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The label to get color.' },
        ],
        returns: 'Returns three *int* values, representing the amount of red, green, blue if successful. *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelGetColor',
    },
    guiLabelGetFontHeight: {
        summary: 'This function returns the height of the font currently used in a GUI text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to get the font height from.' },
        ],
        returns: 'Returns the absolute height of the font currently used in the text label if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelGetFontHeight',
    },
    guiLabelGetTextExtent: {
        summary: 'This function returns the extent, or width, of the current text inside a GUI text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to get the text extent from.' },
        ],
        returns: 'Returns the absolute width of the current text inside the text label if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelGetTextExtent',
    },
    guiLabelSetColor: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function allows you to set the color of a GUI label.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The label to be changed.' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'An integer specifying the amount of red (0 to 255).' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'An integer specifying the amount of green (0 to 255).' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'An integer specifying the amount of blue (0 to 255).' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the the color of the gui label was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelSetColor',
    },
    guiLabelSetHorizontalAlign: {
        summary: 'This function sets the horizontal alignment of a text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to set the horizontal alignment on.' },
            { name: 'align', isOptional: false, isVariadic: false, summary: 'The alignment type. Valid type strings are:' },
            { name: 'wordwrap', isOptional: true, isVariadic: false, summary: 'Whether or not to enable wordwrap for the gui-label.' },
        ],
        returns: 'Returns *true* on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelSetHorizontalAlign',
    },
    guiLabelSetVerticalAlign: {
        summary: 'This function sets the vertical alignment of a text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to set the vertical alignment on.' },
            { name: 'align', isOptional: false, isVariadic: false, summary: 'The alignment type. Valid type strings are:' },
        ],
        returns: 'Returns *true* on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelSetVerticalAlign',
    },
    guiMemoGetCaretIndex: {
        summary: 'This function returns the caret (the text cursor) position within the memo box.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The memo box you want to get the caret position from' },
        ],
        returns: 'Returns the caret index on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoGetCaretIndex',
    },
    guiMemoGetVerticalScrollPosition: {
        summary: 'This function is used to get the vertical scroll position of a memo as a percentage.',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'the memo you want to know the vertical scroll position of.' },
        ],
        returns: 'Returns a float ranging between 0 and 100, or **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoGetVerticalScrollPosition',
    },
    guiMemoIsReadOnly: {
        summary: 'This function checking if memo is read only or no.',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'The memo to check read-only status of.' },
        ],
        returns: 'Returns *true* if the memo is read only, *false* if the memo isn\'t read only, *nil* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoIsReadOnly',
    },
    guiMemoSetCaretIndex: {
        summary: 'This function sets the current position of the caret (the text cursor) within the memo.',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'The memo edit box where the caret position is to be changed.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'An integer referring to the desired character position within the box. 0 would be before the first character in the box, 1 before the second, etc.' },
        ],
        returns: 'Returns *true* if the caret was successfully moved, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoSetCaretIndex',
    },
    guiMemoSetReadOnly: {
        summary: 'This function allows you to set or remove read-only status for a GUI memo. If read-only is set to *true*, the contents are not editable.',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'The memo to change read-only status of.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether read-only is to be enabled or disabled.' },
        ],
        returns: 'Returns *true* if the status was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoSetReadOnly',
    },
    guiMemoSetVerticalScrollPosition: {
        summary: 'This function is used to set the vertical scroll position of a memo as a percentage.',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'the memo you want to change the vertical scroll position of.' },
            { name: 'position', isOptional: false, isVariadic: false, summary: 'a float ranging between 0 and 100.' },
        ],
        returns: 'Returns **true** if the position was set, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoSetVerticalScrollPosition',
    },
    guiMoveToBack: {
        summary: 'This function moves a GUI element to the very back of all other GUI elements.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to move to the back' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMoveToBack',
    },
    guiProgressBarGetProgress: {
        summary: 'This function gets the progress of a progress bar as a percentage.',
        parameters: [
            { name: 'theProgressbar', isOptional: false, isVariadic: false, summary: 'The progressbar you want to check.' },
        ],
        returns: 'Returns a float ranging between 0 and 100.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiProgressBarGetProgress',
    },
    guiProgressBarSetProgress: {
        summary: 'This function is used to set the progress of a progressbar as a percentage.',
        parameters: [
            { name: 'theProgressbar', isOptional: false, isVariadic: false, summary: 'The progressbar you want to change the progress of' },
            { name: 'progress', isOptional: false, isVariadic: false, summary: 'a float ranging from 0 - 100' },
        ],
        returns: 'Returns true if the progress was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiProgressBarSetProgress',
    },
    guiRadioButtonGetSelected: {
        summary: 'This function gets a radio button\'s selection state.',
        parameters: [
            { name: 'guiRadioButton', isOptional: false, isVariadic: false, summary: 'The radio button you wish to retrieve the selection state of.' },
        ],
        returns: 'Returns *true* if the radio button is selected, *false* if it is not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiRadioButtonGetSelected',
    },
};
