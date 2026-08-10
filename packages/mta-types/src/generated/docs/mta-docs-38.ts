import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_38: ApiDocumentationCatalog = {
    setColorFilter: {
        summary: '',
        parameters: [
            { name: 'aRed', isOptional: false, isVariadic: false, summary: 'The amount of red (0-255).' },
            { name: 'aGreen', isOptional: false, isVariadic: false, summary: 'The amount of green (0-255).' },
            { name: 'aBlue', isOptional: false, isVariadic: false, summary: 'The amount of blue (0-255).' },
            { name: 'aAlpha', isOptional: false, isVariadic: false, summary: 'The amount of alpha (0-255).' },
            { name: 'bRed', isOptional: false, isVariadic: false, summary: 'The amount of red (0-255).' },
            { name: 'bGreen', isOptional: false, isVariadic: false, summary: 'The amount of green (0-255).' },
            { name: 'bBlue', isOptional: false, isVariadic: false, summary: 'The amount of blue (0-255).' },
            { name: 'bAlpha', isOptional: false, isVariadic: false, summary: 'The amount of alpha (0-255).' },
        ],
        returns: 'returns true if the color filter was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColorFilter',
    },
    setColPolygonHeight: {
        summary: 'By default, a colshape polygon is infinitely tall.',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon.' },
            { name: 'floor', isOptional: false, isVariadic: false, summary: 'The polygon floor (lowest Z coordinate). Parse false to reset this value to 0.' },
            { name: 'ceil', isOptional: false, isVariadic: false, summary: 'The polygon ceiling (highest Z coordinate). Parse false to reset this value to infinitely tall.' },
        ],
        returns: 'returns true if the polygon was changed, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColPolygonHeight',
    },
    setColPolygonPointPosition: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape polygon you wish to change.' },
            { name: 'index', isOptional: false, isVariadic: false, summary: 'The index of the point you wish to change. The points are indexed in order, with 1 being the first bound point.' },
            { name: 'fX', isOptional: false, isVariadic: false, summary: 'The new X position of the bound point.' },
            { name: 'fY', isOptional: false, isVariadic: false, summary: 'The new Y position of the bound point.' },
        ],
        returns: 'returns true if the polygon was changed, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColPolygonPointPosition',
    },
    setColShapeRadius: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to change the radius of.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: 'The radius you want to set.' },
        ],
        returns: 'returns true if the radius was changed, or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColShapeRadius',
    },
    setColShapeSize: {
        summary: '',
        parameters: [
            { name: 'shape', isOptional: false, isVariadic: false, summary: 'The colshape you wish to change the size of.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'The collision rectangles width.' },
            { name: 'depth', isOptional: false, isVariadic: false, summary: 'The collision cuboids depth.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'The collision tubess height.' },
        ],
        returns: 'returns true if the size was changed, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetColShapeSize',
    },
    setControlState: {
        summary: 'Sets a state of a specified players control, as if they pressed or released it.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish to set the control state of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to set the state of. See control names for a list of possible controls.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether or not the key will be set to pressed or not.' },
        ],
        returns: 'returns true if the control state was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetControlState',
    },
    setCoronaReflectionEnabled: {
        summary: '',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'the corona marker that you wish set visibility of corona reflection' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'whenever corona reflection should be visible' },
        ],
        returns: 'returns true if setmarkertype|marker type is corona, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCoronaReflectionEnabled',
    },
    setCoronaReflectionsEnabled: {
        summary: '',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: '0 : disabled 1 : enabled (will be visible during rain) 2 : force enabled (will be visible even if there is no rain)' },
        ],
        returns: 'returns true if passed arguments are correct, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCoronaReflectionsEnabled',
    },
    setCursorAlpha: {
        summary: 'This function is used to change alpha (transparency) from the clients cursor.',
        parameters: [
            { name: 'alpha', isOptional: false, isVariadic: false, summary: ': The alpha value to set. Value can be 0-255, where 255 is fully opaque and 0 is fully transparent.' },
        ],
        returns: 'returns true if the new alpha value was set, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCursorAlpha',
    },
    setCursorPosition: {
        summary: 'This function sets the current position of the mouse cursor.',
        parameters: [
            { name: 'cursorX', isOptional: false, isVariadic: false, summary: 'Position over the X axis' },
            { name: 'cursorY', isOptional: false, isVariadic: false, summary: 'Position over the Y axis' },
        ],
        returns: 'returns true if the position has been successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetCursorPosition',
    },
    setDebugViewActive: {
        summary: 'This function enables or disables the debug window.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'true if debug window should be visible, false otherwise.' },
        ],
        returns: 'returns true, false if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDebugViewActive',
    },
    setDevelopmentMode: {
        summary: 'This function is used to set the development mode. Setting development mode allows access\nto special commands which can assist with script debugging.\nClient-side development mode commands:\n* Client_Commands#showcol|showcol: Enables colshapes to be viewed as a wireframe object.\n* Client_Commands#showsound|showsound: Enables world sound ids to be printed in the debug\noutput window.\nShared development mode functions:\n* debugSleep: Sets the freeze time for the client/server.',
        parameters: [
            { name: 'enable', isOptional: false, isVariadic: false, summary: ': A boolean to indicate whether development mode is on (true) or off (false)' },
            { name: 'enableWeb', isOptional: true, isVariadic: false, summary: ': A boolean to indicate whether browser debug messages will be filtered (false) or not (true)' },
        ],
        returns: 'returns true if the mode was set correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDevelopmentMode',
    },
    setEffectDensity: {
        summary: 'This function sets the density of a specified effect.\nThe limit is 1 for Low, 1.5 for Medium, and 2 for High/Very high.|true',
        parameters: [
            { name: 'theEffect', isOptional: false, isVariadic: false, summary: 'The effect to change the speed of.' },
            { name: 'density', isOptional: false, isVariadic: false, summary: 'The level of density (from 0 to 2).' },
        ],
        returns: 'returns true if the density was succesfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetEffectDensity',
    },
    setEffectSpeed: {
        summary: 'This function sets the speed of a specified effect.',
        parameters: [
            { name: 'theEffect', isOptional: false, isVariadic: false, summary: 'The effect to change the speed of.' },
            { name: 'speed', isOptional: false, isVariadic: false, summary: 'The speed to set.' },
        ],
        returns: 'returns true if the effect speed was succesfuly changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetEffectSpeed',
    },
    setElementAlpha: {
        summary: 'This function sets the alpha (transparency) value for the specified element. This can be\na player, ped, object, vehicle or Element/Weapon|weapon.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose alpha you want to set.' },
            { name: 'alpha', isOptional: false, isVariadic: false, summary: 'The alpha value to set. Values are 0-255, where 255 is fully opaque and 0 is fully transparent. Note Objects are fully transparent at 140.' },
        ],
        returns: 'returns true or false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementAlpha',
    },
    setElementAngularVelocity: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to apply the spin to. Can be either a player, ped, object, vehicle or a Element/Weapon|custom weapon.' },
            { name: 'rx', isOptional: false, isVariadic: false, summary: 'velocity around the X axis' },
            { name: 'ry', isOptional: false, isVariadic: false, summary: 'velocity around the Y axis' },
            { name: 'rz', isOptional: false, isVariadic: false, summary: 'velocity around the Z axis' },
        ],
        returns: 'returns true if it was succesful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementAngularVelocity',
    },
    setElementAttachedOffsets: {
        summary: 'This function updates the offsets of an element that has been attached to another element\nusing attachElements.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The attached element.' },
            { name: 'xPosOffset', isOptional: true, isVariadic: false, summary: 'The x offset, if you want the elements to be a certain distance from one another (default 0).' },
            { name: 'yPosOffset', isOptional: true, isVariadic: false, summary: 'The y offset (default 0).' },
            { name: 'zPosOffset', isOptional: true, isVariadic: false, summary: 'The z offset (default 0).' },
            { name: 'xRotOffset', isOptional: true, isVariadic: false, summary: 'The x rotation offset (default 0).' },
            { name: 'yRotOffset', isOptional: true, isVariadic: false, summary: 'The y rotation offset (default 0).' },
            { name: 'zRotOffset', isOptional: true, isVariadic: false, summary: 'The z rotation offset (default 0).' },
        ],
        returns: 'returns true if the attaching process was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementAttachedOffsets',
    },
    setElementBoneMatrix: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to set the bone matrix on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone. See Bone IDs.' },
            { name: 'matrix', isOptional: false, isVariadic: false, summary: 'the MTA matrix to set.' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementBoneMatrix',
    },
    setElementBonePosition: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the Element|element to set the bone position on.' },
            { name: 'bone', isOptional: false, isVariadic: false, summary: 'the ID of the bone to set the position of. See Bone IDs.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The X coordinate of the destination.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The Y coordinate of the destination.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The Z coordinate of the destination.' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementBonePosition',
    },
    setElementBoneRotation: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to set the bone rotation on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'The ID of the bone to set the rotation of. See Bone IDs.' },
            { name: 'yaw', isOptional: false, isVariadic: false, summary: 'The yaw rotation value.' },
            { name: 'pitch', isOptional: false, isVariadic: false, summary: 'The pitch rotation value.' },
            { name: 'roll', isOptional: false, isVariadic: false, summary: 'The roll rotation value.' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementBoneRotation',
    },
    setElementCallPropagationEnabled: {
        summary: 'This function enables/disables call propagation on a certain element. Look at the example\nfor a practical application.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose propagation behaviour youd like to change' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'Whether propagation should be enabled or not' },
        ],
        returns: 'returns true, if the propagation behaviour has been changed successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementCallPropagationEnabled',
    },
    setElementCollidableWith: {
        summary: 'This function can be used to set an element to collide with another element. An element\nwith collisions disabled does not interact physically with the other element.\n\nNote: You can only use this function with the element types listed below.\n*Player\n*Ped\n*Vehicle\n*Object\n* Element/Weapon|Weapon',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which colliding you want to change' },
            { name: 'withElement', isOptional: false, isVariadic: false, summary: 'The other element you wish the first entity to collide with' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean to indicate whether elements should be able to collide with eachother (true) or not (false)' },
        ],
        returns: 'returns true if the collisions were set succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementCollidableWith',
    },
    setElementCollisionsEnabled: {
        summary: 'This function can disable or enable an elements collisions. An element without collisions\ndoes not interact with the physical environment and remains static.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to set the collisions of' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean to indicate whether collisions are enabled (true) or disabled (false)' },
        ],
        returns: 'returns true if the collisions were set succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementCollisionsEnabled',
    },
};
