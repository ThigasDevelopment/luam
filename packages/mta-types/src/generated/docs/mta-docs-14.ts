import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_14: ApiDocumentationCatalog = {
    getDistanceBetweenPoints2D: {
        summary: 'This function returns the distance between two 2 dimensional points using the pythagorean\ntheorem.',
        parameters: [
            { name: 'x1', isOptional: false, isVariadic: false, summary: ': The X position of the first point' },
            { name: 'y1', isOptional: false, isVariadic: false, summary: ': The Y position of the first point' },
            { name: 'x2', isOptional: false, isVariadic: false, summary: ': The X position of the second point' },
            { name: 'y2', isOptional: false, isVariadic: false, summary: ': The Y position of the second point' },
        ],
        returns: 'returns a float containing the 2d distance between the two points. returns false if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDistanceBetweenPoints2D',
    },
    getDistanceBetweenPoints3D: {
        summary: 'This function returns the distance between two 3 dimensional points using the pythagorean\ntheorem.',
        parameters: [
            { name: 'x1', isOptional: false, isVariadic: false, summary: ': The X position of the first point' },
            { name: 'y1', isOptional: false, isVariadic: false, summary: ': The Y position of the first point' },
            { name: 'z1', isOptional: false, isVariadic: false, summary: ': The Z position of the first point' },
            { name: 'x2', isOptional: false, isVariadic: false, summary: ': The X position of the second point' },
            { name: 'y2', isOptional: false, isVariadic: false, summary: ': The Y position of the second point' },
            { name: 'z2', isOptional: false, isVariadic: false, summary: ': The Z position of the second point' },
        ],
        returns: 'returns a float containing the distance between the two points as a float. returns false if an argument passed was invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetDistanceBetweenPoints3D',
    },
    getEasingValue: {
        summary: 'Used for custom Lua based interpolation, returns the easing value (animation time to use\nin your custom interpolation) given a progress and an Easing|easing function.\nIn most cases, either moveObject or interpolateBetween can do the job. getEasingValue is\nonly provided in case you want to do your own custom interpolation based on easing.',
        parameters: [
            { name: 'fProgress', isOptional: false, isVariadic: false, summary: 'float between 0 and 1 indicating the interpolation progress (0 at the beginning of the interpolation, 1 at the end).' },
            { name: 'strEasingType', isOptional: false, isVariadic: false, summary: 'the Easing|easing function to use for the interpolation' },
            { name: 'fEasingPeriod', isOptional: true, isVariadic: false, summary: 'the period of the Easing|easing function (only some easing functions use this parameter)' },
            { name: 'fEasingAmplitude', isOptional: true, isVariadic: false, summary: 'the amplitude of the Easing|easing function (only some easing functions use this parameter)' },
            { name: 'fEasingOvershoot', isOptional: true, isVariadic: false, summary: 'the overshoot of the Easing|easing function (only some easing functions use this parameter)' },
        ],
        returns: 'returns fanimationtime the animation time given by the easing function (can be < 0 or > 1 since some easing|easing functions have overshoot or bounce/spring effects, false otherwise (error in parameters).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetEasingValue',
    },
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
        returns: 'returns float containing the effects speed, false if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetEffectSpeed',
    },
    getElementAlpha: {
        summary: 'This function returns the alpha (transparency) value for the specified element. This can\nbe a player, ped, object, vehicle or Element/Weapon|weapon.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose alpha you want to retrieve.' },
        ],
        returns: 'returns an integer (0-255; 0 = transparent) indicating the elements alpha, or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAlpha',
    },
    getElementAngularVelocity: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to retrieve the angular velocity from. Can be either a player, ped, object, vehicle or a Element/Weapon|custom weapon. Server side supports only vehicles currently.' },
        ],
        returns: 'returns three floats describing the x, y and z rotation',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAngularVelocity',
    },
    getElementAttachedOffsets: {
        summary: 'This function returns the offsets of an element that has been attached to another element\nusing attachElements.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The attached element.' },
        ],
        returns: 'returns 6 float|floats, of which the first 3 indicate the position offset (x, y, z), and the last 3 indicate the rotation offset (x, y, z), if successful. false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAttachedOffsets',
    },
    getElementAttachedTo: {
        summary: 'This function determines the element that the specified element is attached to.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you require the information for.' },
        ],
        returns: 'returns the element that the chosen element is attached to, or false if the element isnt attached to another element.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementAttachedTo',
    },
    getElementBoneMatrix: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to get the bone matrix on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone to get the matrix of. See Bone IDs.' },
        ],
        returns: 'returns a multi-dimensional array (which can be transformed into a proper matrix class using matrix.create method) containing a 4x4 matrix. returns false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBoneMatrix',
    },
    getElementBonePosition: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to get the bone position on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone to get the position of. See Bone IDs.' },
        ],
        returns: 'returns 3 float|floats, representing the x, y, z world position of the bone.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBonePosition',
    },
    getElementBoneRotation: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to get the bone rotation on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone to get the rotation of. See Bone IDs.' },
        ],
        returns: 'returns 3 float|floats, representing the yaw, pitch, roll rotation values.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBoneRotation',
    },
    getElementBoundingBox: {
        summary: 'This function returns the minimum and maximum coordinates of an elements bounding box.\nIt should be noted that the values returned are relative to the position of the element,\nand as such if you wish to get world coordinates for drawing, etc., you should retrieve\nthe position of the element and add the returned values onto that.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element whose bounding box we want to get.' },
        ],
        returns: '*returns min x, min y, min z, max x, max y, max z if the passed element is valid and streamed in, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementBoundingBox',
    },
    getElementByID: {
        summary: 'This function returns an element from the specified ID. If more than one element with the\nsame ID exists, only the first one in the order it appears in the XML tree will be\nreturned by this function.',
        parameters: [
            { name: 'id', isOptional: false, isVariadic: false, summary: 'The ID of the element as it appears in the XML file or as set by setElementID.' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'If there are two or more elements of the same ID it will return the element with the specified index starting at 0.' },
        ],
        returns: 'returns the element with the given id, or false if no such element exists.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementByID',
    },
    getElementByIndex: {
        summary: 'This function returns an element of the specified type with the specified index.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'the type of the element to be returned. Examples include player, vehicle, or a custom type.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'the elements index (0 for the first element, 1 for the second, etc).' },
        ],
        returns: 'returns the requested element, or false if it doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementByIndex',
    },
    getElementChild: {
        summary: 'This function returns one of the child elements of a given parent element. The child\nelement is selected by its index (0 for the first child, 1 for the second and so on).',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'the element above the one to be returned in the hierarchy.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'the elements index (0 for the first element, 1 for the second, etc).' },
        ],
        returns: 'returns the requested element if it exists, or false if it doesnt.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementChild',
    },
    getElementChildren: {
        summary: 'This function is used to retrieve a list of the child elements of a given parent element.\nNote that it will only return direct children and not elements that are further down the\nelement tree.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'Supply this argument with the parent of the children you want returned.' },
            { name: 'theType', isOptional: true, isVariadic: false, summary: 'The type of element you want a list of. This is the same as the tag name in the .map file, so this can be used with a custom element type if desired. Built in types are: player A player connected to the server ped A ped water A water polygon sound A playing sound vehicle A vehicle object An object pickup A pickup marker A marker colshape A collision shape blip A blip radararea A radar area team A team spawnpoint A spawnpoint remoteclient A remote client connected to the server console The server Console' },
        ],
        returns: 'this function returns a table that contains a list of elements that the parent has. if the element has no children, it will return an empy table. it will return false if the parent element does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementChildren',
    },
    getElementChildrenCount: {
        summary: 'This function returns the number of children an element has. Note that only the direct\nchildren are counted and not elements that are further down the element tree.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'the parent element' },
        ],
        returns: 'returns an int with the number of child elements, or false if the parent element does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementChildrenCount',
    },
    getElementCollisionsEnabled: {
        summary: 'This function indicates if a specific element is set to have collisions disabled. An\nelement without collisions does not interact with the physical environment and remains\nstatic.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element for which you want to check whether collisions are enabled' },
        ],
        returns: 'returns true if the collisions are enabled, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementCollisionsEnabled',
    },
    getElementColShape: {
        summary: 'Some elements have an associated colshape, for example Marker and Pickup. This function\nis used to get the associated colshape.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to get the colshape of' },
        ],
        returns: 'returns colshape of the element, false if not or an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementColShape',
    },
    getElementData: {
        summary: 'This function retrieves element data attached to an element under a certain key.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'This is the element with data you want to retrieve.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the element data entry you want to retrieve. (Maximum 31 characters.)' },
            { name: 'inherit', isOptional: true, isVariadic: false, summary: '- toggles whether or not the function should go up the hierarchy to find the requested key in case the specified element doesnt have it.' },
        ],
        returns: 'this function returns a variable containing the requested element data, or false if the element or the element data does not exist. when getting data corresponding to a xml attribute, this is always a string.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementData',
    },
    getElementDimension: {
        summary: 'This function allows you to retrieve the dimension of any element. The dimension\ndetermines what/who the element is visible to.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which youd like to retrieve the dimension of.' },
        ],
        returns: 'returns an integer for the dimension if theelement is valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementDimension',
    },
    getElementDistanceFromCentreOfMassToBaseOfModel: {
        summary: 'This function is used to retrieve the distance between a elements centre of mass to the\nbase of the model. This can be used to calculate the position the element has to be set\nto, to have it on ground level.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns a float with the distance, or false if the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementDistanceFromCentreOfMassToBaseOfModel',
    },
    getElementHealth: {
        summary: 'This function returns the current health for the specified element. This can be a player,\na ped, a vehicle, or an object.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The player or vehicle whose health you want to check.' },
        ],
        returns: 'returns a float indicating the elements health, or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementHealth',
    },
    getElementID: {
        summary: 'This function gets the ID of an element. This is the id attribute of the element and is a\nstring, NOT a number like a model ID, weapons ID or similar.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element from which to retrieve the ID.' },
        ],
        returns: 'this returns a string containing the element id. it will return an empty string if it has no id. it will return false if the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementID',
    },
    getElementInterior: {
        summary: 'This function allows you to retrieve the interior of any element. An interior is the\ncurrent loaded place, 0 being outside.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element of which youd like to retrieve the interior' },
        ],
        returns: 'returns an int for the interior if theelement is valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementInterior',
    },
    getElementLighting: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose lighting you want to retrieve.' },
        ],
        returns: 'returns a float (0.0-0.5; 0 = dark; 0.5 = light) indicating the elements lighting, or false if invalid arguments were passed. this function will fail if called right after element creation.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetElementLighting',
    },
};
