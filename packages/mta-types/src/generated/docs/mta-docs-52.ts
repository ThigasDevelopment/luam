import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_52: ApiDocumentationCatalog = {
    spawnVehicle: {
        summary: 'Spawns a vehicle at any given position and rotation',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to spawn' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x position you wish to spawn the vehicle at' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The x position you wish to spawn the vehicle at' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The x position you wish to spawn the vehicle at' },
            { name: 'rx', isOptional: true, isVariadic: false, summary: 'The x rotation you wish to spawn the vehicle at' },
            { name: 'ry', isOptional: true, isVariadic: false, summary: 'The y rotation you wish to spawn the vehicle at' },
            { name: 'rz', isOptional: true, isVariadic: false, summary: 'The z rotation you wish to spawn the vehicle at' },
        ],
        returns: 'Returns *true* if the vehicle spawned successfully, *false* if the passed argument does not exist or is not a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SpawnVehicle',
    },
    spawnVehicleFlyingComponent: {
        summary: 'This function creates a dynamic (motion-dependent) falling vehicle component.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle whose component is to be created.' },
            { name: 'nodeIndex', isOptional: false, isVariadic: false, summary: 'Specifies the component to be created (ranging from **1** to **24**). Depending on the vehicle, these can be different components such as wheels, fenders, bicycle handlebars, helicopter propellers, train carriages, and many more. Check Nodes list.' },
            { name: 'collisionType', isOptional: true, isVariadic: false, summary: 'Specifies the type of collision for the component, by default it is selected based on the nodeIndex.' },
            { name: 'removalTime', isOptional: true, isVariadic: false, summary: 'The time in milliseconds after which the created component will be removed (it must be removed as it is a temporary object). If not specified, the default time depends on the number of created components.' },
        ],
        returns: 'Returns *true* if the component was created, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SpawnVehicleFlyingComponent',
    },
    split: {
        summary: 'This function splits a string into substrings. You specify a character that will act as a separating character; this will determine where to split the sub-strings. For example, it can split the string "Hello World" into two strings containing the two words, by spliting using a space as a separator.\n\n**Note:** You can use the function gettok to retrieve a single token from the string at a specific index. This may be faster for one-off lookups, but considerably slower if you are going to check each token in a long string.',
        parameters: [
            { name: 'stringToSplit', isOptional: false, isVariadic: false, summary: 'The string you wish to split into parts.' },
            { name: 'separatingChar', isOptional: false, isVariadic: false, summary: 'A string of the character you want to split, or the ASCII number representing the character you want to use to split. If you want to split a string at multiple characters see splitMultiple' },
        ],
        returns: 'Returns a *table* of substrings split from the original string if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Split',
    },
    startResource: {
        summary: 'This function starts a resource either persistently or as a dependency of the current resource. If you start the resource persistently, the resource will run until stopped either using stopResource or by the server admin. A resource started as a dependency will stop when your resource stops, if no other resources have it as a depdendency. This is the same effect as using an *include* in your meta.xml file.\n\nThe function also allows you to specify a number of boolean options. These allow you to disable the loading of various aspects of the resource. This is generally useful for editors rather than for actual gamemodes. It could also be used as a way to preview a resource before enabling the scripting aspects, though this could produce unreliable results. There is no way for a resource to tell if it is being run with any of these booleans set.',
        parameters: [
            { name: 'resourceToStart', isOptional: false, isVariadic: false, summary: 'The resource that should be started.' },
            { name: 'persistent', isOptional: true, isVariadic: false, summary: 'A boolean specifying if the resource should continue to run even after the current resource has been stopped or not. If this is *true* then the resource will run until another resource or user terminates it or the server shuts down. If this is *false* then *resourceToStart* will stop when *thisResource* stops.' },
            { name: 'startIncludedResources', isOptional: true, isVariadic: false, summary: 'A boolean specifying if the resource\'s included/dependant resources will be started.' },
            { name: 'loadServerConfigs', isOptional: true, isVariadic: false, summary: 'A boolean specifying if server side config (XML) files should be loaded with the resource.' },
            { name: 'loadMaps', isOptional: true, isVariadic: false, summary: 'A boolean specifying if any .map files will be started with the resource.' },
            { name: 'loadServerScripts', isOptional: true, isVariadic: false, summary: 'A boolean specifying if server side script files should be started alongside the resource.' },
            { name: 'loadHTML', isOptional: true, isVariadic: false, summary: 'A boolean specifying if HTML files should be started alongside the resource.' },
            { name: 'loadClientConfigs', isOptional: true, isVariadic: false, summary: 'A boolean specifying if client configs should be loaded alongside the resource.' },
            { name: 'loadClientScripts', isOptional: true, isVariadic: false, summary: 'A boolean specifying if client scripts should be loaded and started alongside the resource.' },
            { name: 'loadFiles', isOptional: true, isVariadic: false, summary: 'A boolean specifying if client-side files should be loaded alongside the resource.' },
        ],
        returns: 'Returns *true* if the resource has been started successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StartResource',
    },
    stopObject: {
        summary: 'This will allow you to stop an object that is currently moving.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object whose movement you wish to stop' },
        ],
        returns: '* *true* if successful. * *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StopObject',
    },
    stopResource: {
        summary: 'This function stops a running resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource that should be stopped.' },
        ],
        returns: 'Returns *true* if the resource was stopped, *false* if the stopping failed, or an invalid resource was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StopResource',
    },
    stopSound: {
        summary: 'Stops the sound playback for specified sound element. The sound element is also destroyed.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element you want to stop playing.' },
        ],
        returns: 'Returns *true* if the sound was successfully stopped, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/StopSound',
    },
    svgCreate: {
        summary: 'Creates an svg from size (blank document), filepath or raw data.\n\n*Check the list of supported [https://github.com/sammycage/lunasvg?tab=readme-ov-file#features features].*\'',
        parameters: [
            { name: 'width', isOptional: false, isVariadic: false, summary: 'Desired width, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'Desired height, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'pathOrRawData', isOptional: true, isVariadic: false, summary: 'A string representing the path to your SVG file, or the raw SVG data' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function which is stored on the SVG and fired every time the SVG texture is updated (for example, via svgSetDocumentXML).' },
        ],
        returns: '* Returns an svg if created successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgCreate',
    },
    svgGetDocumentXML: {
        summary: 'Gets the underlying XML document from an SVG element.',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg element you want to get the XML document of.' },
        ],
        returns: '* Returns an xmlnode if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgGetDocumentXML',
    },
    svgGetSize: {
        summary: 'Gets the underlying XML document from an SVG element.',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg you want to get the size of.' },
        ],
        returns: '* Returns two ints, representing **width** and **height**',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgGetSize',
    },
    svgSetDocumentXML: {
        summary: 'Sets the underlying XML document of an SVG element.',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg element you want to set the XML document of' },
            { name: 'xmlDocument', isOptional: false, isVariadic: false, summary: 'An xmlnode containing the data to be set on the SVG document' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function which is stored on the SVG and fired every time the SVG texture is updated (for example, via svgSetSize). **Note:** if present, this will overwrite the current callback stored on the svg' },
        ],
        returns: '* Returns **true** if successful, **false** otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgSetDocumentXML',
    },
    svgSetSize: {
        summary: 'Sets the underlying XML document from an SVG element.',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg element you want to set the size of.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'Desired width, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'Desired height, preferably power of two (16, 32, 64 etc.), maximum is 4096' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'A callback function which is stored on the SVG and fired every time the SVG texture is updated (for example, via svgSetDocumentXML). **Note**: if present, this will overwrite the current callback stored on the svg' },
        ],
        returns: '* Returns **true** if successful, **false** otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgSetSize',
    },
    svgSetUpdateCallback: {
        summary: 'Sets the update callback of an svg element',
        parameters: [
            { name: 'svgElement', isOptional: false, isVariadic: false, summary: 'The svg you want to set the callback function of.' },
            { name: 'callback', isOptional: false, isVariadic: false, summary: 'The callback function to store on the SVG. If **false** is provided, any existing callback function will be removed from the SVG.' },
        ],
        returns: '* Returns true if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SvgSetUpdateCallback',
    },
    takeAllWeapons: {
        summary: 'This function removes every weapons from a specified ped, rendering it unarmed.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'A ped element referencing the specified ped' },
        ],
        returns: 'Returns *true* if the function succeeded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakeAllWeapons',
    },
    takePlayerMoney: {
        summary: 'This function subtracts money from a player\'s current money amount.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player you are taking the money from.' },
            { name: 'amount', isOptional: false, isVariadic: false, summary: 'an integer number specifying the amount of money to take from the player.' },
        ],
        returns: 'Returns *true* if the money was taken, or *false* if invalid parameters were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakePlayerMoney',
    },
    takePlayerScreenShot: {
        summary: 'This function forces a client to capture the current screen output and send it back to the server. The image will contain the GTA HUD and the output of any dxDraw functions that are not flagged as \'post GUI\'. The image specifically excludes the chat box and all GUI (including the client console). The result is received with the event onPlayerScreenShot.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the player to get the screen capture from.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'the width of the capture image.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'the height of the capture image.' },
            { name: 'tag', isOptional: true, isVariadic: false, summary: 'A string to help identify the screen capture. The string is passed to the matching onPlayerScreenShot event for your personal convenience.' },
            { name: 'quality', isOptional: true, isVariadic: false, summary: 'Quality of the final JPEG image from 0 to 100. A lower value can reduce the memory used by the image considerably which will result in faster and less intrusive uploads.' },
            { name: 'maxBandwidth', isOptional: true, isVariadic: false, summary: 'The amount of client upload bandwidth to use (in bytes per second) when sending the image.' },
            { name: 'maxPacketSize', isOptional: true, isVariadic: false, summary: 'The maximum size of one packet.' },
        ],
        returns: 'Returns *true* if the function was successfully, *false* if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakePlayerScreenShot',
    },
    takeWeapon: {
        summary: 'This function removes a specified weapon or ammo from a certain player\'s inventory.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player.' },
            { name: 'weaponId', isOptional: false, isVariadic: false, summary: 'An integer that refers to a weapon that you wish to remove.' },
            { name: 'ammo', isOptional: true, isVariadic: false, summary: 'If used, this amount of ammo will be taken instead and the weapon will not be removed.' },
        ],
        returns: 'Returns a *true* if the weapon/ammo was removed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TakeWeapon',
    },
    teaDecode: {
        summary: 'This function decrypts given [https://en.wikipedia.org/wiki/Base64 base64] representation of encrypted data using the [https://en.wikipedia.org/wiki/Tiny_Encryption_Algorithm Tiny Encryption Algorithm].',
        parameters: [
            { name: 'data', isOptional: false, isVariadic: false, summary: 'The block of data you want to decrypt' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key that should be used for decryption (Only first 16 characters are used)' },
        ],
        returns: 'Returns string containing the decrypted data if the decryption process was successfully completed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TeaDecode',
    },
    teaEncode: {
        summary: 'This functions performs the [https://en.wikipedia.org/wiki/Tiny_Encryption_Algorithm Tiny Encryption Algorithm] on the given string and returns the [https://en.wikipedia.org/wiki/Base64 base64] representation of the encrypted string.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The string you want to encrypt. (See second example if you want to encode binary data)' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key that should be used for encryption (Only first 16 characters are used)' },
        ],
        returns: 'Returns the [https://en.wikipedia.org/wiki/Base64 base64] representation of the encrypted string if the encryption process was successfully completed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TeaEncode',
    },
    testLineAgainstWater: {
        summary: 'This function checks to see if a line between two points collides with the water. This is similar to processLineOfSight, but only collides with water. Waves are not taken into account when testing the line.',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* and the position of the intersection point of the line and the water surface if there is a collision, or *false* if there is no collision.',
        wiki: 'https://wiki.multitheftauto.com/wiki/TestLineAgainstWater',
    },
    testSphereAgainstWorld: {
        summary: 'The function checks whether there is an object within the given radius and returns information about it. The function works similarly to processLineOfSight, but instead of a straight line, it operates based on the specified radius, forming a sphere.',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'The start *x* position' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'The start *y* position' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'The start *z* position' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: 'The radius of the sphere.' },
            { name: 'ignoredElement', isOptional: true, isVariadic: false, summary: 'Specifies the element to be excluded from collision detection within the sphere.' },
            { name: 'checkBuildings', isOptional: true, isVariadic: false, summary: 'Specifies whether buildings should be detected, i.e., elements of the default GTA map or those created using createBuilding.' },
            { name: 'checkVehicles', isOptional: true, isVariadic: false, summary: 'Specifies whether vehicles should be detected.' },
            { name: 'checkPeds', isOptional: true, isVariadic: false, summary: 'Specifies whether peds (including players) should be detected.' },
            { name: 'checkObjects', isOptional: true, isVariadic: false, summary: 'Specifies whether objects should be detected.' },
            { name: 'checkDummies', isOptional: true, isVariadic: false, summary: 'Specifies whether internal GTA dummies should be detected. These are not used in the current MTA version so this argument can be set to *false*.' },
            { name: 'ignoreSomeObjectsForCamera', isOptional: true, isVariadic: false, summary: 'Specifies whether certain elements should be ignored. These are objects that have the (K) property in the \'object.dat\' file. (i.e. Most dynamic objects like boxes or barrels).' },
        ],
        returns: 'The **modelID**, **lodID**, **worldModelPositionX,Y,Z**, **worldModelRotationX,Y,Z** and **entityType** parameters are returned even if **hitElement** is **nil**. ***hit:** *true* if there is a collision, *false* otherwise. ***hitElement:** the MTA element hit if any, *nil* otherwise. ***modelID:** The ID of the element. ***worldModelPositionX,Y,Z:** World position of the detected element. ***worldModelRotationX,Y,Z:** World rotation of the detected element. ***lodID:** The ID of the element\'s LOD (or 0). ***entityType:** The type of the element (building, vehicle, ped, object, dummy).',
        wiki: 'https://wiki.multitheftauto.com/wiki/TestSphereAgainstWorld',
    },
    textCreateDisplay: {
        summary: 'A text display is like a canvas that can contain many items of text. Each display can be seen by multiple observers (players) and each player can see multiple displays.',
        parameters: [],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/TextCreateDisplay',
    },
};
