import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_21: ApiDocumentationCatalog = {
    getPlayerWantedLevel: {
        summary: 'This function gets a player\'s current wanted level. The wanted level is indicated by the amount of stars a player has on the GTA HUD.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose wanted level you wish to get' },
        ],
        returns: 'Returns an *int* from 0 to 6 representing the player\'s wanted level, *false* if the player does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerWantedLevel',
    },
    getPostFXMode: {
        summary: 'Gets the current mode of PostFX.',
        parameters: [],
        returns: 'An integer for the current PostFX mode: * 0: Disabled * 1: Enabled in fullscreen mode * 2: Enabled in windowed/borderless mode',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPostFXMode',
    },
    getPostFXValue: {
        summary: 'Gets the current float value of the selected PostFX type.',
        parameters: [
            { name: 'fxType', isOptional: false, isVariadic: false, summary: 'An string of the PostFX. Possible values are:' },
        ],
        returns: 'Returns the current value of the specified PostFX parameter.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPostFXValue',
    },
    getProcessMemoryStats: {
        summary: 'This function returns a breakdown of the process memory usage. The reported numbers are always byte units and these numbers can be **inaccurate**.',
        parameters: [],
        returns: 'Returns a table if successful, otherwise returns **nil** {| class="wikitable" style="cellpadding: 10px;" |- ! Property || Description |- | virtual || total program size |- | resident || resident set size (memory in physical space/ram, also known as *working set*) |- | shared || size of resident shared memory (shared with other processes) |- | private || size of resident private memory (only for this process) |} **Note:** Resident set size should be roughly shared + private from the table.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProcessMemoryStats',
    },
    getProjectileCounter: {
        summary: 'Get the time left before a projectile detonates.',
        parameters: [
            { name: 'projectile', isOptional: false, isVariadic: false, summary: 'the projectile to get the timer of.' },
        ],
        returns: 'Returns the the time in milliseconds to detonation which depending on the projectile type will do different things: * Grenades will explode when it hits 0 * Teargas may be a duration timer * Both types of rockets will explode when it hits 0 * Satchels restarts so I do not think it does anything',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileCounter',
    },
    getProjectileCreator: {
        summary: 'This function returns the creator of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The projectile element which creator you want to retrieve.' },
        ],
        returns: 'Returns the element which created the projectile if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileCreator',
    },
    getProjectileForce: {
        summary: 'This function returns the force of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The projectile element which force you want to retrieve.' },
        ],
        returns: 'Returns a float if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileForce',
    },
    getProjectileTarget: {
        summary: 'This function returns the target of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The projectile element which target you want to retrieve.' },
        ],
        returns: 'Returns the element which is the projectile\'s target if the projectile is valid and can have a target (like a heat-seeking rocket), *false* otherwise. If the projectile is a satchel charge, returns the element at which it is glued to (or *nil* if it isn\'t glued to any).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileTarget',
    },
    getProjectileType: {
        summary: 'This function returns the type of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The projectile element which type you want to retrieve.' },
        ],
        returns: 'Returns an integer over the type of the projectile or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileType',
    },
    getRadarAreaColor: {
        summary: 'This function can be used to retrieve the current color of a radar area.',
        parameters: [
            { name: 'theRadararea', isOptional: false, isVariadic: false, summary: 'The radar area you wish to retrieve the colour of.' },
        ],
        returns: 'Returns four integers in RGBA format (*red*, *green*, *blue*, *alpha*), with a maximum value of 255 for each. Alpha decides transparency where 255 is opaque and 0 is transparent. Returns *false* if the radararea is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadarAreaColor',
    },
    getRadarAreaSize: {
        summary: 'This function is used for getting the X and Y size of an existing radar area.',
        parameters: [
            { name: 'theRadararea', isOptional: false, isVariadic: false, summary: 'The radar area element whose size you wish to get.' },
        ],
        returns: 'Returns two *floats* indicating the X and Y length of the radar area respectively, *false* if the radar area is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadarAreaSize',
    },
    getRadioChannel: {
        summary: 'The function is used to retrieve the ID of the current radio channel.',
        parameters: [],
        returns: 'Returns the ID of the radio channel.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadioChannel',
    },
    getRadioChannelName: {
        summary: 'This function gets the given radio channel name.',
        parameters: [
            { name: 'id', isOptional: false, isVariadic: false, summary: 'The ID of the radio station you want to get the name of. It is a number from 0 to 12.' },
        ],
        returns: 'Returns a string containing the station name if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadioChannelName',
    },
    getRainLevel: {
        summary: 'This function is used to get the current rain level.',
        parameters: [],
        returns: 'Returns the rain level as a number.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRainLevel',
    },
    getRandomPlayer: {
        summary: 'This function returns a random player.',
        parameters: [],
        returns: 'Returns a random player, *false* if the server is empty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRandomPlayer',
    },
    getRealTime: {
        summary: 'This function gets the server or client (if used client sided it returns time as set on client\'s computer) real time and returns it in a table. If you want to get the in-game time (shown on GTA\'s clock) use getTime.',
        parameters: [
            { name: 'seconds', isOptional: true, isVariadic: false, summary: 'A count in seconds from the year 1970. Useful for storing points in time, or for retrieving time information for getBanTime. The valid range of this argument is 0 to 32,000,000,000' },
            { name: 'localTime', isOptional: true, isVariadic: false, summary: 'Set to *true* to adjust for the locally set timezone.' },
        ],
        returns: 'Returns a *table* of substrings with different time format or *false* if the **seconds** argument is out of range. {| border="2" cellpadding="2" cellspacing="0" style="margin: 1em 1em 1em 0; background: #f9f9f9; border: 1px #aaa solid; border-collapse: collapse; font-size: 95%;" |**Member** |**Meaning** |**Range** |- |second |seconds after the minute |0-61* |- |minute |minutes after the hour |0-59 |- |hour |hours since midnight |0-23 |- |monthday |day of the month |1-31 |- |month |months since January |0-11 |- |year |years since 1900 |- |weekday |days since Sunday |0-6 |- |yearday |days since January 1 |0-365 |- |isdst |Daylight Saving Time flag |- |timestamp |seconds since 1970 (Ignoring set timezone) | |} ** second* is generally 0-59. Extra range to accommodate for leap seconds in certain systems.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRealTime',
    },
    getRemoteRequestInfo: {
        summary: 'Gets informations of an fetchRemote or callRemote request info.',
        parameters: [
            { name: 'theRequest', isOptional: false, isVariadic: false, summary: 'returned from fetchRemote, callRemote or getRemoteRequests' },
            { name: 'postDataLength', isOptional: true, isVariadic: false, summary: '' },
            { name: 'includeHeaders', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a table when valid, false otherwise The table contains: ***bytesReceived:** A number specifying the amount of data received so far. Zero means the download is queued ***bytesTotal:** A number specifying the final download size. Will be zero if the remote HTTP server has not set the \'Content-Length\' header ***currentAttempt:** A number specifying the current connection attempt ***type:** A string specifying either "fetch" or "call" ***url:** A string specifying the URL ***resource:** The resource which started the request, or false if the resource has since been stopped/restarted ***queue:** A string specifying the queue name ***method:** A string specifying the HTTP method. e.g. "GET" or "POST" ***connectionAttempts:** A number specifying max number connection attempts as declared in the fetchRemote call ***connectionTimeout:** A number specifying connection attempt timeout as declared in the fetchRemote call ***postData:** A string containing the request post data as declared in the fetchRemote call ***headers:** A table containing the request HTTP headers as declared in the fetchRemote call',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRemoteRequestInfo',
    },
    getRemoteRequests: {
        summary: 'Gets all fetchRemote and callRemote requests currently running.',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'the resource to get all requests from' },
        ],
        returns: 'Returns a table with all requests, false if an invalid resource was provided',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRemoteRequests',
    },
    getResourceACLRequests: {
        summary: 'This function retrieves the ACL request section from the meta.xml file of the given resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource to get the ACL requests for.' },
        ],
        returns: 'Returns a *table* with the ACL requests for the given resource, or *false* if the resource is not valid. A valid resource with no ACL requests will return an empty table.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceACLRequests',
    },
    getResourceConfig: {
        summary: 'This function is used to return the root node of a configuration file. Config files must be predefined in a resource\'s meta file.  An alternative way to load XML files is to use xmlLoadFile.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file is in, and \'path\' is the path from the root directory of the resource to the file.' },
        ],
        returns: 'Returns the root node of the specified configuration file. If the file is corrupted, not defined in the meta file or doesn\'t exist, returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceConfig',
    },
    getResourceDynamicElementRoot: {
        summary: 'This function retrieves the *dynamic element root* of a specified resource. The *dynamic element root* is the parent of elements that are created by scripts (e.g. with createObject) unless they specify a different parent.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource of which dynamic element root we want.' },
        ],
        returns: 'Returns an element of the resource\'s dynamic element root if the resource specified was valid and active (currently running), *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceDynamicElementRoot',
    },
    getResourceExportedFunctions: {
        summary: 'Returns a table containing the names of the functions that a resource exports. It will return the exports of the current resource if there is no argument passed in.',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'the resource of which you want to know the exported functions.' },
        ],
        returns: 'Returns a table of function names if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceExportedFunctions',
    },
    getResourceFromName: {
        summary: 'This function is used to retrieve a resource from its name. A resource\'s name is the same as its folder or file archive name on the server (without the extension).',
        parameters: [
            { name: 'resourceName', isOptional: false, isVariadic: false, summary: 'the name of the resource you wish to get.' },
        ],
        returns: 'Returns the resource with the specified name, or *false* if no resource of that name exists. Note that clientside this will also return *false* for resources that are in the *loaded* state, since the client is unaware of resources that have not been started.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceFromName',
    },
    getResourceGUIElement: {
        summary: 'This function retrieves a resource\'s GUI element. The resource\'s GUI element is the element in the element tree which is the default parent of all GUI elements that belong to a particular resource. It has a predefined variable called **guiRoot**, and each resource has one of these. You can attach event handlers to this element to easily capture events that originate from your resource (and global events that originate from the root element).',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'the resource whose GUI element we are getting. If not specified, assumes the current resource.' },
        ],
        returns: 'Returns the root GUI element that contains all the other GUI elements.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceGUIElement',
    },
    getResourceInfo: {
        summary: 'This function retrieves the value of any attribute in a resource info tag.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource we are getting the info from.' },
            { name: 'attribute', isOptional: false, isVariadic: false, summary: 'the name of the attribute we want info about.' },
        ],
        returns: 'Returns a *string* with the attribute value if it exists, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceInfo',
    },
    getResourceLastStartTime: {
        summary: 'Used to check the last starting time and date of a resource',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource of which you\'d like to check the last starting time.' },
        ],
        returns: 'If successful, returns the UNIX timestamp when the resource was last started, or the string "never" if the resource has not been started yet, otherwise false. Use in conjunction with getRealTime in order to retrieve detailed information.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceLastStartTime',
    },
    getResourceLoadFailureReason: {
        summary: 'This function retrieves the reason why a resource failed to start.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource you wish to check.' },
        ],
        returns: 'If the resource failed to load, returns a string with the failure reason in it. If it loaded successfully, returns an empty string. Returns *false* if the resource doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceLoadFailureReason',
    },
    getResourceLoadTime: {
        summary: 'Gets the date and time at which a resource was last loaded in the server.',
        parameters: [
            { name: 'res', isOptional: false, isVariadic: false, summary: 'the resource you want to know the load time of.' },
        ],
        returns: 'If successful, returns the UNIX timestamp when the resource was loaded, otherwise false. Use in conjunction with getRealTime in order to retrieve detailed information.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceLoadTime',
    },
    getResourceMapRootElement: {
        summary: 'This function retrieves the root element of a certain map in a specified resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource where the map is located' },
            { name: 'mapName', isOptional: false, isVariadic: false, summary: 'name of the maps which root element we want to retrieve, file extension is required' },
        ],
        returns: 'Returns an the resource\'s map root element if the map exists and resource specified was valid and active (currently running), *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceMapRootElement',
    },
    getResourceName: {
        summary: 'This function gets the name of the specified resource.\n\nSpecifying the resource parameter is not mandatory now, in this case this resource is used as a basis',
        parameters: [
            { name: 'res', isOptional: true, isVariadic: false, summary: 'The resource you wish to get the name of.' },
        ],
        returns: 'Returns a string with the resource name in it, or *false* if the resource does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceName',
    },
};
