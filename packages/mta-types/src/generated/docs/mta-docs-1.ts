import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_1: ApiDocumentationCatalog = {
    abortRemoteRequest: {
        summary: 'Aborts a fetchRemote or callRemote request.',
        parameters: [
            { name: 'theRequest', isOptional: false, isVariadic: false, summary: 'returned from fetchRemote, callRemote or getRemoteRequests' },
        ],
        returns: 'Returns true on success, false when invalid request was provided',
        wiki: 'https://wiki.multitheftauto.com/wiki/AbortRemoteRequest',
    },
    aclCreate: {
        summary: 'This function creates an ACL entry in the Access Control List system with the specified name.',
        parameters: [
            { name: 'aclName', isOptional: false, isVariadic: false, summary: 'The name of the ACL entry to add.' },
        ],
        returns: 'Returns the created ACL object if successful. Returns false if an ACL of the given name could not be created.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclCreate',
    },
    aclCreateGroup: {
        summary: 'This function creates a group in the ACL. An ACL group can contain objects like players and resources. They specify who has access to the ACL\'s in this group.',
        parameters: [
            { name: 'groupName', isOptional: false, isVariadic: false, summary: 'The name of the group to create' },
        ],
        returns: 'Returns the pointer to the created aclgroup if successful. Returns false if failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclCreateGroup',
    },
    aclDestroy: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function destroys the ACL passed. The destroyed ACL will no longer be valid.',
        parameters: [
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to destroy' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if successfully destroyed and *false* if it could not be deleted (ie. it\'s not valid).',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclDestroy',
    },
    aclDestroyGroup: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function destroys the given ACL group. The destroyed ACL group will no longer be valid.',
        parameters: [
            { name: 'aclGroup', isOptional: false, isVariadic: false, summary: 'The aclgroup element to destroy' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the ACL group was successfully deleted, *false* if it could not be deleted for some reason (ie. invalid argument).',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclDestroyGroup',
    },
    aclGet: {
        summary: 'Get the ACL with the given name. If need to get most of the ACL\'s, you should consider using aclList to get a table of them all.',
        parameters: [
            { name: 'aclName', isOptional: false, isVariadic: false, summary: 'The name to get the ACL belonging to' },
        ],
        returns: 'Returns the ACL with that name if it could be retrieved, *false*/*nil* if the ACL does not exist or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGet',
    },
    aclGetGroup: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function is used to get the ACL group with the given name. If you need most of the groups you should consider using aclGroupList instead to get a table containing them all.',
        parameters: [
            { name: 'groupName', isOptional: false, isVariadic: false, summary: 'The name to get the ACL group from' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns the ACL group if it could be found. Returns false/nil if it did not exist or failed for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGetGroup',
    },
    aclGetName: {
        summary: 'Get the name of given ACL.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns the name of the given ACL as a string if successful. Returns *false*/*nil* if unsuccessful, ie the ACL is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGetName',
    },
    aclGetRight: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function returns whether the access for the given right is set to true or false in the ACL.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: 'The ACL to get the right from' },
            { name: 'rightName', isOptional: false, isVariadic: false, summary: 'The right name to return the access value of.' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* or *false* if the ACL gives access or not to the given function. Returns *nil* if it failed for some reason, e.g. an invalid ACL was specified or the right specified does not exist in the ACL.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGetRight',
    },
    aclGroupAddACL: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function adds the given ACL to the given ACL group. This makes the resources and players in the given ACL group have access to what\'s specified in the given ACL. The rights for something in the different ACL\'s in a group are OR-ed together, which means if one ACL gives access to something, this ACL group will have access to that.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The group to add the ACL to' },
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to add to the group' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the ACL could be successfully added to the ACL group, *false*/*nil* if either of the elements are invalid, the ACL is already in that group or if something else goes wrong.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupAddACL',
    },
    aclGroupAddObject: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function adds an object to the given ACL group. An object can be a player\'s account, specified as:\n  *user.*\n\nOr a resource, specified as:\n  *resource.*\n\nObjects are specified as strings. The ACL groups work for the user accounts and the resources that are specified in them.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The group to add the object name string too.' },
            { name: 'theObjectName', isOptional: false, isVariadic: false, summary: 'The object string to add to the given ACL.' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the object was successfully added to the ACL, *false* if it already existed in the list.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupAddObject',
    },
    aclGroupGetName: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function is used to get the name of the given ACL group.',
        parameters: [
            { name: 'aclGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to get the name of' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns the name of the given ACL group as a string if successful, otherwise *false* or *nil* if the aclGroup is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupGetName',
    },
    aclGroupList: {
        summary: 'This function returns a table of all the ACL groups.',
        parameters: [],
        returns: 'Returns a table of all the ACL groups if successful, returns an empty table if no ACL groups exist. *false*/*nil* can be returned if this function fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupList',
    },
    aclGroupListACL: {
        summary: '<!-- Change this to "Client function" or "Server function" appropriately-->\n<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function returns a table over all the ACL\'s that exist in a given ACL group.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to get the ACL elements from' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns a table of the ACL elements in the given ACL group. This table might be empty. Returns *false* or *nil* if theGroup is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupListACL',
    },
    aclGroupListObjects: {
        summary: 'This function returns a table over all the objects that exist in a given ACL group. These are objects like players and resources.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to get the objects from' },
        ],
        returns: 'Returns a table of strings in the given ACL group. This table might be empty. Returns *false* or *nil* if theGroup is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupListObjects',
    },
    aclGroupRemoveACL: {
        summary: 'This function removes the given ACL from the given ACL group.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The group to remove the given ACL from' },
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to remove from the given group' },
        ],
        returns: 'Returns *true* if the ACL was successfully removed from the ACL group, *false*/*nil* if it could not be removed for some reason, ie. either of the elements were invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupRemoveACL',
    },
    aclGroupRemoveObject: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function removes the given object from the given ACL group. The object can be a resource or a player. See aclGroupAddObject for more details.',
        parameters: [
            { name: 'theGroup', isOptional: false, isVariadic: false, summary: 'The ACL group to remove the object string from' },
            { name: 'theObjectString', isOptional: false, isVariadic: false, summary: 'The object to remove from the ACL group' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the object existed in the ACL and could be removed, *false* if it could not be removed for some reason, ie. it did not exist in the given ACL group.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclGroupRemoveObject',
    },
    aclList: {
        summary: 'This function returns a list of all the ACLs.',
        parameters: [],
        returns: 'Returns a table of all the ACLs. This table can be empty if no ACLs exist. It can also return *false*/*nil* if it failed for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclList',
    },
    aclListRights: {
        summary: 'This function returns a table of all the rights that a given ACL has.',
        parameters: [
            { name: 'theACL', isOptional: false, isVariadic: false, summary: 'The ACL to get the rights from' },
            { name: 'allowedType', isOptional: false, isVariadic: false, summary: 'The allowed right type. Possible values are *general*, *function*, *resource* and *command*' },
        ],
        returns: 'Returns a table over the rights as strings in the given ACL. This table might be empty. Returns *false* or *nil* if theACL is invalid or it fails for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclListRights',
    },
    aclObjectGetGroups: {
        summary: 'This function returns a table of all groups the object is in.\n|22273',
        parameters: [
            { name: 'object', isOptional: false, isVariadic: false, summary: 'The name of the ACL entry to get groups of' },
        ],
        returns: 'Returns a table of all groups the object is in on success, false if something went wrong.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclObjectGetGroups',
    },
    aclReload: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function reloads the ACL\'s and the ACL groups from the ACL XML file. All ACL and ACL group elements are invalid after a call to this and should not be used anymore.',
        parameters: [],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the XML was successfully reloaded from the file, *false* or *nil* if the XML was invalid, didn\'t exist or could not be loaded for some other reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclReload',
    },
    aclRemoveRight: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function removes the given right (string) from the given ACL.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: 'The ACL to remove the right from' },
            { name: 'rightName', isOptional: false, isVariadic: false, summary: 'The ACL name to remove from the right from' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the given right was successfully removed from the given ACL, *false* or *nil* if it could not be removed for some reason, ie. it didn\'t exist in the ACL.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclRemoveRight',
    },
    aclSave: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThe ACL XML file is automatically saved whenever the ACL is modified, but the automatic save can be delayed by up to 10 seconds for performance reasons. Calling this function will force an immediate save.',
        parameters: [],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the ACL was successfully changed, *false* or *nil* if it could not be saved for some reason, ie. file in use.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclSave',
    },
    aclSetRight: {
        summary: 'This functions changes or adds the given right in the given ACL. The access can be *true* or *false* and specifies whether the ACL gives access to the right or not.',
        parameters: [
            { name: 'theAcl', isOptional: false, isVariadic: false, summary: 'The ACL to change the right of' },
            { name: 'rightName', isOptional: false, isVariadic: false, summary: 'The right to add/change the access property of. It **must** be prefixed with "**function.**" or "**command.**" or "**general.**" or "**resource.**"' },
            { name: 'hasAccess', isOptional: false, isVariadic: false, summary: 'Whether the access should be set to true or false' },
        ],
        returns: 'Returns *true* if the access was successfully changed, *false* or *nil* if it failed for some reason, ie. invalid ACL or the rightname is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AclSetRight',
    },
    addAccount: {
        summary: 'This function adds an account to the list of registered accounts of the current server.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the account you wish to make, this normally is the player\'s name.' },
            { name: 'pass', isOptional: false, isVariadic: false, summary: 'The password to set for this account for future logins.' },
            { name: 'allowCaseVariations', isOptional: true, isVariadic: false, summary: 'Whether the username is case sensitive (if this is set to true, usernames "Bob" and "bob" will refer to different accounts)' },
        ],
        returns: 'Returns an account or *false* if the account already exists or an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddAccount',
    },
    addBan: {
        summary: 'This function will add a ban for the specified IP/username/serial to the server.',
        parameters: [
            { name: 'IP', isOptional: false, isVariadic: false, summary: 'The IP to be banned. If you don\'t want to ban by IP, set this to *nil*.' },
            { name: 'Username', isOptional: false, isVariadic: false, summary: 'The [http://community.mtasa.com/ MTA Community] username to be banned (now obsolete). If you don\'t want to ban by username, set this to *nil*.' },
            { name: 'Serial', isOptional: false, isVariadic: false, summary: 'The serial to be banned. If you don\'t want to ban by serial, set this to *nil*.' },
            { name: 'responsibleElement', isOptional: true, isVariadic: false, summary: 'The element that is responsible for banning the IP/username/serial. This can be a player or the root (getRootElement()).' },
            { name: 'reason', isOptional: true, isVariadic: false, summary: 'The reason the IP/username/serial will be banned from the server.' },
            { name: 'seconds', isOptional: true, isVariadic: false, summary: 'The amount of seconds the player will be banned from the server for. This can be 0 for an infinite amount of time.' },
        ],
        returns: 'Returns the new ban if the IP/username/serial was banned successfully, *false* if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddBan',
    },
    addClothingModel: {
        summary: 'This function adds a new wearable clothing item for CJ.',
        parameters: [
            { name: 'clothesTexture', isOptional: false, isVariadic: false, summary: 'A string determining the clothes texture that will be added.' },
            { name: 'clothesModel', isOptional: false, isVariadic: false, summary: 'A string determining the clothes model that will be added.' },
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: 'A integer representing the clothes slot/type the clothes should be added to. See the clothes catalog.' },
        ],
        returns: 'Returns *true* if the clothing was added, and *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddClothingModel',
    },
    addColPolygonPoint: {
        summary: 'This function is used to add a new point to an existing colshape polygon.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish add a point to.' },
            { name: 'fX', isOptional: false, isVariadic: false, summary: 'The X position of the new bound point.' },
            { name: 'fY', isOptional: false, isVariadic: false, summary: 'The Y position of the new bound point.' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'The index where the new point will be inserted in the polygon. The points are indexed in order, with 1 being the first bound point. Passing 0 will insert the point as the last one in the polygon.' },
        ],
        returns: 'Returns *true* if the polygon was changed, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/AddColPolygonPoint',
    },
};
