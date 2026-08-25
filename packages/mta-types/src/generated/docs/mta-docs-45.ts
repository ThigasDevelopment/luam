import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_45: ApiDocumentationCatalog = {
    setPedAnalogControlState: {
        summary: 'Sets an analog state of a specified ped\'s control, as if they pressed or released it.\n\nThis function only works on peds, to change the analog control state for a player, please use setAnalogControlState.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped you wish to set the control state of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to set the state of. See control names for a list of possible controls.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A float between 0 and 1 indicating the amount the control is pressed.' },
        ],
        returns: 'Returns *true* if the control state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnalogControlState',
    },
    setPedAnimation: {
        summary: 'Sets the current animation of a player or ped. Not specifying the type of animation will automatically cancel the current one.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to apply an animation to.' },
            { name: 'block', isOptional: true, isVariadic: false, summary: 'the animation block\'s name.' },
            { name: 'anim', isOptional: true, isVariadic: false, summary: 'the name of the animation within the block.' },
            { name: 'time', isOptional: true, isVariadic: false, summary: 'how long the animation will run for in milliseconds.' },
            { name: 'loop', isOptional: true, isVariadic: false, summary: 'indicates whether or not the animation will loop.' },
            { name: 'updatePosition', isOptional: true, isVariadic: false, summary: 'will change the actual coordinates of the ped according to the animation. Use this for e.g. walking animations.' },
            { name: 'interruptable', isOptional: true, isVariadic: false, summary: 'if set to *false* other tasks wont be able to interupt the animation. Setting this to \'false\' also gives this function more power to override other animations that are running. For example, squatting after a jump can be terminated.' },
            { name: 'freezeLastFrame', isOptional: true, isVariadic: false, summary: 'if set to *true* after animation the last frame will be frozen, otherwise the animation will end and controls will return.' },
            { name: 'blendTime', isOptional: true, isVariadic: false, summary: 'how long the animation will mixed with the previous one in milliseconds.' },
            { name: 'retainPedState', isOptional: true, isVariadic: false, summary: 'will restore the task which was playing before calling this function. Useful for restoring the crouch task after animation ends. This may be extended in the future to support other states/tasks.' },
        ],
        returns: 'Returns *true* if succesful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnimation',
    },
    setPedAnimationProgress: {
        summary: 'Sets the current animation progress of a player or ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to change animation progress.' },
            { name: 'anim', isOptional: true, isVariadic: false, summary: 'the animation name currently applied to ped, if not supplied, the animation will stop' },
            { name: 'progress', isOptional: true, isVariadic: false, summary: 'current animation progress you want to apply, value from 0.0 to 1.0, if not supplied will default to 0.0' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnimationProgress',
    },
    setPedAnimationSpeed: {
        summary: 'Sets the speed of a currently running animation for a particular player or ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to change animation speed of.' },
            { name: 'anim', isOptional: true, isVariadic: false, summary: 'the animation name it will affect.' },
            { name: 'speed', isOptional: true, isVariadic: false, summary: 'a float containing the speed between 0.0–1.0 you want to apply to the animation. *This limitation may be adjusted in the future, so do not provide speeds outside this boundary.* The limit is now 0.0 to 10.0.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedAnimationSpeed',
    },
    setPedArmor: {
        summary: 'This function allows you to set the armor value of a ped.\nFunction also added client-side.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose armor you want to modify.' },
            { name: 'armor', isOptional: false, isVariadic: false, summary: 'the amount of armor you want to set on the ped. Valid values are from 0 to 100.' },
        ],
        returns: 'Returns *true* if the armor was changed succesfully. Returns *false* if an invalid ped was specified, or the armor value specified is out of acceptable range.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedArmor',
    },
    setPedBleeding: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped whose bleeding effect you want to set of.' },
            { name: 'bleeding', isOptional: false, isVariadic: false, summary: 'Boolean specifying whether the player or ped is bleeding or not.' },
        ],
        returns: 'Returns *true* if the bleeding state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedBleeding',
    },
    setPedCameraRotation: {
        summary: 'This function sets the camera rotation of a ped, e.g. where its camera will look at. Don\'t confuse this with getCameraMatrix, because that function is designed for fixed (scripted) camera moves.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose camera rotation is to be changed.' },
            { name: 'cameraRotation', isOptional: false, isVariadic: false, summary: 'The new direction that the ped will walk if you set their forwards control state. If the ped is the local player, it will also change where his camera is looking at if it isn\'t fixed (i.e. camera target is the local player).' },
        ],
        returns: 'Returns *true* if the camera rotation was changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedCameraRotation',
    },
    setPedCanBeKnockedOffBike: {
        summary: 'This function controls if a ped can fall of his bike by accident - namely by banging into a wall.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose knockoffstatus is being changed' },
            { name: 'canBeKnockedOffBike', isOptional: false, isVariadic: false, summary: '*true* or *false*' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedCanBeKnockedOffBike',
    },
    setPedChoking: {
        summary: 'This function can be used to force the ped to do the choking (coughing) animation until he respawns or toggled off using this function. The animation can not be cancelled by a player it\'s applied to, and he will not loose health.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose choking status to toggle' },
            { name: 'choking', isOptional: false, isVariadic: false, summary: '*true* to make the ped choke, *false* to no longer force his choking animation' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise (e.g. player handle is invalid)',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedChoking',
    },
    setPedControlState: {
        summary: 'This function makes a ped or player press or release a certain control.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped you want to press or release a control.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'the name of the control of which to change the state. See control names for a list of valid names.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'the new control state. *true* means pressed, *false* is released.' },
        ],
        returns: 'Returns *true* if successful, *false* if otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedControlState',
    },
    setPedDoingGangDriveby: {
        summary: 'This function sets the driveby state of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped element whose state is to be changed.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean value representing the drive-by state, *true* meaning enabled and *false* disabled.' },
        ],
        returns: 'Returns *true* if the driveby state could be changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedDoingGangDriveby',
    },
    setPedEnterVehicle: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped to enter the vehicle.' },
            { name: 'theVehicle', isOptional: true, isVariadic: false, summary: '' },
            { name: 'passenger', isOptional: true, isVariadic: false, summary: 'If set to *true*, the ped will enter as passenger in the nearest available seat, otherwise he will enter as driver.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise. When this function returns *true*, the client will ask server for permission to enter a vehicle. Actually entering can still fail in the following cases *Another player or ped is already entering, exiting or jacking the same vehicle and seat. *Movement input or damage can interrupt the task. Use getPedTask to monitor what the ped is doing. This function returns *false* in the following cases *Invalid arguments were parsed. *Time passed since last enter/exit for this ped is less than 1500 ms. *onClientVehicleStartEnter was cancelled by a script. *The ped has an active TASK_PRIMARY task. Use getPedTask to monitor what the ped is doing.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedEnterVehicle',
    },
    setPedExitVehicle: {
        summary: '',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The player or ped to exit the vehicle.' },
        ],
        returns: 'Returns *true* if the function was successful, *false* otherwise. When this function returns *true*, the client will ask server for permission to exit a vehicle. This function returns *false* in the following cases *Invalid arguments were parsed. *Time passed since last enter/exit for this ped is less than 1500 ms. *The ped is already being jacked.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedExitVehicle',
    },
    setPedFightingStyle: {
        summary: 'Changes a ped\'s fighting style. Most styles only change the \'special attack\' which is done using the Aim and Enter keys.\nFunction also added client-side.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose fighting style to change.' },
            { name: 'style', isOptional: false, isVariadic: false, summary: 'The fighting style ID to apply.' },
        ],
        returns: 'Returns *true* in case of success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedFightingStyle',
    },
    setPedFootBloodEnabled: {
        summary: 'This function makes a ped\'s footprints bloody.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'the ped to give bloody footprints to.' },
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'boolean specifying whether or not to have bloody feet.' },
        ],
        returns: 'Returns *true* if changing the ped\'s bloody feet status worked.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedFootBloodEnabled',
    },
    setPedGravity: {
        summary: 'This function sets the gravity level of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped whose gravity to change.' },
            { name: 'gravity', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the gravity was successfully set, *false* otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedGravity',
    },
    setPedHeadless: {
        summary: 'With this function, you can set if a ped has a head or not.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped to check.' },
            { name: 'headState', isOptional: false, isVariadic: false, summary: 'head state, use true if you want the ped be headless, use false to give back the head.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise',
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
            { name: 'target', isOptional: true, isVariadic: false, summary: 'if this argument is specified, the position arguments will be mean offsets relative to the target and the ped\'s gaze will follow the specified element instead. Can be a player, a vehicle, another ped etc.' },
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
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose oxygen level you want to modify.' },
            { name: 'oxygen', isOptional: false, isVariadic: false, summary: 'the amount of oxygen you want to set on the ped. Native values are from 0 to 1000. Each of the stamina (22) and underwater stamina (225) stat maximum adds a bonus of 1500. So the maximum oxygen level is 4000.' },
        ],
        returns: 'Returns *true* if the oxygen level was changed succesfully. Returns *false* if an invalid ped and/or oxygen level was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedOxygenLevel',
    },
    setPedsLODDistance: {
        summary: 'This function sets the peds LOD distance.',
        parameters: [
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'the new peds LOD distance. This value is clamped to **0** – **500**. (Default for *high_detail_peds* on is **500**, when off, it is **60**).' },
        ],
        returns: 'This function returns *true* if the argument is valid. Returns *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedsLODDistance',
    },
    setPedStat: {
        summary: 'This function allows you to set the value of a specific statistic for a ped. **Visual stats (FAT and BODY_MUSCLE) can only be used on the CJ skin**, they have no effect on other skins. When this function is used client-side, it can only be used on client-side created peds.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose statistic you want to modify.' },
            { name: 'stat', isOptional: false, isVariadic: false, summary: 'the stat ID.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'the new value of the stat. It must be between 0 and 1000.' },
        ],
        returns: 'Returns *true* if the statistic was changed succesfully. Returns *false* if an invalid player is specified, if the stat ID/value is out of acceptable range or if the FAT or BODY_MUSCLE stats are used on non-CJ players.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedStat',
    },
    setPedTargetingMarkerEnabled: {
        summary: 'This function is used to toggle the health target marker on top of all pedestrians.',
        parameters: [
            { name: 'enabled', isOptional: false, isVariadic: false, summary: 'A boolean denoting whether we want to enable (*true*) or disable (*false*) the markers.' },
        ],
        returns: 'Returns *true* if the markers were enabled, *false* if weren\'t or if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedTargetingMarkerEnabled',
    },
    setPedVoice: {
        summary: 'Changes the voice of a ped.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the ped whose voice to change.' },
            { name: 'voiceType', isOptional: false, isVariadic: false, summary: 'the voice type. See ped voices for possible types.' },
            { name: 'voiceName', isOptional: false, isVariadic: false, summary: 'the voice name within the specified type. See ped voices for possible voices.' },
        ],
        returns: 'Returns *true* when the voice was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetPedVoice',
    },
};
