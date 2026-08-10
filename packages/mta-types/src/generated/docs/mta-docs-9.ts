import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_9: ApiDocumentationCatalog = {
    engineReplaceAnimation: {
        summary: 'This function replaces a specific internal (default) animation with a custom one that has\nbeen loaded using EngineLoadIFP|engineLoadIFP function. This function only affects a\nspecific player or ped, the Animations|internal animation is not replaced for everyone,\nfor instance, different players and peds are able to have completely different crouching,\nwalking, and fighting etc., animations running simultaneously at the same time. Also, its\nnot synchronized, youll need to execute this function on every client in Lua to\nsynchronize it.\nInternal animations replaced using this function can still be played with\nSetPedAnimation|setPedAnimation. You can restore replaced animations back with\nEngineRestoreAnimation|engineRestoreAnimation.\nIt should be noted that partial animations are not supported, you can still replace them,\nbut they wont work as intended, for example, FightA_block animation from ped block is a\npartial animation, you cant replace it properly, only a few animations are partial, rest\nof them are not, so it shouldnt be a problem.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to replace an animation for.' },
            { name: 'InternalBlockName', isOptional: false, isVariadic: false, summary: 'the Animations|internal block name.' },
            { name: 'InternalAnimName', isOptional: false, isVariadic: false, summary: 'the Animations|internal animation name inside InternalBlockName.' },
            { name: 'CustomBlockName', isOptional: false, isVariadic: false, summary: 'the custom block name of the loaded IFP file that you passed to EngineLoadIFP|engineLoadIFP as second parameter.' },
            { name: 'CustomAnimName', isOptional: false, isVariadic: false, summary: 'the custom animation name inside the loaded IFP file with CustomBlockName.' },
        ],
        returns: 'returns true on success, false in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineReplaceAnimation',
    },
    engineReplaceCOL: {
        summary: 'This function replaces the collision file of the given model id to the collision file\npassed. Use engineLoadCOL to load the collision file first.',
        parameters: [
            { name: 'theCol', isOptional: false, isVariadic: false, summary: 'The collision file to replace with' },
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID whose collision file you want to replace' },
        ],
        returns: 'returns true if the collision was successfully replaced, false or nil if the collision could not be replaced for a reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineReplaceCOL',
    },
    engineReplaceModel: {
        summary: 'This function replaces the given model ID with the model contained in a DFF file loaded\nby engineLoadDFF. This function supports vehicle|vehicles, object|objects, ped|peds and\nplayer|players but not CJ clothing and body parts.\nTo replace weapon models you must use their object IDs, not weapon IDs. There is a weapon\nmodel list available at weapons.\n* Please note the loading order that is used in the examples as other orders can cause\ncollisions, textures or the DFF not to load due to technical limitations.\n* Default GTA map objects behave inconsistently when using this function on them. If you\nwant to replace models in the original GTA map, use one of the EngineReplaceModel\nnotes|methods shown here.\n* A raw data DFF element can only be used once, because the underlying memory for the\nmodel is released after replacement.\n* If the replacement model is broken and the original model is not loaded/streamed-in at\nthe time of replacement, this function will succeed and you wont see any error message,\nneither when the model replacement fails once the original model starts to\nload/stream-in.',
        parameters: [
            { name: 'theModel', isOptional: false, isVariadic: false, summary: 'The model to replace the given model ID with' },
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model it to replace the model of' },
            { name: 'alphaTransparency', isOptional: true, isVariadic: false, summary: 'Set to true if model uses semi-transparent textures, e.g. windows. This will ensure other objects behind the semi-transparent textures are rendered correctly. (Can slightly impact performance, so only set when required)' },
        ],
        returns: 'returns true if the model was successfully replaced, false if it failed for some reason, ie. the dff or the model id is not valid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineReplaceModel',
    },
    engineRequestModel: {
        summary: '',
        parameters: [
            { name: 'elementType', isOptional: false, isVariadic: false, summary: ': ped, vehicle or object.' },
            { name: 'parentID', isOptional: true, isVariadic: false, summary: ': The ID of the parent model (by default this is: 1337 - objects, 400 - vehicles, 7 - peds).' },
        ],
        returns: 'do not rely on the model numbers returned being consistent across multiple clients or multiple runs of resources. there is no guarantee for the order of the numbers or that the same numbers will always correspond to the same element type. any patterns are coincidental.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRequestModel',
    },
    engineResetModelLODDistance: {
        summary: '',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'The model / object ID number you want to reset the LOD distance of.' },
        ],
        returns: 'returns true if the lod distance was reset to default, or false if the model argument is incorrect, or the lod distance hasnt been changed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineResetModelLODDistance',
    },
    engineResetSurfaceProperties: {
        summary: '',
        parameters: [
            { name: 'surfaceID', isOptional: true, isVariadic: false, summary: 'Material IDs|Material ID from 0 to 178' },
        ],
        returns: 'returns true if the function executed succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineResetSurfaceProperties',
    },
    engineRestoreAnimation: {
        summary: 'This function restores internal (default) animations that were replaced using\nEngineReplaceAnimation|engineReplaceAnimation function. This function only affects a\nspecific player or ped just like EngineReplaceAnimation|engineReplaceAnimation.\nIf only 1st parameter (Ped|ped) is provided to this function, all replaced animations are\nrestored.\nIf block name is also provided for 2nd parameter, then replaced animations within that\nblock are restored.\nIf 3rd parameter (animation name) is provided, then only that specific animation within\nthat specific block is restored.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to restore an animation(s) for.' },
            { name: 'InternalBlockName', isOptional: true, isVariadic: false, summary: 'the Animations|internal block name.' },
            { name: 'InternalAnimName', isOptional: true, isVariadic: false, summary: 'the Animations|internal animation name inside InternalBlockName.' },
        ],
        returns: 'returns true on success, false in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreAnimation',
    },
    engineRestoreCOL: {
        summary: 'This function restores the original collision model of the given model ID. Reverses the\neffect of engineReplaceCOL.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The ID of the model to restore the model of' },
        ],
        returns: 'returns true if this function succeeds, false or nil if it fails for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreCOL',
    },
    engineRestoreModel: {
        summary: 'This function restores the visual DFF model of the given model ID. This restores the\nresult of engineReplaceModel.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID to restore the visuals of' },
        ],
        returns: 'returns true if the model was successfully restored, false or nil if it failed for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreModel',
    },
    engineRestoreModelPhysicalPropertiesGroup: {
        summary: '',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': the id of model which you wish to restore original physical properties group of.' },
        ],
        returns: 'returns true if there were no issues, if passed arguments were invalid an error is raised.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreModelPhysicalPropertiesGroup',
    },
    engineRestoreObjectGroupPhysicalProperties: {
        summary: '',
        parameters: [
            { name: 'groupID', isOptional: false, isVariadic: false, summary: ': the id of physical properties group which you wish to restore a property of. objectgroup-modifiable : the property which you wish to restore, as per table below.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns true if everything went well, error is raised otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestoreObjectGroupPhysicalProperties',
    },
    engineRestreamWorld: {
        summary: '',
        parameters: [],
        returns: 'returns true if the world was restreamed successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRestreamWorld',
    },
    engineSetAsynchronousLoading: {
        summary: 'This function enables or disables asynchronous model loading. Enabling asynchronous model\nloading may reduce the small pauses that occur when a new model is displayed for the\nfirst time. However, it can cause the new models to appear slightly later than they might\nhave otherwise.',
        parameters: [
            { name: 'enable', isOptional: false, isVariadic: false, summary: 'Set to true/false to enable/disable asynchronous loading. Only works if the clients preferences has Asynchronous Loading set to Auto.' },
            { name: 'force', isOptional: false, isVariadic: false, summary: 'If set to true, ignores the clients preferences.' },
        ],
        returns: 'returns true if the function executed successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetAsynchronousLoading',
    },
    engineSetModelLODDistance: {
        summary: 'This function sets a custom LOD distance for any object / model ID. This is the distance\nat which objects of that model ID are switched to their LOD model, or (if there is no LOD\nmodel) become invisible.\nNotes:\nThe actual draw distance used is modified by the draw distance slider in the settings\nVideo tab of the MTA client.\n*When the Video tab draw distance slider is 0%, the engineSetModelLODDistance setting\napproximately matches the draw distance used.\n:e.g. engineSetModelLODDistance(1337,100) will mean model 1337 will be visible up to a\ndistance of 100 units.\n*When the Video tab draw distance slider is 100%, the engineSetModelLODDistance setting\nis approximately doubled before use.\n:e.g. engineSetModelLODDistance(1337,100) will mean model 1337 will be visible up to a\ndistance of 200 units.\nHowever, there is a general draw distance limit of 300 units. So\nengineSetModelLODDistance(1337,400) will mean model 1337 will be visible up to a distance\nof 300 units no matter what the Video tab says.\nTherefore, unless its really important, engineSetModelLODDistance should not be set to\nanything greater than 170.\n\n170 will still give the maximum draw distance (of 300 units) on clients that have a Video\ntab draw distance setting of 100%, and it will help reduce lag for players who chose a\nlower draw distance in their settings.\nFor low LOD elements, engineSetModelLODDistance still has a limit of 300 units, but the\nactual draw distance used is 5 times the setting value. Also, low LOD elements ignore the\nVideo tab draw distance slider. So a setting of 200 will mean a low LOD element will\nalways have a draw distance of 1000 units.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'The model / object ID number you want to change the LOD distance of.' },
            { name: 'distance', isOptional: false, isVariadic: false, summary: 'New LOD distance value in San Andreas units.' },
        ],
        returns: 'returns true if the function executed succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelLODDistance',
    },
    engineSetModelPhysicalPropertiesGroup: {
        summary: '',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': the id of model which you wish to set physical properties group of.' },
            { name: 'groupID', isOptional: false, isVariadic: false, summary: ': the id of new physical properties group to be used by given model.' },
        ],
        returns: 'returns true if there were no issues with group change, otherwise an error is raised',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelPhysicalPropertiesGroup',
    },
    engineSetModelVisibleTime: {
        summary: '',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': The ID of the model.' },
            { name: 'timeOn', isOptional: false, isVariadic: false, summary: ': Value between 0 and 24 that states when the model should appear.' },
            { name: 'timeOff', isOptional: false, isVariadic: false, summary: ': Value between 0 and 24 that states when the model should disappear.' },
        ],
        returns: 'returns true if the change was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetModelVisibleTime',
    },
    engineSetObjectGroupPhysicalProperty: {
        summary: '',
        parameters: [
            { name: 'groupID', isOptional: false, isVariadic: false, summary: ': the id of physical properties group which you wish to set a property of. objectgroup-modifiable : the property which you wish to set, as per table below.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: '' },
            { name: 'newValue', isOptional: false, isVariadic: false, summary: ': new value of the property, with proper type as specified in table below' },
        ],
        returns: 'returns true if everything went well, error is raised otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetObjectGroupPhysicalProperty',
    },
    engineSetSurfaceProperties: {
        summary: '',
        parameters: [
            { name: 'surfaceID', isOptional: false, isVariadic: false, summary: 'Material IDs|Material ID from 0 to 178' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'Property name' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'New value from table below' },
        ],
        returns: 'returns true if the function executed succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineSetSurfaceProperties',
    },
    engineStreamingFreeUpMemory: {
        summary: '',
        parameters: [
            { name: 'bytes', isOptional: false, isVariadic: false, summary: 'The amount of RAM to be freed up in bytes.' },
        ],
        returns: '* returns true if the function has succeeded, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingFreeUpMemory',
    },
    engineStreamingGetUsedMemory: {
        summary: '',
        parameters: [],
        returns: '* returns a int containing the amount of memory in bytes.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineStreamingGetUsedMemory',
    },
    eventName: {
        summary: 'The name of the event ("onResourceStart", "onPlayerWasted" etc.)',
        parameters: [],
        returns: '',
        wiki: '',
    },
    executeBrowserJavascript: {
        summary: 'This function executes a Javascript string to the specified Element/Browser|browser.\nWorks only with local browsers.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The web browser which will execute the Javascript code' },
            { name: 'jsCode', isOptional: false, isVariadic: false, summary: 'The Javascript code string' },
        ],
        returns: 'returns true if executing javascript is allowed in the current context, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExecuteBrowserJavascript',
    },
    executeCommandHandler: {
        summary: 'This function will call all the attached functions of an existing console command, for a\nspecified player.',
        parameters: [
            { name: 'commandName', isOptional: false, isVariadic: false, summary: 'The name of the command you wish to execute. This is what must be typed into the console to trigger the function.' },
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player that will be presented as executer of the command to the handler function(s) of the command.' },
            { name: 'args', isOptional: true, isVariadic: false, summary: 'Additional parameters that will be passed to the handler function(s) of the command that is called, separated by spaces.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExecuteCommandHandler',
    },
    executeSQLQuery: {
        summary: 'This function executes an arbitrary SQL query and returns the result rows if there are\nany. It allows parameter binding for security (SQL injection is rendered impossible).',
        parameters: [
            { name: 'query', isOptional: false, isVariadic: false, summary: 'An SQL query. Positions where parameter values will be inserted are marked with a ?. paramX A variable number of parameters. These must be strings or numbers - it is important to make sure they are of the correct type. Also, the number of parameters passed must be equal to the number of ? characters in the query string. String parameters are automatically escaped by adding a backslash (\\) before \' and \\ characters.' },
            { name: 'param1', isOptional: true, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'returns a table with the result of the query if it was a select query, or false if otherwise. in case of a select query the result table may be empty (if there are no result rows). the table is of the form: ```lua { { colname1=value1, colname2=value2, ... }, { colname1=value3, colname2=value4, ... }, ... } ``` a subsequent table represents the next row.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExecuteSQLQuery',
    },
    extinguishFire: {
        summary: '',
        parameters: [
            { name: 'x', isOptional: true, isVariadic: false, summary: '' },
            { name: 'y', isOptional: true, isVariadic: false, summary: '' },
            { name: 'z', isOptional: true, isVariadic: false, summary: '' },
            { name: 'radius', isOptional: true, isVariadic: false, summary: 'a float value indicating the radius in which to extinguish fire.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/ExtinguishFire',
    },
    fadeCamera: {
        summary: 'This function will fade a players camera to a color or back to normal over a specified\ntime period. This will also affect the sound volume for the player (50% faded = 50%\nvolume, full fade = no sound). For clientside scripts you can perform 2 fade ins or fade\nouts in a row, but for serverside scripts you must use one then the other.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player whose camera you wish to fade.' },
            { name: 'fadeIn', isOptional: false, isVariadic: false, summary: 'Should the camera be faded in or out? Pass true to fade the camera in, false to fade it out to a color.' },
            { name: 'timeToFade', isOptional: true, isVariadic: false, summary: 'The number of seconds it should take to fade.' },
            { name: 'red', isOptional: true, isVariadic: false, summary: 'The amount of red in the color that the camera fades out to (0 - 255). Not required for fading in.' },
            { name: 'green', isOptional: true, isVariadic: false, summary: 'The amount of green in the color that the camera fades out to (0 - 255). Not required for fading in.' },
            { name: 'blue', isOptional: true, isVariadic: false, summary: 'The amount of blue in the color that the camera fades out to (0 - 255). Not required for fading in.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/FadeCamera',
    },
};
