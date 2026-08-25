import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_39: ApiDocumentationCatalog = {
    resetSkyGradient: {
        summary: 'This function allows restoring of a changed sky gradient as a result of setSkyGradient.',
        parameters: [],
        returns: 'Returns *true* if sky color was reset correctly, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetSkyGradient',
    },
    resetSunColor: {
        summary: 'This function is used to reset the color of the sun to its normal color.',
        parameters: [],
        returns: 'Returns true if the color of the sun was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetSunColor',
    },
    resetSunSize: {
        summary: 'This function is used to reset the size of the sun to its normal size.',
        parameters: [],
        returns: 'Returns true if the size of the sun was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetSunSize',
    },
    resetTimeFrozen: {
        summary: '',
        parameters: [],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetTimeFrozen',
    },
    resetTimer: {
        summary: 'This function allows you to reset the value of the elapsed time in existing timers. The function resets the "execution time" value for timers with a limited number of repetitions.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'The timer whose elapsed time you wish to reset.' },
        ],
        returns: 'Returns *true* if the timer was successfully reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetTimer',
    },
    resetVehicleComponentPosition: {
        summary: 'This function reset to default component position for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset component position.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'Returns *true* if the position of the component was reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleComponentPosition',
    },
    resetVehicleComponentRotation: {
        summary: 'This function reset to default component rotation for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset component rotation.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'Returns *true* if the rotation of the component was reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleComponentRotation',
    },
    resetVehicleComponentScale: {
        summary: 'This function reset to default component scale for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset component scale.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'Returns *true* if the scale of the component was reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleComponentScale',
    },
    resetVehicleDummyPositions: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to reset the dummy positions.' },
        ],
        returns: 'Returns *true* if the dummy positions have been reset, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleDummyPositions',
    },
    resetVehicleExplosionTime: {
        summary: 'Resets the vehicle explosion time. This is the point in time at which the vehicle last exploded: at this time plus the vehicle\'s respawn delay, the vehicle is respawned. You can use this function to prevent the vehicle from respawning.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset the explosion time from.' },
        ],
        returns: 'Returns *true* if the vehicle explosion time has been reset, *false* if it failed to reset the explosion time.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleExplosionTime',
    },
    resetVehicleIdleTime: {
        summary: 'Resets the vehicle idle time',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset the idle time from.' },
        ],
        returns: 'Returns *true* if the vehicle idle time has been reset, *false* if it failed to reset the idle time.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleIdleTime',
    },
    resetVehiclesLODDistance: {
        summary: 'Resets the distance of vehicles LOD to default. Default values depends on client setting. If client has enabled *high detail vehicles* in video options, value will be reset to (500, 500) - otherwise to (70, 150). You can check value of this option using dxGetStatus (*SettingHighDetailVehicles*).',
        parameters: [],
        returns: 'Returns true if the vehicles LOD distance was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehiclesLODDistance',
    },
    resetVolumetricShadows: {
        summary: '',
        parameters: [],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVolumetricShadows',
    },
    resetWaterColor: {
        summary: 'This function reset the water color of the GTA world to default.',
        parameters: [],
        returns: 'Returns *true* if water color was reset correctly, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWaterColor',
    },
    resetWaterLevel: {
        summary: 'This function resets the water of the GTA world back to its default level. Water elements are not affected.',
        parameters: [],
        returns: 'Returns *true* if water level was reset correctly, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWaterLevel',
    },
    resetWeaponFiringRate: {
        summary: 'This function resets the firing rate of a custom weapon to the default one.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon to reset the firing rate of.' },
        ],
        returns: 'Returns *true* on success, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWeaponFiringRate',
    },
    resetWindVelocity: {
        summary: 'This function resets the wind velocity in San Andreas to its default state.',
        parameters: [],
        returns: 'Returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWindVelocity',
    },
    resetWorldProperties: {
        summary: 'This function resets all world properties to default.\n\nRegardless of the value of the arguments, the following properties are reset:\n* Far clip distance\n* Near clip distance\n* Clouds (enabled)\n* Birds (enabled)\n* Occlusions (enabled)\n* Gravity\n* Game speed\n* Aircraft max height & velocity\n* Jetpack max height\n* Interior furnitures (enabled)\n* Minute duration\n* Blur level\n* Corona reflections\n* Traffic lights locked state\n* Water level and color\n* Wave height\n* Volumetric shadows\n* Game time freeze\n* Dynamic ped shadows',
        parameters: [
            { name: 'resetSpecialProperties', isOptional: true, isVariadic: false, summary: 'Restores all special world properties changed by setWorldSpecialPropertyEnabled to default.' },
            { name: 'resetWorldProperties', isOptional: true, isVariadic: false, summary: 'Reset all world properties changed by setWorldProperty.' },
            { name: 'resetWeatherProperties', isOptional: true, isVariadic: false, summary: 'Reset all weather properties like heat haze, rain level, sun color etc.' },
            { name: 'resetLODs', isOptional: true, isVariadic: false, summary: 'Reset vehicles and peds lod distance.' },
            { name: 'resetSounds', isOptional: true, isVariadic: false, summary: 'Restore interior sounds, world sounds and ambient sounds.' },
            { name: 'resetGlitches', isOptional: true, isVariadic: false, summary: 'Disable all glitches enabled by setGlitchEnabled.' },
            { name: 'resetJetpackWeapons', isOptional: true, isVariadic: false, summary: 'Reset jetpack weapons changes by setJetpackWeaponEnabled to default (uzi, pistol, tec9).' },
        ],
        returns: 'This function returns nothing (*nil*).',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWorldProperties',
    },
    resetWorldProperty: {
        summary: 'This function is used to reset the values of time cycle and weather related properties.',
        parameters: [
            { name: 'property', isOptional: false, isVariadic: false, summary: 'The property you wish to retrieve.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWorldProperty',
    },
    resetWorldSounds: {
        summary: 'This function is used to reset the world sounds to the default setting.',
        parameters: [],
        returns: 'Returns true if the world sounds were reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWorldSounds',
    },
    resizeBrowser: {
        summary: 'Allows resizing of CEF browsers at runtime.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser you want to resize.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'The new width of the browser.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'The new height of the browser.' },
        ],
        returns: 'Returns *true* if the browser is resized successfully, *false* if there\'s something wrong.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResizeBrowser',
    },
    resource: {
        summary: 'A resource element of the resource the snippet was executed in',
        parameters: [],
        returns: '',
        wiki: '',
    },
    resourceRoot: {
        summary: 'A resource root element of the resource the snippet was executed in',
        parameters: [],
        returns: '',
        wiki: '',
    },
    respawnObject: {
        summary: 'This function respawns a specific object.\nThis function is now also available on the server side.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'an object element' },
        ],
        returns: '* *true* if the object was sucessfully respawned. * *false* if the object is not breakable, or a wrong object was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RespawnObject',
    },
    respawnVehicle: {
        summary: 'This function respawns a vehicle according to its set respawn position, set by setVehicleRespawnPosition or the position and rotation it was created on. To spawn a vehicle to a specific location just once, spawnVehicle can be used.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to respawn' },
        ],
        returns: 'Returns *true* if the vehicle respawned successfully, *false* if the passed argument does not exist or is not a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RespawnVehicle',
    },
    restartResource: {
        summary: 'This function restarts a running resource. Restarting will destroy all the elements that the resource has created (as stopping the resource does).',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource you want to restart.' },
            { name: 'persistent', isOptional: true, isVariadic: false, summary: 'Unused' },
            { name: 'configs', isOptional: true, isVariadic: false, summary: 'Reload configs?' },
            { name: 'maps', isOptional: true, isVariadic: false, summary: 'Reload maps?' },
            { name: 'scripts', isOptional: true, isVariadic: false, summary: 'Reload (server) scripts?' },
            { name: 'html', isOptional: true, isVariadic: false, summary: 'Reload html files (for resource web access)?' },
            { name: 'clientConfigs', isOptional: true, isVariadic: false, summary: 'Reload client configs?' },
            { name: 'clientScripts', isOptional: true, isVariadic: false, summary: 'Reload client scripts?' },
            { name: 'clientFiles', isOptional: true, isVariadic: false, summary: 'Reload files?' },
        ],
        returns: 'Returns *true* if the resource was restarted, *false* if the resource wasn\'t running, or an invalid resource was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RestartResource',
    },
    restoreAllWorldModels: {
        summary: 'This function allows restoring of all world objects, which were removed with removeWorldModel.',
        parameters: [],
        returns: 'Returns *true* if the world objects were restored, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RestoreAllWorldModels',
    },
    restoreGameWorld: {
        summary: '',
        parameters: [],
        returns: 'This function does not return any value.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RestoreGameWorld',
    },
    restoreWorldModel: {
        summary: 'This function restoring a removed world object, reversing the effect of removeWorldModel.\n\nYou may use restoreAllWorldModels to **restore all world models removed with this function**.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'A whole integer specifying the GTASA object model ID.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: 'A floating point number representing the radius that will be eliminated.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'interior', isOptional: true, isVariadic: false, summary: 'The interior ID to apply the restoral to. Some objects in interior 13 show in all interiors so if you want to restore everything in interior 0 also restore everything in interior 13. A value of -1 here will affect all interiors.' },
        ],
        returns: 'Returns *true* if the world object was restored, *false* if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RestoreWorldModel',
    },
    root: {
        summary: 'The root element of the server',
        parameters: [],
        returns: '',
        wiki: '',
    },
};
