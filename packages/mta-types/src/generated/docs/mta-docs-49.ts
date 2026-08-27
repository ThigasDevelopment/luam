import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_49: ApiDocumentationCatalog = {
    setVehicleDoorOpenRatio: {
        summary: 'This function sets how much a vehicle\'s door is open. Doors include the boot/trunk and the bonnet of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to change the door open ratio of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'A whole number, 0 (hood), 1 (trunk), 2 (front left), 3 (front right), 4 (rear left), 5 (rear right)' },
            { name: 'ratio', isOptional: false, isVariadic: false, summary: 'The ratio value, ranging from 0 (fully closed) to 1 (fully open).' },
            { name: 'time', isOptional: true, isVariadic: false, summary: 'The number of milliseconds the door should take to reach the value you have specified. A value of 0 will change the door open ratio instantly.' },
        ],
        returns: 'Returns *true* if the door open ratio was successfully set, *false* if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDoorOpenRatio',
    },
    setVehicleDoorState: {
        summary: 'This function sets the state of the specified door on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to change the door state of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'An integer representing which door to set the state of. Valid values are:' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'An integer representing the state to set the door to. Valid values are:' },
        ],
        returns: 'Returns *true* if the door state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDoorState',
    },
    setVehicleDoorsUndamageable: {
        summary: 'This function makes a vehicle\'s doors undamageable, so they won\'t fall off when they\'re hit. Note that the vehicle **has** to be locked using setVehicleLocked for this setting to have any effect.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle of which you wish to set the car door damageability.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean denoting whether the vehicle\'s doors are undamageable (*true*) or damageable (*false*).' },
        ],
        returns: 'Returns *true* if the damageability state was successfully changed, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDoorsUndamageable',
    },
    setVehicleDummyPosition: {
        summary: 'This function sets the position of the dummy for the given vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you want to set the dummy position for.' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: 'The dummy whose position you want to set.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: ', **y**, **z** The new dummy position.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the dummy position has been successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDummyPosition',
    },
    setVehicleEngineState: {
        summary: 'This function turns a vehicle\'s engine on or off. Note that the engine will always be turned on when someone enters the driver seat, unless you override that behaviour with scripts.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the engine state of.' },
            { name: 'engineState', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether the engine will be turned on (*true*) or off (*false*).' },
        ],
        returns: 'Returns *true* if the vehicle\'s engine state was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleEngineState',
    },
    setVehicleFuelTankExplodable: {
        summary: 'This function changes the \'explodable state\' of a vehicle\'s fuel tank, which toggles the ability to blow the vehicle up by shooting the tank. This function will have no effect on vehicles with tanks that cannot be shot in single player.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the fuel tank explodable state of.' },
            { name: 'explodable', isOptional: false, isVariadic: false, summary: 'A boolean value representing whether or not the fuel tank will be explodable.' },
        ],
        returns: 'Returns *true* if the vehicle\'s fuel tank explodable state was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleFuelTankExplodable',
    },
    setVehicleGravity: {
        summary: 'Sets the gravity vector of a vehicle. The vehicle will fall in this direction, and the camera of any occupants will also be rotated to match it. Can be used for e.g. driving on walls or upside down on ceilings.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which to change the gravity.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleGravity',
    },
    setVehicleHandling: {
        summary: 'This function is used to change the handling data of a vehicle.\n\nImplemented also for client-sided vehicles.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to set the handling of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you wish to set the handling of the vehicle to.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value of the property you wish to set the handling of the vehicle to.' },
        ],
        returns: 'Returns *true* if the handling was set successfully, *false* otherwise. See below a list of valid properties and their required values:',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleHandling',
    },
    setVehicleHeadLightColor: {
        summary: 'This function will set the headlight color of a vehicle. valid Red Green and Blue arguments range from 0-255',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to set the headlight color of.' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'An integer indicating the amount of red for the vehicle\'s headlights' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'An integer indicating the amount of green for the vehicle\'s headlights' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'An integer indicating the amount of blue for the vehicle\'s headlights' },
        ],
        returns: 'Returns *true* if vehicle\'s headlight color was set, *false* if an invalid vehicle or invalid color ranges were specified for red,green or blue.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleHeadLightColor',
    },
    setVehicleIdleRespawnDelay: {
        summary: 'This function sets the time delay (in milliseconds) the vehicle will remain at its position while empty.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the respawn delay of.' },
            { name: 'timeDelay', isOptional: false, isVariadic: false, summary: 'The number of milliseconds the vehicle will be allowed to remain unused until it respawns.' },
        ],
        returns: 'Returns *true* if the vehicle was found and edited.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleIdleRespawnDelay',
    },
    setVehicleLandingGearDown: {
        summary: 'This function is used to set the landing gear state of certain vehicles.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle of which you wish to set the landing gear state.' },
            { name: 'gearState', isOptional: false, isVariadic: false, summary: 'A bool representing the state of the landing gear. *true* represents a collapsed landing gear, while *false* represents a disabled landing gear.' },
        ],
        returns: 'Returns *true* if the landing gear was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleLandingGearDown',
    },
    setVehicleLightState: {
        summary: 'This function sets the state of the light on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A handle to the vehicle that you wish to change the light state of.' },
            { name: 'light', isOptional: false, isVariadic: false, summary: 'A whole number determining the individual light:' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A whole number determining the new state of the light. *0* represents normal lights, and *1* represents broken lights.' },
        ],
        returns: 'Returns *true* if the light state was set successfully, *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleLightState',
    },
    setVehicleLocked: {
        summary: 'This function can be used to set the vehicle\'s doors to be locked or unlocked.  Locking a vehicle restricts access to the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which you wish to change the lock status of' },
            { name: 'locked', isOptional: false, isVariadic: false, summary: 'Boolean for the status you wish to set. Set *true* to lock, *false* to unlock' },
        ],
        returns: 'Returns *true* if the operation was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleLocked',
    },
    setVehicleModelDummyPosition: {
        summary: 'This function sets the position of the dummies contained in a vehicle model. Use setVehicleComponentPosition to adjust the vehicle component positions.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID which you want to apply the change to' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: 'The dummy whose position you want to change' },
            { name: 'x', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if everything went fine, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleModelDummyPosition',
    },
    setVehicleModelExhaustFumesPosition: {
        summary: 'This function sets the position of the exhaust fumes the vehicle model emits. Use setVehicleComponentPosition to adjust the exhaust position.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID which you want to apply the change to' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: ', **posY**, **posZ**: The desired position' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if everything went fine, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleModelExhaustFumesPosition',
    },
    setVehicleModelWheelSize: {
        summary: 'This function sets the size of a group of wheels for a vehicle model. The wheel size mainly determines their width, collision box (used to check if a bullet hits a tire, for example) and the ground clearance of vehicles with that model (i.e., the minimum distance from the center of the car geometry to the ground). It also changes the visual scale and rotation of the wheels, if not all the wheel groups have equal size. The visual scaling is applied before the per-vehicle wheel scale.',
        parameters: [
            { name: 'vehicleModel', isOptional: false, isVariadic: false, summary: 'The vehicle model ID.' },
            { name: 'wheelGroup', isOptional: false, isVariadic: false, summary: 'The group of wheels of the vehicle model that will have its size set by this function. The following values are supported:' },
            { name: 'wheelSize', isOptional: false, isVariadic: false, summary: 'The wheel size value to set. Default GTA values for automobiles usually are around 0.7. It must be greater than 0.' },
        ],
        returns: 'Returns *true* if the size for the specified wheel group and vehicle model has been set successfully, or an error if some parameter is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleModelWheelSize',
    },
    setVehicleNitroActivated: {
        summary: 'This function activates or deactivates the nitro on the specified vehicle, like if a player pressed the button for activating nitro.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to activate or deactivate the nitro on.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: '*true* if you want to activate the nitro, *false* if you want to disable it.' },
        ],
        returns: 'Returns *true* if the nitro activation state was modified successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleNitroActivated',
    },
    setVehicleNitroCount: {
        summary: 'This function sets how many times a player can activate the nitro on a specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle which you want to modify how many times a player can use its nitro.' },
            { name: 'count', isOptional: false, isVariadic: false, summary: 'how many times should the player be able to use the nitro of this vehicle (from 0-100 times; 0 means that it can\'t be used and 101 means that it can be used infinite times).' },
        ],
        returns: 'Returns *true* if the nitro count was set successfully to the vehicle, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleNitroCount',
    },
    setVehicleNitroLevel: {
        summary: 'This function sets the nitro level of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to set.' },
            { name: 'level', isOptional: false, isVariadic: false, summary: 'Nitro level you want to set (ranges from 0.0001 to 1.0).' },
        ],
        returns: 'Returns *true* if the nitro level was set successfully to the vehicle, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleNitroLevel',
    },
    setVehicleOverrideLights: {
        summary: 'This function changes the light overriding setting on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the override lights setting of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'A whole number representing the state of the lights:' },
        ],
        returns: 'Returns *true* if the vehicle\'s lights setting was changed. Otherwise *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleOverrideLights',
    },
    setVehiclePaintjob: {
        summary: 'This function changes the paintjob on the specified vehicle.\n\nSee paintjob for list of supported vehicles.\nTo remove a paintjob from a vehicle, apply paintjob number **3** to it.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the paintjob of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'A whole number representing the new paintjob id. Ranges from 0 up to 3.' },
        ],
        returns: 'Returns *true* if the vehicle\'s paintjob was changed. Otherwise *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclePaintjob',
    },
    setVehiclePanelState: {
        summary: 'This function allows you to change the state of one of the six panels vehicle\'s can have. When executed on the server-side resources, the damage will be synched for all players, whereas the change is only client-side if the function is used in a client resource.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you would like to modify the panel of.' },
            { name: 'panelID', isOptional: false, isVariadic: false, summary: 'An ID specifying the part of the vehicle. Possible values are:' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'How damaged the part is on the scale of 0 to 3, with 0 being undamaged and 3 being very damaged. How this is manifested depends on the panel and the vehicle.' },
            { name: 'spawnFlyingComponent', isOptional: true, isVariadic: false, summary: 'If set to **true**, spawns flying bumpers etc. If you remove a component with state 3.' },
            { name: 'breakGlass', isOptional: true, isVariadic: false, summary: 'This argument applies only to the windscreen (PanelID is 4). If set to **false**, the glass will fall off as a flying component, similar to how a bumper does. If set to **true**, the windscreen will not spawn as a flying component but will shatter instead, just like when shot.' },
        ],
        returns: 'Returns *true* if the panel state has been updated, *false* otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclePanelState',
    },
    setVehiclePlateText: {
        summary: 'This function can be used to set the numberplate text of a vehicle.\nAll non ascii characters will be replaced by spaces.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle whose numberplate you want to change.' },
            { name: 'numberplate', isOptional: false, isVariadic: false, summary: 'a string that will go on the number plate of the vehicle (max 8 characters).' },
        ],
        returns: 'Returns *true* if the numberplate was changed successfully, or *false* if invalid arguments were passed',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclePlateText',
    },
    setVehicleRespawnDelay: {
        summary: 'This function sets the time delay (in milliseconds) the vehicle will remain wrecked before respawning.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the respawn delay of.' },
            { name: 'timeDelay', isOptional: false, isVariadic: false, summary: 'The amount of milliseconds to delay.' },
        ],
        returns: 'Returns *true* if the vehicle was found and edited.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRespawnDelay',
    },
};
