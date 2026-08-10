import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_1: ApiDocumentationCatalog = {
    abortRemoteRequest: {
        summary: 'Aborts a FetchRemote|fetchRemote or CallRemote|callRemote request.',
        parameters: [
            { name: 'theRequest', isOptional: false, isVariadic: false, summary: ': returned from FetchRemote|fetchRemote, CallRemote|callRemote or GetRemoteRequests|getRemoteRequests' },
        ],
        returns: 'returns true on success, false when invalid request was provided',
        wiki: 'https://wiki.multitheftauto.com/wiki/AbortRemoteRequest',
    },
    aclCreate: {
        summary: 'This function creates an ACL entry in the Access Control List system with the specified\nname.',
        parameters: [
            { name: 'aclName', isOptional: false, isVariadic: false, summary: 'The name of the ACL entry to add.' },
        ],
        returns: 'returns the created acl object if successful. returns false if an acl of the given name could not be created.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclCreate',
    },
    aclCreateGroup: {
        summary: 'This function creates a group in the ACL. An ACL group can contain objects like players\nand resources. They specify who has access to the ACLs in this group.',
        parameters: [
            { name: 'groupName', isOptional: false, isVariadic: false, summary: 'The name of the group to create' },
        ],
        returns: 'returns the pointer to the created aclgroup if successful. returns false if failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclCreateGroup',
    },
    aclDestroy: {
        summary: 'This function destroys the ACL passed. The destroyed ACL will no longer be valid.',
        parameters: [
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to destroy' },
        ],
        returns: 'returns true if successfully destroyed and false if it could not be deleted (ie. its not valid).',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclDestroy',
    },
    aclDestroyGroup: {
        summary: 'This function destroys the given ACL group. The destroyed ACL group will no longer be\nvalid.',
        parameters: [
            { name: 'aclGroup', isOptional: false, isVariadic: false, summary: 'The aclgroup element to destroy' },
        ],
        returns: 'returns true if the acl group was successfully deleted, false if it could not be deleted for some reason (ie. invalid argument).',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclDestroyGroup',
    },
    aclGet: {
        summary: 'Get the ACL with the given name. If need to get most of the ACLs, you should consider\nusing aclList to get a table of them all.',
        parameters: [
            { name: 'aclName', isOptional: false, isVariadic: false, summary: 'The name to get the ACL belonging to' },
        ],
        returns: 'returns the acl with that name if it could be retrieved, false/nil if the acl does not exist or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGet',
    },
    aclGetGroup: {
        summary: 'This function is used to get the ACL group with the given name. If you need most of the\ngroups you should consider using aclGroupList instead to get a table containing them all.',
        parameters: [
            { name: 'groupName', isOptional: false, isVariadic: false, summary: 'The name to get the ACL group from' },
        ],
        returns: 'returns the acl group if it could be found. returns false/nil if it did not exist or failed for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGetGroup',
    },
    aclGetName: {
        summary: 'Get the name of given ACL.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns the name of the given acl as a string if successful. returns false/nil if unsuccessful, ie the acl is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGetName',
    },
    aclGetRight: {
        summary: 'This function returns whether the access for the given right is set to true or false in\nthe ACL.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: 'The ACL to get the right from' },
            { name: 'rightName', isOptional: false, isVariadic: false, summary: 'The right name to return the access value of.' },
        ],
        returns: 'returns true or false if the acl gives access or not to the given function. returns nil if it failed for some reason, e.g. an invalid acl was specified or the right specified does not exist in the acl.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGetRight',
    },
    aclGroupAddACL: {
        summary: 'This function adds the given ACL to the given ACL group. This makes the resources and\nplayers in the given ACL group have access to whats specified in the given ACL. The\nrights for something in the different ACLs in a group are OR-ed together, which means if\none ACL gives access to something, this ACL group will have access to that.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The group to add the ACL to' },
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to add to the group' },
        ],
        returns: 'returns true if the acl could be successfully added to the acl group, false/nil if either of the elements are invalid, the acl is already in that group or if something else goes wrong.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupAddACL',
    },
    aclGroupAddObject: {
        summary: 'This function adds an object to the given ACL group. An object can be a players account,\nspecified as:\nuser.\nOr a resource, specified as:\nresource.\nObjects are specified as strings. The ACL groups work for the user accounts and the\nresources that are specified in them.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The group to add the object name string too.' },
            { name: 'theObjectName', isOptional: false, isVariadic: false, summary: 'The object string to add to the given ACL.' },
        ],
        returns: 'returns true if the object was successfully added to the acl, false if it already existed in the list.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupAddObject',
    },
    aclGroupGetName: {
        summary: 'This function is used to get the name of the given ACL group.',
        parameters: [
            { name: 'aclGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to get the name of' },
        ],
        returns: 'returns the name of the given acl group as a string if successful, otherwise false or nil if the aclgroup is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupGetName',
    },
    aclGroupList: {
        summary: 'This function returns a table of all the ACL groups.',
        parameters: [],
        returns: 'returns a table of all the acl groups if successful, returns an empty table if no acl groups exist. false/nil can be returned if this function fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupList',
    },
    aclGroupListACL: {
        summary: 'This function returns a table over all the ACLs that exist in a given ACL group.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to get the ACL elements from' },
        ],
        returns: 'returns a table of the acl elements in the given acl group. this table might be empty. returns false or nil if thegroup is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupListACL',
    },
    aclGroupListObjects: {
        summary: 'This function returns a table over all the objects that exist in a given ACL group. These\nare objects like players and resources.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to get the objects from' },
        ],
        returns: 'returns a table of strings in the given acl group. this table might be empty. returns false or nil if thegroup is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupListObjects',
    },
    aclGroupRemoveACL: {
        summary: 'This function removes the given ACL from the given ACL group.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The group to remove the given ACL from' },
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to remove from the given group' },
        ],
        returns: 'returns true if the acl was successfully removed from the acl group, false/nil if it could not be removed for some reason, ie. either of the elements were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupRemoveACL',
    },
    aclGroupRemoveObject: {
        summary: 'This function removes the given object from the given ACL group. The object can be a\nresource or a player. See aclGroupAddObject for more details.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to remove the object string from' },
            { name: 'theObjectString', isOptional: false, isVariadic: false, summary: 'The object to remove from the ACL group' },
        ],
        returns: 'returns true if the object existed in the acl and could be remoevd, false if it could not be removed for some reason, ie. it did not exist in the given acl group.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupRemoveObject',
    },
    aclList: {
        summary: 'This function returns a list of all the ACLs.',
        parameters: [],
        returns: 'returns a table of all the acls. this table can be empty if no acls exist. it can also return false/nil if it failed for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclList',
    },
    aclListRights: {
        summary: 'This function returns a table of all the rights that a given ACL has.',
        parameters: [
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to get the rights from' },
            { name: 'allowedType', isOptional: false, isVariadic: false, summary: 'The allowed right type. Possible values are general, function, resource and command' },
        ],
        returns: 'returns a table over the rights as strings in the given acl. this table might be empty. returns false or nil if theacl is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclListRights',
    },
    aclReload: {
        summary: 'This function reloads the ACLs and the ACL groups from the ACL XML file. All ACL and ACL\ngroup elements are invalid after a call to this and should not be used anymore.',
        parameters: [],
        returns: 'returns true if the xml was successfully reloaded from the file, false or nil if the xml was invalid, didnt exist or could not be loaded for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclReload',
    },
    aclRemoveRight: {
        summary: 'This function removes the given right (string) from the given ACL.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: 'The ACL to remove the right from' },
            { name: 'rightName', isOptional: false, isVariadic: false, summary: 'The ACL name to remove from the right from' },
        ],
        returns: 'returns true if the given right was successfully removed from the given acl, false or nil if it could not be removed for some reason, ie. it didnt exist in the acl.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclRemoveRight',
    },
    aclSave: {
        summary: 'The ACL XML file is automatically saved whenever the ACL is modified, but the automatic\nsave can be delayed by up to 10 seconds for performance reasons. Calling this function\nwill force an immediate save.',
        parameters: [],
        returns: 'returns true if the acl was successfully changed, false or nil if it could not be saved for some reason, ie. file in use.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclSave',
    },
    aclSetRight: {
        summary: 'This functions changes or adds the given right in the given ACL. The access can be true\nor false and specifies whether the ACL gives access to the right or not.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: 'The ACL to change the right of' },
            { name: 'rightName', isOptional: false, isVariadic: false, summary: 'The right to add/change the access property of' },
            { name: 'hasAccess', isOptional: false, isVariadic: false, summary: 'Whether the access should be set to true or false' },
        ],
        returns: 'returns true if the access was successfully changed, false or nil if it failed for some reason, ie. invalid acl or the rightname is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclSetRight',
    },
    addAccount: {
        summary: 'This function adds an account to the list of registered accounts of the current server.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the account you wish to make, this normally is the players name.' },
            { name: 'pass', isOptional: false, isVariadic: false, summary: 'The password to set for this account for future logins.' },
            { name: 'allowCaseVariations', isOptional: true, isVariadic: false, summary: 'Whether the username is case sensitive (if this is set to true, usernames Bob and bob will refer to different accounts)' },
        ],
        returns: 'returns an account or false if the account already exists or an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddAccount',
    },
    addBan: {
        summary: 'This function will add a ban for the specified IP/username/serial to the server.',
        parameters: [
            { name: 'IP', isOptional: true, isVariadic: false, summary: 'The IP to be banned. If you dont want to ban by IP, set this to nil. **or**' },
            { name: 'Username', isOptional: true, isVariadic: false, summary: 'The http://community.mtasa.com/ MTA Community username to be banned (now obsolete). If you dont want to ban by username, set this to nil. **or**' },
            { name: 'Serial', isOptional: true, isVariadic: false, summary: 'The serial to be banned. If you dont want to ban by serial, set this to nil. ** or any combination.**' },
            { name: 'responsibleElement', isOptional: true, isVariadic: false, summary: 'The element that is responsible for banning the IP/username/serial. This can be a player or the root (getRootElement()).' },
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'The reason the IP/username/serial will be banned from the server.' },
            { name: 'seconds', isOptional: true, isVariadic: false, summary: 'The amount of seconds the player will be banned from the server for. This can be 0 for an infinite amount of time.' },
        ],
        returns: 'returns the new ban if the ip/username/serial was banned successfully, false if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddBan',
    },
    addColPolygonPoint: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish add a point to.' },
            { name: 'fX', isOptional: false, isVariadic: false, summary: 'The X position of the new bound point.' },
            { name: 'fY', isOptional: false, isVariadic: false, summary: 'The Y position of the new bound point.' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'The index where the new point will be inserted in the polygon. The points are indexed in order, with 1 being the first bound point. Passing 0 will insert the point as the last one in the polygon. Returns \'\'true\'\' if the polygon was changed, \'\'false\'\' if invalid arguments were passed.' },
        ],
        returns: 'returns true if the polygon was changed, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddColPolygonPoint',
    },
    addCommandHandler: {
        summary: 'This function will attach a scripting function (handler) to a console command, so that\nwhenever a player or administrator uses the command the function is called.\nMultiple command handlers can be attached to a single command, and they will be called in\nthe order that the handlers were attached. Equally, multiple commands can be handled by a\nsingle function, and the commandName parameter used to decide the course of action.\nFor users, a command is in the format:\ncommandName argument1 argument2\nThis can be triggered from the players console or directly from the chat box by prefixing\nthe message with a forward slash (/). For server side handlers, the server admin is also\nable to trigger these directly from the servers console in the same way as they are\ntriggered from a players console.',
        parameters: [
            { name: 'commandName', isOptional: false, isVariadic: false, summary: 'This is the name of the command you wish to attach a handler to. This is what must be typed into the console to trigger the function.' },
            { name: 'handlerFunction', isOptional: false, isVariadic: false, summary: 'This is the function that you want the command to trigger, which has to be defined before you add the handler. This function can take two parameters, playerSource and commandName, followed by as many parameters as you expect after your command (see below). These are all optional.' },
            { name: 'restricted', isOptional: true, isVariadic: false, summary: 'Specify whether or not this command should be restricted by default. Use this on commands that should be inaccessible to everyone as default except special users specified in the ACL (Access Control List). This is to make sure admin commands such as ie. punish wont be available to everyone if a server administrator forgets masking it in ACL. Make sure to add the command to your ACL under the proper group for it to be usefull (i.e ). This argument defaults to false if nothing is specified.' },
            { name: 'caseSensitive', isOptional: true, isVariadic: false, summary: 'Specifies if the command handler will ignore the case for this command name.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddCommandHandler',
    },
    addDebugHook: {
        summary: 'This function allows tracing of MTA functions and events. It should only be used when\ndebugging scripts as it may degrade script performance.\nDebug hooks are not recursive, so functions and events triggered inside the hook callback\nwill not be traced.',
        parameters: [
            { name: 'hookType', isOptional: false, isVariadic: false, summary: 'The type of hook to add. This can be: ** preEvent ** postEvent ** preFunction ** postFunction * preEventFunction * postEventFunction' },
            { name: 'callbackFunction', isOptional: false, isVariadic: false, summary: 'The function to call ** Returning the string "skip" from the callback function will cause the original function/event to be skipped' },
            { name: 'nameList', isOptional: true, isVariadic: false, summary: 'Table of strings for restricting which functions and events the hook will be triggered on ** addDebugHook and removeDebugHook will only be hooked if they are specified in the name list' },
        ],
        returns: 'returns true if the hook was successfully added, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddDebugHook',
    },
};
