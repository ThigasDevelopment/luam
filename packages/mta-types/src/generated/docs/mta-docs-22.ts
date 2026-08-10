import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_22: ApiDocumentationCatalog = {
    getVehicleComponentRotation: {
        summary: 'This function gets the component rotation of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component rotation of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A Vehicle_Components|vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the returned rotation is relative to. It can be one of the following values: parent (default if not specified): The rotation is relative to the parent component. root : The rotation is relative to the root component. world : The rotation is a world rotation, relative to the worlds coordinates axes.' },
        ],
        returns: 'returns three floats indicating the rotation of the component, x, y and z respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentRotation',
    },
    getVehicleComponents: {
        summary: 'This function gets a table of the components currently on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get the Vehicle_Components|components of.' },
        ],
        returns: 'returns a table containing the name of the component as the key and visibility flag of that component as the value',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponents',
    },
    getVehicleComponentScale: {
        summary: 'This function gets the component scale of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component scale of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A Vehicle_Components|vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the returned scale is relative to. It can be one of the following values: parent The scale is relative to the parent component. root The scale is relative to the root component. world The scale is a world scale.' },
        ],
        returns: 'returns three floats indicating the scale of the component, x, y and z respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentScale',
    },
    getVehicleComponentVisible: {
        summary: 'This function get component visibility for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get component visibility of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A Vehicle_Components|vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'returns a bool indicating the visible state of the component.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleComponentVisible',
    },
    getVehicleController: {
        summary: 'This function is used to get the player in control of the specified vehicle which\nincludes somebody who is trying to enter the drivers seat.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you want to get the controller of.' },
        ],
        returns: 'returns a player object, if there isnt a driver, it will search the trailer chain for the front driver, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleController',
    },
    getVehicleCurrentGear: {
        summary: 'Gets the specified vehicles current gear.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle to get the gear of' },
        ],
        returns: 'returns the gear if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleCurrentGear',
    },
    getVehicleDoorOpenRatio: {
        summary: 'This function tells you how open a door is (the open ratio). Doors include boots/trunks\nand bonnets on vehicles that have them.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to get the door open ratio of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'A whole number, 0 (hood), 1 (trunk), 2 (front left), 3 (front right), 4 (rear left), 5 (rear right)' },
        ],
        returns: 'returns a number between 0 and 1 that indicates how open the door is. 0 is closed, and 1 is fully open. returns false if invalid arguments are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleDoorOpenRatio',
    },
    getVehicleDoorState: {
        summary: 'This function returns the current state of the specifed door on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you want to get the door status of.' },
            { name: 'door', isOptional: false, isVariadic: false, summary: 'a whole number representing which door to get the status of. Valid values are: 0 Hood 1 Trunk 2 Front left 3 Front right 4 Rear left 5 Rear right' },
        ],
        returns: 'if successful, one of the following integers will be returned: * 0: shut, intact (also returned if the door does not exist) * 1: ajar, intact * 2: shut, damaged * 3: ajar, damaged * 4: missing',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleDoorState',
    },
    getVehicleDummyPosition: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you want to get the dummy positions from.' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: 'The dummy whose position you want to get.' },
        ],
        returns: 'returns 3 float|floats indicating the position x, y and z of the vehicles dummy. it returns false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleDummyPosition',
    },
    getVehicleEngineState: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': the vehicle you wish to get the engine state of.' },
        ],
        returns: 'returns true if the vehicles engine is started, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleEngineState',
    },
    getVehicleGravity: {
        summary: 'Retrieves the current gravity vector of a vehicle. This is the direction in which the\nvehicle falls, also the cameras of any passengers will be rotated to match it.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle to retrieve the gravity vector of.' },
        ],
        returns: 'returns the x, y and z components of the gravity vector if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleGravity',
    },
    getVehicleHandling: {
        summary: 'This function returns a table of the current vehicle handling data.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to get the handling data of.' },
        ],
        returns: 'returns a table containing all the handling data, false otherwise. heres a list of valid table properties and what they return:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleHandling',
    },
    getVehicleHeadLightColor: {
        summary: 'This function will get the headlight color of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to set the headlight color of.' },
        ],
        returns: 'returns three integers for the red, green and blue of the headlight color for the specified vehicle, false if an invalid vehicle was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleHeadLightColor',
    },
    getVehicleLandingGearDown: {
        summary: 'This function is used to check whether a vehicles landing gear is down or not. Only\nplanes can be used with this function.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which you wish to check the landing gear state.' },
        ],
        returns: 'returns true if landing gear is down, false if the landing gear is up. returns nil if the vehicle has no landing gear, or is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleLandingGearDown',
    },
    getVehicleLightState: {
        summary: 'This function returns the current state of the specified light on the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to know the light state of.' },
            { name: 'light', isOptional: false, isVariadic: false, summary: 'A whole number determining the individual light: 0 Front left 1 Front right 2 Rear right 3 Rear left' },
        ],
        returns: 'returns 0 (working) or 1 (broken)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleLightState',
    },
    getVehicleMaxPassengers: {
        summary: 'This function returns the maximum number of passengers that a specified vehicle can hold.\nOnly passenger seats are counted, the driver seat is excluded.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to know the maximum capacity of. OR modelID the model id that you wish to know the maximum capacity of.' },
        ],
        returns: 'returns an int indicating the maximum number of passengers that can enter a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleMaxPassengers',
    },
    getVehicleModelDummyDefaultPosition: {
        summary: '',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: ': The model ID which you want to apply the change to.' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: ': The dummy whose position you want to get.' },
        ],
        returns: 'returns 3 float|floats indicating the default position x, y and z of the given dummy. it returns false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelDummyDefaultPosition',
    },
    getVehicleModelDummyPosition: {
        summary: 'This function gets position of the dummies contained in a vehicle model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': The model ID which you want to apply the change to' },
            { name: 'dummy', isOptional: false, isVariadic: false, summary: ': The dummy whose position you want to get' },
        ],
        returns: 'returns three floats indicating the position x, y and z of given dummy. it returns false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelDummyPosition',
    },
    getVehicleModelExhaustFumesPosition: {
        summary: 'This function returns the position of the exhaust fumes the vehicle model emits.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': The vehicle model ID.' },
        ],
        returns: 'returns the position of the exhaust fumes if everything went fine or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelExhaustFumesPosition',
    },
    getVehicleModelFromName: {
        summary: 'This function retrieves the model ID of a vehicle as an integer value from its name.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'A string containing the name of the vehicle.' },
        ],
        returns: 'returns an integer if the name exists, false otherwise. if you use this function on vehicles with shared names, such as police, it will return the earliest occurrence of that vehicles id.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelFromName',
    },
    getVehicleModelWheelSize: {
        summary: '',
        parameters: [
            { name: 'vehicleModel', isOptional: false, isVariadic: false, summary: ': The Vehicle IDs|vehicle model ID.' },
            { name: 'wheelGroup', isOptional: true, isVariadic: false, summary: ': The group of wheels of the vehicle model to retrieve their size value. If not specified, it defaults to all_wheels. The following values are supported: front_axle : Represents the wheels in the front axle. rear_axle : Represents the wheels in the rear axle. all_wheels : Convenience group that returns all the wheel sizes in a table of the following format: ```lua { front_axle = 0.8, rear_axle = 0.7 } ```' },
        ],
        returns: 'returns a decimal number or a table, depending on the specified wheel group. if the specified vehicle model id or wheel group are not valid, an error is raised instead. the meaning of the wheel size values is documented in setvehiclemodelwheelsize.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleModelWheelSize',
    },
    getVehicleName: {
        summary: 'This function returns a string containing the name of the vehicle',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you want to get the name of.' },
        ],
        returns: 'returns a string containing the requested vehicles name, or false if the vehicle passed to the function is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleName',
    },
    getVehicleNameFromModel: {
        summary: 'Gets the name of a vehicle by its model ID.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'This is the vehicle model ID. See vehicle IDs to see what values will return names.' },
        ],
        returns: 'returns the name of the vehicle if the model id was valid, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleNameFromModel',
    },
    getVehicleNitroCount: {
        summary: 'This function gets the nitro count of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which you want to get a nitro count.' },
        ],
        returns: 'returns an integer determining the amount of nitro counts of the vehicle, false if there is no nitro in the vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleNitroCount',
    },
    getVehicleNitroLevel: {
        summary: 'This function gets the nitro level of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to get a nitro level.' },
        ],
        returns: 'returns a float determining the nitro level (ranges from 0.0001 to 1.0) of the vehicle, false if there is no nitro in the vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleNitroLevel',
    },
    getVehicleOccupant: {
        summary: 'This function gets the player sitting/trying to enter the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which you wish to retrieve the driver or a passenger.' },
            { name: 'seat', isOptional: true, isVariadic: false, summary: 'the seat where the player is sitting (0 for driver, 1+ for passengers).' },
        ],
        returns: 'returns the player sitting in the vehicle, or false if the seat is unoccupied or doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleOccupant',
    },
    getVehicleOccupants: {
        summary: 'This function gets all peds sitting in the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which you wish to retrieve the occupants.' },
        ],
        returns: 'returns a table with seat id as an index and the occupant as an element like this: tableseat = occupant returns false if an invalid vehicle was passed or if the vehicle has no seats (like a trailer) counting players in a vehicle dont use an ipairs loop with the table returned by this function. it will skip the driver, as ipairs starts at 1 and the driver seat is id 0. and if theres an empty seat, ipairs will stop looping. you should use a pairs loop instead. ```lua local counter = 0 for seat, player in pairs(getvehicleoccupants(pseudovehicle)) do counter = counter + 1 end outputdebugstring(players in your vehicle: .. counter) ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleOccupants',
    },
    getVehicleOverrideLights: {
        summary: 'This function is used to find out the current state of the override-lights setting of a\nvehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': the vehicle you wish to retrieve the override lights setting of.' },
        ],
        returns: 'returns an integer value: 0 (no override), 1 (force off) or 2 (force on).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleOverrideLights',
    },
};
