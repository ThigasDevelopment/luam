import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_24: ApiDocumentationCatalog = {
    getVehicleCompatibleUpgrades: {
        summary: 'This function returns a table of all the compatible upgrades (or all for a specified slot, optionally) for a specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to retrieve the list of compatible upgrades of.' },
            { name: 'slot', isOptional: true, isVariadic: false, summary: 'the upgrade slot number for which you\'re getting the list (from 0 to 16). Compatible upgrades for all slots are listed if this is not specified.' },
        ],
        returns: 'Returns a *table* with all the compatible upgrades, or *false* if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleCompatibleUpgrades',
    },
    getVehicleComponentPosition: {
        summary: 'This function gets the component position of a vehicle. The vehicle must be streamed in.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component position of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the returned position is relative to. It can be one of the following values:' },
        ],
        returns: 'Returns three *floats* indicating the position of the component, *x*, *y* and *z* respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentPosition',
    },
    getVehicleComponentRotation: {
        summary: 'This function gets the component rotation of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component rotation of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the returned rotation is relative to. It can be one of the following values:' },
        ],
        returns: 'Returns three *floats* indicating the rotation of the component, *x*, *y* and *z* respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentRotation',
    },
    getVehicleComponents: {
        summary: 'This function gets a table of the components currently on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get the components of.' },
        ],
        returns: 'Returns a *table* containing the name of the component as the key and visibility flag of that component as the value',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponents',
    },
    getVehicleComponentScale: {
        summary: 'This function gets the component scale of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component scale of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the returned scale is relative to. It can be one of the following values:' },
        ],
        returns: 'Returns three *floats* indicating the scale of the component, *x*, *y* and *z* respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentScale',
    },
    getVehicleComponentVisible: {
        summary: 'This function get component visibility for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component visibility of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'Returns a *bool* indicating the visible state of the component.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentVisible',
    },
    getVehicleController: {
        summary: 'This function is used to get the player in control of the specified vehicle which includes somebody who is trying to enter the drivers seat.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you want to get the \'controller\' of.' },
        ],
        returns: 'Returns a player object, if there isn\'t a driver, it will search the \'trailer chain\' for the front driver, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleController',
    },
    getVehicleCurrentGear: {
        summary: 'Gets the specified vehicle\'s current gear.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle to get the gear of' },
        ],
        returns: 'Returns the gear if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleCurrentGear',
    },
    getVehicleDoorOpenRatio: {
        summary: 'This function tells you how open a door is (the \'open ratio\'). Doors include boots/trunks and bonnets on vehicles that have them.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to get the door open ratio of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'A whole number, 0 (hood), 1 (trunk), 2 (front left), 3 (front right), 4 (rear left), 5 (rear right)' },
        ],
        returns: 'Returns a number between 0 and 1 that indicates how open the door is. 0 is closed, and 1 is fully open. Returns *false* if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleDoorOpenRatio',
    },
    getVehicleDoorState: {
        summary: 'This function returns the current state of the specifed door on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you want to get the door status of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'a whole number representing which door to get the status of. Valid values are:' },
        ],
        returns: 'If successful, one of the following integers will be returned: * **0:** Shut, intact (also returned if the door does not exist) * **1:** Ajar, intact * **2:** Shut, damaged * **3:** Ajar, damaged * **4:** Missing',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleDoorState',
    },
    getVehicleDummyPosition: {
        summary: 'This function returns the position of the dummy for the given vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you want to get the dummy positions from.' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: 'The dummy whose position you want to get.' },
        ],
        returns: 'Returns 3 floats indicating the position X, Y and Z of the vehicle\'s dummy. It returns *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleDummyPosition',
    },
    getVehicleEngineState: {
        summary: 'This function returns a vehicle\'s engine state (on or off).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to get the engine state of.' },
        ],
        returns: 'Returns **true** if the vehicle\'s engine is started, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleEngineState',
    },
    getVehicleEntryPoints: {
        summary: 'This function returns a table containing the positions to 4 possible entry points to a vehicle. This function can be used alongside setPedEnterVehicle to make a ped enter a specific seat by first moving the ped to a entry point retrieved through **getVehicleEntryPoints** and then using setPedEnterVehicle to make them enter.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'If the vehicle has entry points, it returns a table containing the positions of the 4 possible entry points to the vehicle, otherwise it returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleEntryPoints',
    },
    getVehicleGravity: {
        summary: 'Retrieves the current gravity vector of a vehicle. This is the direction in which the vehicle falls, also the cameras of any passengers will be rotated to match it.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle to retrieve the gravity vector of.' },
        ],
        returns: 'Returns the x, y and z components of the gravity vector if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleGravity',
    },
    getVehicleHandling: {
        summary: 'This function returns a table of the current vehicle handling data.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to get the handling data of.' },
            { name: 'property', isOptional: true, isVariadic: false, summary: 'the property you want to get.' },
        ],
        returns: 'Returns a *table* containing all the handling data, *false* otherwise. If a property is specified, it returns the value of the specific property. Here\'s a list of valid table properties and what they return:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleHandling',
    },
    getVehicleHeadLightColor: {
        summary: 'This function will get the headlight color of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to set the headlight color of.' },
        ],
        returns: 'Returns three *integers* for the red, green and blue of the headlight color for the specified vehicle, *false* if an invalid vehicle was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleHeadLightColor',
    },
    getVehicleIdleRespawnDelay: {
        summary: 'This function gets the time delay (in milliseconds)\nthe vehicle will remain at its position while empty.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get the idle delay of.' },
        ],
        returns: 'Returns the delay in milliseconds.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleIdleRespawnDelay',
    },
    getVehicleLandingGearDown: {
        summary: 'This function is used to check whether a vehicle\'s landing gear is down or not. Only planes can be used with this function.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which you wish to check the landing gear state.' },
        ],
        returns: 'Returns *true* if landing gear is down, *false* if the landing gear is up. Returns *nil* if the vehicle has no landing gear, or is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleLandingGearDown',
    },
    getVehicleLightState: {
        summary: 'This function returns the current state of the specified light on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to know the light state of.' },
            { name: 'light', isOptional: false, isVariadic: false, summary: 'A whole number determining the individual light:' },
        ],
        returns: 'Returns 0 (working) or 1 (broken)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleLightState',
    },
    getVehicleMaxPassengers: {
        summary: 'This function returns the maximum number of passengers that a specified vehicle can hold. Only passenger seats are counted, the driver seat is excluded.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'the model id that you wish to know the maximum capacity of.' },
        ],
        returns: 'Returns an int indicating the maximum number of passengers that can enter a vehicle. Returns **false** if vehicle (or its ID) is a trailer <!-- -->',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleMaxPassengers',
    },
    getVehicleModelDummyDefaultPosition: {
        summary: 'This function gets the default position of the dummies contained in a vehicle model.',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: 'The model ID which you want to apply the change to.' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: 'The dummy whose position you want to get.' },
        ],
        returns: 'Returns 3 floats indicating the default position X, Y and Z of the given dummy. It returns *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelDummyDefaultPosition',
    },
    getVehicleModelDummyPosition: {
        summary: 'This function gets position of the dummies contained in a vehicle model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID which you want to apply the change to' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: 'The dummy whose position you want to get' },
        ],
        returns: 'Returns three floats indicating the position *x*, *y* and *z* of given dummy. It returns *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelDummyPosition',
    },
    getVehicleModelExhaustFumesPosition: {
        summary: 'This function returns the position of the exhaust fumes the vehicle model emits.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The vehicle model ID.' },
        ],
        returns: 'Returns the position of the exhaust fumes if everything went fine or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelExhaustFumesPosition',
    },
    getVehicleModelFromName: {
        summary: 'This function retrieves the model ID of a vehicle as an integer value from its name.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'A string containing the name of the vehicle.' },
        ],
        returns: 'Returns an integer if the name exists, *false* otherwise. If you use this function on vehicles with shared names, such as "police", it will return the earliest occurrence of that vehicle\'s ID.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelFromName',
    },
    getVehicleModelWheelSize: {
        summary: 'This function gets the size of a group of wheels for a vehicle model.',
        parameters: [
            { name: 'vehicleModel', isOptional: false, isVariadic: false, summary: 'The vehicle model ID.' },
            { name: 'wheelGroup', isOptional: true, isVariadic: false, summary: 'The group of wheels of the vehicle model to retrieve their size value. If not specified, it defaults to *all_wheels*. The following values are supported:' },
        ],
        returns: 'Returns a decimal number or a table, depending on the specified wheel group. If the specified vehicle model ID or wheel group are not valid, an error is raised instead. The meaning of the wheel size values is documented in setVehicleModelWheelSize.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelWheelSize',
    },
    getVehicleName: {
        summary: 'This function returns a string containing the name of the vehicle',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you want to get the name of.' },
        ],
        returns: 'Returns a string containing the requested vehicle\'s name, or *false* if the vehicle passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleName',
    },
    getVehicleNameFromModel: {
        summary: 'Gets the name of a vehicle by its model ID.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'This is the vehicle model ID. See vehicle IDs to see what values will return names.' },
        ],
        returns: 'Returns the name of the vehicle if the model ID was valid, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleNameFromModel',
    },
    getVehicleNitroCount: {
        summary: 'This function gets the nitro count of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which you want to get a nitro count.' },
        ],
        returns: 'Returns *an integer* determining the amount of nitro counts of the vehicle, *false* if there is no nitro in the vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleNitroCount',
    },
};
