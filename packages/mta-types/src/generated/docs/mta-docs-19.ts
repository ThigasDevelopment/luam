import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_19: ApiDocumentationCatalog = {
    getPlayerTeam: {
        summary: 'This function gets the current team a player is on.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': The player whose team you want to find out.' },
        ],
        returns: 'returns a team element representing the team the player is on, false if the player is not part of a team.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerTeam',
    },
    getPlayerVersion: {
        summary: 'This function gets the client version of the specified player as a sortable string. The\nstring is always 15 characters long and is formatted as follows:\n* 1 character representing the major version\n* 1 dot character\n* 1 character representing the minor version\n* 1 dot character\n* 1 character representing the maintenance version\n* 1 dash character\n* 1 character representing the build type\n* 1 dot character\n* 5 characters representing the build number\n* 1 dot character\n* 1 character representing the build revision\nAn example of a version string would be: 1.0.4-9.01746.0\nWhere the first three numbers represent the major/minor/maintenance version, i.e.\n1.0.4\n\nThe fourth number is 9, which means its a release build, (Development and beta builds\nhave lower numbers here)\n\nAnd the fifth and sixth numbers represent the build number.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose client version you wish to get.' },
        ],
        returns: 'returns a string containing the client version, or false if the player is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerVersion',
    },
    getPlayerWantedLevel: {
        summary: 'This function gets a players current wanted level. The wanted level is indicated by the\namount of stars a player has on the GTA HUD.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose wanted level you wish to get' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPlayerWantedLevel',
    },
    getProcessMemoryStats: {
        summary: '',
        parameters: [],
        returns: 'returns a table if successful, otherwise returns nil {| class=wikitable style=cellpadding: 10px; |- ! property || description |- | virtual || total program size |- | resident || resident set size (memory in physical space/ram, also known as working set) |- | shared || size of resident shared memory (shared with other processes) |- | private || size of resident private memory (only for this process) |} note: resident set size should be roughly shared + private from the table.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProcessMemoryStats',
    },
    getProjectileCounter: {
        summary: 'Get the time left before a projectile detonates.',
        parameters: [
            { name: 'projectile', isOptional: false, isVariadic: false, summary: ': the projectile to get the timer of.' },
        ],
        returns: 'returns the the time in milliseconds to detonation which depending on the projectile type will do different things: * grenades will explode when it hits 0 * teargas may be a duration timer * both types of rockets will explode when it hits 0 * satchels restarts so i do not think it does anything',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileCounter',
    },
    getProjectileCreator: {
        summary: 'This function returns the creator of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The projectiles| projectile element which creator you want to retrieve.' },
        ],
        returns: 'returns the element which created the projectile if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileCreator',
    },
    getProjectileForce: {
        summary: 'This function returns the force of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The projectiles| projectile element which force you want to retrieve.' },
        ],
        returns: 'returns a float if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileForce',
    },
    getProjectileTarget: {
        summary: 'This function returns the target of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The projectiles| projectile element which target you want to retrieve.' },
        ],
        returns: 'returns the element which is the projectiles target if the projectile is valid and can have a target (like a heat-seeking rocket), false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileTarget',
    },
    getProjectileType: {
        summary: 'This function returns the type of the specified projectile.',
        parameters: [
            { name: 'theProjectile', isOptional: false, isVariadic: false, summary: 'The Element/Projectile|projectile element which type you want to retrieve.' },
        ],
        returns: 'returns an integer over the type of the projectile or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetProjectileType',
    },
    getRadarAreaColor: {
        summary: 'This function can be used to retrieve the current color of a radararea|radar area.',
        parameters: [
            { name: 'theRadararea', isOptional: false, isVariadic: false, summary: 'The radararea|radar area you wish to retrieve the colour of.' },
        ],
        returns: 'returns four integers in rgba format (red, green, blue, alpha), with a maximum value of 255 for each. alpha decides transparency where 255 is opaque and 0 is transparent. returns false if the radararea is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadarAreaColor',
    },
    getRadarAreaSize: {
        summary: 'This function is used for getting the X and Y size of an existing radararea|radar area.',
        parameters: [
            { name: 'theRadararea', isOptional: false, isVariadic: false, summary: 'The radararea|radar area element whose size you wish to get.' },
        ],
        returns: 'returns two floats indicating the x and y length of the radar area respectively, false if the radar area is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadarAreaSize',
    },
    getRadioChannel: {
        summary: 'The function is used to retrieve the ID of the current radio channel.',
        parameters: [],
        returns: 'returns the id of the radio channel.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadioChannel',
    },
    getRadioChannelName: {
        summary: 'This function gets the given radio channel name.',
        parameters: [
            { name: 'id', isOptional: false, isVariadic: false, summary: 'The ID of the radio station you want to get the name of. It is a number from 0 to 12.' },
        ],
        returns: 'returns a string containing the station name if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRadioChannelName',
    },
    getRainLevel: {
        summary: 'This function is used to get the current rain level.',
        parameters: [],
        returns: 'returns the rain level as a number.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRainLevel',
    },
    getRandomPlayer: {
        summary: 'This function returns a random player.',
        parameters: [],
        returns: 'returns a random player, false if the server is empty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRandomPlayer',
    },
    getRealTime: {
        summary: 'This function gets the server or client (if used client sided it returns time as set on\nclients computer) real time and returns it in a table. If you want to get the in-game\ntime (shown on GTAs clock) use getTime.',
        parameters: [
            { name: 'seconds', isOptional: true, isVariadic: false, summary: 'A count in seconds from the year 1970. Useful for storing points in time, or for retrieving time information for getBanTime. The valid range of this argument is 0 to 32,000,000,000' },
            { name: 'localTime', isOptional: true, isVariadic: false, summary: 'Set to true to adjust for the locally set timezone.' },
        ],
        returns: 'returns a table of substrings with different time format or false if the seconds argument is out of range. {| border=2 cellpadding=2 cellspacing=0 style=margin: 1em 1em 1em 0; background: #f9f9f9; border: 1px #aaa solid; border-collapse: collapse; font-size: 95%; |member |meaning |range |- |second |seconds after the minute |0-61* |- |minute |minutes after the hour |0-59 |- |hour |hours since midnight |0-23 |- |monthday |day of the month |1-31 |- |month |months since january |0-11 |- |year |years since 1900 |- |weekday |days since sunday |0-6 |- |yearday |days since january 1 |0-365 |- |isdst |daylight saving time flag |- |timestamp |seconds since 1970 (ignoring set timezone) | |} * second is generally 0-59. extra range to accommodate for leap seconds in certain systems.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRealTime',
    },
    getRemoteRequestInfo: {
        summary: 'Gets informations of an FetchRemote|fetchRemote or CallRemote|callRemote request info.',
        parameters: [
            { name: 'theRequest', isOptional: false, isVariadic: false, summary: ': returned from FetchRemote|fetchRemote, CallRemote|callRemote or GetRemoteRequests|getRemoteRequests' },
            { name: 'postDataLength', isOptional: true, isVariadic: false, summary: '' },
            { name: 'includeHeaders', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: 'returns a table when valid, false otherwise the table contains: *bytesreceived: a number specifying the amount of data received so far. zero means the download is queued *bytestotal: a number specifying the final download size. will be zero if the remote http server has not set the content-length header *currentattempt: a number specifying the current connection attempt *type: a string specifying either fetch or call *url: a string specifying the url *resource: the resource which started the request, or false if the resource has since been stopped/restarted *queue: a string specifying the queue name *method: a string specifying the http method. e.g. get or post *connectionattempts: a number specifying max number connection attempts as declared in the fetchremote call *connectiontimeout: a number specifying connection attempt timeout as declared in the fetchremote call *postdata: a string containing the request post data as declared in the fetchremote call *headers: a table containing the request http headers as declared in the fetchremote call',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRemoteRequestInfo',
    },
    getRemoteRequests: {
        summary: 'Gets all FetchRemote|fetchRemote and CallRemote|callRemote requests currently running.',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: ': the resource to get all requests from' },
        ],
        returns: 'returns a table with all requests, false if an invalid resource was provided',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetRemoteRequests',
    },
    getResourceACLRequests: {
        summary: 'This function retrieves the ACL request section from the meta.xml file of the given\nresource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource to get the ACL requests for.' },
        ],
        returns: 'returns a table with the acl requests for the given resource, or false if the resource is not valid. a valid resource with no acl requests will return an empty table.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceACLRequests',
    },
    getResourceConfig: {
        summary: 'This function is used to return the root node of a configuration file. Config files must\nbe predefined in a resources Meta.xml|meta file.  An alternative way to load XML files is\nto use xmlLoadFile.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. :For example, if there is a file named \'settings.xml\' in the resource \'ctf\', it can be accessed from another resource this way: \'\'getResourceConfig(":ctf/settings.xml")\'\'. :If the file is in the current resource, only the file path is necessary, e.g. \'\'getResourceConfig("settings.xml")\'\'.' },
        ],
        returns: 'returns the root node of the specified configuration file. if the file is corrupted, not defined in the meta file or doesnt exist, returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceConfig',
    },
    getResourceDynamicElementRoot: {
        summary: 'This function retrieves the dynamic element root of a specified resource. The dynamic\nelement root is the parent of elements that are created by scripts (e.g. with\ncreateObject) unless they specify a different parent.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource of which dynamic element root we want.' },
        ],
        returns: 'returns an element of the resources dynamic element root if the resource specified was valid and active (currently running), false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceDynamicElementRoot',
    },
    getResourceExportedFunctions: {
        summary: 'Returns a table containing the names of the functions that a resource exports. It will\nreturn the exports of the current resource if there is no argument passed in.',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'the resource of which you want to know the call|exported functions.' },
        ],
        returns: 'returns a table of function names if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceExportedFunctions',
    },
    getResourceFromName: {
        summary: 'This function is used to retrieve a resource from its name. A resources name is the same\nas its folder or file archive name on the server (without the extension).',
        parameters: [
            { name: 'resourceName', isOptional: false, isVariadic: false, summary: 'the name of the resource you wish to get.' },
        ],
        returns: 'returns the resource with the specified name, or false if no resource of that name exists. note that clientside this will also return false for resources that are in the loaded state, since the client is unaware of resources that have not been started.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceFromName',
    },
    getResourceGUIElement: {
        summary: 'This function retrieves a resources GUI element. The resources GUI element is the element\nin the element tree which is the default parent of all GUI elements that belong to a\nparticular resource. It has a predefined variable called guiRoot, and each resource has\none of these. You can attach event handlers to this element to easily capture events that\noriginate from your resource (and global events that originate from the root element).',
        parameters: [
            { name: 'theResource', isOptional: true, isVariadic: false, summary: 'the resource whose GUI element we are getting. If not specified, assumes the current resource.' },
        ],
        returns: 'returns the root gui element that contains all the other gui elements.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceGUIElement',
    },
    getResourceInfo: {
        summary: 'This function retrieves the value of any attribute in a resource info tag.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource we are getting the info from.' },
            { name: 'attribute', isOptional: false, isVariadic: false, summary: 'the name of the attribute we want info about.' },
        ],
        returns: 'returns a string with the attribute value if it exists, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceInfo',
    },
    getResourceLastStartTime: {
        summary: 'Used to check the last starting time and date of a resource',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource of which youd like to check the last starting time.' },
        ],
        returns: 'if successful, returns the unix timestamp when the resource was last started, or the string never if the resource has not been started yet, otherwise false. use in conjunction with getrealtime in order to retrieve detailed information. returns a string with the time and date, or false if the resource does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceLastStartTime',
    },
    getResourceLoadFailureReason: {
        summary: 'This function retrieves the reason why a resource failed to start.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'The resource you wish to check.' },
        ],
        returns: 'if the resource failed to load, returns a string with the failure reason in it. if it loaded successfully, returns an empty string. returns false if the resource doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceLoadFailureReason',
    },
    getResourceLoadTime: {
        summary: 'Gets the date and time at which a resource was last loaded in the server.',
        parameters: [
            { name: 'res', isOptional: false, isVariadic: false, summary: 'the resource you want to know the load time of.' },
        ],
        returns: 'if successful, returns the unix timestamp when the resource was loaded, otherwise false. use in conjunction with getrealtime in order to retrieve detailed information. if successful, returns a string with the date and time that the resource was last loaded into memory (for example when the server started, or when the resource was changed and reloaded). returns false on failure. an example string is fri mar 28 13:51:04 2008.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceLoadTime',
    },
    getResourceMapRootElement: {
        summary: 'This function retrieves the root element of a certain map in a specified resource.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource where the map is located' },
            { name: 'mapName', isOptional: false, isVariadic: false, summary: 'name of the maps which root element we want to retrieve, file extension is required' },
        ],
        returns: 'returns an the resources map root element if the map exists and resource specified was valid and active (currently running), false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceMapRootElement',
    },
    getResourceName: {
        summary: 'This function gets the name of the specified resource.',
        parameters: [
            { name: 'res', isOptional: false, isVariadic: false, summary: 'The resource you wish to get the name of.' },
        ],
        returns: 'returns a string with the resource name in it, or false if the resource does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetResourceName',
    },
};
