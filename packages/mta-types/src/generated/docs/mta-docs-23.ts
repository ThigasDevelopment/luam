import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_23: ApiDocumentationCatalog = {
    getVehiclePaintjob: {
        summary: 'This function gets the current paintjob on the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': the vehicle you wish to get the paintjob of.' },
        ],
        returns: 'returns an integer representing the current paintjob on the vehicle. * 0: the first paintjob * 1: the second paintjob * 2: the third paintjob * 3: default paintjob (no paintjob)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclePaintjob',
    },
    getVehiclePanelState: {
        summary: 'This function returns the current state of a specifed panel on the vehicle. A vehicle can\nhave up to 7 panels.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to know the panel state of.' },
            { name: 'panel', isOptional: false, isVariadic: false, summary: 'an integer specifying the panel you want to know the state of. Not every vehicle has every panel. Possible values are: 0 Front-left panel 1 Front-right panel 2 Rear-left panel 3 Rear-right panel 4 Windscreen 5 Front bumper 6 Rear bumper' },
        ],
        returns: 'returns an int indicating the state of the specified the panel. this is a value between 0 and 3, with 0 indicating the panel is undamaged and 3 indicating it is very damaged.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclePanelState',
    },
    getVehiclePlateText: {
        summary: 'This function is used to retrieve the text on the number plate of a specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle that you wish to retrieve the plate text from.' },
        ],
        returns: 'returns a string that corresponds to the plate on the text, false if a bad argument was passed or if it is not a vehicle. every vehicle (including planes, boats, etc.) has a numberplate, even if its not visible.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclePlateText',
    },
    getVehicleRespawnPosition: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which youd like to retrieve the respawn coordinates of.' },
        ],
        returns: 'returns three float|floats indicating the respawn coordinates of the vehicle, x, y and z respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleRespawnPosition',
    },
    getVehicleRespawnRotation: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle which youd like to retrieve the respawn rotation of.' },
        ],
        returns: 'returns three float|floats indicating the respawn rotation of the vehicle, x, y and z respectively.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleRespawnRotation',
    },
    getVehicleSirenParams: {
        summary: 'This function get the parameters of a vehicles siren.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to get the siren parameters of' },
        ],
        returns: 'returns a table with the siren count, siren type and a sub table for the four flags. false otherwise. ```lua int sirenparams.sirencount int sirenparams.sirentype table sirenparams.flags bool sirenparams.flags360 bool sirenparams.flags.doloscheck bool sirenparams.flags.userandomiser bool sirenparams.flags.silent ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleSirenParams',
    },
    getVehicleSirens: {
        summary: 'This function gets the properties of a vehicles sirens.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to get siren information of.' },
        ],
        returns: 'if the vehicle is invalid, it returns false. otherwise, returns a table with sub tables containing the properties of each siren point in the following manner: ```lua float sirendatasirenpoint.x float sirendatasirenpoint.y float sirendatasirenpoint.z int sirendatasirenpoint.red int sirendatasirenpoint.green int sirendatasirenpoint.blue int sirendatasirenpoint.alpha int sirendatasirenpoint.min_alpha ```',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleSirens',
    },
    getVehicleSirensOn: {
        summary: 'This function returns whether the sirens are turned on for the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that will be checked.' },
        ],
        returns: 'returns true if the sirens are turned on for the specified vehicle, false if the sirens are turned off for the specified vehicle, if the vehicle doesnt have sirens or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleSirensOn',
    },
    getVehiclesLODDistance: {
        summary: 'Returns the distance of vehicles LOD.',
        parameters: [],
        returns: '* float: general distance used for most vehicles * float: distance used for trains and planes',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclesLODDistance',
    },
    getVehiclesOfType: {
        summary: 'This function scans through all the current vehicles and returns the ones matching the\ngiven model.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: ': The model of vehicles you want.' },
        ],
        returns: 'returns a table of existing vehicles matching the specified model.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehiclesOfType',
    },
    getVehicleTowedByVehicle: {
        summary: 'This function is used to get the vehicle being towed by another.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to get the towed vehicle from.' },
        ],
        returns: 'returns the vehicle that thevehicle is towing, false if it isnt towing a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleTowedByVehicle',
    },
    getVehicleTowingVehicle: {
        summary: 'This function is used to get the vehicle that is towing another.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': the vehicle being towed.' },
        ],
        returns: '* the vehicle that thevehicle is being towed by. * false if it isnt being towed.',
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
        summary: 'This function gets the position of a vehicles turret, if it has one. Vehicles with\nturrets include firetrucks and tanks.',
        parameters: [
            { name: 'turretVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle whose turret position you want to retrieve. This should be a vehicle with a turret.' },
        ],
        returns: 'returns two floats for the x (horizontal) and y (vertical) axis rotation respectively. these values are in radians. the function will return 0, 0 if the vehicle is not a vehicle with a turret.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleTurretPosition',
    },
    getVehicleType: {
        summary: 'This function retrieves the type of a vehicle (such as if it is a car or a boat).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns a string with vehicle type or false if an invalid modelid has been supplied, or an empty string if the vehicle is blocked internally (some trailers). possible strings returned:',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleType',
    },
    getVehicleUpgradeOnSlot: {
        summary: 'This function returns the current upgrade id on the specified vehicles upgrade slot\nAn upgrade slot is a certain type of upgrade (eg: exhaust, spoiler), there are 17 slots\n(0 to 16).',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle whose upgrade you want to retrieve.' },
            { name: 'slot', isOptional: false, isVariadic: false, summary: ': The slot id of the upgrade. (Upgrade list ordered by slot number)' },
        ],
        returns: 'returns an integer with the upgrade on the slot if correct arguments were passed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleUpgradeOnSlot',
    },
    getVehicleUpgrades: {
        summary: 'This function returns a table of all the upgrades on a specifed vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to retrieve the upgrades of.' },
        ],
        returns: 'returns a table of all the upgrades on each slot of a vehicle, which may be empty, or false if a valid vehicle is not passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleUpgrades',
    },
    getVehicleUpgradeSlotName: {
        summary: 'This function returns the name of an upgrade slot name (e.g. roof, spoiler).',
        parameters: [
            { name: 'slot_upgrade', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns a string with the slot name if a valid slot or upgrade id was given, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleUpgradeSlotName',
    },
    getVehicleVariant: {
        summary: 'This function gets the variant of a specified vehicle. In GTA: San Andreas some vehicles\nare different; for example the labelling on trucks or the contents of a pick-up truck and\nthe varying types of a motor bike. For the default variant list see: Vehicle variants.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to get the variant of.' },
        ],
        returns: 'returns 2 int containing the vehicle variants, false otherwise (the specified vehicle doesnt exist).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleVariant',
    },
    getVehicleWheelFrictionState: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to get the wheel friction state.' },
            { name: 'wheel', isOptional: false, isVariadic: false, summary: 'The wheel you want to check. (0: front left, 1: rear left, 2: front right, 3: rear right)' },
        ],
        returns: 'returns a int indicating the wheel friction state. this value can be: * 0: normal friction * 1: slip with acceleration (only for driving wheels) * 2: slip without acceleration * 3: locked wheel (on brake or handbrake).',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleWheelFrictionState',
    },
    getVehicleWheelScale: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle to get its wheel scale of.' },
        ],
        returns: 'returns the wheel scale of the specified vehicle as a decimal number, or an error if the vehicle is invalid. for more information about the returned number, see setvehiclewheelscale.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleWheelScale',
    },
    getVehicleWheelStates: {
        summary: 'This function returns the current states of all the wheels on the vehicle.\nNo vehicles have more than 4 wheels, if they appear to they will be duplicating other\nwheels.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A handle to the vehicle that you wish to know the wheel states of.' },
        ],
        returns: 'returns 4 ints indicating the states of the wheels (front left, rear left, front right, rear right). these values can be: * 0: inflated * 1: flat * 2: fallen off * 3: collisionless',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVehicleWheelStates',
    },
    getVersion: {
        summary: 'This function gives you various version information about MTA and the operating system.',
        parameters: [],
        returns: 'returns a table with version information. specifically these keys are present in the table: *number: the mta server or client version (depending where the function was called) in pure numerical form, e.g. 256 *mta: the mta server or client version (depending where the function was called) in textual form, e.g. 1.0 *name: the full mta product name, either mta:sa server or mta:sa client. *netcode: the netcode version number. *os: returns the operating system on which the server or client is running *type: the type of build. can be: **nightly rx - a nightly development build. x represents the nightly build revision. **custom - a build compiled manually **release - a build that is publicly released (provisional). *tag: the build tag (from 1.0.3 onwards). contains infomation about the underlying version used. i.e. the final version of 1.0.3 has the build tag of 1.0.3 rc-9. (this can be confirmed by using the console command ver.) *sortable: a 15 character sortable version string (from 1.0.4 onwards). format of the string is described in getplayerversion.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetVersion',
    },
    getWaterColor: {
        summary: 'This function returns the water color of the GTA world.\nNote: The server can only return the water color, if it has actually been set by script.',
        parameters: [],
        returns: 'returns 4 int|ints, indicating the color of the water. (rgba)',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaterColor',
    },
    getWaterLevel: {
        summary: 'This function allows you to retrieve the water level from a certain location. The water\nlevel is 0 in most places though it can vary (e.g. its higher near the dam).',
        parameters: [
            { name: 'posX', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: '' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: '' },
            { name: 'ignoreDistanceToWaterThreshold', isOptional: true, isVariadic: false, summary: 'If set to false, this function returns false, if the difference between water level (without waves) and posZ is greater than 3.0' },
        ],
        returns: 'returns an integer of the water level if the localplayer/position is near the water (-3 to 20 on the z coordinate) else false if theres no water near the localplayer/position.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaterLevel',
    },
    getWaterVertexPosition: {
        summary: 'Gets the world position of a vertex (i.e. corner) of a water area. Each water area is\neither a triangle or quad (rectangle) so each has 3 or 4 corners.',
        parameters: [
            { name: 'theWater', isOptional: false, isVariadic: false, summary: 'the water element to get the vertex of' },
            { name: 'vertexIndex', isOptional: false, isVariadic: false, summary: 'the index of the vertex whose position to get. Values range from 1 to 4 for a water quad, or 1 to 3 for a triangle.' },
        ],
        returns: 'returns the x, y and z coordinates of the specified vertex if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaterVertexPosition',
    },
    getWaveHeight: {
        summary: 'This function returns the current wave height.',
        parameters: [],
        returns: 'returns the height as a float, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWaveHeight',
    },
    getWeaponAmmo: {
        summary: 'This function gets the total ammo a Element/Weapon|custom weapon has.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: ': The weapon to get the ammo of.' },
        ],
        returns: 'returns an int|integer containing how many ammo left has the weapon. returns false if an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponAmmo',
    },
    getWeaponClipAmmo: {
        summary: 'This function gets the amount of ammo left in a Element/Weapon|custom weapons\nmagazine/clip.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon to get the clip ammo of.' },
        ],
        returns: 'returns the amount of ammo in the element/weapon|custom weapons clip, false if an error occured.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponClipAmmo',
    },
    getWeaponFiringRate: {
        summary: 'This gets the firing rate to be used when a Element/Weapon|custom weapon opens fire.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to modify the firing rate of.' },
        ],
        returns: 'returns an integer with the firing rate of the custom weapon, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/GetWeaponFiringRate',
    },
};
