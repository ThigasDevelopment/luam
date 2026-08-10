import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_45: ApiDocumentationCatalog = {
    setVehicleDirtLevel: {
        summary: 'This function sets the dirt level on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to set the dirt level from' },
            { name: 'dirtLevel', isOptional: false, isVariadic: false, summary: 'The dirt level' },
        ],
        returns: 'returns true if the dirt level was set on the vehicle, false if the dirt level was not set or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDirtLevel',
    },
    setVehicleDoorOpenRatio: {
        summary: 'This function sets how much a vehicles door is open. Doors include the boot/trunk and the\nbonnet of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to change the door open ratio of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'A whole number, 0 (hood), 1 (trunk), 2 (front left), 3 (front right), 4 (rear left), 5 (rear right)' },
            { name: 'ratio', isOptional: false, isVariadic: false, summary: 'The ratio value, ranging from 0 (fully closed) to 1 (fully open).' },
            { name: 'time', isOptional: true, isVariadic: false, summary: 'The number of milliseconds the door should take to reach the value you have specified. A value of 0 will change the door open ratio instantly.' },
        ],
        returns: 'returns true if the door open ratio was successfully set, false if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDoorOpenRatio',
    },
    setVehicleDoorState: {
        summary: 'This function sets the state of the specified door on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to change the door state of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'An integer representing which door to set the state of. Valid values are: 0 Shut, intact (aka Closed, undamaged) 1 Ajar, intact (aka Slightly open, undamaged) 2 Shut, damaged (aka Closed, damaged) 3 Ajar, damaged (aka Slightly open, damaged) 4 Missing 5 Rear right' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'An integer representing the state to set the door to. Valid values are: spawnFlyingComponent A boolean, if set to true, spawns flying doors etc. if you remove a component with state == 4.' },
        ],
        returns: 'returns true if the door state was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDoorState',
    },
    setVehicleDoorsUndamageable: {
        summary: 'This function makes a vehicles doors undamageable, so they wont fall off when theyre hit.\nNote that the vehicle has to be locked using setVehicleLocked for this setting to have\nany effect.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle of which you wish to set the car door damageability.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A boolean denoting whether the vehicles doors are undamageable (true) or damageable (false).' },
        ],
        returns: 'returns true if the damageability state was successfully changed, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDoorsUndamageable',
    },
    setVehicleDummyPosition: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you want to set the dummy position for.' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: 'The dummy whose position you want to set.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: ', y, z The new dummy position.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the dummy position has been successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDummyPosition',
    },
    setVehicleEngineState: {
        summary: 'This function turns a vehicles engine on or off. Note that the engine will always be\nturned on when someone enters the driver seat, unless you override that behaviour with\nscripts.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the engine state of.' },
            { name: 'engineState', isOptional: false, isVariadic: false, summary: ': A boolean value representing whether the engine will be turned on (true) or off (false).' },
        ],
        returns: 'returns true if the vehicles engine state was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleEngineState',
    },
    setVehicleFuelTankExplodable: {
        summary: 'This function changes the explodable state of a vehicles fuel tank, which toggles the\nability to blow the vehicle up by shooting the tank. This function will have no effect on\nvehicles with tanks that cannot be shot in single player.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the fuel tank explodable state of.' },
            { name: 'explodable', isOptional: false, isVariadic: false, summary: ': A boolean value representing whether or not the fuel tank will be explodable.' },
        ],
        returns: 'returns true if the vehicles fuel tank explodable state was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleFuelTankExplodable',
    },
    setVehicleGravity: {
        summary: 'Sets the gravity vector of a vehicle. The vehicle will fall in this direction, and the\ncamera of any occupants will also be rotated to match it. Can be used for e.g. driving on\nwalls or upside down on ceilings.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which to change the gravity. x, y, z the components of the new gravity vector. If this vector has length 1, the strength of the gravity will be same as the global gravity for other entities. If it is 2, it will be twice as strong, etc.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleGravity',
    },
    setVehicleHandling: {
        summary: 'This function is used to change the handling data of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to set the handling of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you wish to set the handling of the vehicle to. Additionally, helicopters are not affected by custom handling. The vehicle-on-wheels handling does not affect planes when they are on the ground either. For more information on this, see [https://github.com/multitheftauto/mtasa-blue/issues/2426 issue 2426]' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value of the property you wish to set the handling of the vehicle to.' },
        ],
        returns: 'returns true if the handling was set successfully, false otherwise. see below a list of valid properties and their required values:',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleHandling',
    },
    setVehicleHeadLightColor: {
        summary: 'This function will set the headlight color of a vehicle. valid Red Green and Blue\narguments range from 0-255',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to set the headlight color of.' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'An integer indicating the amount of red for the vehicles headlights' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'An integer indicating the amount of green for the vehicles headlights' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'An integer indicating the amount of blue for the vehicles headlights' },
        ],
        returns: 'returns true if vehicles headlight color was set, false if an invalid vehicle or invalid color ranges were specified for red,green or blue.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleHeadLightColor',
    },
    setVehicleIdleRespawnDelay: {
        summary: 'This function sets the time delay (in milliseconds) the vehicle will remain at its\nposition while empty.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the respawn delay of.' },
            { name: 'timeDelay', isOptional: false, isVariadic: false, summary: ': The number of milliseconds the vehicle will be allowed to remain unused until it respawns.' },
        ],
        returns: 'returns true if the vehicle was found and edited.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleIdleRespawnDelay',
    },
    setVehicleLandingGearDown: {
        summary: 'This function is used to set the landing gear state of certain vehicles.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle of which you wish to set the landing gear state.' },
            { name: 'gearState', isOptional: false, isVariadic: false, summary: 'A bool representing the state of the landing gear. true represents a collapsed landing gear, while false represents a disabled landing gear.' },
        ],
        returns: 'returns true if the landing gear was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleLandingGearDown',
    },
    setVehicleLightState: {
        summary: 'This function sets the state of the light on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A handle to the vehicle that you wish to change the light state of.' },
            { name: 'light', isOptional: false, isVariadic: false, summary: 'A whole number determining the individual light: 0 Front left 1 Front right 2 Rear right 3 Rear left' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'A whole number determining the new state of the light. 0 represents normal lights, and 1 represents broken lights. Returns \'\'true\'\' if the light state was set successfully, \'\'false\'\' if invalid arguments were passed to the function.' },
        ],
        returns: 'returns true if the light state was set successfully, false if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleLightState',
    },
    setVehicleLocked: {
        summary: 'This function can be used to set the vehicles doors to be locked or unlocked.  Locking a\nvehicle restricts access to the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which you wish to change the lock status of' },
            { name: 'locked', isOptional: false, isVariadic: false, summary: 'Boolean for the status you wish to set. Set true to lock, false to unlock' },
        ],
        returns: 'returns true if the operation was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleLocked',
    },
    setVehicleModelDummyPosition: {
        summary: 'This function sets the position of the dummies contained in a vehicle model. Use\nsetVehicleComponentPosition to adjust the vehicle component positions.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': The model ID which you want to apply the change to' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: ': The dummy whose position you want to change posX , posY, posZ: The desired position' },
            { name: 'x', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if everything went fine, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleModelDummyPosition',
    },
    setVehicleModelExhaustFumesPosition: {
        summary: 'This function sets the position of the exhaust fumes the vehicle model emits. Use\nsetVehicleComponentPosition to adjust the exhaust position.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': The model ID which you want to apply the change to' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: ', posY, posZ: The desired position' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if everything went fine, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleModelExhaustFumesPosition',
    },
    setVehicleModelWheelSize: {
        summary: '',
        parameters: [
            { name: 'vehicleModel', isOptional: false, isVariadic: false, summary: ': The Vehicle IDs|vehicle model ID.' },
            { name: 'wheelGroup', isOptional: false, isVariadic: false, summary: ': The group of wheels of the vehicle model that will have its size set by this function. The following values are supported: front_axle : Represents the wheels in the front axle. The default value for this group is read by GTA from the WheelScale_Front field of the vehicles.ide data file. rear_axle : Represents the wheels in the rear axle. The default value for this group is read by GTA from the WheelScale_Rear field of the vehicles.ide data file. all_wheels : Convenience group that contains the other wheel groups: front_axle and rear_axle.' },
            { name: 'wheelSize', isOptional: false, isVariadic: false, summary: ': The wheel size value to set. Default GTA values for automobiles usually are around 0.7. It must be greater than 0.' },
        ],
        returns: 'returns true if the size for the specified wheel group and vehicle model has been set successfully, or an error if some parameter is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleModelWheelSize',
    },
    setVehicleNitroActivated: {
        summary: 'This function activates or deactivates the nitro on the specified vehicle, like if a\nplayer pressed the button for activating nitro.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to activate or deactivate the nitro on.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'true if you want to activate the nitro, false if you want to disable it.' },
        ],
        returns: 'returns true if the nitro activation state was modified successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleNitroActivated',
    },
    setVehicleNitroCount: {
        summary: 'This function sets how many times a player can activate the nitro on a specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': the vehicle which you want to modify how many times a player can use its nitro.' },
            { name: 'count', isOptional: false, isVariadic: false, summary: ': how many times should the player be able to use the nitro of this vehicle (from 0-100 times; 0 means that it cant be used and 101 means that it can be used infinite times).' },
        ],
        returns: 'returns true if the nitro count was set successfully to the vehicle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleNitroCount',
    },
    setVehicleNitroLevel: {
        summary: 'This function sets the nitro level of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to set.' },
            { name: 'level', isOptional: false, isVariadic: false, summary: 'Nitro level you want to set (ranges from 0.0001 to 1.0).' },
        ],
        returns: 'returns true if the nitro level was set successfully to the vehicle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleNitroLevel',
    },
    setVehicleOverrideLights: {
        summary: 'This function changes the light overriding setting on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the override lights setting of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: ': A whole number representing the state of the lights: 0 : No override, lights are set to default. 1 : Lights are forced off. 2 : Lights are forced on.' },
        ],
        returns: 'returns true if the vehicles lights setting was changed. otherwise false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleOverrideLights',
    },
    setVehiclePaintjob: {
        summary: 'This function changes the paintjob on the specified vehicle.\n\nSee Paintjob|paintjob for list of supported vehicles.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the paintjob of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: ': A whole number representing the new paintjob id. Ranges from 0 up to 3.' },
        ],
        returns: 'returns true if the vehicles paintjob was changed. otherwise false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclePaintjob',
    },
    setVehiclePanelState: {
        summary: 'This function allows you to change the state of one of the six panels vehicles can have.\nWhen executed on the server-side resources, the damage will be synched for all players,\nwhereas the change is only client-side if the function is used in a client resource.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you would like to modify the panel of.' },
            { name: 'panelID', isOptional: false, isVariadic: false, summary: 'An ID specifying the part of the vehicle. Possible values are: Cars 0 Engine Smoke (left engine for a Nevada or a Beagle) 1 Engine Smoke (right engine for a Nevada or a Beagle) 2 Rudder 3 Elevators 4 Ailerons 5 Unknown 6 Unknown \'\'NOTE:\'\' Settings are not applicable for all vehicles of these types, for instance panel 0 effects a Dodo, but does nothing to a hydra. Planes' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'How damaged the part is on the scale of 0 to 3, with 0 being undamaged and 3 being very damaged. How this is manifested depends on the panel and the vehicle.' },
        ],
        returns: 'returns true if the panel state has been updated, false otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclePanelState',
    },
    setVehiclePlateText: {
        summary: 'This function can be used to set the numberplate text of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle whose numberplate you want to change.' },
            { name: 'numberplate', isOptional: false, isVariadic: false, summary: 'a string that will go on the number plate of the vehicle (max 8 characters).' },
        ],
        returns: 'returns true if the numberplate was changed successfully, or false if invalid arguments were passed',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclePlateText',
    },
};
