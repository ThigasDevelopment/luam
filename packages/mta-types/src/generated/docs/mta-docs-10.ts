import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_10: ApiDocumentationCatalog = {
    engineReplaceCOL: {
        summary: 'This function replaces the collision file of the given model id to the collision file passed. Use engineLoadCOL to load the collision file first.',
        parameters: [
            { name: 'theCol', isOptional: false, isVariadic: false, summary: 'The collision file to replace with' },
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID whose collision file you want to replace' },
        ],
        returns: 'Returns *true* if the collision was successfully replaced, *false* or *nil* if the collision could not be replaced for a reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineReplaceCOL',
    },
    engineReplaceModel: {
        summary: 'This function replaces the given model ID with the model contained in a DFF file loaded by engineLoadDFF. This function supports vehicles, objects, peds and players.\n\nSince version [https://buildinfo.multitheftauto.com/?Revision=23124&Branch= r23124] and above replacing CJ clothing became possible - see: Clothing Component IDs. Body parts replacements aren\'t supported at the moment.\n\nTo replace weapon models you must use their object IDs, not weapon IDs. There is a weapon model list available at Weapons.',
        parameters: [
            { name: 'theModel', isOptional: false, isVariadic: false, summary: 'The model to replace the given model ID with' },
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model it to replace the model of' },
            { name: 'alphaTransparency', isOptional: true, isVariadic: false, summary: 'Set to true if model uses semi-transparent textures, e.g. windows. This will ensure other objects behind the semi-transparent textures are rendered correctly. (Can slightly impact performance, so only set when required)' },
        ],
        returns: 'Returns *true* if the model was successfully replaced, *false* if it failed for some reason, ie. the DFF or the model ID is not valid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineReplaceModel',
    },
    engineRequestModel: {
        summary: 'This function is used to assign the next available model ID to a certain element type.',
        parameters: [
            { name: 'elementType', isOptional: false, isVariadic: false, summary: '"ped", "vehicle", "object", "timed-object", "clump", "object-damageable"' },
            { name: 'parentID', isOptional: true, isVariadic: false, summary: 'The ID of the parent model (by default this is: 1337 - objects, 400 - vehicles, 7 - peds, 3425 - clump models, 4715 - timed objects, 994 - damageable objects).' },
        ],
        returns: 'Returns an *integer* of the model ID that was available to be assigned to the element type, *false* if no free model ID available or invalid element type. Do not rely on the model numbers returned being consistent across multiple clients or multiple runs of resources. There is no guarantee for the order of the numbers or that the same numbers will always correspond to the same element type. Any patterns are coincidental.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRequestModel',
    },
    engineRequestTXD: {
        summary: 'This function is used to register the next available TXD ID.',
        parameters: [
            { name: 'name', isOptional: false, isVariadic: false, summary: 'TXD name string up to 24 characters.' },
        ],
        returns: 'Returns an *integer* of the TXD ID that was available to be assigned to game models, *false* if no free TXD ID available. Do not rely on the id numbers returned being consistent across multiple clients or multiple runs of resources. There is no guarantee for the order of the numbers.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRequestTXD',
    },
    engineResetModelFlags: {
        summary: 'This function restores model flags to default state.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to reset.' },
        ],
        returns: 'Returns *true* if model flags was successfully restored, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineResetModelFlags',
    },
    engineResetModelLODDistance: {
        summary: 'This function resets the LOD distance for an object / model ID.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'The model / object ID number you want to reset the LOD distance of.' },
        ],
        returns: 'Returns *true* if the LOD distance was reset to default, or *false* if the model argument is incorrect, or the LOD distance hasn\'t been changed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineResetModelLODDistance',
    },
    engineResetModelTXDID: {
        summary: 'This function restores the original TXD ID of the given model ID. Reverses the effect of EngineSetModelTXDID.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The ID of the model to restore the model of' },
        ],
        returns: 'Returns *true* if this function succeeds, throw a error if it fails for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineResetModelTXDID',
    },
    engineResetSurfaceProperties: {
        summary: 'This function resets a surface property to its default value. If no ID is provided, it will reset all surfaces\' properties to their original values.',
        parameters: [
            { name: 'surfaceID', isOptional: true, isVariadic: false, summary: 'Material ID from 0 to 178' },
        ],
        returns: 'Returns *true* if the function executed succesfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineResetSurfaceProperties',
    },
    engineRestoreAnimation: {
        summary: 'This function restores internal (default) animations that were replaced using engineReplaceAnimation function. This function only affects a specific player or ped just like engineReplaceAnimation.\n\nIf only 1st parameter (ped) is provided to this function, all replaced animations are restored.\nIf block name is also provided for 2nd parameter, then replaced animations within that block are restored.\nIf 3rd parameter (animation name) is provided, then only that specific animation within that specific block is restored.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to restore an animation(s) for.' },
            { name: 'InternalBlockName', isOptional: true, isVariadic: false, summary: 'the internal block name.' },
            { name: 'InternalAnimName', isOptional: true, isVariadic: false, summary: 'the internal animation name inside InternalBlockName.' },
        ],
        returns: 'Returns *true* on success, *false* in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreAnimation',
    },
    engineRestoreCOL: {
        summary: '<!-- Change this to "Client function" or "Server function" appropriately-->\n<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function restores the original collision model of the given model ID. Reverses the effect of engineReplaceCOL.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The ID of the model to restore the model of' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if this function succeeds, *false* or *nil* if it fails for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreCOL',
    },
    engineRestoreDFFImage: {
        summary: 'This function restores changes to DFF file from IMG container.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to restore.' },
        ],
        returns: 'Returns *true* if IMG file was successfully restored, *false* otherwise. <!-- TODO: Add examples',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreDFFImage',
    },
    engineRestoreModel: {
        summary: '<!-- Change this to "Client function" or "Server function" appropriately-->\n<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis function restores the visual DFF model of the given model ID. This restores the result of engineReplaceModel.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID to restore the visuals of' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the model was successfully restored, *false* or *nil* if it failed for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreModel',
    },
    engineRestoreModelPhysicalPropertiesGroup: {
        summary: 'This function restores original physical properties group used by given model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'the id of model which you wish to restore original physical properties group of.' },
        ],
        returns: 'Returns **true** if there were no issues, if passed arguments were invalid an error is raised.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreModelPhysicalPropertiesGroup',
    },
    engineRestoreObjectGroupPhysicalProperties: {
        summary: 'This function restores all physical properties of given properties group.',
        parameters: [
            { name: 'groupID', isOptional: false, isVariadic: false, summary: 'the id of physical properties group which you wish to restore.' },
        ],
        returns: 'Returns **true** if everything went well, error is raised otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreObjectGroupPhysicalProperties',
    },
    engineRestoreTXDImage: {
        summary: 'This function restores changes to TXD file from IMG container.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to restore.' },
        ],
        returns: 'Returns *true* if IMG file was successfully restored, *false* otherwise. <!-- TODO: Add examples',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreTXDImage',
    },
    engineRestreamWorld: {
        summary: 'This function re-streams everything in the GTA world. Read [https://github.com/multitheftauto/mtasa-blue/pull/1735 this pull request] to understand what it is for.',
        parameters: [],
        returns: 'Returns *true* if the world was restreamed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestreamWorld',
    },
    engineSetAsynchronousLoading: {
        summary: 'This function enables or disables asynchronous model loading. Enabling asynchronous model loading may reduce the small pauses that occur when a new model is displayed for the first time. However, it can cause the new models to appear slightly later than they might have otherwise.',
        parameters: [
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set to true/false to enable/disable asynchronous loading. Only works if the client\'s preferences has \'Asynchronous Loading\' set to \'Auto\'.' },
            { name: 'force', isOptional: false, isVariadic: false, summary: 'If set to true, ignores the client\'s preferences.' },
        ],
        returns: 'Returns *true* if the function executed successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetAsynchronousLoading',
    },
    engineSetModelFlag: {
        summary: 'This function changes specific model flag.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to set flag.' },
            { name: 'flagName', isOptional: false, isVariadic: false, summary: 'flag name.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'flag state.' },
        ],
        returns: 'Returns *boolean* with flag state, throws an error otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelFlag',
    },
    engineSetModelFlags: {
        summary: 'This function changes model flags.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to change.' },
            { name: 'flags', isOptional: false, isVariadic: false, summary: 'flags.' },
            { name: 'ideFlags', isOptional: true, isVariadic: false, summary: 'use IDE flag format.' },
        ],
        returns: 'Returns *true* if model flags was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelFlags',
    },
    engineSetModelLODDistance: {
        summary: 'This function sets a custom LOD distance for any object / model ID. This is the distance at which objects of that model ID are switched to their LOD model, or (if there is no LOD model) become invisible.\n\n**Known Issues:**\n\n***This function only works with script-created objects**, just like objects created  with **CreateObject** or buildings created with **createBuilding**. It **DOES NOT** work with default map objects/buildings.\n***If the LOD distance **for a high LOD model** is set to more than 325, the fade out effect of the model will not trigger and the model will just pop in/pop out of existence.\n\n**Notes:\'\'\'\n\n*The actual draw distance used is modified by the draw distance slider in the settings \'Video\' tab of the MTA client.\n\n*When the \'Video\' tab draw distance slider is 0%, the engineSetModelLODDistance setting approximately matches the draw distance used.\n:*e.g. engineSetModelLODDistance(1337,100) will mean model 1337 will be visible up to a distance of **100** units.*\n\n*When the \'Video\' tab draw distance slider is 100%, the engineSetModelLODDistance setting is approximately doubled before use.\n:*e.g. engineSetModelLODDistance(1337,100) will mean model 1337 will be visible up to a distance of **200** units.*\n\nHowever, there is a general draw distance limit of 325 units. So engineSetModelLODDistance(1337,400) will mean model 1337 will be visible up to a distance of 325 units no matter what the \'Video\' tab says.\n\nTherefore, unless it\'s really important, engineSetModelLODDistance should not be set to anything greater than 170.\n\n170 will still give the maximum draw distance (of 325 units) on clients that have a \'Video\' tab draw distance setting of 100%, and it will help reduce lag for players who chose a lower draw distance in their settings.\n\n**Note for low LOD objects**:\n*The limit is 325 units, but the actual draw distance used is 5 times the setting value. Also, they ignore the \'Video\' tab draw distance slider. So a setting of 200 will mean a low LOD element will always have a draw distance of **1000** units.\n\n**Note for low LOD buildings**:\n*The distance must be set greater than 300 for a low LOD building in order to work correctly. Otherwise, the low LOD will always be visible. The actual draw distance is NOT 5 times the setting value.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'The model / object ID number you want to change the LOD distance of.' },
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'New LOD distance value in San Andreas units.' },
            { name: 'extendedLod', isOptional: true, isVariadic: false, summary: 'Allows to set a greater distance than the current 325 units.' },
        ],
        returns: 'Returns *true* if the function executed succesfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelLODDistance',
    },
    engineSetModelPhysicalPropertiesGroup: {
        summary: 'This function sets physical properties group id used by given model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'the id of model which you wish to set physical properties group of.' },
            { name: 'groupID', isOptional: false, isVariadic: false, summary: 'the id of new physical properties group to be used by given model. Use -1 to disable model physics.' },
        ],
        returns: 'Returns **true** if there were no issues with group change, otherwise an error is raised',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelPhysicalPropertiesGroup',
    },
    engineSetModelTXDID: {
        summary: 'This function changes the TXD ID of the given model ID.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The ID of the model to update TXD ID.' },
            { name: 'txdID', isOptional: false, isVariadic: false, summary: 'The ID of target TXD. Use engineRequestTXD to get a new TXD ID.' },
        ],
        returns: 'Returns *true* if this function succeeds, throw a error if it fails for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelTXDID',
    },
    engineSetModelVisibleTime: {
        summary: 'This function changes model visibility time, this is used for example for building lights being shown after 23:00.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The ID of the model.' },
            { name: 'timeOn', isOptional: false, isVariadic: false, summary: 'Value between 0 and 24 that states when the model should appear.' },
            { name: 'timeOff', isOptional: false, isVariadic: false, summary: 'Value between 0 and 24 that states when the model should disappear.' },
        ],
        returns: 'Returns *true* if the change was successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelVisibleTime',
    },
    engineSetObjectGroupPhysicalProperty: {
        summary: 'This function sets physical property of given properties group.',
        parameters: [
            { name: 'groupID', isOptional: false, isVariadic: false, summary: 'the id of physical properties group which you wish to set a property of.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: '' },
            { name: 'newValue', isOptional: false, isVariadic: false, summary: 'new value of the property, with proper type as specified in table below' },
        ],
        returns: 'Returns **true** if everything went well, error is raised otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetObjectGroupPhysicalProperty',
    },
    engineSetPoolCapacity: {
        summary: 'This function changes the capacity of the provided pool.',
        parameters: [
            { name: 'pool', isOptional: false, isVariadic: false, summary: 'Name of the pool' },
            { name: 'capacity', isOptional: false, isVariadic: false, summary: 'New size' },
        ],
        returns: '**true** if the pool capacity was changed and **false** if not. Throws an error if the pool is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetPoolCapacity',
    },
    engineSetSurfaceProperties: {
        summary: 'This function changes a property of a surface.',
        parameters: [
            { name: 'surfaceID', isOptional: false, isVariadic: false, summary: 'Material ID from 0 to 178' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'Property name' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'New value from table below' },
        ],
        returns: 'Returns *true* if the function executed succesfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetSurfaceProperties',
    },
    engineStreamingFreeUpMemory: {
        summary: 'This function frees up the streaming RAM memory.',
        parameters: [
            { name: 'bytes', isOptional: false, isVariadic: false, summary: 'The amount of RAM to be freed up in bytes.' },
        ],
        returns: '* Returns *true* if the function has succeeded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingFreeUpMemory',
    },
};
