import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_50: ApiDocumentationCatalog = {
    setVehicleRespawnPosition: {
        summary: 'This function sets the position (and rotation) the vehicle will respawn to.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the respawn position of.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'rx', isOptional: true, isVariadic: false, summary: 'A floating point number representing the rotation about the X axis in Degrees.' },
            { name: 'ry', isOptional: true, isVariadic: false, summary: 'A floating point number representing the rotation about the Y axis in Degrees.' },
            { name: 'rz', isOptional: true, isVariadic: false, summary: 'A floating point number representing the rotation about the Z axis in Degrees.' },
        ],
        returns: 'Returns *true* if the vehicle was found and edited, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRespawnPosition',
    },
    setVehicleRespawnRotation: {
        summary: 'This function sets the rotation the vehicle will respawn to.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the respawn position of.' },
            { name: 'rx', isOptional: false, isVariadic: false, summary: 'A float representing the rotation about the X axis in degrees.' },
            { name: 'ry', isOptional: false, isVariadic: false, summary: 'A float representing the rotation about the Y axis in degrees.' },
            { name: 'rz', isOptional: false, isVariadic: false, summary: 'A float representing the rotation about the Z axis in degrees.' },
        ],
        returns: 'Returns *true* if the vehicle respawn rotation was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRespawnRotation',
    },
    setVehicleRotorSpeed: {
        summary: 'Sets the rotor speed of a helicopter or plane. This function now applies to both helicopters and planes.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle (helicopter or plane) to adjust the rotor of.' },
            { name: 'speed', isOptional: false, isVariadic: false, summary: 'the new rotor speed. Usual values are 0 if the vehicle is stationary, or 0.2 if the rotor is fully spun up. Higher values than normal will not affect the vehicle\'s handling. Negative values are allowed and will make the rotor spin in the opposite direction (for helicopters, this pushes it down).' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRotorSpeed',
    },
    setVehicleRotorState: {
        summary: 'Turns the rotor on/off for an plane or helicopter. A vehicle with the rotor turned off cannot hover in the air.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle (helicopter or plane) whose rotor you want to toggle.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'The rotor state, which determines whether it should be on (**true**) or off (**false**).' },
            { name: 'stopRotor', isOptional: true, isVariadic: false, summary: 'Specifies whether the rotor should be stopped after being turned off. If false, the rotor will continue spinning at a constant speed (it won\'t slow down or accelerate). It will also not be able to lift off the ground. You can also use setVehicleRotorSpeed to manage the rotor speed.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleRotorState',
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
        returns: 'Returns *true* if the siren point was successfully changed on the vehicle, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleSirens',
    },
    setVehicleSirensOn: {
        summary: 'This function changes the state of the sirens on the specified vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that will have the sirens set' },
            { name: 'sirensOn', isOptional: false, isVariadic: false, summary: 'The state to set the sirens to' },
        ],
        returns: 'Returns *true* if the sirens are set for the specified vehicle, *false* if the sirens can\'t be set for the specified vehicle, if the vehicle doesn\'t have sirens or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleSirensOn',
    },
    setVehiclesLODDistance: {
        summary: 'Sets the distance of vehicles LOD.',
        parameters: [
            { name: 'vehiclesDistance', isOptional: false, isVariadic: false, summary: 'general distance used for most vehicles, this value is clamped to 0 – 500' },
            { name: 'trainsAndPlanesDistance', isOptional: true, isVariadic: false, summary: 'distance used for trains and planes, this value is clamped to 0 – 500' },
        ],
        returns: 'This function returns *true* if arguments are valid. Returns *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehiclesLODDistance',
    },
    setVehicleSmokeTrailEnabled: {
        summary: 'This function used to set planes smoke trail enabled or disabled.',
        parameters: [
            { name: 'veh', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to set the smoke trail.' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'A boolean if set to true it will enabled the smoke trail.' },
        ],
        returns: 'If successful returns *true*, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleSmokeTrailEnabled',
    },
    setVehicleTaxiLightOn: {
        summary: 'This function will set the taxi light on in a taxi (vehicle ID\'s 420 and 438)',
        parameters: [
            { name: 'taxi', isOptional: false, isVariadic: false, summary: 'The vehicle element of the taxi that you wish to turn the light on.' },
            { name: 'LightState', isOptional: false, isVariadic: false, summary: 'whether the light is on. *True* for on, *False* for off.' },
        ],
        returns: 'Returns *true* if the state was successfully set, *false* otherwise.',
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
        summary: 'This function sets the position of a vehicle\'s turret, if it has one. This can be used to influence the turret\'s rotation, so it doesn\'t follow the camera. Vehicles with turrets include firetrucks and tanks.',
        parameters: [
            { name: 'turretVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle whose turret position you want to retrieve. This should be a vehicle with a turret.' },
            { name: 'positionX', isOptional: false, isVariadic: false, summary: 'The horizontal position of the turret. In radians' },
            { name: 'positionY', isOptional: false, isVariadic: false, summary: 'The vertical position of the turret. In radians' },
        ],
        returns: 'Returns a *true* if a valid vehicle element and valid positions were passed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleTurretPosition',
    },
    setVehicleVariant: {
        summary: 'This function sets the variant of a specified vehicle. In GTA: San Andreas some vehicles are different; for example the labelling on trucks or the contents of a pick-up truck and the varying types of a motor bike. For the default variant list see: Vehicle variants.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to set the variant.' },
            { name: 'variant1', isOptional: true, isVariadic: false, summary: 'An integer for the first variant. See Vehicle variants.' },
            { name: 'variant2', isOptional: true, isVariadic: false, summary: 'An integer for the second variant. See Vehicle variants.' },
        ],
        returns: 'Returns *true* if the vehicle variants were successfully set, *false* otherwise (the specified vehicle doesn\'t exist or the specified variants are invalid).',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleVariant',
    },
    setVehicleWheelScale: {
        summary: 'This function sets the scale of all the wheels of a vehicle. The wheel scale multiplies the visible height and length (but not width) of all the wheels in a vehicle, without affecting their collisions or the handling, similarly to setVehicleComponentScale. The wheel scale is applied after the model wheel size.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle whose wheel scale you wish to modify.' },
            { name: 'wheelScale', isOptional: false, isVariadic: false, summary: 'The wheel scale value to set.' },
        ],
        returns: 'Returns *true* if the wheel scale has been set successfully, or an error if some parameter is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleWheelScale',
    },
    setVehicleWheelsRotation: {
        summary: 'This function is used to manipulate the wheel rotation of a vehicle. Cars, Bikes (including BMX) and Trailers are supported.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'the vehicle whose wheel rotation is to be set.' },
            { name: 'rotation', isOptional: false, isVariadic: false, summary: 'the new wheel rotation value.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleWheelsRotation',
    },
    setVehicleWheelStates: {
        summary: 'This function sets the state of wheels on the vehicle.\n\nInternally, no vehicles have more than 4 wheels. If they appear to, they will be duplicating other wheels.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'A handle to the vehicle that you wish to change the wheel states of.' },
            { name: 'frontLeft', isOptional: false, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
            { name: 'rearLeft', isOptional: true, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
            { name: 'frontRight', isOptional: true, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
            { name: 'rearRight', isOptional: true, isVariadic: false, summary: 'A whole number representing the wheel state (-1 for no change)' },
        ],
        returns: 'Returns a boolean value *true* or *false* that tells you if it was successful or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleWheelStates',
    },
    setVehicleWindowOpen: {
        summary: 'This function sets the vehicle window state.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to change the window state.' },
            { name: 'window', isOptional: false, isVariadic: false, summary: 'An integer representing window.' },
            { name: 'open', isOptional: false, isVariadic: false, summary: 'Boolean which represent window open state.' },
        ],
        returns: '* when the vehicle is not streamed in: ** if the window ID does lie within the acceptable list of values, it will return **true** ** if the window ID does *not* lie within the acceptable list of values, it will return **false** * when the vehicle is streamed in: ** if the vehicle has the window, it will return **true** ** if the vehicle does not have the window, it will return **false**',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleWindowOpen',
    },
    setVolumetricShadowsEnabled: {
        summary: 'This function used to enable or disable volumetric shadows.',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'if set true it will enable the volumetric shadows, false otherwise.' },
        ],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVolumetricShadowsEnabled',
    },
    setWaterColor: {
        summary: 'This function changes the water color of the GTA world.',
        parameters: [
            { name: 'red', isOptional: false, isVariadic: false, summary: 'The *red* value of the water, from 0 to 255.' },
            { name: 'green', isOptional: false, isVariadic: false, summary: 'The *green* value of the water, from 0 to 255.' },
            { name: 'blue', isOptional: false, isVariadic: false, summary: 'The *blue* value of the water, from 0 to 255.' },
            { name: 'alpha', isOptional: true, isVariadic: false, summary: 'The *alpha* (visibility) value of the water, from 0 to 255. Defaults to 200 if not declared.' },
        ],
        returns: 'Returns *true* if water color was set correctly, *false* if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaterColor',
    },
    setWaterDrawnLast: {
        summary: 'This function changes the water rendering order.',
        parameters: [
            { name: 'bEnabled', isOptional: false, isVariadic: false, summary: 'A boolean value determining whether water should be drawn last.' },
        ],
        returns: 'Returns *true* if the rendering order was changed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaterDrawnLast',
    },
    setWaterLevel: {
        summary: 'Sets the height of some or all the water in the game world.',
        parameters: [
            { name: 'theWater', isOptional: true, isVariadic: false, summary: 'the water element to change.' },
            { name: 'level', isOptional: false, isVariadic: false, summary: 'the new Z coordinate of the water surface' },
        ],
        returns: 'Returns *true* if successful, *false* in case of failure. Returns *true* if successful, *false* in case of failure (there is no water at the specified coordinates).',
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
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaterVertexPosition',
    },
    setWaveHeight: {
        summary: 'This function sets the wave height to the desired value, the default is 0.',
        parameters: [
            { name: 'height', isOptional: false, isVariadic: false, summary: 'A float between 0 and 100.' },
        ],
        returns: 'Returns a boolean value *true* or *false* that tells you if it was successful or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWaveHeight',
    },
    setWeaponAmmo: {
        summary: 'Sets the ammo to a certain amount for a specified weapon (if they already have it), regardless of current ammo.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'A player object referencing the specified player' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'A whole number integer that refers to a weapon ID.' },
            { name: 'totalAmmo', isOptional: false, isVariadic: false, summary: 'A whole number integer serving as the total ammo amount for the given weapon (including ammo in clip).' },
            { name: 'ammoInClip', isOptional: true, isVariadic: false, summary: 'The amount of ammo to set in the player\'s clip. This will be taken from the main ammo. If left unspecified or set to 0, the current clip will remain.' },
        ],
        returns: 'Returns a boolean value *true* or *false* that tells you if it was successful or not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetWeaponAmmo',
    },
};
