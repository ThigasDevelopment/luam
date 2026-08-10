import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_36: ApiDocumentationCatalog = {
    resetVehicleComponentScale: {
        summary: 'This function reset to default component scale for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset component scale.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
        ],
        returns: 'returns true if the scale of the component was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleComponentScale',
    },
    resetVehicleDummyPositions: {
        summary: '',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle to reset the dummy positions.' },
        ],
        returns: 'returns true if the dummy positions have been reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleDummyPositions',
    },
    resetVehicleExplosionTime: {
        summary: 'Resets the vehicle explosion time. This is the point in time at which the vehicle last\nexploded: at this time plus the vehicles respawn delay, the vehicle is respawned. You can\nuse this function to prevent the vehicle from respawning.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset the explosion time from.' },
        ],
        returns: 'returns true if the vehicle explosion time has been reset, false if it failed to reset the explosion time.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleExplosionTime',
    },
    resetVehicleIdleTime: {
        summary: 'Resets the vehicle idle time',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to reset the idle time from.' },
        ],
        returns: 'returns true if the vehicle idle time has been reset, false if it failed to reset the idle time.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehicleIdleTime',
    },
    resetVehiclesLODDistance: {
        summary: 'Resets the distance of vehicles LOD to default. Default values depends on client setting.\nIf client has enabled high detail vehicles in video options, value will be reset to (500,\n500) - otherwise to (70, 150). You can check value of this option using dxGetStatus\n(SettingHighDetailVehicles).',
        parameters: [],
        returns: 'returns true if the vehicles lod distance was reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetVehiclesLODDistance',
    },
    resetWaterColor: {
        summary: 'This function reset the water color of the GTA world to default.',
        parameters: [],
        returns: 'returns true if water color was reset correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWaterColor',
    },
    resetWaterLevel: {
        summary: 'This function resets the water of the GTA world back to its default level. water|Water\nelements are not affected.',
        parameters: [],
        returns: 'returns true if water level was reset correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWaterLevel',
    },
    resetWeaponFiringRate: {
        summary: 'This function resets the firing rate of a Element/Weapon|custom weapon to the default one.',
        parameters: [
            { name: 'theWeapon', isOptional: false, isVariadic: false, summary: 'the weapon to reset the firing rate of.' },
        ],
        returns: 'returns true on success, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWeaponFiringRate',
    },
    resetWindVelocity: {
        summary: 'This function resets the wind velocity in San Andreas to its default state.',
        parameters: [],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWindVelocity',
    },
    resetWorldSounds: {
        summary: 'This function is used to reset the world sounds to the default setting.',
        parameters: [],
        returns: 'returns true if the world sounds were reset, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ResetWorldSounds',
    },
    resizeBrowser: {
        summary: 'Allows resizing of CEF browsers at runtime.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser you want to resize.' },
            { name: 'width', isOptional: false, isVariadic: false, summary: 'The new width of the browser.' },
            { name: 'height', isOptional: false, isVariadic: false, summary: 'The new height of the browser.' },
        ],
        returns: 'returns true if the browser is resized successfully, false if theres something wrong.',
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
        summary: 'This function respawns a specific object.',
        parameters: [
            { name: 'theObject', isOptional: false, isVariadic: false, summary: 'an object element' },
        ],
        returns: '* true if the object was sucessfully respawned. * false if the object is not breakable, or a wrong object was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RespawnObject',
    },
    respawnVehicle: {
        summary: 'This function respawns a vehicle according to its set respawn position, set by\nsetVehicleRespawnPosition or the position and rotation it was created on. To spawn a\nvehicle to a specific location just once, spawnVehicle can be used.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to respawn' },
        ],
        returns: 'returns true if the vehicle respawned successfully, false if the passed argument does not exist or is not a vehicle.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RespawnVehicle',
    },
    restartResource: {
        summary: 'This function restarts a running resource. Restarting will destroy all the elements that\nthe resource has created (as stopping the resource does).\n*Dont forget to give admin rights to the resource, in which you are using restartResource\nfunction or it wont work.\n*This function does not restart the resource immediately. Restarts are queued up until\nthe end of the servers frame to ensure that they occur in the correct order (and that\ndependent resources can start and stop correctly). The resource being restarted will have\nan onResourceStop event triggered and the restarted instance will receive an\nonResourceStart event. Remember that the element and resource variables will be\ninvalidated during the restart, though of course, the resources name will not.',
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
        returns: 'returns true if the resource was restarted, false if the resource wasnt running, or an invalid resource was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RestartResource',
    },
    restoreAllWorldModels: {
        summary: 'This function allows restoring of all world objects,which were removed with\nRemoveWorldModel.',
        parameters: [],
        returns: 'returns true if the world objects were restored, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RestoreAllWorldModels',
    },
    restoreWorldModel: {
        summary: 'This function allows restoring of world object,which was removed with RemoveWorldModel.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'A whole integer specifying the GTASA object model ID.' },
            { name: 'radius', isOptional: false, isVariadic: false, summary: 'A floating point number representing the radius that will be eliminated.' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'A floating point number representing the X coordinate on the map.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Y coordinate on the map.' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'A floating point number representing the Z coordinate on the map.' },
            { name: 'iInterior', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the world object was restored, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/RestoreWorldModel',
    },
    root: {
        summary: 'The root element of the server',
        parameters: [],
        returns: '',
        wiki: '',
    },
    saveMapData: {
        summary: 'This converts a set of elements in the element tree into XML. This is a format that can\nthen be loaded as a map file. Each element represents a single XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: ': An existing node that should contain the contents of baseElement' },
            { name: 'baseElement', isOptional: false, isVariadic: false, summary: ': The first element to output to the XML tree. This element and all its children (and their children, etc) will be output.' },
            { name: 'childrenOnly', isOptional: true, isVariadic: false, summary: ': Defines if you want to only save children of the specified element.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/SaveMapData',
    },
    set: {
        summary: 'This function is used to save arbitrary data under a certain name on the settings\nsystem|settings registry.\nIts important to note that set always writes to the settings.xml file, even if get read\nthe value from a resources meta.xml. This means that the admin can specify settings in\nthe settings.xml that override the resources defaults, but that the defaults can still be\nretrieved if need be. As a general principle, resources should not be designed so that\nthe admin is required to modify them, they should be black boxes.',
        parameters: [
            { name: 'settingName', isOptional: false, isVariadic: false, summary: 'The name of the setting you want to set. See settings system#Setting names|setting names for information on settings names.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value to set the setting to. This can be any Lua data type, except for functions, most userdata (only resources cant be stored) and threads.' },
        ],
        returns: 'returns true if the setting has been set, false if you do not have access to the setting or invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Set',
    },
    setAccountData: {
        summary: 'This function sets a string to be stored in an account. This can then be retrieved using\ngetAccountData. Data stored as account data is persistent across users sessions and maps,\nunless they are logged into a guest account. Even if logged into a guest account, account\ndata can be useful as a way to store a reference to your own account system, though its\npersistence is equivalent to that of using setElementData on the players element.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to retrieve the data from.' },
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The key under which you wish to store the data' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you wish to store. Set to false to remove the data. NOTE: you cannot store tables as values, but you can use toJSON strings.' },
        ],
        returns: 'returns a true if the account data was set, false if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAccountData',
    },
    setAccountName: {
        summary: 'This function sets the name of an account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you wish to change the name.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The new name.' },
            { name: 'allowCaseVariations', isOptional: true, isVariadic: false, summary: 'Whether the username is case sensitive (if this is set to true, usernames Bob and bob will refer to different accounts)' },
        ],
        returns: 'returns a true if the account name was set, false if an invalid argument was specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAccountName',
    },
    setAccountPassword: {
        summary: 'This function sets the password of the specified account.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'the account whose password you want to set' },
            { name: 'password', isOptional: false, isVariadic: false, summary: 'the password' },
        ],
        returns: 'returns true if the password was set correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAccountPassword',
    },
    setAircraftMaxHeight: {
        summary: 'This function changes the maximum flying height of aircraft.',
        parameters: [
            { name: 'Height', isOptional: false, isVariadic: false, summary: 'The height you want aircraft to be able to go.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAircraftMaxHeight',
    },
    setAircraftMaxVelocity: {
        summary: 'This function sets the maximum velocity at which aircrafts could fly. Using this function\nserver-side will overwrite the value that was previously set client-side.',
        parameters: [
            { name: 'velocity', isOptional: false, isVariadic: false, summary: 'The max velocity, can be 0 or any positive value. Default is 1.5.' },
        ],
        returns: 'returns true if the max velocity was set correctly, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAircraftMaxVelocity',
    },
    setAmbientSoundEnabled: {
        summary: 'This function allows you to disable some background sound effects. See also:\nsetWorldSoundEnabled.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'The type of ambient sound to toggle. Can be either gunfire or general.' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set false to turn off, true to turn on' },
        ],
        returns: 'returns true if the ambient sound was set correctly, false if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAmbientSoundEnabled',
    },
    setAnalogControlState: {
        summary: 'This sets the analog control state of a control for the local player. To change the\nanalog controls for a ped, please use setPedAnalogControlState.',
        parameters: [
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control that you want to set the state of. See control names for a list of possible controls.' },
            { name: 'state', isOptional: true, isVariadic: false, summary: 'A float between 0 and 1 indicating the amount the control is pressed. If no value is provided, the analog control is removed. ***forceOverrideNextFrame: ** A bool indicating if the player input should force fully overriden for the next frame.' },
            { name: 'forceOverrideNextFrame', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if the control state was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetAnalogControlState',
    },
};
