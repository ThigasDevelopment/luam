import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_29: ApiDocumentationCatalog = {
    guiGetSize: {
        summary: 'This function gets the size of a GUI element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The GUI element to get size of.' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean representing whether the size should be relative to the element\'s parent width, or an absolute size in pixels.' },
        ],
        returns: 'Returns the GUI element size *x* and *y* if the function has been successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetSize',
    },
    guiGetText: {
        summary: 'This function is used to get the text of GUI elements like edit boxes, labels, buttons etc.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'element you wish to get text of.' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns a string containing the requested element\'s text, or false if the gui element passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetText',
    },
    guiGetVisible: {
        summary: 'This function determines if a GUI element is visible.',
        parameters: [
            { name: 'guiElement', isOptional: false, isVariadic: false, summary: 'the GUI element to be checked' },
        ],
        returns: 'Returns *true* if the element is visible, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGetVisible',
    },
    guiGridListAddColumn: {
        summary: 'This function is used to create columns in grid lists.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
            { name: 'title', isOptional: false, isVariadic: false, summary: 'Title of the column' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'Column width, relative to the grid list width' },
        ],
        returns: 'Returns the column id if it was created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListAddColumn',
    },
    guiGridListAddRow: {
        summary: 'Adds a row to a grid list, and optionally add simple text items with your rows.  Use guiGridListSetItemText to add row headers.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a row to' },
            { name: 'itemText1', isOptional: true, isVariadic: false, summary: 'The text for the first column item in the row. Either a string or a number can be passed (use numbers for sorting purposes).' },
            { name: 'itemText2', isOptional: true, isVariadic: false, summary: 'The text for the second column item in the row. Either a string or a number can be passed (use numbers for sorting purposes).' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns the row id if it has been created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListAddRow',
    },
    guiGridListAutoSizeColumn: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis allows you to automatically size a column to display everything in it correctly, with the most minimal width.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element where the column is located.' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'The ID of the column you want to be auto-sized.' },
        ],
        returns: 'Returns *true* if the column was auto-sized, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListAutoSizeColumn',
    },
    guiGridListClear: {
        summary: 'This function clears all the data from a grid list.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element to be cleared' },
        ],
        returns: 'Returns *true* if the grid list element is valid and has been cleared successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListClear',
    },
    guiGridListGetColumnCount: {
        summary: 'This allows you to get the count of existing columns in a gridlist.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
        ],
        returns: 'Returns an integer with the amount of columns in the gridlist, false otherwise. ```lua -- create the grid list local list = guiCreateGridList(0.80, 0.40, 0.15, 0.35, true) -- add three columns to the grid list guiGridListAddColumn(list, "Column 1", 0.33) guiGridListAddColumn(list, "Column 2", 0.33) guiGridListAddColumn(list, "Column 3", 0.33) -- display the number of columns in the grid list in the debug or server console (/debugscript 3) print("Number of columns: " .. guiGridListGetColumnCount(list)) ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetColumnCount',
    },
    guiGridListGetColumnTitle: {
        summary: 'This function is used to get the column title of a gridlist column.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The grid list you want to get the column title from' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
        ],
        returns: 'Returns a string containing the column title, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetColumnTitle',
    },
    guiGridListGetColumnWidth: {
        summary: 'This allows you to get the width of an existing column in a gridlist.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID of the Get size' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean defining whether **width** measurements will be relative to the Gridlist size, or absolute pixels.' },
        ],
        returns: 'Returns the width of the gridlist column, *false* if bad arguments were given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetColumnWidth',
    },
    guiGridListGetHorizontalScrollPosition: {
        summary: 'This function is used to get the horizontal scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The grid list you want to get the horizontal scroll position from' },
        ],
        returns: 'Returns a integer between 0 and 100 indicating the horizontal scroll position, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetHorizontalScrollPosition',
    },
    guiGridListGetItemColor: {
        summary: 'This function gets the color of a gridlist item.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list element' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'Row ID' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
        ],
        returns: 'Returns four *int* values, representing the amount of red, green, blue and alpha if successful. *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetItemColor',
    },
    guiGridListGetItemData: {
        summary: 'With this function you can retrieve the string data associated with an item in a grid list. This is not the text that is displayed on the item, but an internal string that you can use to hold extra information about the item.\n\n**Note:** This function will only work **after** you set the item\'s text using guiGridListSetItemText!',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the grid list containing the item you\'re interested in' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'the row index of the item' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'the column index of the item' },
        ],
        returns: 'Returns the item data of the specified item if succesful, *false* if one of the arguments was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetItemData',
    },
    guiGridListGetItemText: {
        summary: 'This function retrieves the text from a specific grid list item.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the gridlist containing the item you\'re interested in' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'row id of the item (first is 0)' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'column id of the item (first is 0)' },
        ],
        returns: 'Returns the text of the item if the arguments are right, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetItemText',
    },
    guiGridListGetRowCount: {
        summary: 'This function returns the number of rows in a grid list.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list to get the number of rows from.' },
        ],
        returns: 'Returns the number of rows if the function is successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetRowCount',
    },
    guiGridListGetSelectedCount: {
        summary: 'This function returns the amount of options selected in the specified grid list.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list which amount of selected items you want to retrieve.' },
        ],
        returns: 'Returns an integer representing the amount of selected options if everything was successful or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectedCount',
    },
    guiGridListGetSelectedItem: {
        summary: 'This function returns the row and column indexes of the selected item in a grid list. First selected row and column is (0, 0).',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'the grid list you want to know the selected row index of' },
        ],
        returns: 'Returns the row and column indexes of the selected item if the specified grid list is valid and has a selected item, (-1, -1) if no item is selected, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectedItem',
    },
    guiGridListGetSelectedItems: {
        summary: 'This function returns the items selected in the specified grid list.\n\nNote that for some reason the column ID is 1 lower than it should be, for example 0 is returned but if you try and get the text for column 0 there is nothing, but column 1 has what you clicked on.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list which selected items you want to retrieve.' },
        ],
        returns: 'Returns a table over the selected items in the grid list in this format: ```lua table = { [1] = { ["column"], -- has the first selected item\'s column ID ["row"] -- has the first selected item\'s row ID }, [2] = { ["column"],-- has the second selected item\'s column ID ["row"] -- has the second selected item\'s row ID }, ... } ``` if everything was successful or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectedItems',
    },
    guiGridListGetSelectionMode: {
        summary: 'This function retrieves the current selection mode of a gui gridlist.',
        parameters: [
            { name: 'gridlist', isOptional: false, isVariadic: false, summary: 'The gridlist you want to get the selection mode of.' },
        ],
        returns: 'Returns the ID of the current gridlist\'s selection mode.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetSelectionMode',
    },
    guiGridListGetVerticalScrollPosition: {
        summary: 'This function is used to get the vertical scroll position from a grid list',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The grid list you want to get the vertical scroll position from' },
        ],
        returns: 'Returns a integer between 0 and 100 indicating the vertical scroll position, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListGetVerticalScrollPosition',
    },
    guiGridListInsertRowAfter: {
        summary: 'This allows you to insert a new row after a specified row, and simultaneously set text. Good for inserting new rows in the middle of existing rows. To insert at the top use -1 as row index.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a row to' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'Row ID of the row you want to insert the **new row** after.' },
        ],
        returns: 'Returns *row id* if the row was successfully added, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListInsertRowAfter',
    },
    guiGridListIsSortingEnabled: {
        summary: 'This function checks whether the gridlist sorting is enabled or disabled.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The GUI gridlist you wish to check if sorting is enabled or not.' },
        ],
        returns: 'Returns *true* if sorting is enabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListIsSortingEnabled',
    },
    guiGridListRemoveColumn: {
        summary: 'This allows you to delete columns that exist in grid lists.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to remove a column from' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
        ],
        returns: 'Returns *true* if the grid list column was successfully removed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListRemoveColumn',
    },
    guiGridListRemoveRow: {
        summary: 'This allows you to delete rows that exist in grid lists.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to remove a row from' },
            { name: 'rowIndex', isOptional: false, isVariadic: false, summary: 'The row ID which you want to remove' },
        ],
        returns: 'Returns *true* if the grid list row was successfully removed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListRemoveRow',
    },
    guiGridListSetColumnTitle: {
        summary: 'This function is used to change the column title of a gridlist column.',
        parameters: [
            { name: 'guiGridlist', isOptional: false, isVariadic: false, summary: 'The grid list you want to change the column title from' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID' },
            { name: 'title', isOptional: false, isVariadic: false, summary: 'The title of the column' },
        ],
        returns: 'Returns *true* if the new title was set, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetColumnTitle',
    },
    guiGridListSetColumnWidth: {
        summary: 'This allows you to set the width of an existing column in a gridlist.',
        parameters: [
            { name: 'gridList', isOptional: false, isVariadic: false, summary: 'The grid list you want to add a column to' },
            { name: 'columnIndex', isOptional: false, isVariadic: false, summary: 'Column ID of the size you want to change' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'A float or integer of the width of the column depending on the **relative** argument.' },
            { name: 'relative', isOptional: false, isVariadic: false, summary: 'A boolean defining whether **width** measurements will be relative to the Gridlist size, or absolute pixels.' },
        ],
        returns: 'Returns *true* if the gridlist column width was successfully set, *false* if bad arguments were given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GuiGridListSetColumnWidth',
    },
};
