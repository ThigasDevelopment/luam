import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_16: ApiDocumentationCatalog = {
    getEffectDensity: {
        summary: 'This function gets the density of certain effect.',
        parameters: [
            { name: 'theEffect', isOptional: false, isVariadic: false, summary: 'The effect to get density of.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetEffectDensity',
    },
    getEffectSpeed: {
        summary: 'This function gets the speed of a specified effect.',
        parameters: [
            { name: 'theEffect', isOptional: false, isVariadic: false, summary: 'The effect to get the speed of.' },
        ],
        returns: 'Returns float containing the effect\'s speed, *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetEffectSpeed',
    },
    getElementAlpha: {
        summary: 'This function returns the alpha (transparency) value for the specified element. This can be a player, ped, object, vehicle or weapon.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose alpha you want to retrieve.' },
        ],
        returns: 'Returns an integer (0-255; 0 = transparent) indicating the element\'s alpha, or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAlpha',
    },
    getElementAngularVelocity: {
        summary: 'Gets the current angular velocity of a specified, supported element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to retrieve the angular velocity from. Can be either a player, ped, object, vehicle or a custom weapon. **Server side supports only vehicles currently.**' },
        ],
        returns: 'Returns three floats describing the x, y and z rotation',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAngularVelocity',
    },
    getElementAttachedOffsets: {
        summary: 'This function returns the offsets of an element that has been attached to another element using attachElements.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The attached element.' },
        ],
        returns: 'Returns 6 floats, of which the first 3 indicate the position offset (x, y, z), and the last 3 indicate the rotation offset (x, y, z), if successful. *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAttachedOffsets',
    },
    getElementAttachedTo: {
        summary: 'This function determines the element that the specified element is attached to.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you require the information for.' },
        ],
        returns: 'Returns the element that the chosen element is attached to, or *false* if the element isn\'t attached to another element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAttachedTo',
    },
    getElementBoneMatrix: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to get the bone matrix on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone to get the matrix of. See Bone IDs.' },
        ],
        returns: 'Returns a multi-dimensional array (which can be transformed into a proper matrix class using *Matrix.create* method) containing a 4x4 matrix. Returns *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBoneMatrix',
    },
    getElementBonePosition: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to get the bone position on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone to get the position of. See Bone IDs.' },
        ],
        returns: 'Returns 3 floats, representing the X, Y, Z world position of the bone.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBonePosition',
    },
    getElementBoneQuaternion: {
        summary: 'This function retrieves how a particular bone rotates in relation to the element.\n\nThe use of [https://en.wikipedia.org/wiki/Quaternion quaternions] are more effective and do not generate issues like gimbal lock that might arise with [https://en.wikipedia.org/wiki/Euler_angles Euler angles], so they are a preferable choice for rotation.',
        parameters: [
            { name: 'ped', isOptional: false, isVariadic: false, summary: 'The element (ped or player) from which the bone\'s rotation will be retrieved.' },
            { name: 'bone', isOptional: false, isVariadic: false, summary: 'The ID of the bone to retrieve the quaternion of.' },
        ],
        returns: 'Returns four float values: * **x:** The quaternion\'s coefficient of the 𝑖 component, representing rotation around the x-axis. * **y:** The quaternion\'s coefficient of the 𝑗 component, representing rotation around the y-axis. * **z:** The quaternion\'s coefficient of the 𝑘 component, representing rotation around the z-axis. * **w:** The real part of the quaternion, which is linked to the angle of rotation.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBoneQuaternion',
    },
    getElementBoneRotation: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to get the bone rotation on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone to get the rotation of. See Bone IDs.' },
        ],
        returns: 'Returns 3 floats, representing the yaw, pitch, roll rotation values.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBoneRotation',
    },
    getElementBoundingBox: {
        summary: 'This function returns the minimum and maximum coordinates of an element\'s bounding box.\n\nIt should be noted that the values returned are relative to the position of the element, and as such if you wish to get world coordinates for drawing, etc., you should retrieve the position of the element and add the returned values onto that.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element whose bounding box we want to get.' },
        ],
        returns: '*Returns *min x, min y, min z, max x, max y, max z* if the passed element is valid and streamed in, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBoundingBox',
    },
    getElementByID: {
        summary: 'This function returns an element from the specified ID. If more than one element with the same ID exists, only the first one in the order it appears in the XML tree will be returned by this function.',
        parameters: [
            { name: 'id', isOptional: false, isVariadic: false, summary: 'The ID of the element as it appears in the XML file or as set by setElementID.' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'If there are two or more elements of the same ID it will return the element with the specified index starting at 0.' },
        ],
        returns: 'Returns the element with the given ID, or *false* if no such element exists.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementByID',
    },
    getElementByIndex: {
        summary: 'This function returns an element of the specified type with the specified index.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'the type of the element to be returned. Examples include "player", "vehicle", or a custom type.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'the element\'s index (0 for the first element, 1 for the second, etc).' },
        ],
        returns: 'Returns the requested element, or *false* if it doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementByIndex',
    },
    getElementChild: {
        summary: 'This function returns one of the child elements of a given parent element. The child element is selected by its index (0 for the first child, 1 for the second and so on).',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'the element above the one to be returned in the hierarchy.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'the element\'s index (0 for the first element, 1 for the second, etc).' },
        ],
        returns: 'Returns the requested element if it exists, or *false* if it doesn\'t.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementChild',
    },
    getElementChildren: {
        summary: 'This function is used to retrieve a list of the child elements of a given parent element. Note that it will only return direct children and not elements that are further down the element tree.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'Supply this argument with the parent of the children you want returned.' },
            { name: 'theType', isOptional: true, isVariadic: false, summary: 'The type of element you want a list of. This is the same as the tag name in the .map file, so this can be used with a custom element type if desired. Built in types are:' },
        ],
        returns: 'This function returns a *table* that contains a list of elements that the parent has. If the element has no children, it will return an empy *table*. It will return *false* if the parent element does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementChildren',
    },
    getElementChildrenCount: {
        summary: 'This function returns the number of children an element has. Note that only the direct children are counted and not elements that are further down the element tree.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'the parent element' },
        ],
        returns: 'Returns an *int* with the number of child elements, or *false* if the parent element does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementChildrenCount',
    },
    getElementCollisionsEnabled: {
        summary: 'This function indicates if a specific element is set to have collisions disabled. An element without collisions does not interact with the physical environment and remains static.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element for which you want to check whether collisions are enabled' },
        ],
        returns: 'Returns *true* if the collisions are enabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementCollisionsEnabled',
    },
    getElementColShape: {
        summary: 'Some elements have an associated colshape, for example Marker and Pickup. This function is used to get the associated colshape.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to get the colshape of' },
        ],
        returns: 'Returns *colshape* of the element, *false* if not or an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementColShape',
    },
    getElementData: {
        summary: 'This function retrieves element data attached to an element under a certain key.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'This is the element with data you want to retrieve.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the element data entry you want to retrieve. (Maximum 31 characters.)' },
            { name: 'inherit', isOptional: true, isVariadic: false, summary: '- toggles whether or not the function should go up the hierarchy to find the requested key in case the specified element doesn\'t have it.' },
        ],
        returns: 'This function returns a *variable* containing the requested element data, or *false* if the element or the element data does not exist. When getting data corresponding to a XML attribute, this is always a *string*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementData',
    },
    getElementDimension: {
        summary: 'This function allows you to retrieve the dimension of an element. See Dimension for the list of valid element types. The dimension determines what/who the element is visible to.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which you\'d like to retrieve the dimension of.' },
        ],
        returns: 'Returns an integer for the dimension if **theElement** is valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementDimension',
    },
    getElementDistanceFromCentreOfMassToBaseOfModel: {
        summary: 'This function is used to retrieve the distance between a element\'s centre of mass to the base of the model. This can be used to calculate the position the element has to be set to, to have it on ground level.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a *float* with the distance, or *false* if the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementDistanceFromCentreOfMassToBaseOfModel',
    },
    getElementHealth: {
        summary: 'This function returns the current health for the specified element. This can be a player, a ped, a vehicle, or an object.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The player or vehicle whose health you want to check.' },
        ],
        returns: 'Returns a float indicating the element\'s health, or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementHealth',
    },
    getElementID: {
        summary: 'This function gets the ID of an element. This is the "id" attribute of the element and is a string, NOT a number like a model ID, weapons ID or similar.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element from which to retrieve the ID.' },
        ],
        returns: 'This returns a *string* containing the element ID. It will return an empty *string* if it has no ID. It will return *false* if the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementID',
    },
    getElementInterior: {
        summary: 'This function allows you to retrieve the interior of any element. An interior is the current loaded place, 0 being outside.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element of which you\'d like to retrieve the interior' },
        ],
        returns: 'Returns an int for the interior if **theElement** is valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementInterior',
    },
    getElementLighting: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose lighting you want to retrieve.' },
        ],
        returns: 'Returns a float (0.0-0.5; 0 = dark; 0.5 = light) indicating the element\'s lighting, or *false* if invalid arguments were passed. This function will fail if called right after element creation.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementLighting',
    },
    getElementMatrix: {
        summary: 'This function gets an element\'s transform matrix. This contains 16 float values that multiplied to a point will give you the point transformed. It is most useful for matrix calculations such as calculating offsets. For further information, please refer to a tutorial of matrices in computer graphics programming.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which you wish to retrieve the matrix for.' },
            { name: 'legacy', isOptional: true, isVariadic: false, summary: 'Set to *false* to return correctly setup matrix (i.e. Last column in the first 3 rows set to zero).' },
        ],
        returns: 'Returns a multi-dimensional array (which can be transformed into a proper matrix class using *Matrix.create* method) containing a 4x4 matrix. Returns *false* if the element is not streamed in, and not a vehicle, ped or object.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementMatrix',
    },
    getElementModel: {
        summary: 'Returns the model ID of a given element. This can be a player/ped skin, a pickup model, an object model or a vehicle model.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to retrieve the model ID of.' },
        ],
        returns: 'Returns the model ID if successful, *false* otherwise. * For players/peds: A GTASA player model (skin) ID. See Character Skins. * For vehicles: The vehicle ID of the vehicle. * For objects: An int specifying the model id.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementModel',
    },
    getElementParent: {
        summary: 'This function is used to determine the parent of an *element*.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The child of the parent element you want returned.' },
        ],
        returns: 'This returns the parent as an *element*. It returns *false* if *theElement* is invalid, or is the root node.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementParent',
    },
};
