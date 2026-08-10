import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_5: ApiDocumentationCatalog = {
    createResource: {
        summary: 'This function creates an new, empty resource. This creates a directory matching the name\nyou specify on disk, then creates an empty meta.xml file with a  element in it.',
        parameters: [
            { name: 'resourceName', isOptional: false, isVariadic: false, summary: 'The name of the new resource. This should be a valid file name. Its recommended that you do not have spaces or non-ASCII characters in resource names.' },
            { name: 'organizationalDir', isOptional: true, isVariadic: false, summary: ': A string containing the path where the resource should be created (e.g. gamemodes/amx).' },
        ],
        returns: 'returns the resource element of the new resource if successful, false otherwise. this could fail if the resource name already is in use, if a directory already exists with the name youve specified (but this isnt a valid resource) or if the name you specify isnt valid. it could also fail if the disk was full or for other similar reasons.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateResource',
    },
    createSearchLight: {
        summary: '',
        parameters: [
            { name: 'startX', isOptional: false, isVariadic: false, summary: ': the X coordinate where the searchlight light cone will start.' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: ': the Y coordinate where the searchlight light cone will start.' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: ': the Z coordinate where the searchlight light cone will start.' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: ': the X coordinate of the direction where the searchlight will point to.' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: ': the Y coordinate of the direction where the searchlight will point to.' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: ': the Z coordinate of the direction where the searchlight will point to.' },
            { name: 'startRadius', isOptional: false, isVariadic: false, summary: ': the radius of the searchlights light cone in its beginning.' },
            { name: 'endRadius', isOptional: false, isVariadic: false, summary: ': the radius of the searchlights light cone in its end.' },
            { name: 'renderSpot', isOptional: true, isVariadic: false, summary: ': if true, the searchlight will lighten the surface where it ends.' },
        ],
        returns: 'if every argument is correct and the limit of 1000 searchlights has not been reached, this function returns a element/searchlight|searchlight element. otherwise, it returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateSearchLight',
    },
    createSWATRope: {
        summary: 'Creates a SWAT rope like that of the rope in single player used by SWAT Teams abseiling\nfrom the Police Maverick.',
        parameters: [
            { name: 'fx', isOptional: false, isVariadic: false, summary: '' },
            { name: 'fy', isOptional: false, isVariadic: false, summary: '' },
            { name: 'fZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'duration', isOptional: false, isVariadic: false, summary: 'the amount in miliseconds the rope will be there before falling to the ground.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateSWATRope',
    },
    createTeam: {
        summary: 'This function is for creating a new team, which can be used to group players. Players\nwill not join the team until they are respawned.',
        parameters: [
            { name: 'teamName', isOptional: false, isVariadic: false, summary: 'A string representing the teams name.' },
            { name: 'colorR', isOptional: true, isVariadic: false, summary: 'An integer representing the red color value.' },
            { name: 'colorG', isOptional: true, isVariadic: false, summary: 'An integer representing the green color value.' },
            { name: 'colorB', isOptional: true, isVariadic: false, summary: 'An integer representing the blue color value.' },
        ],
        returns: 'returns a team element if it was successfully created, false if invalid arguments are passed or a team with that name already exists.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateTeam',
    },
    createTrayNotification: {
        summary: 'This function creates a notification balloon on the desktop.',
        parameters: [
            { name: 'notificationText', isOptional: false, isVariadic: false, summary: 'The text to send in the notification.' },
            { name: 'iconType', isOptional: true, isVariadic: false, summary: 'The notification icon type. Possible values are: default (the MTA icon), info, warning, error' },
            { name: 'useSound', isOptional: true, isVariadic: false, summary: 'A boolean value indicating whether or not to play a sound when receiving the notification.' },
        ],
        returns: 'returns true if the notification is correctly created, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateTrayNotification',
    },
    createVehicle: {
        summary: 'This function creates a vehicle at the specified location.\nIts worth nothing that the position of the vehicle is the center point of the vehicle,\nnot its base. As such, you need to ensure that the z value (vertical axis) is some height\nabove the ground. You can find the exact height using the client side function\ngetElementDistanceFromCentreOfMassToBaseOfModel, or you can estimate it yourself and just\nspawn the vehicle so it drops to the ground.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: ': The Vehicle IDs|vehicle ID of the vehicle being created.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: ': A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: ': A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: ': A floating point number representing the Z coordinate on the map.' },
            { name: 'rx', isOptional: true, isVariadic: false, summary: ': A floating point number representing the rotation about the X axis in degrees.' },
            { name: 'ry', isOptional: true, isVariadic: false, summary: ': A floating point number representing the rotation about the Y axis in degrees.' },
            { name: 'rz', isOptional: true, isVariadic: false, summary: ': A floating point number representing the rotation about the Z axis in degrees.' },
            { name: 'numberplate', isOptional: true, isVariadic: false, summary: ': A string that will go on the number plate of the vehicle (max 8 characters).' },
            { name: 'bDirection', isOptional: true, isVariadic: false, summary: '(serverside only): Placeholder boolean which provides backward compatibility with some scripts. It never had any effect, but it is read by the code. It is recommended to ignore this argument, passing false or the variant1 argument in its place.' },
            { name: 'variant1', isOptional: true, isVariadic: false, summary: ': An integer for the first vehicle variant. See vehicle variants.' },
            { name: 'variant2', isOptional: true, isVariadic: false, summary: ': An integer for the second vehicle variant. See vehicle variants.' },
        ],
        returns: 'returns the vehicle element that was created. returns false if the arguments are incorrect, or if the vehicle limit of 65535 is exceeded.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateVehicle',
    },
    createWater: {
        summary: 'Creates an area of water.\nThe largest possible size of a water area is 5996&#0215;5996. Also be aware that the\nfunction will change all x and y coordinates you specify into even integer numbers if\nnecessary: this is because of a limitation of San Andreas.\nYou are able to give the water a shallow water effect, which practically changes the\nwater invisible to the eye. However, all elements still work the same way as without the\nshallow effect - allowing swimming, diving, vehicles to sink, etc.',
        parameters: [
            { name: 'x1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'x2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'x3', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y3', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z3', isOptional: false, isVariadic: false, summary: '' },
            { name: 'x4', isOptional: true, isVariadic: false, summary: '' },
            { name: 'y4', isOptional: true, isVariadic: false, summary: '' },
            { name: 'z4', isOptional: true, isVariadic: false, summary: '' },
            { name: 'bShallow', isOptional: true, isVariadic: false, summary: 'gives the water a shallow water effect.' },
        ],
        returns: 'returns a water element if successful, false otherwise. the water element can be repositioned with setelementposition and destroyed with destroyelement.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateWater',
    },
    createWeapon: {
        summary: 'Creates a Element/Weapon|custom weapon that can fire bullets. Do not confuse this with\nplayer held weapons.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'The weapon type which can be:' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x position to create the weapon.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y position to create the weapon.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z position to create the weapon.' },
        ],
        returns: 'returns a element/weapon|custom weapon element, which represents a weapon floating at that position.',
        wiki: 'https://wiki.multitheftauto.com/wiki/CreateWeapon',
    },
    dbConnect: {
        summary: 'This function opens a connection to a database and returns an element that can be used\nwith dbQuery. To disconnect use destroyElement.',
        parameters: [
            { name: 'databaseType', isOptional: false, isVariadic: false, summary: 'The type of database. This can be either sqlite or mysql' },
            { name: 'host', isOptional: false, isVariadic: false, summary: ': Host address e.g. host=127.0.0.1 dbname : Name of the database to use e.g. dbname=test port : Host port e.g. port=1234 (optional, defaults to standard MySQL port if not used) unix_socket : Unix socket or named pipe to use (optional) charset : Communicate with the server using a character which is different from the default e.g. charset=utf8 (optional)' },
            { name: 'username', isOptional: true, isVariadic: false, summary: 'Usually required for MySQL, ignored by SQLite' },
            { name: 'password', isOptional: true, isVariadic: false, summary: 'Usually required for MySQL, ignored by SQLite' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'List of key=value pairs separated by semicolons. Supported keys are: share which can be set to 0 or 1. (Default value for SQLite is share=1, for MySQL is share=0). When set to 1, the connection is shared and will be used by other calls to dbConnect with the same host string. This is usually a good thing for SQLite connections, but not so good for MySQL unless care is taken. batch which can be set to 0 or 1. (Default is batch=1). When set to 1, queries called in the same frame are automatically batched together which can significantly speed up inserts/updates. The downside is you lose control of the feature that is used to achieve batching (For SQLite it is transactions, for MySQL it is autocommit mode). Therefore, if you use transactions, lock tables or control autocommit yourself, you may want to disable this feature. autoreconnect which can be set to 0 or 1. (Default value autoreconnect=1). When set to 1, dropped connections will automatically be reconnected. Note that session variables (incl. SET NAMES), user variables, table locks and temporary tables will be reset because of the reconnection. So if you use these fancy features, you will need to turn autoreconnect off and cope with dropped connections some other way. log which can be set to 0 or 1. (Default value log=1). When set to 0, activity from this connection will not be recorded in the Server_Commands#debugdb|database debug log file. tag (Default value tag=script). A string which helps identify activity from this connection in the Server_Commands#debugdb|database debug log file. suppress A comma separated list of error codes to ignore. (eg. suppress=1062,1169). multi_statements Enable multiple statements (separated by a semi-colon) in one query. Use dbPrepareString when building a multiple statement query to reduce SQL injection risks. queue Name of the queue to use. (Default value for SQLite is sqlite, for MySQL default is the host string from the host argument). Asynchronous database queries in the same queue are processed in order, one at a time. Any name can be used.' },
        ],
        returns: 'returns a database connection element unless there are problems, in which case it return false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DbConnect',
    },
    dbExec: {
        summary: 'This function executes a database query using the supplied connection. No query result is\nreturned.',
        parameters: [
            { name: 'databaseConnection', isOptional: false, isVariadic: false, summary: 'A database connection element previously returned from dbConnect' },
            { name: 'query', isOptional: false, isVariadic: false, summary: 'An SQL query. Positions where parameter values will be inserted are marked with a ? paramX A variable number of parameters. These must be strings or numbers - it is important to make sure they are of the correct type. Also, the number of parameters passed must be equal to the number of ? characters in the query string. String parameters are automatically quoted and escaped as required. (If you do not want a string quoted, use **??**) Make sure that numbers are in number format as a string number is treated differently.' },
            { name: 'param1', isOptional: true, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns true unless the connection is incorrect, in which case it returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DbExec',
    },
    dbFree: {
        summary: 'This function frees a database query handle. dbFree only needs to be used if a result has\nnot been obtained with dbPoll',
        parameters: [
            { name: 'queryHandle', isOptional: false, isVariadic: false, summary: 'A query handle previously returned from dbQuery' },
        ],
        returns: 'returns true if the handle was successfully freed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DbFree',
    },
    dbPoll: {
        summary: 'This function checks the progress of a database query.',
        parameters: [
            { name: 'queryHandle', isOptional: false, isVariadic: false, summary: 'A query handle previously returned from dbQuery' },
            { name: 'timeout', isOptional: false, isVariadic: false, summary: 'How many milliseconds to wait for a result. Use 0 for an instant response (which may return nil). Use -1 to wait until a result is ready. Note: A wait here will freeze the entire server just like executeSQLQuery' },
            { name: 'multipleResults', isOptional: true, isVariadic: false, summary: 'Set to true to enable the return values from multiple queries |7972' },
        ],
        returns: '*nil: returns nil if the query results are not yet ready. you should try again in a little while. (if you give up waiting for a result, be sure to call dbfree) *false: returns false if the query string contained an error, the connection has been lost or the query handle is incorrect. this automatically frees the query handle, so you do not have to call dbfree. ** this also returns two extra values: (see the example on how the retrieve them) ***int: error code ***string error message *table: returns a table with the result of the query when the query has successfully completed. this automatically frees the query handle, so you do not have to call dbfree. if multipleresults is set to true, it will first return a table pertaining to one query, followed by the results for that query and so on for the next queries. ** this also returns extra values (only when multipleresults is set to true): ***int: number of affected rows ***int: last insert id the table is of the format: ```lua { { colname1=value1, colname2=value2, ... }, { colname1=value3, colname2=value4, ... }, ... } ``` a subsequent table represents the next row.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DbPoll',
    },
    dbPrepareString: {
        summary: 'This function escapes arguments in the same way as dbQuery, except dbPrepareString\nreturns the query string instead of processing the query. This allows you to safely build\ncomplex query strings from component parts and help prevent (one class of) SQL\ninjection.',
        parameters: [
            { name: 'databaseConnection', isOptional: false, isVariadic: false, summary: 'A database connection element previously returned from dbConnect' },
            { name: 'query', isOptional: false, isVariadic: false, summary: 'An SQL query. Positions where parameter values will be inserted are marked with a ? paramX A variable number of parameters. These must be strings or numbers - it is important to make sure they are of the correct type. Also, the number of parameters passed must be equal to the number of ? characters in the query string. String parameters are automatically quoted and escaped as required. (If you do not want a string quoted, use **??**)' },
            { name: 'param1', isOptional: true, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns a prepare sql query string, or false if an error occurred.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DbPrepareString',
    },
    dbQuery: {
        summary: 'This function starts a database query using the supplied connection. Use the returned\nquery handle with dbPoll to get the result, or dbFree if you dont want the result.',
        parameters: [
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'An optional function to be called when a result is ready. The function will only be called if the result has not already been read with dbPoll. The function is called with the query handle as the first argument.' },
            { name: 'callbackArguments', isOptional: false, isVariadic: false, summary: 'An optional table containing extra arguments to be sent to the callback function. paramX A variable number of parameters. These must be strings or numbers - it is important to make sure they are of the correct type. Also, the number of parameters passed must be equal to the number of ? characters in the query string. String parameters are automatically quoted and escaped as required. (If you do not want a string quoted, use **??**)' },
            { name: 'databaseConnection', isOptional: false, isVariadic: false, summary: 'A database connection element previously returned from dbConnect' },
            { name: 'query', isOptional: false, isVariadic: false, summary: 'An SQL query. Positions where parameter values will be inserted are marked with a ?' },
            { name: 'param1', isOptional: true, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns a query handle unless the connection is incorrect, in which case it return false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DbQuery',
    },
    debugSleep: {
        summary: 'debugSleep freezes the client/server for the specified time. This means that all\nsynchronization, rendering and script execution will stop except HTTP processing invoked\nby fetchRemote. This function only works, if development mode is enabled by\nsetDevelopmentMode and can be utilised to build a debugger that communicates via HTTP\nrequests with the editor/IDE.',
        parameters: [
            { name: 'sleep', isOptional: false, isVariadic: false, summary: ': An integer value in milliseconds.' },
        ],
        returns: 'returns true if the development mode is enabled and arguments are correct, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DebugSleep',
    },
    decodeString: {
        summary: 'This function decodes an encoded string using the specified algorithm. The counterpart of\nthis function is encodeString.',
        parameters: [
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: 'The algorithm to use.' },
            { name: 'input', isOptional: false, isVariadic: false, summary: 'The input to decode.' },
            { name: 'options', isOptional: false, isVariadic: false, summary: 'A table with options and other necessary data for the algorithm, as detailed below.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'providing a callback will run this function asynchronously, the arguments to the callback are the same as the returned values below.' },
        ],
        returns: 'returns the decoded string if successful, false otherwise. if a callback was provided, the decoded string is argument to the callback.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DecodeString',
    },
    deleteResource: {
        summary: 'This function deletes a resource from the MTA memory and moves it to the\n/resources-cache/trash/ directory.',
        parameters: [
            { name: 'resourceName', isOptional: false, isVariadic: false, summary: 'The name of resource to delete.' },
        ],
        returns: 'returns true if the resource has been deleted successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DeleteResource',
    },
    deref: {
        summary: 'This function will take a reference obtained by the ref function and returns its Lua\nelement.',
        parameters: [
            { name: 'reference', isOptional: false, isVariadic: false, summary: 'The valid reference, which you want to dereference' },
        ],
        returns: 'returns mixed if the reference were valid. returns false if the reference were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Deref',
    },
    destroyElement: {
        summary: 'This function destroys an element and all elements within it in the hierarchy (its\nchildren, the children of those children etc). player|Player elements cannot be destroyed\nusing this function. A player can only be removed from the hierarchy when they quit or\nare kicked. The root element also cannot be destroyed, however, passing the root as an\nargument will wipe all elements from the server, except for the players and clients,\nwhich will become direct descendants of the root node, and other elements that cannot be\ndestroyed, such as resource root elements.\nPlayers are not the only elements that cannot be deleted. This list also includes remote\nclients and console elements.',
        parameters: [
            { name: 'elementToDestroy', isOptional: false, isVariadic: false, summary: 'The element you wish to destroy.' },
        ],
        returns: 'returns true if the element was destroyed successfully, false if either the element passed to it was invalid or it could not be destroyed for some other reason (for example, clientside destroyelement cant destroy serverside elements).',
        wiki: 'https://wiki.multitheftauto.com/wiki/DestroyElement',
    },
    detachElements: {
        summary: 'This function detaches attached elements from one another.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to be detached (the child)' },
            { name: 'theAttachToElement', isOptional: true, isVariadic: false, summary: 'The element you wish to detach from, will detach from the attached element if this isnt specified.' },
        ],
        returns: 'returns true if the detaching was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DetachElements',
    },
    detachTrailerFromVehicle: {
        summary: 'This function detaches an already attached trailer from a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to detach a trailer from.' },
            { name: 'theTrailer', isOptional: true, isVariadic: false, summary: ': The trailer you wish to be detached.' },
        ],
        returns: 'returns true if the vehicles were successfully detached, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DetachTrailerFromVehicle',
    },
    detonateSatchels: {
        summary: 'This function can be used to detonate a players satchels.',
        parameters: [
            { name: 'Player', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/DetonateSatchels',
    },
};
