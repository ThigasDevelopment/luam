import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_9: ApiDocumentationCatalog = {
    engineGetModelNameFromID: {
        summary: 'This function gets the model name of an object model from model ID. This function is the counterpart of engineGetModelIDFromName.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID of the object' },
        ],
        returns: 'Returns a *string* with the name of the object model, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelNameFromID',
    },
    engineGetModelPhysicalPropertiesGroup: {
        summary: 'This function gets physical properties group id used by given model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'the id of model which you wish to get physical properties group of.' },
        ],
        returns: 'Returns **id** of physical properties group that requested model uses, in range of *0-159*, if the object doesn\'t have a group assigned, *-1* is returned. If passed arguments were wrong, error is triggered.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelPhysicalPropertiesGroup',
    },
    engineGetModelTextureNames: {
        summary: 'This function returns a table of the world textures which are applied to the specified model.',
        parameters: [
            { name: 'modelId', isOptional: true, isVariadic: false, summary: 'You can either use the model id or the model name.' },
        ],
        returns: 'Returns a table if this function succeeds, false if it fails for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelTextureNames',
    },
    engineGetModelTextures: {
        summary: 'This function allows you to get the textures of any model.',
        parameters: [
            { name: 'modelName/modelID', isOptional: false, isVariadic: false, summary: '' },
            { name: 'textureNames', isOptional: true, isVariadic: false, summary: 'Only return textures with specified name(s). You can provide a single string or a table of strings. Wildcard matching e.g. "ro?ds*" can be used.' },
        ],
        returns: 'Returns a table of texture elements [textureName, texture], **false** otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelTextures',
    },
    engineGetModelTXDID: {
        summary: 'This function gets TXD ID from a model.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to get TXD ID from.' },
        ],
        returns: 'Returns ID if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelTXDID',
    },
    engineGetModelVisibleTime: {
        summary: '',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: 'The ID of the model.' },
        ],
        returns: 'Returns 2 integers, indicating *timeOn* and *timeOff*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelVisibleTime',
    },
    engineGetObjectGroupPhysicalProperty: {
        summary: 'This function gets physical property of given properties group.',
        parameters: [
            { name: 'groupID', isOptional: false, isVariadic: false, summary: 'the id of physical properties group which you wish to get a property from.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns the value contained in given property if everything went well, error is raised otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetObjectGroupPhysicalProperty',
    },
    engineGetPoolCapacity: {
        summary: 'This function returns the capacity of the provided pool.',
        parameters: [
            { name: 'pool', isOptional: false, isVariadic: false, summary: 'Name of the pool' },
        ],
        returns: 'The capacity of the provided pool as positive number',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetPoolCapacity',
    },
    engineGetPoolDefaultCapacity: {
        summary: 'This function returns the default capacity of the provided pool.',
        parameters: [
            { name: 'pool', isOptional: false, isVariadic: false, summary: 'Name of the pool' },
        ],
        returns: 'The default capacity of the provided pool as positive number',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetPoolDefaultCapacity',
    },
    engineGetPoolUsedCapacity: {
        summary: 'This function returns the used capacity of the provided pool.',
        parameters: [
            { name: 'pool', isOptional: false, isVariadic: false, summary: 'Name of the pool' },
        ],
        returns: 'The used capacity of the provided pool as positive number',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetPoolUsedCapacity',
    },
    engineGetSurfaceProperties: {
        summary: 'This function retrieves the value of a surface property.',
        parameters: [
            { name: 'surfaceID', isOptional: false, isVariadic: false, summary: 'Material ID from 0 to 178' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'Property name' },
        ],
        returns: 'Returns the current property value. See the table below for possible values.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetSurfaceProperties',
    },
    engineGetVisibleTextureNames: {
        summary: 'This function returns a list of the world textures which are being used to draw the current scene.',
        parameters: [
            { name: 'nameFilter', isOptional: true, isVariadic: false, summary: 'Only include textures that match the wildcard string.' },
            { name: 'modelId', isOptional: true, isVariadic: false, summary: 'Only include textures that are used by the model id (or model name)' },
        ],
        returns: 'Returns a table of texture names.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetVisibleTextureNames',
    },
    engineImageGetFile: {
        summary: 'This function gets a file from an IMG container.',
        parameters: [
            { name: 'img_file', isOptional: false, isVariadic: false, summary: 'The IMG file you want to get file from.' },
            { name: 'file', isOptional: false, isVariadic: false, summary: 'Name or position of the file you want to get.' },
        ],
        returns: 'Returns file\'s binary data if successful, false otherwise. Data size is bonded to 2 Kb block size.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineImageGetFile',
    },
    engineImageGetFiles: {
        summary: 'This function gets the list of files from an IMG container.',
        parameters: [
            { name: 'imgArchive', isOptional: false, isVariadic: false, summary: 'The [https://gtamods.com/wiki/IMG_archive#Version_2_-_GTA_SA IMG] file handler you want to get files from.' },
        ],
        returns: 'Returns array table with files in the [https://gtamods.com/wiki/IMG_archive#Version_2_-_GTA_SA IMG] element if successfull, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineImageGetFiles',
    },
    engineImageGetFilesCount: {
        summary: 'This function returns the number of files an IMG file has.',
        parameters: [
            { name: 'imgArchive', isOptional: false, isVariadic: false, summary: 'the IMG archive handler' },
        ],
        returns: 'Returns an *int* with the number of files.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineImageGetFilesCount',
    },
    engineImageLinkDFF: {
        summary: 'This function links DFF file with an IMG container. This function does not change a model immediately. You should use engineRestreamWorld to reload models.',
        parameters: [
            { name: 'img_file', isOptional: false, isVariadic: false, summary: 'The IMG file you want to link.' },
            { name: 'file_path', isOptional: false, isVariadic: false, summary: 'Path to the DFF file you want to link.' },
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to link to.' },
        ],
        returns: 'Returns *true* if IMG file was successfully linked, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineImageLinkDFF',
    },
    engineImageLinkTXD: {
        summary: 'This function links TXD file with an IMG container. This function does not change a model immediately. You should use engineRestreamWorld to reload models.',
        parameters: [
            { name: 'img_file', isOptional: false, isVariadic: false, summary: 'The IMG file you want to link.' },
            { name: 'file_path', isOptional: false, isVariadic: false, summary: 'Path to the TXD file you want to link.' },
            { name: 'txdID', isOptional: false, isVariadic: false, summary: 'ID of the texture dictionary you want to link to. Use engineGetModelTXDID or engineRequestTXD to get this value.' },
        ],
        returns: 'Returns *true* if IMG file was successfully linked, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineImageLinkTXD',
    },
    engineImportTXD: {
        summary: 'This function imports (adds) a loaded RenderWare Texture Dictionary into a specific model. This is necessary in order for the DFF loader to find any new textures. Please **call this function before loading the DFF model file**, in order to allow the DFF loading process to find the new textures. This function can also replace default GTA textures, so that it becomes possible to e.g. put custom images on existing billboards. Ped and weapon textures are also supported.',
        parameters: [
            { name: 'texture', isOptional: false, isVariadic: false, summary: 'The TXD that was loaded with engineLoadTXD' },
            { name: 'model_id', isOptional: false, isVariadic: false, summary: 'The model id to import the TXD into' },
        ],
        returns: 'Returns *true* if the function executed succesfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineImportTXD',
    },
    engineLoadCOL: {
        summary: 'This function loads a RenderWare Collision (COL 1/2/3) file into GTA. The collisions can then be used to provide collisions for in-game objects.\n\nFor vehicles, please omit this function by embedding your COL file into your DFF file. This way, you can be sure that the COL file is correctly (and automatically) loaded when calling engineLoadDFF.\n\nThis is a client side function. Be sure to transfer your COL file by including it in the meta file.',
        parameters: [
            { name: 'raw_data', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a COL if the file was loaded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadCOL',
    },
    engineLoadDFF: {
        summary: 'This function loads a RenderWare Model (DFF) file into GTA.\n\nTo successfully load your model with textures, be sure to use engineLoadTXD and engineImportTXD before calling this function. If some error occurs while loading the DFF, MTA will output a message - check out DFF error messages to know what they mean.\n\nThis is a client side function. Be sure to transfer your DFF file by including it in the meta file.\n\nThe returned DFF element is an element in the element tree, just like vehicles and objects. When the dff is destroyed, ie on resource unload or using destroyElement, any elements that use the DFF, such as vehicles or objects will be reset.',
        parameters: [
            { name: 'raw_data', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'Returns a DFF element if the dff file loaded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadDFF',
    },
    engineLoadIFP: {
        summary: 'This function loads an animation library (IFP) file into GTA with a custom block name. All three IFP formats are supported ANPK, ANP2, and ANP3. Unfortunately, GTA 3 animations are not supported, however, you can load GTA:VC IFP files using this function. You don\'t have to replace any animation to play a custom one, to play a custom animation, load the IFP file using this function, then use setPedAnimation.\n\nIf you wish to replace a GTA internal animation with a custom one, you can use engineReplaceAnimation. To unload the IFP file, use destroyElement, restarting or stopping the resource can also unload the IFP file automatically.',
        parameters: [
            { name: 'raw_data', isOptional: false, isVariadic: false, summary: '' },
            { name: 'custom_block_name', isOptional: false, isVariadic: false, summary: 'the new block name for the IFP file. You cannot use the GTA default internal block names. **You should namespace this name** using a string like *resource.blockname*' },
        ],
        returns: 'Returns an IFP element if the IFP file loaded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadIFP',
    },
    engineLoadIMG: {
        summary: 'This function loads an IMG container into GTA.',
        parameters: [
            { name: 'img_file', isOptional: false, isVariadic: false, summary: 'The filepath to the IMG file you want to load.' },
        ],
        returns: 'Returns an IMG element if the IMG file loaded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadIMG',
    },
    engineLoadTXD: {
        summary: 'This function loads a RenderWare Texture Dictionary (TXD) file into GTA. The texture dictionary can then be used to provide textures.\n\nThis is a client side function. Be sure to transfer your TXD file by including it in the meta file.',
        parameters: [
            { name: 'raw_data', isOptional: false, isVariadic: false, summary: '' },
            { name: 'filteringEnabled', isOptional: true, isVariadic: false, summary: 'Whether to enable texture filtering.' },
        ],
        returns: 'Returns a TXD if the file was loaded, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadTXD',
    },
    enginePreloadWorldArea: {
        summary: 'This function allows a specific area to be loaded **immediately**, which can be useful when teleporting a player. The function is not based on a radius, but a specific zone is loaded.',
        parameters: [
            { name: 'x', isOptional: false, isVariadic: false, summary: 'Position in the X axis.' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'Position in the Y axis' },
            { name: 'z', isOptional: false, isVariadic: false, summary: 'Position in the z axis.' },
            { name: 'loadingOption', isOptional: true, isVariadic: false, summary: 'Argument of what exactly is to be loaded. Possible values:' },
        ],
        returns: 'Nothing',
        wiki: 'https://wiki.multitheftauto.com/wiki/EnginePreloadWorldArea',
    },
    engineRemoveImage: {
        summary: 'This function disables streaming from an IMG container.',
        parameters: [
            { name: 'img_file', isOptional: false, isVariadic: false, summary: 'The IMG file you want to remove.' },
        ],
        returns: 'Returns *true* if stremaing from IMG file was successfully disabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRemoveImage',
    },
    engineRemoveShaderFromWorldTexture: {
        summary: 'This function removes a shader from one or more world textures.',
        parameters: [
            { name: 'shader', isOptional: false, isVariadic: false, summary: 'The shader which is to be removed' },
            { name: 'textureName', isOptional: false, isVariadic: false, summary: 'The name of the world texture to remove the shader from. It should be exactly the same string as used with engineApplyShaderToWorldTexture when the shader was initially applied.' },
            { name: 'targetElement', isOptional: true, isVariadic: false, summary: 'The element to remove the shader from. It should be the same element as used with engineApplyShaderToWorldTexture when the shader was initially applied.' },
        ],
        returns: 'Returns *true* if the shader was successfully removed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRemoveShaderFromWorldTexture',
    },
    engineReplaceAnimation: {
        summary: 'This function replaces a specific internal (default) animation with a custom one that has been loaded using engineLoadIFP function. This function only affects a specific player or ped, the internal animation is not replaced for everyone, for instance, different players and peds are able to have completely different crouching, walking, and fighting etc., animations running simultaneously at the same time. Also, it\'s not synchronized, you\'ll need to execute this function on every client in Lua to synchronize it.\n\nInternal animations replaced using this function can still be played with setPedAnimation. You can restore replaced animations back with engineRestoreAnimation.\n\nIt should be noted that partial animations are not supported, you can still replace them, but they won\'t work as intended, for example, "FightA_block" animation from "ped" block is a partial animation, you can\'t replace it properly, only a few animations are partial, rest of them are not, so it shouldn\'t be a problem.',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'the player or ped you want to replace an animation for.' },
            { name: 'InternalBlockName', isOptional: false, isVariadic: false, summary: 'the internal block name.' },
            { name: 'InternalAnimName', isOptional: false, isVariadic: false, summary: 'the internal animation name inside InternalBlockName.' },
            { name: 'CustomBlockName', isOptional: false, isVariadic: false, summary: 'the custom block name of the loaded IFP file that you passed to engineLoadIFP as second parameter.' },
            { name: 'CustomAnimName', isOptional: false, isVariadic: false, summary: 'the custom animation name inside the loaded IFP file with CustomBlockName.' },
        ],
        returns: 'Returns *true* on success, *false* in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineReplaceAnimation',
    },
};
