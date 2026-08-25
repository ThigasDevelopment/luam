import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_25: ApiDocumentationCatalog = {
    getVehicleNitroLevel: {
        summary: 'This function gets the nitro level of the vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle, which you want to get a nitro level.' },
        ],
        returns: 'Returns *a float* determining the nitro level (ranges from 0.0001 to 1.0) of the vehicle, *false* if there is no nitro in the vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleNitroLevel',
    },
    getVehicleOccupant: {
        summary: 'This function gets the player sitting/trying to enter the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which you wish to retrieve the driver or a passenger.' },
            { name: 'seat', isOptional: true, isVariadic: false, summary: 'the seat where the player is sitting (0 for driver, 1+ for passengers).' },
        ],
        returns: 'Returns the player sitting in the vehicle, or *false* if the seat is unoccupied or doesn\'t exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleOccupant',
    },
    getVehicleOccupants: {
        summary: 'This function gets all peds sitting in the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle of which you wish to retrieve the occupants.' },
        ],
        returns: 'Returns a table with seat ID as an index and the occupant as an element like this: table[seat] = occupant Returns *false* if an invalid vehicle was passed or if the vehicle has no seats (like a trailer) COUNTING PLAYERS IN A VEHICLE Don\'t use an ipairs loop with the table returned by this function. It will skip the driver, as ipairs starts at 1 and the driver seat is ID 0. And if there\'s an empty seat, ipairs will stop looping. You should use a pairs loop instead. ```lua local counter = 0 for seat, player in pairs(getVehicleOccupants(pseudoVehicle)) do counter = counter + 1 end outputDebugString("Players in your vehicle: ".. counter) ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleOccupants',
    },
    getVehicleOverrideLights: {
        summary: 'This function is used to find out the current state of the override-lights setting of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to retrieve the override lights setting of.' },
        ],
        returns: 'Returns an integer value: 0 (No override), 1 (Force off) or 2 (Force on).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleOverrideLights',
    },
    getVehiclePaintjob: {
        summary: 'This function gets the current paintjob on the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to get the paintjob of.' },
        ],
        returns: 'Returns an integer representing the current paintjob on the vehicle. * **0**: The first paintjob * **1**: The second paintjob * **2**: The third paintjob * **3**: Default paintjob (no paintjob)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclePaintjob',
    },
    getVehiclePanelState: {
        summary: 'This function returns the current state of a specifed panel on the vehicle. A vehicle can have up to 7 panels.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to know the panel state of.' },
            { name: 'panel', isOptional: false, isVariadic: false, summary: 'an *integer* specifying the panel you want to know the state of. Not every vehicle has every panel. Possible values are:' },
        ],
        returns: 'Returns an int indicating the state of the specified the panel. This is a value between 0 and 3, with 0 indicating the panel is undamaged and 3 indicating it is very damaged.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclePanelState',
    },
    getVehiclePlateText: {
        summary: 'This function is used to retrieve the text on the number plate of a specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to retrieve the plate text from.' },
        ],
        returns: 'Returns a *string* that corresponds to the plate on the text, *false* if a bad argument was passed or if it is not a vehicle. Every vehicle (including planes, boats, etc.) has a numberplate, even if it\'s not visible.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclePlateText',
    },
    getVehicleRespawnDelay: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get the respawn delay of.' },
        ],
        returns: 'Returns the delay in milliseconds.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleRespawnDelay',
    },
    getVehicleRespawnPosition: {
        summary: 'This function retrieves the respawn coordinates of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which you\'d like to retrieve the respawn coordinates of.' },
        ],
        returns: 'Returns three floats indicating the respawn coordinates of the vehicle, *x*, *y* and *z* respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleRespawnPosition',
    },
    getVehicleRespawnRotation: {
        summary: 'This function retrieves the respawn rotation of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which you\'d like to retrieve the respawn rotation of.' },
        ],
        returns: 'Returns three floats indicating the respawn rotation of the vehicle, *x*, *y* and *z* respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleRespawnRotation',
    },
    getVehicleRotorSpeed: {
        summary: 'Retrieves the speed at which the rotor of a helicopter or plane rotates.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle element (helicopter or plane) to get the rotor speed of.' },
        ],
        returns: 'Returns the rotor speed if successful. This is 0 when the helicopter or plane is stationary, and about 0.2 when it is fully spun up. It can be negative if the rotor rotates counter-clockwise. Returns *false* in case of failure (an invalid element or a vehicle element that is not a helicopter or plane was passed).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleRotorSpeed',
    },
    getVehicleRotorState: {
        summary: 'This function returns a vehicle\'s (plane or helicopter) rotor state (on or off).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle you wish to get the engine state of.' },
        ],
        returns: 'Returns **true** if the vehicle\'s rotor is started, **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleRotorState',
    },
    getVehicleSirenParams: {
        summary: 'This function get the parameters of a vehicles siren.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to get the siren parameters of' },
        ],
        returns: 'Returns a *table* with the siren count, siren type and a sub table for the four flags. False otherwise. ```lua [int] SirenParams.SirenCount [int] SirenParams.SirenType [table] SirenParams.Flags [bool] SirenParams.Flags["360"] [bool] SirenParams.Flags.DoLOSCheck [bool] SirenParams.Flags.UseRandomiser [bool] SirenParams.Flags.Silent ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleSirenParams',
    },
    getVehicleSirens: {
        summary: 'This function gets the properties of a vehicle\'s sirens.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to get siren information of.' },
        ],
        returns: 'If the vehicle is invalid, it returns *false*. Otherwise, returns a *table* with sub tables containing the properties of each siren point in the following manner: ```lua [float] SirenData[sirenPoint].x [float] SirenData[sirenPoint].y [float] SirenData[sirenPoint].z [int] SirenData[sirenPoint].Red [int] SirenData[sirenPoint].Green [int] SirenData[sirenPoint].Blue [int] SirenData[sirenPoint].Alpha [int] SirenData[sirenPoint].Min_Alpha ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleSirens',
    },
    getVehicleSirensOn: {
        summary: 'This function returns whether the sirens are turned on for the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that will be checked.' },
        ],
        returns: 'Returns *true* if the sirens are turned on for the specified vehicle, *false* if the sirens are turned off for the specified vehicle, if the vehicle doesn\'t have sirens or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleSirensOn',
    },
    getVehiclesLODDistance: {
        summary: 'Returns the distance of vehicles LOD.',
        parameters: [],
        returns: '* **float:** general distance used for most vehicles * **float:** distance used for trains and planes',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclesLODDistance',
    },
    getVehiclesOfType: {
        summary: 'This function scans through all the current vehicles and returns the ones matching the given model.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'The model of vehicles you want.' },
        ],
        returns: 'Returns a table of existing vehicles matching the specified model.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclesOfType',
    },
    getVehicleTowedByVehicle: {
        summary: 'This function is used to get the vehicle being towed by another.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get the towed vehicle from.' },
        ],
        returns: 'Returns the vehicle that *theVehicle* is towing, *false* if it isn\'t towing a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleTowedByVehicle',
    },
    getVehicleTowingVehicle: {
        summary: 'This function is used to get the vehicle that is towing another.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle being towed.' },
        ],
        returns: '* The vehicle that *theVehicle* is being towed by. * *false* if it isn\'t being towed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleTowingVehicle',
    },
    getVehicleTurnVelocity: {
        summary: 'This function is used to retrieve a vehicles turning velocity for each axis.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to get the turning velocities of.' },
        ],
        returns: 'returns 3 floats that represent the vehicles turning velocity on the x, y and z axis or false if wrong arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleTurnVelocity',
    },
    getVehicleTurretPosition: {
        summary: 'This function gets the position of a vehicle\'s turret, if it has one. Vehicles with turrets include firetrucks and tanks.',
        parameters: [
            { name: 'turretVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle whose turret position you want to retrieve. This should be a vehicle with a turret.' },
        ],
        returns: 'Returns two floats for the X (horizontal) and Y (vertical) axis rotation respectively. These values are in radians. The function will return *0, 0* if the vehicle is not a vehicle with a turret.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleTurretPosition',
    },
    getVehicleType: {
        summary: 'This function retrieves the type of a vehicle (such as if it is a car or a boat).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a *string* with vehicle type or *false* if an invalid modelID has been supplied, or an empty string if the vehicle is blocked internally (some trailers). Possible strings returned:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleType',
    },
    getVehicleUpgradeOnSlot: {
        summary: 'This function returns the current upgrade id on the specified vehicle\'s \'upgrade slot\'\nAn upgrade slot is a certain type of upgrade (eg: exhaust, spoiler), there are 17 slots (0 to 16).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle whose upgrade you want to retrieve.' },
            { name: 'slot', isOptional: false, isVariadic: false, summary: 'The slot id of the upgrade. *(Upgrade list ordered by slot number)*' },
        ],
        returns: 'Returns an *integer* with the upgrade on the slot if correct arguments were passed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleUpgradeOnSlot',
    },
    getVehicleUpgrades: {
        summary: 'This function returns a table of all the upgrades on a specifed vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to retrieve the upgrades of.' },
        ],
        returns: 'Returns a *table* of all the upgrades on each slot of a vehicle, which may be empty, or *false* if a valid vehicle is not passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleUpgrades',
    },
    getVehicleUpgradeSlotName: {
        summary: 'This function returns the name of an upgrade slot name (e.g. roof, spoiler).',
        parameters: [
            { name: 'slot/upgrade', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a *string* with the slot name if a valid slot or upgrade ID was given, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleUpgradeSlotName',
    },
    getVehicleVariant: {
        summary: 'This function gets the variant of a specified vehicle. In GTA: San Andreas some vehicles are different; for example the labelling on trucks or the contents of a pick-up truck and the varying types of a motor bike. For the default variant list see: Vehicle variants.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to get the variant of.' },
        ],
        returns: 'Returns 2 int containing the vehicle variants, *false* otherwise (the specified vehicle doesn\'t exist).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleVariant',
    },
    getVehicleWheelFrictionState: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to get the wheel friction state.' },
            { name: 'wheel', isOptional: false, isVariadic: false, summary: 'The wheel you want to check. (0: front left, 1: rear left, 2: front right, 3: rear right)' },
        ],
        returns: 'Returns a int indicating the wheel friction state. This value can be: * **0:** Normal friction * **1:** Slip with acceleration (only for driving wheels) * **2:** Slip without acceleration * **3:** Locked wheel (on brake or handbrake).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleWheelFrictionState',
    },
    getVehicleWheelScale: {
        summary: 'This function gets the scale of all the wheels of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to get its wheel scale of.' },
        ],
        returns: 'Returns the wheel scale of the specified vehicle as a decimal number, or an error if the vehicle is invalid. For more information about the returned number, see setVehicleWheelScale.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleWheelScale',
    },
    getVehicleWheelStates: {
        summary: 'This function returns the current states of all the wheels on the vehicle.\n\nNo vehicles have more than 4 wheels, if they appear to they will be duplicating other wheels.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A handle to the vehicle that you wish to know the wheel states of.' },
        ],
        returns: 'Returns 4 ints indicating the states of the wheels (front left, rear left, front right, rear right). These values can be: * **0:** Inflated * **1:** Flat * **2:** Fallen off * **3:** Collisionless',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleWheelStates',
    },
    getVersion: {
        summary: 'This function gives you various version information about MTA and the operating system.\n\nMTA already has a built in command \'/ver\' which will show you your client version. Alongside that, there is also \'/sver\' which will show you the version of the server you are currently connected to. This function unlike getPlayerVersion shows a lot more information regarding MTA version.',
        parameters: [],
        returns: 'Returns a table with version information. Specifically these keys are present in the table: ***number:** the MTA server or client version (depending where the function was called) in pure numerical form, e.g. *"256"* ***mta:** the MTA server or client version (depending where the function was called) in textual form, e.g. *"1.0"* ***name:** the full MTA product name, either *"MTA:SA Server"* or *"MTA:SA Client"*. ***netcode:** the netcode version number. ***os:** returns the operating system on which the server or client is running ***type:** the type of build. can be: ****"Nightly rX"** - A nightly development build. **X** represents the nightly build revision. ****"Custom"** - A build compiled manually ****"Release"** - A build that is publicly released (provisional). ***tag:** the build tag (from 1.0.3 onwards). Contains infomation about the underlying version used. i.e. The final version of 1.0.3 has the build tag of "1.0.3 rc-9". (This can be confirmed by using the console command \'ver\'.) ***sortable:** a 15 character sortable version string (from 1.0.4 onwards). Format of the string is described in getPlayerVersion.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVersion',
    },
};
