import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_11: ApiDocumentationCatalog = {
    engineStreamingGetBufferSize: {
        summary: 'Get the streaming buffer size [**not** maximum memory size]',
        parameters: [],
        returns: 'The streaming buffer size. It is always a positive non-zero number.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingGetBufferSize',
    },
    engineStreamingGetMemorySize: {
        summary: 'Gets the maximum amount of RAM [in bytes] that can be used for streaming',
        parameters: [],
        returns: 'The maximum amount of RAM [in bytes] that can be used for streaming. It is always a non-zero positive number.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingGetMemorySize',
    },
    engineStreamingGetModelLoadState: {
        summary: 'This function returns load state of model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to get flags.' },
        ],
        returns: 'Returns *string* with model load state. Possible load states: * unloaded - model is not loaded. * loaded - model is loaded. * requested - model is waiting for loading. * reading - model is being read * finishing - second reading state for big models.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingGetModelLoadState',
    },
    engineStreamingGetUsedMemory: {
        summary: '',
        parameters: [],
        returns: '* Returns a int containing the amount of memory in bytes.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingGetUsedMemory',
    },
    engineStreamingReleaseModel: {
        summary: 'This function sends a unloading request to the game model streamer.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to unload.' },
            { name: 'removeRef', isOptional: true, isVariadic: false, summary: 'decrease references counter.' },
        ],
        returns: 'Returns *true* if the model was unloaded, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingReleaseModel',
    },
    engineStreamingRequestModel: {
        summary: 'This function sends a loading request to the game model streamer.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to load' },
            { name: 'addRef', isOptional: true, isVariadic: false, summary: 'increase references counter to prevent the model from unloading.' },
            { name: 'isBlocking', isOptional: true, isVariadic: false, summary: 'load model immediately or use async loading.' },
        ],
        returns: 'Returns *true* if a new request was created, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingRequestModel',
    },
    engineStreamingRestoreBufferSize: {
        summary: 'This function resets the streaming buffer. The value is automatically reset when disconnected.',
        parameters: [],
        returns: 'Returns *true* if the event occurred, otherwise it throws an error message and returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingRestoreBufferSize',
    },
    engineStreamingRestoreMemorySize: {
        summary: 'Restores the maximum amount of RAM [in bytes] that can be used for streaming to the default value',
        parameters: [],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingRestoreMemorySize',
    },
    engineStreamingSetBufferSize: {
        summary: 'Set the streaming buffer size. The larger it is, the more models can be loaded in one go BUT increases the RAM  [**not** streaming memory!] usage. Can help with custom IMG loading speed by reducing pop-in.',
        parameters: [
            { name: 'sizeBytes', isOptional: false, isVariadic: false, summary: 'The streaming buffer size. Must be a positive non-zero number.' },
        ],
        returns: 'True if there was enough memory to allocate the buffer, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingSetBufferSize',
    },
    engineStreamingSetMemorySize: {
        summary: 'Sets the maximum amount of RAM [in bytes] that can be used for streaming',
        parameters: [
            { name: 'sizeBytes', isOptional: false, isVariadic: false, summary: 'The maximum amount of RAM [in bytes] that can be used for streaming. Must be a positive non-zero number.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingSetMemorySize',
    },
    engineStreamingSetModelCacheLimits: {
        summary: 'This function sets custom cache limits for vehicle and pedestrian models based on provided values. The arguments that receive zero mean complete deactivation.',
        parameters: [
            { name: 'numVehicles', isOptional: true, isVariadic: false, summary: 'Specifies the maximum number of vehicle models that can be cached.' },
            { name: 'numPeds', isOptional: true, isVariadic: false, summary: 'Specifies the maximum number of pedestrian models that can be cached.' },
        ],
        returns: 'Returns *true* if the event occurred, otherwise it throws an error message and returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingSetModelCacheLimits',
    },
    eventName: {
        summary: 'The name of the event ("onResourceStart", "onPlayerWasted" etc.)',
        parameters: [],
        returns: '',
        wiki: '',
    },
    executeBrowserJavascript: {
        summary: 'This function executes a Javascript string to the specified browser. Works only with local browsers.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser which will execute the Javascript code' },
            { name: 'jsCode', isOptional: false, isVariadic: false, summary: 'The Javascript code string' },
        ],
        returns: 'Returns *true* if executing Javascript is allowed in the current context, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExecuteBrowserJavascript',
    },
    executeCommandHandler: {
        summary: 'This function will call all the attached functions of an existing console command, for a specified player.',
        parameters: [
            { name: 'commandName', isOptional: false, isVariadic: false, summary: 'The name of the command you wish to execute. This is what must be typed into the console to trigger the function.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player that will be presented as executer of the command to the handler function(s) of the command.' },
            { name: 'args', isOptional: true, isVariadic: false, summary: 'Additional parameters that will be passed to the handler function(s) of the command that is called, separated by spaces.' },
        ],
        returns: 'Returns *true* if the command handler was called successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExecuteCommandHandler',
    },
    executeSQLQuery: {
        summary: 'This function executes an arbitrary SQL query and returns the result rows if there are any. It allows parameter binding for security (SQL injection is rendered impossible).',
        parameters: [
            { name: 'query', isOptional: false, isVariadic: false, summary: 'An SQL query. Positions where parameter values will be inserted are marked with a "?".' },
            { name: 'param1', isOptional: true, isVariadic: false, summary: '' },
            { name: 'param2', isOptional: true, isVariadic: false, summary: '' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns a table with the result of the query if it was a SELECT query, or *false* if otherwise. In case of a SELECT query the result table may be empty (if there are no result rows). The table is of the form: ```lua { { colname1=value1, colname2=value2, ... }, { colname1=value3, colname2=value4, ... }, ... } ``` A subsequent table represents the next row.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExecuteSQLQuery',
    },
    extinguishFire: {
        summary: 'This function is used to extinguish all spreading fire, or spreading fire at specified coordinates.',
        parameters: [
            { name: 'x', isOptional: true, isVariadic: false, summary: '' },
            { name: 'y', isOptional: true, isVariadic: false, summary: '' },
            { name: 'z', isOptional: true, isVariadic: false, summary: '' },
            { name: 'radius', isOptional: true, isVariadic: false, summary: 'a float value indicating the radius in which to extinguish fire.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExtinguishFire',
    },
    fadeCamera: {
        summary: 'This function will fade a player\'s camera to a color or back to normal over a specified time period. This will also affect the sound volume for the player (50% faded = 50% volume, full fade = no sound). For clientside scripts you can perform 2 fade ins or fade outs in a row, but for serverside scripts you must use one then the other.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera you wish to fade.' },
            { name: 'fadeIn', isOptional: false, isVariadic: false, summary: 'Should the camera be faded in our out? Pass *true* to fade the camera in, *false* to fade it out to a color.' },
            { name: 'timeToFade', isOptional: true, isVariadic: false, summary: 'The number of seconds it should take to fade.' },
            { name: 'red', isOptional: true, isVariadic: false, summary: 'The amount of red in the color that the camera fades out to (0 - 255). Not required for fading in.' },
            { name: 'green', isOptional: true, isVariadic: false, summary: 'The amount of green in the color that the camera fades out to (0 - 255). Not required for fading in.' },
            { name: 'blue', isOptional: true, isVariadic: false, summary: 'The amount of blue in the color that the camera fades out to (0 - 255). Not required for fading in.' },
        ],
        returns: 'Returns *true* if the camera was faded successfully, *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FadeCamera',
    },
    fetchRemote: {
        summary: 'This function allows you to post and receive data from HTTP servers. The calls are asynchronous so you do not get an immediate result from the call, instead a callback function you specify is called when the download completes.',
        parameters: [
            { name: 'URL', isOptional: false, isVariadic: false, summary: 'A full URL in the format *http://hostname/path/file.ext*. A port can be specified with a colon followed by a port number appended to the hostname.' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'A table containing any request options:' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'This is the function that should receive the data returned from the remote server. The callback argument list should be:' },
            { name: 'callbackArguments', isOptional: true, isVariadic: false, summary: 'A table containing arguments you may want to pass to the callback.' },
        ],
        returns: 'Returns a ***request*** value which can be used with getRemoteRequestInfo or abortRemoteRequest',
        wiki: 'https://wiki.multitheftauto.com/wiki/FetchRemote',
    },
    fileClose: {
        summary: 'Closes a file handle obtained by fileCreate or fileOpen.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'The file handle to close.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileClose',
    },
    fileCopy: {
        summary: 'This function copies a file.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The path of the file you want to copy.' },
            { name: 'copyToFilePath', isOptional: false, isVariadic: false, summary: 'Where to copy the specified file to.' },
            { name: 'overwrite', isOptional: true, isVariadic: false, summary: 'If set to true it will overwrite a file that already exists at copyToFilePath.' },
        ],
        returns: 'Return true if the file was copied, else false if the \'filePath\' doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileCopy',
    },
    fileCreate: {
        summary: 'Creates a new file in a directory of a resource. If there already exists a file with the specified name, it is overwritten with an empty file.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file to be created in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file is in, and \'path\' is the path from the root directory of the resource to the file.' },
        ],
        returns: 'If successful, returns a file handle which can be used with other file functions (fileWrite, fileClose...). Returns *false* if an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileCreate',
    },
    fileDelete: {
        summary: 'Deletes the specified file.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file to delete in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file is in, and \'path\' is the path from the root directory of the resource to the file.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise (for example if there exists no file with the given name, or it does exist but is in use).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileDelete',
    },
    fileExists: {
        summary: 'This functions checks whether a specified file exists inside a resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file, whose existence is going to be checked, in the following format: **":resourceName/path"**. \'resourceName\' is the name of the resource the file is checked to be in, and \'path\' is the path from the root directory of the resource to the file.' },
        ],
        returns: 'Returns *true* if the file exists, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileExists',
    },
    fileFlush: {
        summary: 'Forces pending disk writes to be executed. fileWrite doesn\'t directly write to the hard disk but places the data in a temporary buffer; only when there is enough data in the buffer it is actually written to disk. Call this function if you need the data written right now without closing the file. This is useful for log files that might want to be read while the resource is still executing. fileFlush can be called after each log entry is written. Without this, the file may appear empty or outdated to the user.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'The file handle of the file you wish to flush.' },
        ],
        returns: 'Returns *true* if succeeded, *false* in case of failure (e.g. the file handle is invalid).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileFlush',
    },
    fileGetContents: {
        summary: 'Please note that even if you enable SD #22 and #23 on your server, you are not protected from user attacks, which can happen after verification of the file, but before you read the contents of such verified file. This function enables you to safely read the contents of a meta.xml-listed file on both client and server.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'A handle to the file you wish to get the contents from. Use fileOpen to obtain this handle.' },
            { name: 'verifyContents', isOptional: true, isVariadic: false, summary: 'Set to true, to compare the computed and the expected checksum of the file content.' },
        ],
        returns: 'Returns the bytes that were read from the file, but only if verification was disabled or if the checksum comparison succeeded. On failure, this function returns *nil*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileGetContents',
    },
    fileGetHash: {
        summary: '',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'A handle to the file you wish to get the hash from. Use fileOpen to obtain this handle.' },
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: 'A string which must be one of these: "md5", "sha1", "sha224", "sha256", "sha384", "sha512", "hmac"' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'A table with options and other necessary data for the algorithm, as detailed below.' },
        ],
        returns: 'Returns the hash of the entire file on success, and *nil* on failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileGetHash',
    },
    fileGetPath: {
        summary: 'This function retrieves the path of the given file.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'The file you want to get the path.' },
        ],
        returns: 'Returns a *string* representing the file path, *false* if invalid file was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileGetPath',
    },
    fileGetPos: {
        summary: 'Returns the current read/write position in the given file.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'the file handle you wish to get the position of.' },
        ],
        returns: 'Returns the file position if successful, or *false* if an error occured (e.g. an invalid handle was passed).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileGetPos',
    },
};
