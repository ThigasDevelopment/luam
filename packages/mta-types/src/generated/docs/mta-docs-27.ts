import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_27: ApiDocumentationCatalog = {
    guiGridListGetColumnCount: {
        summary: 'This allows you to get the count of existing columns in a gridlist.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
        ],
        returns: 'returns an integer with the amount of columns in the gridlist, false otherwise. ```lua -- create the grid list local list = guicreategridlist(0.80, 0.40, 0.15, 0.35, true) -- add three columns to the grid list guigridlistaddcolumn(list, column 1, 0.33) guigridlistaddcolumn(list, column 2, 0.33) guigridlistaddcolumn(list, column 3, 0.33) -- display the number of columns in the grid list in the debug or server console (/debugscript 3) print(number of columns: .. guigridlistgetcolumncount(list)) ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetColumnCount',
    },
    guiGridListGetColumnTitle: {
        summary: 'This function is used to get the column title of a gridlist column.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: ': The grid list you want to get the column title from' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: ': Column ID' },
        ],
        returns: 'returns a string containing the column title, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetColumnTitle',
    },
    guiGridListGetColumnWidth: {
        summary: 'This allows you to get the width of an existing column in a gridlist.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID of the Get size' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean defining whether width measurements will be relative to the Gridlist size, or absolute pixels.' },
        ],
        returns: 'returns the width of the gridlist column, false if bad arguments were given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetColumnWidth',
    },
    guiGridListGetHorizontalScrollPosition: {
        summary: 'This function is used to get the horizontal scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: ': The grid list you want to get the horizontal scroll position from' },
        ],
        returns: 'returns a integer between 0 and 100 indicating the horizontal scroll position, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetHorizontalScrollPosition',
    },
    guiGridListGetItemColor: {
        summary: 'This function gets the color of a gridlist item.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'Row ID' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
        ],
        returns: 'returns four int values, representing the amount of red, green, blue and alpha if successful. false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetItemColor',
    },
    guiGridListGetItemData: {
        summary: 'With this function you can retrieve the string data associated with an item in a\nElement/GUI/Gridlist|grid list. This is not the text that is displayed on the item, but\nan internal string that you can use to hold extra information about the item.\n\nNote: This function will only work after you set the items text using\nguiGridListSetItemText!',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the grid list containing the item youre interested in' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'the row index of the item' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'the column index of the item' },
        ],
        returns: 'returns the item data of the specified item if succesful, false if one of the arguments was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetItemData',
    },
    guiGridListGetItemText: {
        summary: 'This function retrieves the text from a specific grid list item.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the gridlist containing the item youre interested in' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'row id of the item (first is 0)' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'column id of the item (first is 0)' },
        ],
        returns: 'returns the text of the item if the arguments are right, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetItemText',
    },
    guiGridListGetRowCount: {
        summary: 'This function returns the number of rows in a grid list.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list to get the number of rows from.' },
        ],
        returns: 'returns the number of rows if the function is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetRowCount',
    },
    guiGridListGetSelectedCount: {
        summary: 'This function returns the amount of options selected in the specified\nElement/GUI/Gridlist|grid list.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The Element/GUI/Gridlist|grid list which amount of selected items you want to retrieve.' },
        ],
        returns: 'returns an integer representing the amount of selected options if everything was successful or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectedCount',
    },
    guiGridListGetSelectedItem: {
        summary: 'This function returns the row and column indexes of the selected item in a grid list.\nFirst selected row and column is (0, 0).',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the grid list you want to know the selected row index of' },
        ],
        returns: 'returns the row and column indexes of the selected item if the specified grid list is valid and has a selected item, (-1, -1) if no item is selected, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectedItem',
    },
    guiGridListGetSelectedItems: {
        summary: 'This function returns the items selected in the specified Element/GUI/Gridlist|grid list.\nNote that for some reason the column ID is 1 lower than it should be, for example 0 is\nreturned but if you try and get the text for column 0 there is nothing, but column 1 has\nwhat you clicked on.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The Element/GUI/Gridlist|grid list which selected items you want to retrieve.' },
        ],
        returns: 'returns a table over the selected items in the element/gui/gridlist|grid list in this format: ```lua table = { 1 = { column, -- has the first selected items column id row -- has the first selected items row id }, 2 = { column,-- has the second selected items column id row -- has the second selected items row id }, ... } ``` if everything was successful or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectedItems',
    },
    guiGridListGetSelectionMode: {
        summary: '',
        parameters: [
            { name: 'gridlist', isOptional: false, isVariadic: false, summary: 'The gridlist you want to get the selection mode of.' },
        ],
        returns: 'returns the id of the current gridlists selection mode.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectionMode',
    },
    guiGridListGetVerticalScrollPosition: {
        summary: 'This function is used to get the vertical scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: ': The grid list you want to get the vertical scroll position from' },
        ],
        returns: 'returns a integer between 0 and 100 indicating the vertical scroll position, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetVerticalScrollPosition',
    },
    guiGridListInsertRowAfter: {
        summary: 'This allows you to insert a new row after a specified row, and simultaneously set text.\nGood for inserting new rows in the middle of existing rows. To insert at the top use -1\nas row index.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a row to' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'Row ID of the row you want to insert the new row after. itemText1 The text for the first column item in the row. Either a string or a number can be passed (use numbers for sorting purposes). itemText2 The text for the second column item in the row. Either a string or a number can be passed (use numbers for sorting purposes). ... Item text for any other columns' },
        ],
        returns: 'returns row id if the row was successfully added, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListInsertRowAfter',
    },
    guiGridListIsSortingEnabled: {
        summary: '',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The GUI gridlist you wish to check if sorting is enabled or not.' },
        ],
        returns: 'returns true if sorting is enabled, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListIsSortingEnabled',
    },
    guiGridListRemoveColumn: {
        summary: 'This allows you to delete columns that exist in grid lists.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to remove a column from' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
        ],
        returns: 'returns true if the grid list column was successfully removed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListRemoveColumn',
    },
    guiGridListRemoveRow: {
        summary: 'This allows you to delete rows that exist in grid lists.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to remove a row from' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'The row ID which you want to remove' },
        ],
        returns: 'returns true if the grid list row was successfully removed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListRemoveRow',
    },
    guiGridListSetColumnTitle: {
        summary: 'This function is used to change the column title of a gridlist column.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: ': The grid list you want to change the column title from' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: ': Column ID' },
            { name: 'title', isOptional: false, isVariadic: false, summary: ': The title of the column' },
        ],
        returns: 'returns true if the new title was set, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetColumnTitle',
    },
    guiGridListSetColumnWidth: {
        summary: 'This allows you to set the width of an existing column in a gridlist.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID of the size you want to change' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'A float or integer of the width of the column depending on the relative argument.' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean defining whether width measurements will be relative to the Gridlist size, or absolute pixels.' },
        ],
        returns: 'returns true if the gridlist column width was successfully set, false if bad arguments were given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetColumnWidth',
    },
    guiGridListSetHorizontalScrollPosition: {
        summary: 'This function is used to set the horizontal scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: ': The grid list you want to set the horizontal scroll position from' },
            { name: 'fPosition', isOptional: false, isVariadic: false, summary: ': A float representing the horizontal scroll position (0-100)' },
        ],
        returns: 'returns true if the horizontal scroll position was set, or false otherwise.',
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
        returns: 'returns true if the item color was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetItemColor',
    },
    guiGridListSetItemData: {
        summary: 'This function sets a Item Data associated to a grid list item.\n\nNote: This function will only work after you set the items text using\nguiGridListSetItemText!',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'A gridlist element of the data you wish to set to' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'The row of the item you wish to set to' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'The column of the item you wish to set to' },
            { name: 'data', isOptional: false, isVariadic: false, summary: 'The data you wish to set to the item.' },
        ],
        returns: 'returns true if the data was set successfully, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetItemData',
    },
    guiGridListSetItemText: {
        summary: 'This function changes the text of a gridlist item.\nNotice: This function doesnt work well with Sorting. If you are using sorting, please use\nthe optional arguments of guiGridListAddRow as much as possible.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'Row ID' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The text you want to put in (does NOT accept numbers, use tostring() for that)' },
            { name: 'section', isOptional: false, isVariadic: false, summary: 'Determines if the item is a section' },
            { name: 'number', isOptional: false, isVariadic: false, summary: 'Tells whether the text item is a number value or not (used for sorting)' },
        ],
        returns: 'returns true if the item text was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetItemText',
    },
    guiGridListSetScrollBars: {
        summary: 'This function allows a gridlists scrollbar to be forced on, or returned to default.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The GUI gridlist you wish to change the state of scrollbars' },
            { name: 'horizontalBar', isOptional: false, isVariadic: false, summary: 'A bool where true forces the horizontal scrollbar on, and false returns them to default.' },
            { name: 'verticalBar', isOptional: false, isVariadic: false, summary: 'A bool where true forces the verical scrollbar on, and false returns them to default.' },
        ],
        returns: 'returns true if the scrollbars were successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetScrollBars',
    },
    guiGridListSetSelectedItem: {
        summary: 'This function selects an item from a gridlist. If you wish to deselect whatever item is\nselected, pass 0 as both the rowIndex and  columnIndex arguments.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the grid list you want to select an item from' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'the row you want to select (index 0 is the first row)' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'the column you want to select (index 1 is the first column)' },
            { name: 'bReset', isOptional: true, isVariadic: false, summary: 'set to false for multiple selections' },
        ],
        returns: 'returns true if the passed arguments are correct and the item has been selected, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetSelectedItem',
    },
};
