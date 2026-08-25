import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_47: ApiDocumentationCatalog = {
    setRainLevel: {
        summary: 'This function sets the rain level to any weather available in GTA. Use resetRainLevel to undo the changes.',
        parameters: [
            { name: 'level', isOptional: false, isVariadic: false, summary: 'A floating point number representing the rain level. 1 represents the maximum rain level usually available in GTA, but higher values are accepted.' },
        ],
        returns: 'Returns *true* if the rain level was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetRainLevel',
    },
    setResourceInfo: {
        summary: 'This function sets the value of any attribute in a resource info tag.',
        parameters: [
            { name: 'theResource', isOptional: false, isVariadic: false, summary: 'the resource we are setting info to.' },
            { name: 'attribute', isOptional: false, isVariadic: false, summary: 'the name of the attribute that is to be set.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'the value of this attribute' },
        ],
        returns: 'Returns *true* if the info was successfully set, *false* otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetResourceInfo',
    },
    setRuleValue: {
        summary: 'This function sets a rule value that can be viewed by server browsers.',
        parameters: [
            { name: 'key', isOptional: false, isVariadic: false, summary: 'The name of the rule **(MAX 200 characters)**' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value you wish to set for the rule **(MAX 200 characters)**' },
        ],
        returns: 'Returns *true* if the rule value was set, *false* if invalid arguments were specified.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetRuleValue',
    },
    setSearchLightEndPosition: {
        summary: 'This function sets the end position of a searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: 'the searchlight to modify the property of.' },
            { name: 'endX', isOptional: false, isVariadic: false, summary: 'the X coordinate where the searchlight light cone will end.' },
            { name: 'endY', isOptional: false, isVariadic: false, summary: 'the Y coordinate where the searchlight light cone will end.' },
            { name: 'endZ', isOptional: false, isVariadic: false, summary: 'the Z coordinate where the searchlight light cone will end.' },
        ],
        returns: 'If every argument is correct, this function returns *true*. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSearchLightEndPosition',
    },
    setSearchLightEndRadius: {
        summary: 'This function sets the end radius of a searchlight element.',
        parameters: [
            { name: 'theSearchlight', isOptional: false, isVariadic: false, summary: '' },
            { name: 'endRadius', isOptional: false, isVariadic: false, summary: 'the radius of the searchlight\'s light cone in its end.' },
        ],
        returns: 'If every argument is correct, this function returns *true*. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSearchLightEndRadius',
    },
    setSearchLightStartPosition: {
        summary: 'This function sets the start position of a searchlight element.',
        parameters: [
            { name: 'theSearchLight', isOptional: false, isVariadic: false, summary: 'the searchlight to modify the property of.' },
            { name: 'startX', isOptional: false, isVariadic: false, summary: 'the X coordinate where the searchlight light cone will start.' },
            { name: 'startY', isOptional: false, isVariadic: false, summary: 'the Y coordinate where the searchlight light cone will start.' },
            { name: 'startZ', isOptional: false, isVariadic: false, summary: 'the Z coordinate where the searchlight light cone will start.' },
        ],
        returns: 'If every argument is correct, this function returns *true*. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSearchLightStartPosition',
    },
    setSearchLightStartRadius: {
        summary: 'This function sets the start radius of a searchlight element.',
        parameters: [
            { name: 'theSearchlight', isOptional: false, isVariadic: false, summary: '' },
            { name: 'startRadius', isOptional: false, isVariadic: false, summary: 'the radius of the searchlight\'s light cone in its beginning.' },
        ],
        returns: 'If every argument is correct, this function returns *true*. If not, it will return *false* plus an error message.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSearchLightStartRadius',
    },
    setServerConfigSetting: {
        summary: 'This function sets server settings which are stored in the mtaserver.conf file.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the setting. Only certain settings from mtaserver.conf can be changed with this function. These are:' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value of the setting' },
            { name: 'bSave', isOptional: true, isVariadic: false, summary: 'Set to *true* to make the setting permanent, or *false* for use only until the next server restart.' },
        ],
        returns: 'Returns *true* if the setting was successfully set, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetServerConfigSetting',
    },
    setServerPassword: {
        summary: '<!-- Change this to "Client function" or "Server function" appropriately-->\n<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function changes the password required to join the server to the given string.',
        parameters: [
            { name: 'thePassword', isOptional: false, isVariadic: false, summary: 'The new server password you want. Pass *nil* or an empty string to remove the password.' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the password was successfully changed or removed, *false* or *nil* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetServerPassword',
    },
    setSkyGradient: {
        summary: 'This function changes the sky color to a two-color gradient.',
        parameters: [
            { name: 'topRed', isOptional: true, isVariadic: false, summary: 'The *red* value of the upper part of the sky, from 0 to 255.' },
            { name: 'topGreen', isOptional: true, isVariadic: false, summary: 'The *green* value of the upper part of the sky, from 0 to 255.' },
            { name: 'topBlue', isOptional: true, isVariadic: false, summary: 'The *blue* value of the upper part of the sky, from 0 to 255.' },
            { name: 'bottomRed', isOptional: true, isVariadic: false, summary: 'The *red* value of the lower part of the sky, from 0 to 255.' },
            { name: 'bottomGreen', isOptional: true, isVariadic: false, summary: 'The *green* value of the lower part of the sky, from 0 to 255.' },
            { name: 'bottomBlue', isOptional: true, isVariadic: false, summary: 'The *blue* value of the lower part of the sky, from 0 to 255.' },
        ],
        returns: 'Returns *true* if sky color was set correctly, *false* if invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSkyGradient',
    },
    setSoundEffectEnabled: {
        summary: 'Used to enable or disable specific sound effects.\n\nUse a player element to control a players voice with this function.',
        parameters: [
            { name: 'theSound/thePlayer', isOptional: false, isVariadic: false, summary: '' },
            { name: 'effectName', isOptional: false, isVariadic: false, summary: 'the effect you want to enable or disable' },
            { name: 'bEnable', isOptional: false, isVariadic: false, summary: '*true* if you want to enable the effect, *false* if you want to disable it.' },
        ],
        returns: 'Returns *true* if the effect was set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundEffectEnabled',
    },
    setSoundEffectParameter: {
        summary: '',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'The sound element.' },
            { name: 'effectName', isOptional: false, isVariadic: false, summary: 'The name of the effect whose parameter you want to change:' },
            { name: 'effectParam', isOptional: false, isVariadic: false, summary: 'The parameter name.' },
            { name: 'paramValue', isOptional: false, isVariadic: false, summary: 'The parameter value.' },
        ],
        returns: 'Returns *true* if effect have been set successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundEffectParameter',
    },
    setSoundLooped: {
        summary: '',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'The sound element to set the loop.' },
            { name: 'loop', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns *true* if the sound element loop state was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundLooped',
    },
    setSoundMaxDistance: {
        summary: 'Sets a custom sound max distance at which the sound stops.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'the default value for this is 20' },
        ],
        returns: 'Returns a *true* if the max distance was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundMaxDistance',
    },
    setSoundMinDistance: {
        summary: 'Sets a custom sound Minimum distance at which the sound stops getting louder.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element.' },
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'an integer representing the distance the sound stops getting louder. the default value for this is 5' },
        ],
        returns: 'Returns a *true* if the minimum distance was set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundMinDistance',
    },
    setSoundPan: {
        summary: 'This function is used to change the pan level of the specified sound element.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'The sound element which pan you want to modify.' },
            { name: 'pan', isOptional: false, isVariadic: false, summary: 'A floating point number representing the desired pan level. Range is from *-1.0 (left)* to *1.0 (right)*' },
        ],
        returns: 'Returns *true* if the sound element pan was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundPan',
    },
    setSoundPanningEnabled: {
        summary: 'This function toggles the panning of a sound (hearing it closer to the left or right side of the speakers due to the camera position). By default a sound has its panning enabled.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element to change the panning of.' },
            { name: 'enable', isOptional: false, isVariadic: false, summary: '*true* to enable the panning, *false* otherwise.' },
        ],
        returns: 'Returns *true* if the sound is valid and good arguments were passed, *false* if not. If the sound is not 3D, this function will return *true* as well, but isSoundPanningEnabled will always return *true* after this (so it has no effect).',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundPanningEnabled',
    },
    setSoundPaused: {
        summary: 'This function is used to either pause or unpause the playback of the specified sound element.\n\nUse a player element to control a players voice with this function.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which you want to pause/unpause.' },
            { name: 'paused', isOptional: false, isVariadic: false, summary: 'a boolean value representing whether the sound should be paused or not. To pause the sound, use *true*.' },
        ],
        returns: 'Returns *true* if the sound element was successfully paused, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundPaused',
    },
    setSoundPosition: {
        summary: 'This function is used to change the seek position of the specified sound element.\nUse a player element to control a players voice with this function.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which seek position you want to modify.' },
            { name: 'pos', isOptional: false, isVariadic: false, summary: 'a float value representing the new seek position of the sound element in seconds.' },
        ],
        returns: 'Returns *true* if the sound element\'s seek position was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundPosition',
    },
    setSoundProperties: {
        summary: 'This function edits the properties of a specific sound.',
        parameters: [
            { name: 'sound', isOptional: false, isVariadic: false, summary: 'a sound element that is created using playSound or playSound3D' },
            { name: 'fSampleRate', isOptional: false, isVariadic: false, summary: 'a float that defines the new sound\'s [http://en.wikipedia.org/wiki/Sampling_rate sample rate]' },
            { name: 'fTempo', isOptional: false, isVariadic: false, summary: 'a float that defines the new sound [http://en.wikipedia.org/wiki/Tempo tempo]' },
            { name: 'fPitch', isOptional: false, isVariadic: false, summary: 'a float that defines the new sound [http://en.wikipedia.org/wiki/Pitch_%28music%29 pitch]' },
            { name: 'bReverse', isOptional: true, isVariadic: false, summary: 'a boolean representing whether the sound will be reversed or not.' },
        ],
        returns: 'Returns *true* if the properties sucessfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundProperties',
    },
    setSoundSpeed: {
        summary: 'This function can be used to change the playback speed of the specified sound element.',
        parameters: [
            { name: 'theSound', isOptional: false, isVariadic: false, summary: 'the sound element which volume you want to modify.' },
            { name: 'speed', isOptional: false, isVariadic: false, summary: 'a floating point number representing the desired sound playback speed.' },
        ],
        returns: 'Returns *true* if the sound element playback speed was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundSpeed',
    },
    setSoundVolume: {
        summary: 'This function is used to change the volume level of the specified sound element.\nUse a player element to control a players voice with this function.',
        parameters: [
            { name: 'theSound/thePlayer', isOptional: false, isVariadic: false, summary: '' },
            { name: 'volume', isOptional: false, isVariadic: false, summary: 'A floating point number representing the desired volume level. Range is from **0.0** to **1.0**. This can go above **1.0** for amplification.' },
        ],
        returns: 'Returns *true* if the sound element volume was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSoundVolume',
    },
    setSunColor: {
        summary: 'This function is used to set the color of the sun.',
        parameters: [
            { name: 'aRed', isOptional: false, isVariadic: false, summary: 'The amount of red (0-255) you want the sun to be.' },
            { name: 'aGreen', isOptional: false, isVariadic: false, summary: 'The amount of green (0-255) you want the sun to be.' },
            { name: 'aBlue', isOptional: false, isVariadic: false, summary: 'The amount of blue (0-255) you want the sun to be.' },
            { name: 'bRed', isOptional: false, isVariadic: false, summary: 'The amount of red (0-255) you want the sun to be.' },
            { name: 'bGreen', isOptional: false, isVariadic: false, summary: 'The amount of green (0-255) you want the sun to be.' },
            { name: 'bBlue', isOptional: false, isVariadic: false, summary: 'The amount of blue (0-255) you want the sun to be.' },
        ],
        returns: 'Returns true if the color of the sun was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSunColor',
    },
    setSunSize: {
        summary: 'This function is used to set the size of the sun.',
        parameters: [
            { name: 'Size', isOptional: false, isVariadic: false, summary: 'The size you want the sun to be in the sky.' },
        ],
        returns: 'Returns true if the size of the sun was set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/SetSunSize',
    },
};
