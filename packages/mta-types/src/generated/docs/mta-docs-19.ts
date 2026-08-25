import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_19: ApiDocumentationCatalog = {
    getOcclusionsEnabled: {
        summary: 'This function is used to get "occlusions enabled" state.',
        parameters: [],
        returns: 'Returns *true* if occlusions are enabled, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetOcclusionsEnabled',
    },
    getOriginalHandling: {
        summary: 'This function returns a table of the original vehicle handling. Use getVehicleHandling if you wish to get the current handling of a vehicle, or getModelHandling for a specific vehicle model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The vehicle ID you wish to get the original handling from.' },
        ],
        returns: 'Returns a *table* containing all the handling data, *false* otherwise. Here a list of valid table properties and what they return:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetOriginalHandling',
    },
    getOriginalWeaponProperty: {
        summary: 'This function gets the original weapon property of the specified weapons specified weapon type.',
        parameters: [
            { name: 'weaponName', isOptional: false, isVariadic: false, summary: '' },
            { name: 'weaponSkill', isOptional: false, isVariadic: false, summary: 'Either: "pro", "std" or "poor"' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you want to get the value of:' },
        ],
        returns: 'On success: **int:** The weapon property On failure: **bool:** False if the passed arguments were invalid',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetOriginalWeaponProperty',
    },
    getPedAmmoInClip: {
        summary: 'This function returns an integer that contains the ammo in a specified ped\'s weapon. See Weapon Info',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose ammo you want to check.' },
            { name: 'weaponSlot', isOptional: true, isVariadic: false, summary: 'an integer representing the weapon slot (set to the ped\'s currently selected slot if not specified).' },
        ],
        returns: 'Returns an int containing the amount of ammo in the specified ped\'s currently selected or specified clip, or 0 if the ped specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedAmmoInClip',
    },
    getPedAnalogControlState: {
        summary: 'This function retrieves the analog control state of a ped, as set by setPedAnalogControlState.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you wish to retrieve the control state of.' },
            { name: 'controlName', isOptional: false, isVariadic: false, summary: 'The control. See control names for a list of possible controls.' },
            { name: 'rawValue', isOptional: true, isVariadic: false, summary: 'A bool indicating if it should return the raw player input value (will always return script value for non-player peds).' },
        ],
        returns: 'Returns a float between 0 (full release) and 1 (full push) indicating the amount the control is pushed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedAnalogControlState',
    },
    getPedAnimation: {
        summary: 'Gets the animation of a player or ped that was set using setPedAnimation.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to get the animation of.' },
        ],
        returns: 'The function returns 9 values in the same order as required by setPedAnimation: ```lua string block, string anim, int time, bool loop, bool updatePosition, bool interruptable, bool freezeLastFrame, int blendTime, bool restoreTaskOnAnimEnd ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedAnimation',
    },
    getPedArmor: {
        summary: 'This function returns the current armor of the specified ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose armor you want to check' },
        ],
        returns: 'A *float* with the armor, *false* if an invalid ped was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedArmor',
    },
    getPedBonePosition: {
        summary: 'Returns the 3D world coordinates of a specific bone of a given ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to inspect.' },
            { name: 'bone', isOptional: false, isVariadic: false, summary: 'the number of the bone to get the position of.' },
        ],
        returns: 'Returns the x, y, z world position of the bone.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedBonePosition',
    },
    getPedCameraRotation: {
        summary: 'This function gets the current camera rotation of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped to retrieve the camera rotation of.' },
        ],
        returns: 'Returns the camera rotation of the ped in degrees if successful. Returns *false* if an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedCameraRotation',
    },
    getPedClothes: {
        summary: 'This function is used to get the current clothes texture and model of a certain type on a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose clothes you want to retrieve.' },
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: 'The type/slot of clothing you want to get.' },
        ],
        returns: 'This function returns 2 strings, the clothes texture and model. The first return value will be *false* if this player\'s clothes type is empty or an invalid player was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedClothes',
    },
    getPedContactElement: {
        summary: 'This function detects the element a ped is standing on. This can be a vehicle or an object.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped of which you want to get the element he is standing on.' },
        ],
        returns: 'Returns an object or a vehicle if the ped is standing on one, *false* if he is touching none or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedContactElement',
    },
    getPedControlState: {
        summary: 'Checks whether a ped or the localplayer has a certain control pressed.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'the control to get the status of. See control names for a list of valid names.' },
        ],
        returns: 'Returns *true* if the ped is pressing the specified control, *false* if not or an invalid argument was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedControlState',
    },
    getPedFightingStyle: {
        summary: 'Retrieves the fighting style a player/ped is currently using.\nFunction also added client-side.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose current fighting style ID you wish to retrieve.' },
        ],
        returns: 'Returns the ped\'s current fighting style as an integer ID, *false* if it fails to retrieve a value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedFightingStyle',
    },
    getPedGravity: {
        summary: 'This function returns the current gravity for the specified ped. The default gravity is 0.008.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose gravity you want to check.' },
        ],
        returns: 'Returns a float indicating the ped\'s gravity, or *false* if the ped is invalid. Default value is 0.008.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedGravity',
    },
    getPedMoveState: {
        summary: 'This function returns the current move state for the specified ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose move state you want to know' },
        ],
        returns: 'Returns a string indicating the ped\'s move state, or *false* if the ped is not streamed in, the movement type is unknown, the ped is in a vehicle or the ped is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedMoveState',
    },
    getPedOccupiedVehicle: {
        summary: 'This function gets the vehicle that the ped is currently in or is trying to enter, if any.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose vehicle you\'re looking up.' },
        ],
        returns: 'Returns the vehicle that the specified ped is in, or *false* if the ped is not in a vehicle or is an invalid ped.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedOccupiedVehicle',
    },
    getPedOccupiedVehicleSeat: {
        summary: 'This function gets the seat that a specific ped is sitting in in a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose vehicle seat you\'re looking up.' },
        ],
        returns: '* Returns an integer containing the number of the seat that the ped is currently in: ** **0:** Front-left ** **1:** Front-right ** **2:** Rear-left ** **3:** Rear-right Returns *false* if the ped is on foot, or the ped doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedOccupiedVehicleSeat',
    },
    getPedOxygenLevel: {
        summary: 'This function returns the current oxygen level of the specified ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose oxygen level you want to check' },
        ],
        returns: 'A *float* with the oxygen level, *false* if an invalid ped was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedOxygenLevel',
    },
    getPedSimplestTask: {
        summary: 'This function is used to get the name of a specified ped\'s current simplest task.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose task you want to retrieve.' },
        ],
        returns: 'Returns a string representing the name of the ped\'s simplest, active task.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedSimplestTask',
    },
    getPedsLODDistance: {
        summary: 'This function gets the peds LOD distance.',
        parameters: [],
        returns: 'This function returns a *float* containing the peds LOD distance.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedsLODDistance',
    },
    getPedStat: {
        summary: 'This function returns the value of the specified statistic of a specific ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose stat you want to retrieve.' },
            { name: 'stat', isOptional: false, isVariadic: false, summary: 'A whole number determining the stat ID.' },
        ],
        returns: 'Returns the value of the requested statistic.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedStat',
    },
    getPedTarget: {
        summary: 'This function is used to get the element a ped is currently targeting.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose target you want to retrieve.' },
        ],
        returns: 'Returns the element that\'s being targeted, or *false* if there isn\'t one. This is only effective on physical GTA elements, namely: * Players * Peds * Vehicles * Objects',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTarget',
    },
    getPedTargetCollision: {
        summary: 'This function allows retrieval of where a ped\'s target is blocked. It will only be blocked if there is an obstacle within a ped\'s target range.',
        parameters: [
            { name: 'targetingPed', isOptional: false, isVariadic: false, summary: 'This is the ped whose target collision you wish to retrieve' },
        ],
        returns: 'Returns three floats, *x*,*y*,*z*, representing the position where the ped\'s target collides, or *false* if it was unsuccessful.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTargetCollision',
    },
    getPedTargetEnd: {
        summary: 'This function allows retrieval of the position where a ped\'s target range ends, when he is aiming with a weapon.',
        parameters: [
            { name: 'targetingPed', isOptional: false, isVariadic: false, summary: 'the ped who is targeting whose target end you wish to retrieve' },
        ],
        returns: 'Returns three floats, *x*,*y*,*z*, representing the position where the ped\'s target ends according to his range, or *false* if it was unsuccessful.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTargetEnd',
    },
    getPedTargetStart: {
        summary: 'This function allows retrieval of the position a ped\'s target range begins, when he is aiming with a weapon.',
        parameters: [
            { name: 'targetingPed', isOptional: false, isVariadic: false, summary: 'The ped whose target start you wish to retrieve' },
        ],
        returns: 'Returns three floats, x,y,z, representing the position where the ped\'s target starts, or *false* if it was unsuccessful.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTargetStart',
    },
    getPedTask: {
        summary: 'This function is used to get any simple or complex task of a certain type for a ped.\n\nIt can provide feedback on all tasks relating to a ped. For example, while jumping, getPedSimplestTask will return TASK_SIMPLE_IN_AIR. If you wanted to know specifically if the player has jumped, you would use this function. If you did you will discover that while jumping Primary task 3 is TASK_COMPLEX_JUMP.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose task you want to retrieve.' },
            { name: 'priority', isOptional: false, isVariadic: false, summary: 'A string determining which set of tasks you want to retrieve it from. This must be either "primary" or "secondary".' },
            { name: 'taskType', isOptional: false, isVariadic: false, summary: 'An integer value representing the task type (or slot) you want to get the task from. Types can be:' },
        ],
        returns: 'Returns the name of the most complex task. See list of player tasks for valid strings. Returns *false* if invalid arguments are specified or if there is no task of the type specified. Returns between 1 and 4 strings. The first string contains the name of the most complex task, with simpler sub-tasks being named in the following strings. See list of player tasks for valid strings. Returns *false* if invalid arguments are specified or if there is no task of the type specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTask',
    },
    getPedTotalAmmo: {
        summary: 'This function returns an integer that contains the total ammo in a specified ped\'s weapon. See Weapon Info',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose ammo you want to check.' },
            { name: 'weaponSlot', isOptional: true, isVariadic: false, summary: 'an integer representing the weapon slot (set to the ped\'s current slot if not given)' },
        ],
        returns: 'Returns an int containing the total amount of ammo for the specified ped\'s weapon, or 0 if the ped specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTotalAmmo',
    },
    getPedVoice: {
        summary: 'Gets the current voice of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped to get the voice of.' },
        ],
        returns: 'If successul, returns the current voice type name and the voice name of the ped (see ped voices for possible names). Returns *false* in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedVoice',
    },
    getPedWalkingStyle: {
        summary: 'Returns the walking style ID of a ped. This ID determines the set of animations that is used for walking, running etc.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose walking style to retrieve.' },
        ],
        returns: 'Returns the walking style ID if successful, *false* otherwise. The possible walking styles are as follows:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedWalkingStyle',
    },
};
