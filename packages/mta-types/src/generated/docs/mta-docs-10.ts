import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_10: ApiDocumentationCatalog = {
    fetchRemote: {
        summary: 'This function allows you to post and receive data from HTTP servers. The calls are\nasynchronous so you do not get an immediate result from the call, instead a callback\nfunction you specify is called when the download completes.\nIn the case when the call fails, a string containing ERROR followed by an integer\ncontaining the error reason will be passed to the callback function. The reason for\nfailure will be similar to errors found with websites - file not found, server not found\nand timeouts.\nIf you are using fetchRemote to connect to a PHP script, you can use\nfile_get_contents(php://input) to read the postData sent from this function.',
        parameters: [
            { name: 'URL', isOptional: false, isVariadic: false, summary: 'A full URL in the format http://hostname/path/file.ext. A port can be specified with a colon followed by a port number appended to the hostname.' },
            { name: 'queueName', isOptional: false, isVariadic: false, summary: 'Name of the queue to use. Any name can be used. If not set, the queue name is default. Requests in the same queue are processed in order, one at a time.' },
            { name: 'connectionAttempts', isOptional: false, isVariadic: false, summary: 'Number of times to retry if the remote host does not respond. (Defaults to 10)' },
            { name: 'connectTimeout', isOptional: false, isVariadic: false, summary: 'Number of milliseconds each connection attempt will take before timing out. (Defaults to 10000)' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'This is the function that should receive the data returned from the remote server. The callback argument list should be: responseData - A string containing the remote response error - A number containing the error number or zero if there was no error. A list of possible error values are: arguments... - The arguments that were passed into fetchRemote' },
            { name: 'postData', isOptional: true, isVariadic: false, summary: 'A string specifying any data you want to send to the remote HTTP server.' },
            { name: 'postIsBinary', isOptional: true, isVariadic: false, summary: 'A boolean specifying if the data is text, or binary. (Defaults to false) arguments A table containing arguments you may want to pass to the callback. responseInfo - A table containing: success - A boolean indicating if the request was successful. statusCode - An integer status/error code headers A table containing HTTP request headers. e.g.{ Pragma&#61;no-cache } options A table containing any request options: method A string specifying the request method. (Defaults to GET or POST) maxRedirects An integer limiting the number of HTTP redirections to automatically follow. (Defaults to 8) username A string specifying the username for protected pages. password A string specifying the password for protected pages. formFields A table containing form items to submit. (for POST method only) e.g.{ name&#61;bob, email&#61;bob@example.com }' },
            { name: 'args', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns a request value which can be used with getremoterequestinfo|getremoterequestinfo or abortremoterequest|abortremoterequest',
        wiki: 'https://wiki.multitheftauto.com/wiki/FetchRemote',
    },
    fileClose: {
        summary: 'Closes a file handle obtained by fileCreate or fileOpen.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'The file handle to close.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileClose',
    },
    fileCopy: {
        summary: 'This function copies a file.Note|The file functions should not be used to implement\nconfiguration files. It is encouraged to use the XML functions for this instead.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: ': The path of the file you want to copy.' },
            { name: 'copyToFilePath', isOptional: false, isVariadic: false, summary: ': Where to copy the specified file to.' },
            { name: 'overwrite', isOptional: true, isVariadic: false, summary: ': If set to true it will overwrite a file that already exists at copyToFilePath.' },
        ],
        returns: 'return true if the file was copied, else false if the filepath doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileCopy',
    },
    fileCreate: {
        summary: 'Creates a new file in a directory of a resource. If there already exists a file with the\nspecified name, it is overwritten with an empty file.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file to be created in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. :For example, if you want to create a file named \'myfile.txt\' in the resource \'mapcreator\', it can be created from another resource this way: \'\'fileCreate(":mapcreator/myfile.txt")\'\'. :If the file is in the current resource, only the file path is necessary, e.g. \'\'fileCreate("myfile.txt")\'\'.' },
        ],
        returns: 'if successful, returns a file handle which can be used with other file functions (filewrite, fileclose...). returns false if an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileCreate',
    },
    fileDelete: {
        summary: 'Deletes the specified file.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file to delete in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. :For example, if you want to delete a file name "myFile.txt" in the resource \'fileres\', it can be deleted from another resource this way: \'\'fileDelete(":fileres/myFile.txt")\'\'. :If the file is in the current resource, only the file path is necessary, e.g. \'\'fileDelete("myFile.txt")\'\'.' },
        ],
        returns: 'returns true if successful, false otherwise (for example if there exists no file with the given name, or it does exist but is in use).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileDelete',
    },
    fileExists: {
        summary: 'This functions checks whether a specified file exists inside a resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file, whose existence is going to be checked, in the following format: :resourceName/path. resourceName is the name of the resource the file is checked to be in, and path is the path from the root directory of the resource to the file. :For example, if you want to check whether a file named \'myfile.txt\' exists in the resource \'mapcreator\', it can be done from another resource this way: \'\'fileExists(":mapcreator/myfile.txt")\'\'. :If the file, whose existence is going to be checked, is in the current resource, only the file path is necessary, e.g. \'\'fileExists("myfile.txt")\'\'. Note that you must use forward slashes \'/\' for the folders, backslashes \'\' will return false.' },
        ],
        returns: 'returns true if the file exists, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileExists',
    },
    fileFlush: {
        summary: 'Forces pending disk writes to be executed. fileWrite doesnt directly write to the hard\ndisk but places the data in a temporary buffer; only when there is enough data in the\nbuffer it is actually written to disk. Call this function if you need the data written\nright now without closing the file. This is useful for log files that might want to be\nread while the resource is still executing. fileFlush can be called after each log entry\nis written. Without this, the file may appear empty or outdated to the user.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'The file handle of the file you wish to flush.' },
        ],
        returns: 'returns true if succeeded, false in case of failure (e.g. the file handle is invalid).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileFlush',
    },
    fileGetPath: {
        summary: 'This function retrieves the path of the given file.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'The file you want to get the path.' },
        ],
        returns: 'returns a string representing the file path, false if invalid file was provided.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileGetPath',
    },
    fileGetPos: {
        summary: 'Returns the current read/write position in the given file.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'the file handle you wish to get the position of.' },
        ],
        returns: 'returns the file position if successful, or false if an error occured (e.g. an invalid handle was passed).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileGetPos',
    },
    fileGetSize: {
        summary: 'Returns the total size in bytes of the given file.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'the file handle you wish to get the size of.' },
        ],
        returns: 'returns the file size if successful, or false if an error occured (e.g. an invalid file handle was passed).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileGetSize',
    },
    fileIsEOF: {
        summary: 'Checks if the file position is at the end of the file.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'A handle to the file you wish to check.' },
        ],
        returns: 'returns true if the file position of the specified file is at the end of the file, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileIsEOF',
    },
    fileOpen: {
        summary: 'Opens an existing file for reading and writing.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. :For example, if there is a file named \'coolObjects.txt\' in the resource \'objectSearch\', it can be opened from another resource this way: \'\'fileOpen(":objectSearch/coolObjects.txt")\'\'. :If the file is in the current resource, only the file path is necessary, e.g. \'\'fileOpen("coolObjects.txt")\'\'.' },
            { name: 'readOnly', isOptional: true, isVariadic: false, summary: 'By default, the file is opened with reading and writing access. You can specify true for this parameter if you only need reading access.' },
        ],
        returns: 'if successful, returns a file handle for the file. otherwise returns false (f.e. if the file doesnt exist).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileOpen',
    },
    fileRead: {
        summary: 'Reads the specified number of bytes from the given file starting at its current\nread/write position, and returns them as a string.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'A handle to the file you wish to read from. Use fileOpen to obtain this handle.' },
            { name: 'count', isOptional: false, isVariadic: false, summary: 'The number of bytes you wish to read.' },
        ],
        returns: 'returns the bytes that were read in a string. note that this string might not contain as many bytes as you specified if an error occured, i.e. end of file.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileRead',
    },
    fileRename: {
        summary: 'Renames the specified file.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the source file in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. If the file is in the current resource, only the file path is necessary.' },
            { name: 'newFilePath', isOptional: false, isVariadic: false, summary: 'Destination filepath for the specified source file in the same format.' },
        ],
        returns: 'if successful, returns true. otherwise returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileRename',
    },
    fileSetPos: {
        summary: 'Sets the current read/write position in the file.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'The file handle of which you want to change the read/write position.' },
            { name: 'offset', isOptional: false, isVariadic: false, summary: 'The new position. This is the number of bytes from the beginning of the file. If this value is larger than the file size, it is limited to 52,428,800 bytes (50 MB).' },
        ],
        returns: 'returns where the offset was actually set at. i.e. if offset was past the end of the file, it will be set at the end of the file, and this position will be returned. returns false in case of failure (e.g. the specified file handle is invalid).',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileSetPos',
    },
    fileWrite: {
        summary: 'Writes one or more strings to a given file, starting at the current read/write position.\nAdvances the position over the number of bytes that were written.',
        parameters: [
            { name: 'theFile', isOptional: false, isVariadic: false, summary: 'A handle to the file you wish to write to. The file must have been opened with write access, i.e. the file handle must be a result of fileCreate or fileOpen with the readonly parameter set to false.' },
            { name: 'string1', isOptional: false, isVariadic: false, summary: 'The string to write.' },
            { name: 'string2', isOptional: true, isVariadic: false, summary: '' },
            { name: 'string3', isOptional: true, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns the number of bytes successfully written to the file, returns false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FileWrite',
    },
    fireWeapon: {
        summary: 'Fires one shot from a Element/Weapon|custom weapon.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to be fired.' },
        ],
        returns: 'returns true if the shot weapon is valid and therefore the shot was fired, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FireWeapon',
    },
    fixVehicle: {
        summary: 'This function will set a vehicles health to full and fix its damage model. If you wish to\nonly change the vehicles health, without affecting its damage model, use setElementHealth.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to fix' },
        ],
        returns: 'returns true if the vehicle was fixed, false if thevehicle is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FixVehicle',
    },
    focusBrowser: {
        summary: 'This function will attempt to focus the Element/Browser|browser or unfocus all browsers.\nThe browser that is focused will retrieve keyboard input.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser to be focused - if this is nil, it will unfocus all browsers.' },
        ],
        returns: 'returns true if the browser was focused or if nil was passed, false if it failed to focus or the browser does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FocusBrowser',
    },
    forcePlayerMap: {
        summary: 'This function is used to forcefully show a players radar map.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: ': A player object referencing the specified player' },
            { name: 'forceOn', isOptional: false, isVariadic: false, summary: ': A boolean value representing whether or not the players radar map will be forced on' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/ForcePlayerMap',
    },
    fromJSON: {
        summary: 'This function parses a JSON formatted string into variables. You can use toJSON to encode\nvariables into a JSON string that can be read by this function.',
        parameters: [
            { name: 'json', isOptional: false, isVariadic: false, summary: 'A JSON formatted string' },
        ],
        returns: 'returns variables read from the json string. note: indices of a json object such as 1: cat are being returned as string, not as integer.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FromJSON',
    },
    fxAddBlood: {
        summary: 'Creates a blood splatter particle effect.',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'count', isOptional: true, isVariadic: false, summary: 'the number of flying droplets to create.' },
            { name: 'brightness', isOptional: true, isVariadic: false, summary: 'the brightness. Ranges from 0 (almost black) to 1 (normal color).' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddBlood',
    },
    fxAddBulletImpact: {
        summary: 'Creates a bullet impact particle effect, consisting of a small smoke cloud and a number\nof sparks.',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'dirZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'smokeSize', isOptional: true, isVariadic: false, summary: 'the size of the smoke cloud.' },
            { name: 'sparkCount', isOptional: true, isVariadic: false, summary: 'the number of sparks to create.' },
            { name: 'smokeIntensity', isOptional: true, isVariadic: false, summary: 'the amount/transparency of smoke, ranges from 0 to 1.' },
        ],
        returns: 'returns a true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddBulletImpact',
    },
    fxAddBulletSplash: {
        summary: 'This function creates a bullet splash particle effect, normally created when shooting\ninto water.',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'A float representing the x position of the splash' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'A float representing the y position of the splash' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: 'A float representing the z position of the splash' },
        ],
        returns: 'returns a true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/FxAddBulletSplash',
    },
};
