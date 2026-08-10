import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_48: ApiDocumentationCatalog = {
    svgCreate: {
        summary: 'Creates an svg from size (blank document), filepath or raw data.',
        parameters: [
            { name: 'width', isOptional: false, isVariadic: false, summary: 'Desired width, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'Desired height, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'pathOrRawData', isOptional: true, isVariadic: false, summary: 'A string representing the path to your SVG file, or the raw SVG data' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function which is stored on the SVG and fired every time the SVG texture is updated (for example, via svgSetDocumentXML). **Note:** See svgSetUpdateCallback for setting an svg\'s callback function after it has been created.' },
        ],
        returns: '* returns an svg if created successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgCreate',
    },
    svgGetDocumentXML: {
        summary: '',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg element you want to get the XML document of.' },
        ],
        returns: '* returns an xmlnode if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgGetDocumentXML',
    },
    svgGetSize: {
        summary: '',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg you want to get the size of.' },
        ],
        returns: '* returns two ints, representing width and height',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgGetSize',
    },
    svgSetDocumentXML: {
        summary: '',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg element you want to set the XML document of' },
            { name: 'xmlDocument', isOptional: false, isVariadic: false, summary: 'An xmlnode containing the data to be set on the SVG document' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function which is stored on the SVG and fired every time the SVG texture is updated (for example, via svgSetSize). Note: if present, this will overwrite the current callback stored on the svg' },
        ],
        returns: '* returns true if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgSetDocumentXML',
    },
    svgSetSize: {
        summary: '',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg element you want to set the size of.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'Desired width, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'Desired height, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function which is stored on the SVG and fired every time the SVG texture is updated (for example, via svgSetDocumentXML). Note: if present, this will overwrite the current callback stored on the svg' },
        ],
        returns: '* returns true if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgSetSize',
    },
    svgSetUpdateCallback: {
        summary: '',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg you want to set the callback function of.' },
            { name: 'callback', isOptional: false, isVariadic: false, summary: 'The callback function to store on the SVG. If false is provided, any existing callback function will be removed from the SVG.' },
        ],
        returns: '* returns true if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgSetUpdateCallback',
    },
    takeAllWeapons: {
        summary: 'This function removes every weapons from a specified ped, rendering it unarmed.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': A ped element referencing the specified ped' },
        ],
        returns: 'returns true if the function succeeded, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakeAllWeapons',
    },
    takePlayerMoney: {
        summary: 'This function subtracts money from a players current money amount.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you are taking the money from.' },
            { name: 'amount', isOptional: false, isVariadic: false, summary: 'an integer number specifying the amount of money to take from the player.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakePlayerMoney',
    },
    takePlayerScreenShot: {
        summary: 'This function forces a client to capture the current screen output and send it back to\nthe server. The image will contain the GTA HUD and the output of any dxDraw functions\nthat are not flagged as post GUI. The image specifically excludes the chat box and all\nGUI (including the client console). The result is received with the event\nonPlayerScreenShot.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player to get the screen capture from.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'the width of the capture image.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'the height of the capture image.' },
            { name: 'tag', isOptional: true, isVariadic: false, summary: 'A string to help identify the screen capture. The string is passed to the matching onPlayerScreenShot event for your personal convenience.' },
            { name: 'quality', isOptional: true, isVariadic: false, summary: 'Quality of the final JPEG image from 0 to 100. A lower value can reduce the memory used by the image considerably which will result in faster and less intrusive uploads.' },
            { name: 'maxBandwith', isOptional: true, isVariadic: false, summary: 'The amount of client upload bandwidth to use (in bytes per second) when sending the image. ***maxPacketSize: ** The maximum size of one packet.' },
            { name: 'maxPacketSize', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the function was successfully, false if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakePlayerScreenShot',
    },
    takeWeapon: {
        summary: 'This function removes a specified weapon or ammo from a certain players inventory.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': A player object referencing the specified player.' },
            { name: 'weaponId', isOptional: false, isVariadic: false, summary: ': An integer that refers to a weapon that you wish to remove.' },
            { name: 'ammo', isOptional: true, isVariadic: false, summary: ': If used, this amount of ammo will be taken instead and the weapon will not be removed.' },
        ],
        returns: 'returns a true if the weapon/ammo was removed successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakeWeapon',
    },
    teaDecode: {
        summary: 'This function decrypts given https://en.wikipedia.org/wiki/Base64 base64 representation\nof encrypted data using the https://en.wikipedia.org/wiki/Tiny_Encryption_Algorithm Tiny\nEncryption Algorithm.',
        parameters: [
            { name: 'data', isOptional: false, isVariadic: false, summary: 'The block of data you want to decrypt' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key that should be used for decryption (Only first 16 characters are used)' },
        ],
        returns: 'returns string containing the decrypted data if the decryption process was successfully completed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TeaDecode',
    },
    teaEncode: {
        summary: 'This functions performs the https://en.wikipedia.org/wiki/Tiny_Encryption_Algorithm Tiny\nEncryption Algorithm on the given string and returns the\nhttps://en.wikipedia.org/wiki/Base64 base64 representation of the encrypted string.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The string you want to encrypt. (See second example if you want to encode binary data)' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key that should be used for encryption (Only first 16 characters are used)' },
        ],
        returns: 'returns the https://en.wikipedia.org/wiki/base64 base64 representation of the encrypted string if the encryption process was successfully completed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TeaEncode',
    },
    testLineAgainstWater: {
        summary: 'This function checks to see if a line between two points collides with the water. This is\nsimilar to processLineOfSight, but only collides with water. Waves are not taken into\naccount when testing the line.',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true and the position of the intersection point of the line and the water surface if there is a collision, or false if there is no collision.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TestLineAgainstWater',
    },
    textCreateDisplay: {
        summary: 'A textdisplay|text display is like a canvas that can contain many textitem|items of text.\nEach display can be seen by multiple observers (players) and each player can see multiple\ndisplays.',
        parameters: [],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextCreateDisplay',
    },
    textCreateTextItem: {
        summary: 'This function creates a text item. A text item represents a single area of text, much\nlike a label does in standard GUI programming. A text item can only be seen by players if\nit is added to a textdisplay using textDisplayAddText. Each text item can be added to\nmultiple displays, if need be.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: ': A string of text you want to display' },
            { name: 'x', isOptional: false, isVariadic: false, summary: ': A floating point number between 0.0 and 1.0 indicating how far across the screen the text should be shown, as a percentage of the width, from the left hand side.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: ': A floating point number between 0.0 and 1.0 indicating how far down the screen the text should be shown, as a percentage of the height, from the top.' },
            { name: 'priority', isOptional: true, isVariadic: false, summary: ': How important it is that this text should be up to date on clients screens. Valid values are: low, medium, high which are aliases for 0, 1 and 2 respectively.' },
            { name: 'red', isOptional: true, isVariadic: false, summary: ': A value between 0 and 255 indicating how red the text should be.' },
            { name: 'green', isOptional: true, isVariadic: false, summary: ': A value between 0 and 255 indicating how green the text should be.' },
            { name: 'blue', isOptional: true, isVariadic: false, summary: ': A value between 0 and 255 indicating how blue the text should be.' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: ': A value between 0 and 255 indicating how transparent the text should be, with 0 being fully transparent, and 255 being opaque.' },
            { name: 'scale', isOptional: true, isVariadic: false, summary: ': A floating point value indicating the scale of the text. The default is 1.0, which is around 12pt.' },
            { name: 'alignX', isOptional: true, isVariadic: false, summary: ': A string representing the X-alignment of the text. (left, center, right)' },
            { name: 'alignY', isOptional: true, isVariadic: false, summary: ': A string representing the Y-alignment of the text. (top, center, bottom)' },
            { name: 'shadowAlpha', isOptional: true, isVariadic: false, summary: ': A value between 0 and 255 indicating how dark the drop shadow should be.' },
        ],
        returns: 'returns a textitem object.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextCreateTextItem',
    },
    textDestroyDisplay: {
        summary: 'This function destroys a text display and will unlink all the textitems on it. This does\nnot stop the textitems existing, but anyone who was observing the textitems through this\ndisplay will stop seeing them.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: 'This is the textdisplay that you wish to have destroyed.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDestroyDisplay',
    },
    textDestroyTextItem: {
        summary: 'This function destroys a textitem object.',
        parameters: [
            { name: 'theTextitem', isOptional: false, isVariadic: false, summary: 'The text item you wish to destroy.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDestroyTextItem',
    },
    textDisplayAddObserver: {
        summary: 'This function adds a player as an observer of a textdisplay. This allows the player to\nsee any textitems that the textdisplay contains.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: ': The textdisplay to add the player to as an observer.' },
            { name: 'playerToAdd', isOptional: false, isVariadic: false, summary: ': The player that should observe the textdisplay.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayAddObserver',
    },
    textDisplayAddText: {
        summary: 'This function adds a textitem to a textdisplay. This allows any observers of the\ntextdisplay to see the textitem.',
        parameters: [
            { name: 'displayToAddTo', isOptional: false, isVariadic: false, summary: ': The textdisplay to add the textitem to.' },
            { name: 'itemToAdd', isOptional: false, isVariadic: false, summary: ': The textitem to add to the display.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayAddText',
    },
    textDisplayGetObservers: {
        summary: 'This function can be used to retrieve all the players  currently observing a specified\ntextdisplay.',
        parameters: [
            { name: 'theDisplay', isOptional: false, isVariadic: false, summary: ': The textdisplay of which observers you want to get.' },
        ],
        returns: 'returns a table of players that are observers of the display or false if invalid textdisplay is passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayGetObservers',
    },
    textDisplayIsObserver: {
        summary: 'This function checks if a player can see the specified textdisplay.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: ': The textdisplay.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': The player.' },
        ],
        returns: 'return true if textdisplay is showing, or false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayIsObserver',
    },
    textDisplayRemoveObserver: {
        summary: 'This function removes a player observer of a textdisplay. This stops the player from\nbeing able to see textitems that the textdisplay contains.',
        parameters: [
            { name: 'display', isOptional: false, isVariadic: false, summary: ': The textdisplay to remove the player from as an observer.' },
            { name: 'playerToRemove', isOptional: false, isVariadic: false, summary: ': The player that should be removed from the textdisplay.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayRemoveObserver',
    },
    textDisplayRemoveText: {
        summary: 'This function removes a textitem from a textdisplay. This stops any observers of the\ntextdisplay from being able to see the textitem.',
        parameters: [
            { name: 'displayToRemoveFrom', isOptional: false, isVariadic: false, summary: ': The textdisplay to remove the textitem from.' },
            { name: 'itemToRemove', isOptional: false, isVariadic: false, summary: ': The textitem to remove from the display.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextDisplayRemoveText',
    },
    textItemGetColor: {
        summary: 'This function allows you to retrieve the color of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The text item you wish to retrieve the color of.' },
        ],
        returns: 'returns four integers in rgba format, with a maximum value of 255 for each. the values are, in order, red, green, blue, and alpha. alpha decides transparency where 255 is opaque and 0 is transparent. false is returned if the text item is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetColor',
    },
    textItemGetPosition: {
        summary: 'This function allows retrieval of the position of a text item.',
        parameters: [
            { name: 'theTextItem', isOptional: false, isVariadic: false, summary: 'The textitem you wish to retrieve the position of' },
        ],
        returns: 'returns two floats of the x and y position on the screen, where the maximum value is 1.0.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextItemGetPosition',
    },
};
