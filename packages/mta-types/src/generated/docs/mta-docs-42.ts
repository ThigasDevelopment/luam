import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_42: ApiDocumentationCatalog = {
    setDiscordRichPresenceEndTime: {
        summary: 'This function sets the remaining time of Discord Rich Presence.',
        parameters: [
            { name: 'seconds', isOptional: false, isVariadic: false, summary: 'an integer representing the number of seconds that are remaining. If 0, or lower than the start time (setDiscordRichPresenceStartTime) the timer will not be displayed.' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresenceEndTime',
    },
    setDiscordRichPresencePartySize: {
        summary: 'This function sets the party size of Discord Rich Presence.',
        parameters: [
            { name: 'size', isOptional: false, isVariadic: false, summary: 'an integer representing the current party size.' },
            { name: 'max', isOptional: false, isVariadic: false, summary: 'an integer representing the maximum party size.' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresencePartySize',
    },
    setDiscordRichPresenceSmallAsset: {
        summary: 'Using this function, you can set the small image asset of the application. The maximum size of assets is *1024x1024*, the minimum *512x512*.',
        parameters: [
            { name: 'assetImage', isOptional: false, isVariadic: false, summary: 'a string containing the key of the small image asset you uploaded to your application\'s asset list.' },
            { name: 'text', isOptional: false, isVariadic: false, summary: 'a string containing the hover text of the small image asset.' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresenceSmallAsset',
    },
    setDiscordRichPresenceStartTime: {
        summary: 'This function sets the elapsed time of Discord Rich Presence.',
        parameters: [
            { name: 'seconds', isOptional: false, isVariadic: false, summary: 'an integer representing the number of seconds that has elapsed. If 0, the timer will not be displayed.' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresenceStartTime',
    },
    setDiscordRichPresenceState: {
        summary: 'This function sets the status of the Discord Rich Presence application.',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'a string containing the status text' },
        ],
        returns: 'Returns *true* if function succeeds, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetDiscordRichPresenceState',
    },
    setEffectDensity: {
        summary: 'This function sets the density of a specified effect.',
        parameters: [
            { name: 'theEffect', isOptional: false, isVariadic: false, summary: 'The effect to change the speed of.' },
            { name: 'density', isOptional: false, isVariadic: false, summary: 'The level of density (from 0 to 2).' },
        ],
        returns: 'Returns *true* if the density was succesfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetEffectDensity',
    },
    setEffectSpeed: {
        summary: 'This function sets the speed of a specified effect.',
        parameters: [
            { name: 'theEffect', isOptional: false, isVariadic: false, summary: 'The effect to change the speed of.' },
            { name: 'speed', isOptional: false, isVariadic: false, summary: 'The speed to set.' },
        ],
        returns: 'Returns *true* if the effect speed was succesfuly changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetEffectSpeed',
    },
    setElementAlpha: {
        summary: 'This function sets the alpha (transparency) value for the specified element. This can be a player, ped, object, vehicle or weapon.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose alpha you want to set.' },
            { name: 'alpha', isOptional: false, isVariadic: false, summary: 'The alpha value to set. Values are 0-255, where 255 is fully opaque and 0 is fully transparent.' },
        ],
        returns: 'Returns *true* or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementAlpha',
    },
    setElementAngularVelocity: {
        summary: 'Sets the angular velocity of a specified, supported element (Applies a spin to it).',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to apply the spin to. Can be either a player, ped, object, vehicle or a custom weapon.' },
            { name: 'rx', isOptional: false, isVariadic: false, summary: 'velocity around the X axis' },
            { name: 'ry', isOptional: false, isVariadic: false, summary: 'velocity around the Y axis' },
            { name: 'rz', isOptional: false, isVariadic: false, summary: 'velocity around the Z axis' },
        ],
        returns: 'Returns *true* if it was succesful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementAngularVelocity',
    },
    setElementAttachedOffsets: {
        summary: 'This function updates the offsets of an element that has been attached to another element using attachElements.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The attached element.' },
            { name: 'xPosOffset', isOptional: true, isVariadic: false, summary: 'The x offset, if you want the elements to be a certain distance from one another (default 0).' },
            { name: 'yPosOffset', isOptional: true, isVariadic: false, summary: 'The y offset (default 0).' },
            { name: 'zPosOffset', isOptional: true, isVariadic: false, summary: 'The z offset (default 0).' },
            { name: 'xRotOffset', isOptional: true, isVariadic: false, summary: 'The x rotation offset (default 0).' },
            { name: 'yRotOffset', isOptional: true, isVariadic: false, summary: 'The y rotation offset (default 0).' },
            { name: 'zRotOffset', isOptional: true, isVariadic: false, summary: 'The z rotation offset (default 0).' },
        ],
        returns: 'Returns *true* if the attaching process was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementAttachedOffsets',
    },
    setElementBoneMatrix: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to set the bone matrix on.' },
            { name: 'boneId', isOptional: false, isVariadic: false, summary: 'the ID of the bone. See Bone IDs.' },
            { name: 'matrix', isOptional: false, isVariadic: false, summary: 'the MTA matrix to set.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementBoneMatrix',
    },
    setElementBonePosition: {
        summary: '',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to set the bone position on.' },
            { name: 'bone', isOptional: false, isVariadic: false, summary: 'the ID of the bone to set the position of. See Bone IDs.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The X coordinate of the destination.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The Y coordinate of the destination.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The Z coordinate of the destination.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementBonePosition',
    },
    setElementBoneQuaternion: {
        summary: 'This function determines how a particular bone rotates in relation to the element.\n\nThe use of [https://en.wikipedia.org/wiki/Quaternion quaternions] are more effective and do not generate issues like gimbal lock that might arise with [https://en.wikipedia.org/wiki/Euler_angles Euler angles], so they are a preferable choice for rotation.',
        parameters: [
            { name: 'ped', isOptional: false, isVariadic: false, summary: 'The element (ped or player) on which the bone\'s rotation will be set.' },
            { name: 'bone', isOptional: false, isVariadic: false, summary: 'The ID of the bone to set the quaternion of.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The quaternion\'s coefficient of the 𝑖 component.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The quaternion\'s coefficient of the 𝑗 component.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The quaternion\'s coefficient of the 𝑘 component.' },
            { name: 'w', isOptional: false, isVariadic: false, summary: 'The real part of the quaternion.' },
        ],
        returns: 'Returns *true* if the set was successful, otherwise returns an error message and returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementBoneQuaternion',
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
        returns: 'Returns *true* if the function was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementBoneRotation',
    },
    setElementCallPropagationEnabled: {
        summary: 'This function enables/disables call propagation on a certain element. Look at the example for a practical application.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose propagation behaviour you\'d like to change' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'Whether propagation should be enabled or not' },
        ],
        returns: 'Returns *true*, if the propagation behaviour has been changed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementCallPropagationEnabled',
    },
    setElementCollidableWith: {
        summary: 'This function can be used to set an element to collide with another element. An element with collisions disabled does not interact physically with the other element.\n\n**Note:** You can only use this function with the element types listed below.\n*Player\n*Ped\n*Vehicle\n*Object',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which colliding you want to change' },
            { name: 'withElement', isOptional: false, isVariadic: false, summary: 'The other element you wish the first entity to collide with' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean to indicate whether elements should be able to collide with eachother (*true*) or not (*false*)' },
        ],
        returns: 'Returns *true* if the collisions were set succesfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementCollidableWith',
    },
    setElementCollisionsEnabled: {
        summary: 'This function can disable or enable an element\'s collisions. An element without collisions does not interact with the physical environment and remains static.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to set the collisions of' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean to indicate whether collisions are enabled (*true*) or disabled (*false*)' },
        ],
        returns: 'Returns *true* if the collisions were set succesfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementCollisionsEnabled',
    },
    setElementData: {
        summary: 'This function stores element data under a certain key, attached to an element. Element data set using this is then synced with all clients and the server. The data can contain server-created elements, but you should avoid passing data that is not able to be synced such as xmlnodes, acls, aclgroups etc.\n\nAs element data is synced to all clients, it can generate a lot of network traffic and be heavy on performance. Events are much more efficient for sending data from a client to the server only, or from the server to a specific client.\n\nUsage of element data should be discouraged where your goal can be achieved with events like above, and tables for storing and retrieving data.\n\nA subscription mode has been introduced for setElementData serverside. When setting data in subscription mode, only clients that are added through addElementDataSubscriber will receive the data, which is good for performance.\nNote this mode only works when setting element data serverside. Setting data clientside still sends the update to all clients if \'synchronize\' is set to true.\n|20477',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you wish to attach the data to.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key you wish to store the data under. (Maximum 128 characters.)' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you wish to store. See element data for a list of acceptable datatypes.' },
            { name: 'syncMode', isOptional: true, isVariadic: false, summary: 'Synchronization mode.' },
            { name: 'clientChangesPolicy', isOptional: true, isVariadic: false, summary: 'Client changes policy.' },
        ],
        returns: 'Returns *true* if the data was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementData',
    },
    setElementDimension: {
        summary: 'This function allows you to set the dimension of an element. See Dimension for the in-depth explanation and the list of valid element types.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which you\'d like to set the dimension of.' },
            { name: 'dimension', isOptional: false, isVariadic: false, summary: 'An integer representing the dimension ID. You can also use **-1** to make the element visible in all dimensions (only valid to objects). Valid values are 0 to 65535.' },
        ],
        returns: 'Returns *true* if **theElement** and **dimension** are valid, *false* otherwise. Also returns false if **theElement** is a player and it\'s not alive.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementDimension',
    },
    setElementDoubleSided: {
        summary: 'This function allows you to set the double-sidedness of an element\'s model. When an element\'s model is double-sided, it\'s back facing triangles become visible.\n\nPossible uses of double-sidedness are: Elimination of invisible walls, using buildings as enclosures, using inverted landmasses as large pits or to make cave networks. It can also remove the need to add extra triangles to custom models when trying to make them appear solid from all directions.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which you\'d like to set the double-sidedness of.' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set to true/false to enable/disable double-sidedness.' },
        ],
        returns: 'Returns *true* if **theElement** is valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementDoubleSided',
    },
    setElementFrozen: {
        summary: 'This function freezes an element (stops it in its position and disables movement) or unfreezes it.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose freeze status we want to change.' },
            { name: 'freezeStatus', isOptional: false, isVariadic: false, summary: 'A boolean denoting whether we want to freeze (*true*) or unfreeze (*false*) it.' },
        ],
        returns: 'Returns *true* if the element was frozen, *false* if it wasn\'t or if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementFrozen',
    },
    setElementHealth: {
        summary: 'This function sets the health for the specified element. This can be a ped, object or a vehicle.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The ped, vehicle or object whose health you want to set.' },
            { name: 'newHealth', isOptional: false, isVariadic: false, summary: 'A float indicating the new health to set for the element.' },
        ],
        returns: 'Returns *true* if the new health was set successfully, or *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementHealth',
    },
    setElementID: {
        summary: 'This function sets the ID of an element to a string. This can be anything from an identifying number, to a name.\nYou can only change the ID of an element clientside if that element has been created clientside as well.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to set the ID of.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The new ID for theElement.' },
        ],
        returns: 'This returns *true* if successful. It will return *false* if **theElement** is invalid, or does not exist, or if **name** is invalid, or is not a string.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementID',
    },
    setElementInterior: {
        summary: 'This function allows you to set the interior of any element. An interior is the current loaded place, 0 being outside.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which you\'d like to set the interior of.' },
            { name: 'interior', isOptional: false, isVariadic: false, summary: 'The interior you want to set the element to. Valid values are 0 to 255.' },
            { name: 'x', isOptional: true, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: true, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: true, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
        ],
        returns: 'Returns *true* if **theElement** and **interior** are valid arguments, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetElementInterior',
    },
};
