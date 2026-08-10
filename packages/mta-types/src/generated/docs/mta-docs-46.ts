import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_46: ApiDocumentationCatalog = {
    setVehicleRespawnDelay: {
        summary: 'This function sets the time delay (in milliseconds) the vehicle will remain wrecked\nbefore respawning.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the respawn delay of.' },
            { name: 'timeDelay', isOptional: false, isVariadic: false, summary: ': The amount of milliseconds to delay.' },
        ],
        returns: 'returns true if the vehicle was found and edited.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRespawnDelay',
    },
    setVehicleRespawnPosition: {
        summary: 'This function sets the position (and rotation) the vehicle will respawn to.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the respawn position of.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: ': A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: ': A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: ': A floating point number representing the Z coordinate on the map.' },
            { name: 'rx', isOptional: true, isVariadic: false, summary: ': A floating point number representing the rotation about the X axis in Degrees.' },
            { name: 'ry', isOptional: true, isVariadic: false, summary: ': A floating point number representing the rotation about the Y axis in Degrees.' },
            { name: 'rz', isOptional: true, isVariadic: false, summary: ': A floating point number representing the rotation about the Z axis in Degrees.' },
        ],
        returns: 'returns true if the vehicle was found and edited, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRespawnPosition',
    },
    setVehicleRespawnRotation: {
        summary: 'This function sets the rotation the vehicle will respawn to.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle you wish to change the respawn position of.' },
            { name: 'rx', isOptional: false, isVariadic: false, summary: ': A float representing the rotation about the X axis in degrees.' },
            { name: 'ry', isOptional: false, isVariadic: false, summary: ': A float representing the rotation about the Y axis in degrees.' },
            { name: 'rz', isOptional: false, isVariadic: false, summary: ': A float representing the rotation about the Z axis in degrees.' },
        ],
        returns: 'returns true if the vehicle respawn rotation was set successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRespawnRotation',
    },
    setVehicleSirens: {
        summary: 'This function changes the properties of a vehicles siren point.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to modify' },
            { name: 'sirenPoint', isOptional: false, isVariadic: false, summary: 'The siren point to modify' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'The x position of this siren point from the center of the vehicle' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'The y position of this siren point from the center of the vehicle' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: 'The z position of this siren point from the center of the vehicle' },
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The amount of red from 0 to 255' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The amount of green from 0 to 255' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The amount of blue from 0 to 255' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: 'The alpha of the siren from 0 to 255' },
            { name: 'minAlpha', isOptional: true, isVariadic: false, summary: 'The minimum alpha of the light during day time' },
        ],
        returns: 'returns true if the siren point was successfully changed on the vehicle, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleSirens',
    },
    setVehicleSirensOn: {
        summary: 'This function changes the state of the sirens on the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that will have the sirens set' },
            { name: 'sirensOn', isOptional: false, isVariadic: false, summary: 'The state to set the sirens to' },
        ],
        returns: 'returns true if the sirens are set for the specified vehicle, false if the sirens cant be set for the specified vehicle, if the vehicle doesnt have sirens or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleSirensOn',
    },
    setVehiclesLODDistance: {
        summary: 'Sets the distance of vehicles LOD.',
        parameters: [
            { name: 'vehiclesDistance', isOptional: false, isVariadic: false, summary: 'general distance used for most vehicles, this value is clamped to 0 – 500' },
            { name: 'trainsAndPlanesDistance', isOptional: true, isVariadic: false, summary: 'distance used for trains and planes, this value is clamped to 0 – 500' },
        ],
        returns: 'this function returns true if arguments are valid. returns false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclesLODDistance',
    },
    setVehicleTaxiLightOn: {
        summary: 'This function will set the taxi light on in a taxi (vehicle IDs 420 and 438)',
        parameters: [
            { name: 'taxi', isOptional: false, isVariadic: false, summary: 'The vehicle element of the taxi that you wish to turn the light on.' },
            { name: 'LightState', isOptional: false, isVariadic: false, summary: 'whether the light is on. True for on, False for off.' },
        ],
        returns: 'returns true if the state was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleTaxiLightOn',
    },
    setVehicleTurnVelocity: {
        summary: 'Sets the angular velocity of a vehicle. Basically applies a spin to it.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to apply the spin to.' },
            { name: 'rx', isOptional: false, isVariadic: false, summary: 'velocity around the X axis' },
            { name: 'ry', isOptional: false, isVariadic: false, summary: 'velocity around the Y axis' },
            { name: 'rz', isOptional: false, isVariadic: false, summary: 'velocity around the Z axis' },
        ],
        returns: 'returns true if it was succesful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleTurnVelocity',
    },
    setVehicleTurretPosition: {
        summary: 'This function sets the position of a vehicles turret, if it has one. This can be used to\ninfluence the turrets rotation, so it doesnt follow the camera. Vehicles with turrets\ninclude firetrucks and tanks.',
        parameters: [
            { name: 'turretVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle whose turret position you want to retrieve. This should be a vehicle with a turret.' },
            { name: 'positionX', isOptional: false, isVariadic: false, summary: ': The horizontal position of the turret. In radians' },
            { name: 'positionY', isOptional: false, isVariadic: false, summary: ': The vertical position of the turret. In radians' },
        ],
        returns: 'returns a true if a valid vehicle element and valid positions were passed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleTurretPosition',
    },
    setVehicleVariant: {
        summary: 'This function sets the variant of a specified vehicle. In GTA: San Andreas some vehicles\nare different; for example the labelling on trucks or the contents of a pick-up truck and\nthe varying types of a motor bike. For the default variant list see: Vehicle variants.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to set the variant.' },
            { name: 'variant1', isOptional: true, isVariadic: false, summary: ': An integer for the first variant. See Vehicle variants.' },
            { name: 'variant2', isOptional: true, isVariadic: false, summary: ': An integer for the second variant. See Vehicle variants.' },
        ],
        returns: 'returns true if the vehicle variants were successfully set, false otherwise (the specified vehicle doesnt exist or the specified variants are invalid).',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleVariant',
    },
    setVehicleWheelScale: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: ': The vehicle whose wheel scale you wish to modify.' },
            { name: 'wheelScale', isOptional: false, isVariadic: false, summary: ': The wheel scale value to set.' },
        ],
        returns: 'returns true if the wheel scale has been set successfully, or an error if some parameter is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleWheelScale',
    },
    setVehicleWheelStates: {
        summary: 'This function sets the state of wheels on the vehicle.\nInternally, no vehicles have more than 4 wheels. If they appear to, they will be\nduplicating other wheels.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A handle to the vehicle that you wish to change the wheel states of.' },
            { name: 'frontLeft', isOptional: false, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
            { name: 'rearLeft', isOptional: true, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
            { name: 'frontRight', isOptional: true, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
            { name: 'rearRight', isOptional: true, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
        ],
        returns: 'returns a boolean value true or false that tells you if it was successful or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleWheelStates',
    },
    setVehicleWindowOpen: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to change the window state.' },
            { name: 'window', isOptional: false, isVariadic: false, summary: 'An integer representing window. 0 motorbike shield 1 rear window 2 right front window 3 right back window 4 left front (driver) window 5 left back window 6 windshield' },
            { name: 'open', isOptional: false, isVariadic: false, summary: 'Boolean which represent window open state.' },
        ],
        returns: '* when the vehicle is not streamed in: ** if the window id does lie within the acceptable list of values, it will return true ** if the window id does not lie within the acceptable list of values, it will return false * when the vehicle is streamed in: ** if the vehicle has the window, it will return true ** if the vehicle does not have the window, it will return false',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleWindowOpen',
    },
    setWaterColor: {
        summary: 'This function changes the water color of the GTA world.',
        parameters: [
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The red value of the water, from 0 to 255.' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The green value of the water, from 0 to 255.' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The blue value of the water, from 0 to 255.' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: 'The alpha (visibility) value of the water, from 0 to 255. Defaults to 200 if not declared.' },
        ],
        returns: 'returns true if water color was set correctly, false if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaterColor',
    },
    setWaterDrawnLast: {
        summary: 'This function changes the water rendering order.',
        parameters: [
            { name: 'bEnabled', isOptional: false, isVariadic: false, summary: ': A boolean value determining whether water should be drawn last.' },
        ],
        returns: 'returns true if the rendering order was changed successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaterDrawnLast',
    },
    setWaterLevel: {
        summary: 'Sets the height of some or all the water in the game world.',
        parameters: [
            { name: 'theWater', isOptional: false, isVariadic: false, summary: 'the water element to change. \'\'or:\'\' includeWaterFeatures a boolean indicating whether to also set the level of water features such as ponds and pools. includeWaterElements a boolean indicating whether to also set the level of all water elements. includeWorldSea a boolean indicating whether to set the level of the sea water includeOutsideWorldSea a boolean indicating whether to also set the level of sea water outside the world area, ie. outside -3000, 3000.' },
            { name: 'level', isOptional: false, isVariadic: false, summary: 'the new Z coordinate of the water surface. All water in the game world is set to this height.' },
        ],
        returns: 'returns true if successful, false in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaterLevel',
    },
    setWaterVertexPosition: {
        summary: 'Sets the world position of a corner point of a water area.',
        parameters: [
            { name: 'theWater', isOptional: false, isVariadic: false, summary: 'the water element of which to change a vertex.' },
            { name: 'vertexIndex', isOptional: false, isVariadic: false, summary: 'the index of the vertex to move. Values range from 1 to 4 for water quads, and 1 to 3 for triangles.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'the X coordinate to set for the vertex.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'the Y coordinate to set for the vertex.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'the Z coordinate to set for the vertex.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaterVertexPosition',
    },
    setWaveHeight: {
        summary: 'This function sets the wave height to the desired value, the default is 0.',
        parameters: [
            { name: 'height', isOptional: false, isVariadic: false, summary: 'A float between 0 and 100.' },
        ],
        returns: 'returns a boolean value true or false that tells you if it was successful or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaveHeight',
    },
    setWeaponAmmo: {
        summary: 'Sets the ammo to a certain amount for a specified weapon (if they already have it),\nregardless of current ammo.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'A whole number integer that refers to a weapon ID.' },
            { name: 'totalAmmo', isOptional: false, isVariadic: false, summary: 'A whole number integer serving as the total ammo amount for the given weapon (including ammo in clip).' },
            { name: 'ammoInClip', isOptional: true, isVariadic: false, summary: 'The amount of ammo to set in the players clip. This will be taken from the main ammo. If left unspecified or set to 0, the current clip will remain.' },
        ],
        returns: 'returns a boolean value true or false that tells you if it was successful or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponAmmo',
    },
    setWeaponClipAmmo: {
        summary: 'This function sets the ammo left in a Element/Weapon|custom weapons magazine/clip.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The Element/Weapon|weapon to set the clip ammo of.' },
            { name: 'clipAmmo', isOptional: false, isVariadic: false, summary: 'The amount of ammo in the clip.' },
        ],
        returns: 'this function returns true if the arguments are valid and the weapon clip ammo could be changed; false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponClipAmmo',
    },
    setWeaponFiringRate: {
        summary: 'This function sets the firing rate to be used when a Element/Weapon|custom weapon is in\nfiring state.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'The weapon to modify the firing rate of.' },
            { name: 'firingRate', isOptional: false, isVariadic: false, summary: 'The weapon firing rate. It seems to be a kind of frecuency value, so the lower the quicker the Element/Weapon|custom weapon will shoot.' },
        ],
        returns: 'returns true on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponFiringRate',
    },
    setWeaponFlags: {
        summary: 'This function sets a Element/Weapon|custom weapon flags, used to change how it behaves or\nfinds a possible target to shoot.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the Element/Weapon|weapon element to set the flag of.' },
            { name: 'theFlag', isOptional: false, isVariadic: false, summary: 'the weapon flag to change (all of them can be true or false): disable_model : makes the weapon and muzzle effect invisible or not. flags : configures the flags used to get where the gun shoots at. They are based on processLineOfSights. You have to specify all the eight flags for the function to succeed. These flags are (by order): checkBuildings : allows the shoot to be blocked by GTAs internally placed buildings, i.e. the world map. checkCarTires : allows the shoot to be blocked by vehicle tires. checkDummies : allows the shoot to be blocked by GTAs internal dummies. These are not used in the current MTA version so this argument can be set to false. checkObjects : allows the shoot to be blocked by object|objects. checkPeds : allows the shoot to be blocked by ped|peds and player|players. checkVehicles : allows the shoot to be blocked by vehicle|vehicles. checkSeeThroughStuff : allows the shoot to be blocked by translucent game objects, e.g. glass. checkShootThroughStuff : allows the shoot to be blocked by things that can be shot through. instant_reload : if enabled, the weapon will reload instantly rather than waiting the reload time until shooting again. shoot_if_out_of_range : if enabled, the weapon will still fire its target beyond the weapon range distance. shoot_if_blocked : if enabled, the weapon will still fire its target even if its blocked by something.' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: ': whether to enable or disable the specified flag.' },
        ],
        returns: 'returns true if all arguments are valid and the flags where changed; false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponFlags',
    },
    setWeaponProperty: {
        summary: 'This function sets the weapon property of the specified weapons specified weapon type.\nSee lower down the page for documentation related to weapon creation.\n```lua\nbool setWeaponProperty ( int weaponID/string weaponName, string\nweaponSkill, string property, int/float theValue )\n```\n*weaponID: The ID or name of the Weapons|weapon you want to set a property of. Names can\nbe:\n*weaponSkill: Either: pro, std or poor. The player must have this skill level set to have\nthe effect.\n*property: The property you want to set the value of:\n*theValue: The value to set the property to.\nOn success:\nbool: Returns true if the weapon property was successfully set\nOn failure:\nbool: Returns false if the weapon property was unable to be set\n\nThe client side function only applies to custom weapons created client sided.\n```lua\nbool setWeaponProperty ( weapon theWeapon, string strProperty,\nvalue theValue )\n```\n* theWeapon: the weapon to change the property of.\n* strProperty: the property to edit:\n* theValue: The value to set the property to.\nReturns true if the property was set.',
        parameters: [
            { name: 'weaponID', isOptional: false, isVariadic: false, summary: 'The ID or name of the Weapons|weapon you want to set a property of. Names can be:' },
            { name: 'weaponSkill', isOptional: false, isVariadic: false, summary: 'Either: pro, std or poor. The player must have this skill level set to have the effect.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you want to set the value of:' },
            { name: 'theValue', isOptional: false, isVariadic: false, summary: 'The value to set the property to.' },
        ],
        returns: 'on success: bool: returns true if the weapon property was successfully set on failure: bool: returns false if the weapon property was unable to be set',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponProperty',
    },
};
