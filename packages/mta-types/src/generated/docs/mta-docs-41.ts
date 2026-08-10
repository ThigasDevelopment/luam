import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_41: ApiDocumentationCatalog = {
    setObjectScale: {
        summary: 'This function changes the visible size of an object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: ': the object you wish to change the scale of.' },
            { name: 'scale', isOptional: false, isVariadic: false, summary: ': a float containing the new scale. 1.0 is the standard scale, with 0.5 being half the size and 2.0 being twice the size. If the scaleY is set, this will be scaleX.' },
            { name: 'scaleY', isOptional: true, isVariadic: false, summary: ': a float containing the new scale on the Y axis' },
            { name: 'scaleZ', isOptional: true, isVariadic: false, summary: ': a float containing the new scale on the Z axis' },
        ],
        returns: '* true if the scale was set properly. * false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetObjectScale',
    },
    setOcclusionsEnabled: {
        summary: 'This function is used to enable or disable occlusions. Occlusions are used by GTA to\nenhance performance by hiding objects that are (normally) obscured by certain large\nbuildings. However when removeWorldModel is used they may also have the undesired effect\nof making parts of the map disappear. Disabling occlusions will fix that.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A bool specifying if GTA occlusions should be enabled' },
        ],
        returns: 'returns true if the setting was set correctly, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetOcclusionsEnabled',
    },
    setPedAimTarget: {
        summary: 'This function allows you to set a peds aim target to a specific point. If a ped is within\na certain range defined by getPedTargetStart and getPedTargetEnd he will be targeted and\nshot.\nNote: If you wish to make a ped shoot you must use this in conjunction with an equipped\nweapon and setPedControlState.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose target you want to set. Only peds and remote players will work; this function has no effect on the local player.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The x coordinate of the aim target point.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The y coordinate of the aim target point.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'The z coordinate of the aim target point.' },
        ],
        returns: 'returns true if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAimTarget',
    },
    setPedAnalogControlState: {
        summary: 'Sets an analog state of a specified peds control, as if they pressed or released it.\nThis function only works on peds, to change the analog control state for a player, please\nuse setAnalogControlState.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you wish to set the control state of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to set the state of. See control names for a list of possible controls.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A float between 0 and 1 indicating the amount the control is pressed.' },
        ],
        returns: 'returns true if the control state was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnalogControlState',
    },
    setPedAnimation: {
        summary: 'Sets the current Animations|animation of a player or ped. Not specifying the type of\nanimation will automatically cancel the current one.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to apply an Animations|animation to.' },
            { name: 'block', isOptional: true, isVariadic: false, summary: 'the Animations|animation blocks name.' },
            { name: 'anim', isOptional: true, isVariadic: false, summary: 'the name of the Animations|animation within the block.' },
            { name: 'time', isOptional: true, isVariadic: false, summary: 'how long the animation will run for in milliseconds.' },
            { name: 'loop', isOptional: true, isVariadic: false, summary: 'indicates whether or not the animation will loop.' },
            { name: 'updatePosition', isOptional: true, isVariadic: false, summary: 'will change the actual coordinates of the ped according to the animation. Use this for e.g. walking animations.' },
            { name: 'interruptable', isOptional: true, isVariadic: false, summary: 'if set to false other tasks wont be able to interupt the animation. Setting this to false also gives this function more power to override other animations that are running. For example, squatting after a jump can be terminated.' },
            { name: 'freezeLastFrame', isOptional: true, isVariadic: false, summary: 'if set to true after animation the last frame will be frozen, otherwise the animation will end and controls will return.' },
            { name: 'blendTime', isOptional: true, isVariadic: false, summary: 'how long the animation will mixed with the previous one in milliseconds.' },
            { name: 'retainPedState', isOptional: true, isVariadic: false, summary: 'will restore the task which was playing before calling this function. Useful for restoring the crouch task after animation ends. This may be extended in the future to support other states/tasks. |16632' },
        ],
        returns: 'returns true if succesful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnimation',
    },
    setPedAnimationProgress: {
        summary: 'Sets the current animation progress of a player or ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to change animation progress.' },
            { name: 'anim', isOptional: true, isVariadic: false, summary: 'the animation name currently applied to ped, if not supplied, the animation will stop' },
            { name: 'progress', isOptional: true, isVariadic: false, summary: 'current animation progress you want to apply, value from 0.0 to 1.0, if not supplied will default to 0.0' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnimationProgress',
    },
    setPedAnimationSpeed: {
        summary: 'Sets the speed of a currently running animation for a particular player or ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to change animation speed of.' },
            { name: 'anim', isOptional: true, isVariadic: false, summary: 'the animation name it will affect.' },
            { name: 'speed', isOptional: true, isVariadic: false, summary: 'a float containing the speed between 0.0–1.0 you want to apply to the animation. This limitation may be adjusted in the future, so do not provide speeds outside this boundary. New feature/item|3.0158|1.5.7|20395|The limit is now 0.0 to 10.0. Warning|Setting speed higher than 1 can cause issues with some animations.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnimationSpeed',
    },
    setPedArmor: {
        summary: 'This function allows you to set the armor value of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': the ped whose armor you want to modify.' },
            { name: 'armor', isOptional: false, isVariadic: false, summary: ': the amount of armor you want to set on the ped. Valid values are from 0 to 100.' },
        ],
        returns: 'returns true if the armor was changed succesfully. returns false if an invalid ped was specified, or the armor value specified is out of acceptable range.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedArmor',
    },
    setPedBleeding: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped whose bleeding effect you want to set of.' },
            { name: 'bleeding', isOptional: false, isVariadic: false, summary: 'Boolean specifying whether the player or ped is bleeding or not.' },
        ],
        returns: 'returns true if the bleeding state was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedBleeding',
    },
    setPedCameraRotation: {
        summary: 'This function sets the camera rotation of a ped, e.g. where its camera will look at. Dont\nconfuse this with getCameraMatrix, because that function is designed for fixed (scripted)\ncamera moves.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose camera rotation is to be changed.' },
            { name: 'cameraRotation', isOptional: false, isVariadic: false, summary: 'The new direction that the ped will walk if you set their forwards control state. If the ped is the local player, it will also change where his camera is looking at if it isnt fixed (i.e. camera target is the local player).' },
        ],
        returns: 'returns true if the camera rotation was changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedCameraRotation',
    },
    setPedCanBeKnockedOffBike: {
        summary: 'This function controls if a ped can fall of his bike by accident - namely by banging into\na wall.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose knockoffstatus is being changed' },
            { name: 'canBeKnockedOffBike', isOptional: false, isVariadic: false, summary: 'true or false' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedCanBeKnockedOffBike',
    },
    setPedChoking: {
        summary: 'This function can be used to force the ped to do the choking (coughing) animation until\nhe respawns or toggled off using this function. The animation can not be cancelled by a\nplayer its applied to, and he will not loose health.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose choking status to toggle' },
            { name: 'choking', isOptional: false, isVariadic: false, summary: 'true to make the ped choke, false to no longer force his choking animation' },
        ],
        returns: 'returns true if successful, false otherwise (e.g. player handle is invalid)',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedChoking',
    },
    setPedControlState: {
        summary: 'This function makes a ped or player press or release a certain control.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to press or release a control.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'the name of the control of which to change the state. See control names for a list of valid names.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'the new control state. true means pressed, false is released.' },
        ],
        returns: 'returns true if successful, false if otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedControlState',
    },
    setPedDoingGangDriveby: {
        summary: 'This function sets the driveby state of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped element whose state is to be changed.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean value representing the drive-by state, true meaning enabled and false disabled.' },
        ],
        returns: 'returns true if the driveby state could be changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedDoingGangDriveby',
    },
    setPedEnterVehicle: {
        summary: '* If forced to enter as a passenger, it doesnt work if all passenger seats are occupied.\nOnly the driver seat can be jacked.\n* If forced to enter as a driver, the ped can carjack the current driver.\n** If the drivers door is blocked by something, the ped can use the opposite front door\nto reach the drivers seat, jacking the passenger in the process.\n* If a vehicle is not specified:\n** The ped will search for a vehicle door within 20 m.\n** If the vehicle has a driver, the limit becomes 10 m.\n* If a vehicle is specified:\n** The vehicle has to be within 50 m. The doors arent taken into account. It means that\nit doesnt work if the vehicles door is in range but the vehicle itself is not.\n** If the vehicle has a driver, the limit becomes 10 m.\n* When entering, the ped will run toward a vehicle if it is less than 50 m away.\n* The ped reserves the seat he is trying to use. It means nobody can enter the respective\nseat while the ped is running toward it.\n** Exception: If the ped is forced to enter as a passenger and is going to use the front\ndoor, the ped can wait if someone is using it to go the driver seat.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped to enter the vehicle. **\'\'Note: The player must be the local player.\'\' **\'\'Note: The ped must be synced by the client. Use isElementSyncer clientside to check if the client is syncing. Use setElementSyncer serverside to change the syncer manually.\'\' vehicle The vehicle to enter. If no vehicle is set, the ped will enter the nearest vehicle within 20 m.' },
            { name: 'theVehicle', isOptional: true, isVariadic: false, summary: '' },
            { name: 'passenger', isOptional: true, isVariadic: false, summary: 'If set to true, the ped will enter as passenger in the nearest available seat, otherwise he will enter as driver.' },
        ],
        returns: 'returns true if the function was successful, false otherwise. when this function returns true, the client will ask server for permission to enter a vehicle. actually entering can still fail in the following cases *another player or ped is already entering, exiting or jacking the same vehicle and seat. *movement input or damage can interrupt the task. use getpedtask to monitor what the ped is doing. this function returns false in the following cases *invalid arguments were parsed. *time passed since last enter/exit for this ped is less than 1500 ms. *onclientvehiclestartenter was cancelled by a script. *the ped has an active task_primary task. use getpedtask to monitor what the ped is doing.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedEnterVehicle',
    },
    setPedExitVehicle: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped to exit the vehicle.' },
        ],
        returns: 'returns true if the function was successful, false otherwise. when this function returns true, the client will ask server for permission to exit a vehicle. this function returns false in the following cases *invalid arguments were parsed. *time passed since last enter/exit for this ped is less than 1500 ms. *the ped is already being jacked.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedExitVehicle',
    },
    setPedFightingStyle: {
        summary: 'Changes a peds fighting style. Most styles only change the special attack which is done\nusing the Aim and Enter keys.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose fighting style to change.' },
            { name: 'style', isOptional: false, isVariadic: false, summary: 'The fighting style ID to apply.' },
        ],
        returns: 'returns true in case of success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedFightingStyle',
    },
    setPedFootBloodEnabled: {
        summary: 'This function makes a ped|peds footprints bloody.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the ped to give bloody footprints to.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'boolean specifying whether or not to have bloody feet.' },
        ],
        returns: 'returns true if changing the peds bloody feet status worked.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedFootBloodEnabled',
    },
    setPedGravity: {
        summary: 'This function sets the gravity level of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped whose gravity to change. level : The level of gravity (default is 0.008).' },
            { name: 'gravity', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the gravity was successfully set, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedGravity',
    },
    setPedHeadless: {
        summary: 'With this function, you can set if a ped has a head or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': The ped to check.' },
            { name: 'headState', isOptional: false, isVariadic: false, summary: ': head state, use true if you want the ped be headless, use false to give back the head.' },
        ],
        returns: 'returns true if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedHeadless',
    },
    setPedLookAt: {
        summary: 'Makes a ped turn his head and look at a specific world position or element.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped to change the lookat of.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'the x coordinate of the world position to look at.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'the y coordinate of the world position to look at.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'the z coordinate of the world position to look at.' },
            { name: 'time', isOptional: true, isVariadic: false, summary: 'the time, in milliseconds, during which the ped will look at the target. Once this time has elapsed, he will look ahead again like before the function was applied. A time of 0 will immediately stop any lookat. A negative time will make the ped look at the target indefinitely.' },
            { name: 'blend', isOptional: true, isVariadic: false, summary: 'the time, in milliseconds, during which the look will blend.' },
            { name: 'target', isOptional: true, isVariadic: false, summary: 'if this argument is specified, the position arguments will be mean offsets relative to the target and the peds gaze will follow the specified element instead. Can be a player, a vehicle, another ped etc.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedLookAt',
    },
    setPedOnFire: {
        summary: 'This function can be used to set a ped on fire or extinguish a fire on it.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped that we want to set/unset' },
            { name: 'isOnFire', isOptional: false, isVariadic: false, summary: 'true to set the ped on fire, false to extinguish any fire on him' },
        ],
        returns: 'returns true if successful, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedOnFire',
    },
    setPedOxygenLevel: {
        summary: 'This function allows you to set the oxygen level of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: ': the ped whose oxygen level you want to modify.' },
            { name: 'oxygen', isOptional: false, isVariadic: false, summary: ': the amount of oxygen you want to set on the ped. Native values are from 0 to 1000. Each of the stamina (22) and underwater stamina (225) Template:Stats|stat maximum adds a bonus of 1500. So the maximum oxygen level is 4000.' },
        ],
        returns: 'returns true if the oxygen level was changed succesfully. returns false if an invalid ped and/or oxygen level was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedOxygenLevel',
    },
    setPedsLODDistance: {
        summary: '',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'the new peds LOD distance. This value is clamped to 0 – 500. (Default for high_detail_peds on is 500, when off, it is 60).' },
        ],
        returns: 'this function returns true if the argument is valid. returns false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedsLODDistance',
    },
};
