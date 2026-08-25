import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_48: ApiDocumentationCatalog = {
    setTeamColor: {
        summary: 'This function is for setting the color of a specified team. This color is shown, for example, in the team players\' nametags.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you want to change the color of.' },
            { name: 'colorR', isOptional: false, isVariadic: false, summary: 'An integer representing the red color value, from 0 to 255.' },
            { name: 'colorG', isOptional: false, isVariadic: false, summary: 'An integer representing the green color value, from 0 to 255.' },
            { name: 'colorB', isOptional: false, isVariadic: false, summary: 'An integer representing the blue color value, from 0 to 255.' },
        ],
        returns: 'Returns *true* if the team is valid and the color is different, otherwise *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTeamColor',
    },
    setTeamFriendlyFire: {
        summary: 'This function sets the friendly fire value for the specified team.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team that will have friendly fire set' },
            { name: 'friendlyFire', isOptional: false, isVariadic: false, summary: 'A boolean denoting whether the players from the same team can kill each other (*true*) or whether the players can\'t kill each other (*false*).' },
        ],
        returns: 'Returns *true* if the friendly fire value is set for the specified team, *false* if the friendly fire value can\'t be set for the specified team or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTeamFriendlyFire',
    },
    setTeamName: {
        summary: 'This function is used to set a team\'s name.',
        parameters: [
            { name: 'theTeam', isOptional: false, isVariadic: false, summary: 'The team you want to change the name of.' },
            { name: 'newName', isOptional: false, isVariadic: false, summary: 'A string representing the name you want the team to be called.' },
        ],
        returns: 'Returns *true* if the team was valid and the name was changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTeamName',
    },
    setTime: {
        summary: 'This function sets the current GTA time to the given time.',
        parameters: [
            { name: 'hour', isOptional: false, isVariadic: false, summary: 'The hour of the new time (range 0-23).' },
            { name: 'minute', isOptional: false, isVariadic: false, summary: 'The minute of the new time (range 0-59).' },
        ],
        returns: 'Returns *true* if the new time was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTime',
    },
    setTimeFrozen: {
        summary: '',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'if set to true it will freeze the time, false otherwise.' },
        ],
        returns: 'Always returns *true*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTimeFrozen',
    },
    setTimer: {
        summary: 'This function allows you to trigger a function after a number of milliseconds have elapsed. You can call one of your own functions or a built-in function. For example, you could set a timer to spawn a player after a number of seconds have elapsed.\n\nOnce a timer has finished repeating, it no longer exists.\n\nThe minimum accepted interval is 0ms.\n\nMulti Theft Auto guarantees that the timer will be triggered after *at least* the interval you specify. The resolution of the timer is tied to the frame rate (server side and client-side). All the overdue timers are triggered at a single point each frame. This means that if, for example, the player is running at 30 frames per second, then two timers specified to occur after 100ms and 110ms would more than likely occur during the same frame, as the difference in time between the two timers (10ms) is less than half the length of the frame (33ms). As with most timers provided by other languages, you shouldn\'t rely on the timer triggering at an exact point in the future.',
        parameters: [
            { name: 'theFunction', isOptional: false, isVariadic: false, summary: 'The function you wish the timer to call.' },
            { name: 'timeInterval', isOptional: false, isVariadic: false, summary: 'The number of milliseconds that should elapse before the function is called. The minimum is 0 ms; 1000 milliseconds = 1 second)' },
            { name: 'timesToExecute', isOptional: false, isVariadic: false, summary: 'The number of times you want the timer to execute, or 0 for infinite repetitions.' },
            { name: 'arguments', isOptional: true, isVariadic: true, summary: '' },
        ],
        returns: 'Returns a timer pointer if the timer was set successfully, *false* if the arguments are invalid or the timer could not be set.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTimer',
    },
    setTimerPaused: {
        summary: 'This function is used to either pause or resume a timer.',
        parameters: [
            { name: 'theTimer', isOptional: false, isVariadic: false, summary: 'The timer you wish to pause or resume.' },
            { name: 'paused', isOptional: false, isVariadic: false, summary: 'a boolean value representing whether the timer should be paused or not. To pause the timer, use *true*.' },
        ],
        returns: 'Returns *true* if the timer was successfully paused or resumed, *false* if no such timer existed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTimerPaused',
    },
    setTrafficLightsLocked: {
        summary: 'Toggles whether you want the traffic lights to be locked. If the lights are locked, it means they won\'t change unless you do setTrafficLightState.',
        parameters: [
            { name: 'toggle', isOptional: false, isVariadic: false, summary: 'A bool indicating whether you want the traffic lights to change automatically, or not' },
        ],
        returns: 'Returns *true* if the successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTrafficLightsLocked',
    },
    setTrafficLightState: {
        summary: 'Sets the current traffic light state. This state controls the traffic light colors. For instance, state **1** will cause the north and south traffic lights to be amber, and the ones left and east will turn red.',
        parameters: [
            { name: 'state', isOptional: false, isVariadic: false, summary: 'If an integer is provided, the state you wish to use (possible values: 0-9). Else, one of the following strings:' },
        ],
        returns: 'Returns *true* if the state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTrafficLightState',
    },
    setTrainDerailable: {
        summary: 'This function will set a train or tram as derailable. This is, if it can derail when it goes above the maximum speed.',
        parameters: [
            { name: 'derailableVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to set derailable.' },
            { name: 'derailable', isOptional: false, isVariadic: false, summary: 'whether the train or tram is derailable. *True as derailable, False as non-derailable.*' },
        ],
        returns: 'Returns *true* if the state was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTrainDerailable',
    },
    setTrainDerailed: {
        summary: 'This function will set a train or tram as derailed.',
        parameters: [
            { name: 'vehicleToDerail', isOptional: false, isVariadic: false, summary: 'The vehicle that you wish to derail.' },
            { name: 'derailed', isOptional: false, isVariadic: false, summary: 'whether the train is derailed.' },
        ],
        returns: 'Returns *true* if the state was successfully set',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTrainDerailed',
    },
    setTrainDirection: {
        summary: 'Sets the direction in which a train or tram drives over the rails (clockwise or counterclockwise).',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train whose direction to change.' },
            { name: 'clockwise', isOptional: false, isVariadic: false, summary: 'if *true*, will make the train go clockwise. If *false*, makes it go counterclockwise.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTrainDirection',
    },
    setTrainPosition: {
        summary: 'Sets the position the train is currently on the track',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train of which to set the track' },
            { name: 'position', isOptional: false, isVariadic: false, summary: 'the position along the track (0 - 18107 a complete way round)' },
        ],
        returns: 'Returns *true* if the train position was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTrainPosition',
    },
    setTrainSpeed: {
        summary: 'Sets the on-track speed of a train.',
        parameters: [
            { name: 'train', isOptional: false, isVariadic: false, summary: 'the train whose speed to change.' },
            { name: 'speed', isOptional: false, isVariadic: false, summary: 'the new on-track speed of the train. A positive value will make it go clockwise, a negative value counter clockwise.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTrainSpeed',
    },
    setTransferBoxVisible: {
        summary: '',
        parameters: [
            { name: 'visible', isOptional: false, isVariadic: false, summary: 'The new transfer box visibility state.' },
        ],
        returns: 'Returns *true* if the visibility was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetTransferBoxVisible',
    },
    setUnbanTime: {
        summary: 'This function sets a new unban time of a given ban using unix timestamp (seconds since Jan 01 1970).',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The ban of which to change the unban time of' },
            { name: 'theTime', isOptional: false, isVariadic: false, summary: 'the new unban time' },
        ],
        returns: 'Returns *true* if changed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetUnbanTime',
    },
    setVehicleAdjustableProperty: {
        summary: 'This function is used for adjusting the movable parts of a model, for example hydra jets or dump truck tray.\nThis function only works on vehicles with adjustable properties.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to change the adjustable property of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'A value from 0 between ?. (Set the adjustable value between 0 and N. 0 is the default value. It is possible to force the setting beyond default maximum, for example setting above 5000 on the dump truck (normal max 2500) will cause the tray to be fully vertical.)' },
        ],
        returns: 'Returns true if the adjustable property was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleAdjustableProperty',
    },
    setVehicleColor: {
        summary: 'This function will set the color of a vehicle using either a RGB format, or the standard San Andreas color IDs. Vehicles can have up to 4 colors, most of the vehicles have 2 colors only.',
        parameters: [
            { name: 'veh', isOptional: false, isVariadic: false, summary: '' },
            { name: 'r1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'g1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'b1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'r2', isOptional: true, isVariadic: false, summary: '' },
            { name: 'g2', isOptional: true, isVariadic: false, summary: '' },
            { name: 'b2', isOptional: true, isVariadic: false, summary: '' },
            { name: 'r3', isOptional: true, isVariadic: false, summary: '' },
            { name: 'g3', isOptional: true, isVariadic: false, summary: '' },
            { name: 'b3', isOptional: true, isVariadic: false, summary: '' },
            { name: 'r4', isOptional: true, isVariadic: false, summary: '' },
            { name: 'g4', isOptional: true, isVariadic: false, summary: '' },
            { name: 'b4', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if vehicle\'s color was set, *false* if an invalid vehicle or invalid colors were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleColor',
    },
    setVehicleComponentPosition: {
        summary: 'This function sets the component position of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to set component position.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'The new x position of this component.' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'The new y position of this component.' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: 'The new z position of this component.' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the supplied position (*posX*, *posY*, *posZ*) is relative to. It can be one of the following values:' },
        ],
        returns: 'Returns *true* if component position was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleComponentPosition',
    },
    setVehicleComponentRotation: {
        summary: 'This function sets the component rotation of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to set component rotation of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'rotX', isOptional: false, isVariadic: false, summary: 'The component\'s rotation around the x axis in degrees.' },
            { name: 'rotY', isOptional: false, isVariadic: false, summary: 'The component\'s rotation around the y axis in degrees.' },
            { name: 'rotZ', isOptional: false, isVariadic: false, summary: 'The component\'s rotation around the z axis in degrees.' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the supplied rotation (*rotX*, *rotY*, *rotZ*) is relative to. It can be one of the following values:' },
        ],
        returns: 'Returns *true* if the component rotation was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleComponentRotation',
    },
    setVehicleComponentScale: {
        summary: 'This function sets the component scale of a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to set component scale.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the frame name from the model file of the component you wish to modify)' },
            { name: 'scaleX', isOptional: false, isVariadic: false, summary: 'The new x scale of this component.' },
            { name: 'scaleY', isOptional: false, isVariadic: false, summary: 'The new y scale of this component.' },
            { name: 'scaleZ', isOptional: false, isVariadic: false, summary: 'The new z scale of this component.' },
            { name: 'base', isOptional: true, isVariadic: false, summary: 'A string representing what the supplied scale (*scaleX*, *scaleY*, *scaleZ*) is relative to. It can be one of the following values:' },
        ],
        returns: 'Returns *true* if component scale was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleComponentScale',
    },
    setVehicleComponentVisible: {
        summary: 'This function sets component visibility for vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to set component visibility of.' },
            { name: 'theComponent', isOptional: false, isVariadic: false, summary: 'A vehicle component (this is the component\'s frame name (also called \'dummy\') from the vehicle model\'s DFF file of which you want to manipulate components)' },
            { name: 'visible', isOptional: false, isVariadic: false, summary: 'a *bool* which determines if the component should be visible' },
        ],
        returns: 'Returns a *bool* indicating if the visiblity was changed successfully.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleComponentVisible',
    },
    setVehicleDamageProof: {
        summary: 'This functions makes a vehicle damage proof, so it won\'t take damage from bullets, hits, explosions or fire. A damage proof\'s vehicle health can still be changed via script.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to make damage proof.' },
            { name: 'damageProof', isOptional: false, isVariadic: false, summary: '*true* is damage proof, *false* is damageable.' },
        ],
        returns: 'Returns *true* if the vehicle was set damage proof succesfully, *false* if the arguments are invalid or it failed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDamageProof',
    },
    setVehicleDirtLevel: {
        summary: 'This function sets the dirt level on a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that you want to set the dirt level from' },
            { name: 'dirtLevel', isOptional: false, isVariadic: false, summary: 'The dirt level' },
        ],
        returns: 'returns true if the dirt level was set on the vehicle, false if the dirt level was not set or if invalid arguments are specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetVehicleDirtLevel',
    },
};
