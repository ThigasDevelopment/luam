import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_17: ApiDocumentationCatalog = {
    getObjectProperty: {
        summary: '',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'the object you wish to get a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'the property you want to get the value of: * "all" - \'\'table\'\' with values of all properties below (OOP method: \'\'getProperties\'\')' },
        ],
        returns: 'on success: table for all, 3 float|floats for center_of_mass or float for other properties on failure: false',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetObjectProperty',
    },
    getObjectScale: {
        summary: 'This function returns the visible size of an object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: ': the object you wish to return the scale of.' },
        ],
        returns: '* three float values indicating the scale of the object on the x, y, and z axis if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetObjectScale',
    },
    getOcclusionsEnabled: {
        summary: 'This function is used to get occlusions enabled state.',
        parameters: [],
        returns: 'returns true if occlusions are enabled, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetOcclusionsEnabled',
    },
    getOriginalHandling: {
        summary: 'This function returns a table of the original vehicle handling. Use getVehicleHandling if\nyou wish to get the current handling of a vehicle, or getModelHandling for a specific\nvehicle model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The vehicle ID you wish to get the original handling from.' },
        ],
        returns: 'returns a table containing all the handling data, false otherwise. here a list of valid table properties and what they return:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetOriginalHandling',
    },
    getOriginalWeaponProperty: {
        summary: 'This function gets the original weapon property of the specified weapons specified weapon\ntype.',
        parameters: [
            { name: 'weaponID', isOptional: false, isVariadic: false, summary: 'or weaponName The ID or name of the weapon you want to get info of. Names can be:' },
            { name: 'weaponSkill', isOptional: false, isVariadic: false, summary: 'Either: pro, std or poor' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you want to get the value of: The following properties are get only:' },
        ],
        returns: 'on success: int: the weapon property on failure: bool: false if the passed arguments were invalid',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetOriginalWeaponProperty',
    },
    getPedAmmoInClip: {
        summary: 'This function returns an integer that contains the ammo in a specified peds weapon. See\nweapon|Weapon Info',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose ammo you want to check.' },
            { name: 'weaponSlot', isOptional: true, isVariadic: false, summary: 'an integer representing the weapon slot (set to the peds currently selected slot if not specified).' },
        ],
        returns: 'returns an int containing the amount of ammo in the specified peds currently selected or specified clip, or 0 if the ped specified is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedAmmoInClip',
    },
    getPedAnalogControlState: {
        summary: 'This function retrieves the analog control state of a ped, as set by\nsetPedAnalogControlState.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you wish to retrieve the control state of.' },
            { name: 'controlName', isOptional: false, isVariadic: false, summary: 'The control. See control names for a list of possible controls.' },
            { name: 'rawValue', isOptional: true, isVariadic: false, summary: 'A bool indicating if it should return the raw player input value (will always return script value for non-player peds).' },
        ],
        returns: 'returns a float between 0 (full release) and 1 (full push) indicating the amount the control is pushed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedAnalogControlState',
    },
    getPedAnimation: {
        summary: 'Gets the animation of a player or ped that was set using setPedAnimation.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to get the animations|animation of.' },
        ],
        returns: '```lua string block, string anim, int time, bool loop, bool updateposition, bool interruptable, bool freezelastframe, int blendtime, bool restoretaskonanimend ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedAnimation',
    },
    getPedArmor: {
        summary: 'This function returns the current armor of the specified ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose armor you want to check' },
        ],
        returns: 'a float with the armor, false if an invalid ped was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedArmor',
    },
    getPedBonePosition: {
        summary: 'Returns the 3D world coordinates of a specific bone of a given ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to inspect.' },
            { name: 'bone', isOptional: false, isVariadic: false, summary: 'the number of the bone to get the position of. 1 BONE_PELVIS1 2 BONE_PELVIS 3 BONE_SPINE1 4 BONE_UPPERTORSO 5 BONE_NECK 6 BONE_HEAD2 7 BONE_HEAD1 8 BONE_HEAD 21 BONE_RIGHTUPPERTORSO 22 BONE_RIGHTSHOULDER 23 BONE_RIGHTELBOW 24 BONE_RIGHTWRIST 25 BONE_RIGHTHAND 26 BONE_RIGHTTHUMB 31 BONE_LEFTUPPERTORSO 32 BONE_LEFTSHOULDER 33 BONE_LEFTELBOW 34 BONE_LEFTWRIST 35 BONE_LEFTHAND 36 BONE_LEFTTHUMB 41 BONE_LEFTHIP 42 BONE_LEFTKNEE 43 BONE_LEFTANKLE 44 BONE_LEFTFOOT 51 BONE_RIGHTHIP 52 BONE_RIGHTKNEE 53 BONE_RIGHTANKLE 54 BONE_RIGHTFOOT' },
        ],
        returns: 'returns the x, y, z world position of the bone.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedBonePosition',
    },
    getPedCameraRotation: {
        summary: 'This function gets the current camera rotation of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped to retrieve the camera rotation of.' },
        ],
        returns: 'returns the camera rotation of the ped in degrees if successful. returns false if an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedCameraRotation',
    },
    getPedClothes: {
        summary: 'This function is used to get the current clothes texture and model of a certain type on a\nped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose clothes you want to retrieve.' },
            { name: 'clothesType', isOptional: false, isVariadic: false, summary: 'The type/slot of clothing you want to get.' },
        ],
        returns: 'this function returns 2 string|strings, the clothes texture and model. the first return value will be false if this players clothes type is empty or an invalid player was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedClothes',
    },
    getPedContactElement: {
        summary: 'This function detects the element a ped is standing on. This can be a vehicle or an\nobject.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped of which you want to get the element he is standing on.' },
        ],
        returns: 'returns an object or a vehicle if the ped is standing on one, false if he is touching none or an invalid element was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedContactElement',
    },
    getPedControlState: {
        summary: 'Checks whether a ped or the localplayer has a certain control pressed.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to check.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'the control to get the status of. See control names for a list of valid names.' },
        ],
        returns: 'returns true if the ped is pressing the specified control, false if not or an invalid argument was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedControlState',
    },
    getPedFightingStyle: {
        summary: 'Retrieves the fighting style a player/ped is currently using.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose current fighting style ID you wish to retrieve.' },
        ],
        returns: 'returns the peds current fighting style as an integer id, false if it fails to retrieve a value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedFightingStyle',
    },
    getPedGravity: {
        summary: 'This function returns the current gravity for the specified ped. The default gravity is\n0.008.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose gravity you want to check.' },
        ],
        returns: 'returns a float indicating the peds gravity, or false if the ped is invalid. default value is 0.008.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedGravity',
    },
    getPedMoveState: {
        summary: 'This function returns the current move state for the specified ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose move state you want to know' },
        ],
        returns: 'returns a string indicating the peds move state, or false if the ped is not streamed in, the movement type is unknown, the ped is in a vehicle or the ped is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedMoveState',
    },
    getPedOccupiedVehicle: {
        summary: 'This function gets the vehicle that the ped is currently in or is trying to enter, if any.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose vehicle youre looking up.' },
        ],
        returns: 'returns the vehicle that the specified ped is in, or false if the ped is not in a vehicle or is an invalid ped.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedOccupiedVehicle',
    },
    getPedOccupiedVehicleSeat: {
        summary: 'This function gets the seat that a specific ped is sitting in in a vehicle.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose vehicle seat youre looking up.' },
        ],
        returns: '* returns an integer containing the number of the seat that the ped is currently in: ** 0: front-left ** 1: front-right ** 2: rear-left ** 3: rear-right returns false if the ped is on foot, or the ped doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedOccupiedVehicleSeat',
    },
    getPedOxygenLevel: {
        summary: 'This function returns the current oxygen level of the specified ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose oxygen level you want to check' },
        ],
        returns: 'a float with the oxygen level, false if an invalid ped was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedOxygenLevel',
    },
    getPedSimplestTask: {
        summary: 'This function is used to get the name of a specified peds current simplest task.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose task you want to retrieve.' },
        ],
        returns: 'returns a string representing the name of the peds simplest, active task.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedSimplestTask',
    },
    getPedsLODDistance: {
        summary: '',
        parameters: [],
        returns: 'this function returns a float containing the peds lod distance.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedsLODDistance',
    },
    getPedStat: {
        summary: 'This function returns the value of the specified statistic of a specific ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose stat you want to retrieve.' },
            { name: 'stat', isOptional: false, isVariadic: false, summary: ': A whole number determining the stat ID.' },
        ],
        returns: 'returns the value of the requested statistic.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedStat',
    },
    getPedTarget: {
        summary: 'This function is used to get the element a ped is currently targeting.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose target you want to retrieve.' },
        ],
        returns: 'returns the element thats being targeted, or false if there isnt one. this is only effective on physical gta elements, namely: * players * peds * vehicles * objects',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTarget',
    },
    getPedTargetCollision: {
        summary: 'This function allows retrieval of where a peds target is blocked. It will only be blocked\nif there is an obstacle within a peds target range.',
        parameters: [
            { name: 'targetingPed', isOptional: false, isVariadic: false, summary: 'This is the ped whose target collision you wish to retrieve' },
        ],
        returns: 'returns three floats, x,y,z, representing the position where the peds target collides, or false if it was unsuccessful.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTargetCollision',
    },
    getPedTargetEnd: {
        summary: 'This function allows retrieval of the position where a peds target range ends, when he is\naiming with a weapon.',
        parameters: [
            { name: 'targetingPed', isOptional: false, isVariadic: false, summary: 'the ped who is targeting whose target end you wish to retrieve' },
        ],
        returns: 'returns three floats, x,y,z, representing the position where the peds target ends according to his range, or false if it was unsuccessful.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTargetEnd',
    },
    getPedTargetStart: {
        summary: 'This function allows retrieval of the position a peds target range begins, when he is\naiming with a weapon.',
        parameters: [
            { name: 'targetingPed', isOptional: false, isVariadic: false, summary: 'The ped whose target start you wish to retrieve' },
        ],
        returns: 'returns three floats, x,y,z, representing the position where the peds target starts, or false if it was unsuccessful.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTargetStart',
    },
    getPedTask: {
        summary: 'This function is used to get any simple or complex task of a certain type for a ped.\nIt can provide feedback on all tasks relating to a ped. For example, while jumping,\ngetPedSimplestTask will return TASK_SIMPLE_IN_AIR. If you wanted to know specifically if\nthe player has jumped, you would use this function. If you did you will discover that\nwhile jumping Primary task 3 is TASK_COMPLEX_JUMP.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose task you want to retrieve.' },
            { name: 'priority', isOptional: false, isVariadic: false, summary: ': A string determining which set of tasks you want to retrieve it from. This must be either primary or secondary.' },
            { name: 'taskType', isOptional: false, isVariadic: false, summary: ': An integer value representing the task type (or slot) you want to get the task from. Types can be: PRIMARY TASKS 0 TASK_SECONDARY_ATTACK 1 TASK_SECONDARY_DUCK 2 TASK_SECONDARY_SAY 3 TASK_SECONDARY_FACIAL_COMPLEX 4 TASK_SECONDARY_PARTIAL_ANIM SECONDARY TASKS 5 TASK_SECONDARY_IK' },
        ],
        returns: 'returns the name of the most complex task. see list of player tasks for valid strings. returns false if invalid arguments are specified or if there is no task of the type specified. returns between 1 and 4 strings. the first string contains the name of the most complex task, with simpler sub-tasks being named in the following strings. see list of player tasks for valid strings. returns false if invalid arguments are specified or if there is no task of the type specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetPedTask',
    },
};
