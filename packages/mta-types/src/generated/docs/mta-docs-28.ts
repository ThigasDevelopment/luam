import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_28: ApiDocumentationCatalog = {
    guiGridListSetSelectionMode: {
        summary: 'This function sets the selection mode of a gui gridlist.  For example, the MTA server\nbrowser selects a whole row, while the Controls dialog selects a single cell. To select\nmultiple items you must be holding down ctrl.',
        parameters: [
            { name: 'gridlist', isOptional: false, isVariadic: false, summary: 'The gridlist in which you wish to set the selection mode.' },
            { name: 'mode', isOptional: false, isVariadic: false, summary: 'The mode of the selection. Can be the following values: 0 Single row selection 1 Multiple row selection 2 Single cell selection 3 Multiple cell selection 4 Nominated(First) single column selection 5 Nominated(First) multiple column selection 6 Single column selection 7 Multiple column selection 8 Nominated(First) single row selection 9 Nominated(First) multiple row selection' },
        ],
        returns: 'returns true if the selection mode was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetSelectionMode',
    },
    guiGridListSetSortingEnabled: {
        summary: 'This function allows the disabling or enabling of sorting within a gridlist.  Sorting is\nachieved by clicking a column header.  Gridlist items will be sorted according to the\nclicked column.  By default, gridlists have sorting enabled.  This function will allow\nyou to toggle this.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The GUI gridlist you wish to toggle the sorting of.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the sorting is enabled, or disabled.' },
        ],
        returns: 'returns true if sorting was successfully toggled., false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetSortingEnabled',
    },
    guiGridListSetVerticalScrollPosition: {
        summary: 'This function is used to set the vertical scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: ': The grid list you want to set the vertical scroll position from' },
            { name: 'fPosition', isOptional: false, isVariadic: false, summary: ': A float representing the vertical scroll position (0-100)' },
        ],
        returns: 'returns true if the vertical scroll position was set, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetVerticalScrollPosition',
    },
    guiLabelGetColor: {
        summary: 'This function gets the color of a label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The label to get color.' },
        ],
        returns: 'returns three int values, representing the amount of red, green, blue if successful. false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelGetColor',
    },
    guiLabelGetFontHeight: {
        summary: 'This function returns the height of the font currently used in a GUI text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to get the font height from.' },
        ],
        returns: 'returns the absolute height of the font currently used in the text label if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelGetFontHeight',
    },
    guiLabelGetTextExtent: {
        summary: 'This function returns the extent, or width, of the current text inside a GUI text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to get the text extent from.' },
        ],
        returns: 'returns the absolute width of the current text inside the text label if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelGetTextExtent',
    },
    guiLabelSetColor: {
        summary: 'This function allows you to set the color of a GUI label.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The label to be changed.' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'An integer specifying the amount of red (0 to 255).' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'An integer specifying the amount of green (0 to 255).' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'An integer specifying the amount of blue (0 to 255).' },
        ],
        returns: 'returns true if the the color of the gui label was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelSetColor',
    },
    guiLabelSetHorizontalAlign: {
        summary: 'This function sets the horizontal alignment of a text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to set the horizontal alignment on.' },
            { name: 'align', isOptional: false, isVariadic: false, summary: 'The alignment type. Valid type strings are: **"left" **"center" **"right"' },
            { name: 'wordwrap', isOptional: true, isVariadic: false, summary: 'Whether or not to enable wordwrap for the gui-label.' },
        ],
        returns: 'returns true on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelSetHorizontalAlign',
    },
    guiLabelSetVerticalAlign: {
        summary: 'This function sets the vertical alignment of a text label.',
        parameters: [
            { name: 'theLabel', isOptional: false, isVariadic: false, summary: 'The text label to set the vertical alignment on.' },
            { name: 'align', isOptional: false, isVariadic: false, summary: 'The alignment type. Valid type strings are: **"top" **"center" **"bottom"' },
        ],
        returns: 'returns true on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiLabelSetVerticalAlign',
    },
    guiMemoGetCaretIndex: {
        summary: 'This function returns the caret (the text cursor) position within the memo box.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The memo box you want to get the caret position from' },
        ],
        returns: 'returns the caret index on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoGetCaretIndex',
    },
    guiMemoGetVerticalScrollPosition: {
        summary: '',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: ': the guiCreateMemo|memo you want to know the vertical scroll position of.' },
        ],
        returns: 'returns a float ranging between 0 and 100, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoGetVerticalScrollPosition',
    },
    guiMemoIsReadOnly: {
        summary: '',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'The memo to check read-only status of.' },
        ],
        returns: 'returns true if the memo is read only, false if the memo isnt read only, nil otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoIsReadOnly',
    },
    guiMemoSetCaretIndex: {
        summary: 'This function sets the current position of the caret (the text cursor) within the memo.',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'The memo edit box where the caret position is to be changed.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'An integer referring to the desired character position within the box. 0 would be before the first character in the box, 1 before the second, etc.' },
        ],
        returns: 'returns true if the caret was successfully moved, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoSetCaretIndex',
    },
    guiMemoSetReadOnly: {
        summary: 'This function allows you to set or remove read-only status for a GUI memo. If read-only\nis set to true, the contents are not editable.',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: 'The memo to change read-only status of.' },
            { name: 'status', isOptional: false, isVariadic: false, summary: 'A boolean value indicating whether read-only is to be enabled or disabled.' },
        ],
        returns: 'returns true if the status was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoSetReadOnly',
    },
    guiMemoSetVerticalScrollPosition: {
        summary: '',
        parameters: [
            { name: 'theMemo', isOptional: false, isVariadic: false, summary: ': the guiCreateMemo|memo you want to change the vertical scroll position of.' },
            { name: 'position', isOptional: false, isVariadic: false, summary: ': a float ranging between 0 and 100.' },
        ],
        returns: 'returns true if the position was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMemoSetVerticalScrollPosition',
    },
    guiMoveToBack: {
        summary: 'This function moves a GUI element to the very back of all other GUI elements.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element that you want to move to the back' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiMoveToBack',
    },
    guiProgressBarGetProgress: {
        summary: 'This function gets the progress of a progress bar as a percentage.',
        parameters: [
            { name: 'theProgressbar', isOptional: false, isVariadic: false, summary: ': The progressbar you want to check.' },
        ],
        returns: 'returns a float ranging between 0 and 100.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiProgressBarGetProgress',
    },
    guiProgressBarSetProgress: {
        summary: 'This function is used to set the progress of a progressbar as a percentage.',
        parameters: [
            { name: 'theProgressbar', isOptional: false, isVariadic: false, summary: ': The progressbar you want to change the progress of' },
            { name: 'progress', isOptional: false, isVariadic: false, summary: ': a float ranging from 0 - 100' },
        ],
        returns: 'returns true if the progress was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiProgressBarSetProgress',
    },
    guiRadioButtonGetSelected: {
        summary: 'This function gets a radio buttons selection state.',
        parameters: [
            { name: 'guiRadioButton', isOptional: false, isVariadic: false, summary: 'The radio button you wish to retrieve the selection state of.' },
        ],
        returns: 'returns true if the radio button is selected, false if it is not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiRadioButtonGetSelected',
    },
    guiRadioButtonSetSelected: {
        summary: 'This function selects or unselects a radio button.',
        parameters: [
            { name: 'guiRadioButton', isOptional: false, isVariadic: false, summary: 'The GUI radio button in which you wish to change the selection state of' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'The state of the radio button, where true indicates selected, and false indicates unselected.' },
        ],
        returns: 'returns true if the radio buttons selection state was successfully set, false otherwise.',
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
            { name: 'theScrollBar', isOptional: false, isVariadic: false, summary: ': The scrollbar you want to check.' },
        ],
        returns: 'returns a float ranging between 0 and 100, representing the amount the scrollbar has been scrolled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollBarGetScrollPosition',
    },
    guiScrollBarSetScrollPosition: {
        summary: 'This function is used to set the scroll amount of a scrollbar as a percentage.',
        parameters: [
            { name: 'theScrollBar', isOptional: false, isVariadic: false, summary: ': The scrollbar you want to change the progress of' },
            { name: 'amount', isOptional: false, isVariadic: false, summary: ': a float ranging from 0 - 100 representing the amount you wish to set the scroll bar.' },
        ],
        returns: 'returns true if the scroll position was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollBarSetScrollPosition',
    },
    guiScrollPaneGetHorizontalScrollPosition: {
        summary: 'This function is used to get the position of a horizontal scroll pane as a percentage.',
        parameters: [
            { name: 'horizontalScrollPane', isOptional: false, isVariadic: false, summary: ': The scroll pane you want to know the position of' },
        ],
        returns: 'returns a float ranging between 0 and 100, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneGetHorizontalScrollPosition',
    },
    guiScrollPaneGetVerticalScrollPosition: {
        summary: 'This function is used to get the position of a vertical scroll pane as a percentage.',
        parameters: [
            { name: 'verticalScrollPane', isOptional: false, isVariadic: false, summary: ': The scroll pane you want to know the position of' },
        ],
        returns: 'returns a float ranging between 0 and 100, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneGetVerticalScrollPosition',
    },
    guiScrollPaneSetHorizontalScrollPosition: {
        summary: 'This function is used to set the position of a horizontal scroll pane as a percentage.',
        parameters: [
            { name: 'horizontalScrollPane', isOptional: false, isVariadic: false, summary: ': The scroll pane you want to change the position of' },
            { name: 'position', isOptional: false, isVariadic: false, summary: ': a float ranging from 0 - 100' },
        ],
        returns: 'returns true if the position was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneSetHorizontalScrollPosition',
    },
    guiScrollPaneSetScrollBars: {
        summary: 'This function allows a scrollpanes scrollbars to be forced on, or returned to default.',
        parameters: [
            { name: 'scrollPane', isOptional: false, isVariadic: false, summary: 'the GUI scrollpane element you want to set the scrollbars of.' },
            { name: 'horizontal', isOptional: false, isVariadic: false, summary: 'A bool where true forces the horizontal scrollbar on, and false returns them to default.' },
            { name: 'vertical', isOptional: false, isVariadic: false, summary: 'A bool where true forces the vertical scrollbar on, and false returns them to default.' },
        ],
        returns: 'returns true if the call was successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiScrollPaneSetScrollBars',
    },
};
