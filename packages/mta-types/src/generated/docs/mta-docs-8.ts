import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_8: ApiDocumentationCatalog = {
    dxSetShaderTransform: {
        summary: 'This function applies a 3D transformation to a shader element when it is drawn with\ndxDrawImage.',
        parameters: [
            { name: 'theShader', isOptional: false, isVariadic: false, summary: 'The shader element whose transformation is to be changed' },
            { name: 'rotationX', isOptional: false, isVariadic: false, summary: 'Rotation angle in degrees around the X axis (Left,right). This will make the shader rotate along its width.' },
            { name: 'rotationY', isOptional: false, isVariadic: false, summary: 'Rotation angle in degrees around the Y axis (Up,down). This will make the shader rotate along its height.' },
            { name: 'rotationZ', isOptional: false, isVariadic: false, summary: 'Rotation angle in degrees around the Z axis (In,out). This will make the shader rotate in a similar way to the rotation argument in dxDrawImage.' },
            { name: 'rotationCenterOffsetX', isOptional: true, isVariadic: false, summary: 'The center of rotation offset X position in screen relative units.' },
            { name: 'rotationCenterOffsetY', isOptional: true, isVariadic: false, summary: 'The center of rotation offset Y position in screen relative units.' },
            { name: 'rotationCenterOffsetZ', isOptional: true, isVariadic: false, summary: 'The center of rotation offset Z position in screen relative units.' },
            { name: 'bRotationCenterOffsetOriginIsScreen', isOptional: true, isVariadic: false, summary: 'Set to boolean|true if the center of rotation origin should be the center of the screen rather than the center of the image.' },
            { name: 'perspectiveCenterOffsetX', isOptional: true, isVariadic: false, summary: 'The center of perspective offset X position in screen relative units.' },
            { name: 'perspectiveCenterOffsetY', isOptional: true, isVariadic: false, summary: 'The center of perspective offset Y position in screen relative units.' },
            { name: 'bPerspectiveCenterOffsetOriginIsScreen', isOptional: true, isVariadic: false, summary: 'Set to boolean|true if the center of perspective origin should be the center of the screen rather than the center of the image. To convert screen relative units into screen pixel coordinates, \'\'multiply\'\' by the screen size. Conversely, to convert screen pixel coordinates to screen relative units, \'\'**divide**\'\' by the screen size.' },
        ],
        returns: 'returns true if the shader elements transform was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetShaderTransform',
    },
    dxSetShaderValue: {
        summary: 'This sets a named parameter for a shader element',
        parameters: [
            { name: 'theShader', isOptional: false, isVariadic: false, summary: 'The shader element whose parameter is to be changed' },
            { name: 'parameterName', isOptional: false, isVariadic: false, summary: 'The name of parameter' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value to set, which can be a texture, a bool, a number or a list of numbers(max 16 floats(numbers))' },
        ],
        returns: 'returns true if the shader elements parameter was successfully changed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetShaderValue',
    },
    dxSetTestMode: {
        summary: 'This function is used for testing scripts written using guiCreateFont, dxCreateFont,\ndxCreateShader and dxCreateRenderTarget.\nEach one of the 3 test modes should be used in turn to help highlight any potential\nproblems.',
        parameters: [
            { name: 'testMode', isOptional: false, isVariadic: false, summary: 'The test mode to be set. It can be one of the following values: none Test mode disabled no_mem Simulate no free video memory available for MTA. low_mem Simulate little free video memory available for MTA. no_shader Simulate shaders failing validation.' },
        ],
        returns: 'returns true if the test mode was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetTestMode',
    },
    dxSetTextureEdge: {
        summary: 'This functions allows you to change the edge handling after creating the texture.',
        parameters: [
            { name: 'theTexture', isOptional: false, isVariadic: false, summary: 'The affected texture' },
            { name: 'textureEdge', isOptional: false, isVariadic: false, summary: 'The texture edge mode. Available modes are wrap, mirror, clamp, border, mirror-once border-color If textureEdge is set to border, you are able to define a border color here' },
            { name: 'border_color', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetTextureEdge',
    },
    dxSetTexturePixels: {
        summary: 'This function sets the Texture_pixels|pixels of a texture element. It can be used with a\nstandard texture, render target or screen source. Only plain format pixels please.\n* This function is slow and not something you want to be doing once a frame.\n* It is very slow when setting pixels to a render target or screen source.\n* And is very slow indeed if the texture format is not argb.',
        parameters: [
            { name: 'surfaceIndex', isOptional: false, isVariadic: false, summary: 'Desired slice to set if the texture is a volume texture, or desired face to set if the texture is a cube map. (Cube map faces: 0=+X 1=-X 2=+Y 3=-Y 4=+Z 5=-Z) By default the pixels are set starting at the top left corner of the texture. To set a different region, define a rectangular area using all four of these optional arguments:' },
            { name: 'texture', isOptional: false, isVariadic: false, summary: 'The texture element to set the pixels of' },
            { name: 'pixels', isOptional: false, isVariadic: false, summary: 'The plain format pixels to use' },
            { name: 'x', isOptional: true, isVariadic: false, summary: 'Rectangle left position' },
            { name: 'y', isOptional: true, isVariadic: false, summary: 'Rectangle top position' },
            { name: 'width', isOptional: true, isVariadic: false, summary: 'Rectangle width' },
            { name: 'height', isOptional: true, isVariadic: false, summary: 'Rectangle height' },
        ],
        returns: 'returns a string if successful, false if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetTexturePixels',
    },
    dxUpdateScreenSource: {
        summary: 'This function updates the contents of a screen source texture with the screen output from\nGTA',
        parameters: [
            { name: 'screenSource', isOptional: false, isVariadic: false, summary: 'The screen source element whose pixels we want to fill with the screen capture' },
            { name: 'resampleNow', isOptional: true, isVariadic: false, summary: 'A bool to indicate if the screen should be captured immediately. The default is false which means the screen from the end of the previous frame is used (better for performance and consistency). Use true for layering fullscreen effects.' },
        ],
        returns: 'returns true if the screen was successfully captured, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxUpdateScreenSource',
    },
    encodeString: {
        summary: 'This function encodes a string using the specified algorithm. The counterpart of this\nfunction is decodeString.',
        parameters: [
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: 'The algorithm to use.' },
            { name: 'input', isOptional: false, isVariadic: false, summary: 'The input to encode.' },
            { name: 'options', isOptional: false, isVariadic: false, summary: 'A table with options and other necessary data for the algorithm, as detailed below.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'providing a callback will run this function asynchronously, the arguments to the callback are the same as the returned values below.' },
        ],
        returns: '* tea ** encodedstring: the encoded string if successful, false otherwise. if a callback was provided, true is returned immediately, and the encoded string is passed as an argument to the callback. * aes128 ** encodedstring: the encoded string if successful, false otherwise. if a callback was provided, true is returned immediately, and the encoded string is passed as an argument to the callback. ** iv (https://en.wikipedia.org/wiki/initialization_vector initialization vector): this is a string generated by the encryption algorithm that is needed to decrypt the message by decodestring. if a callback was provided, true is returned immediately, and the iv is passed as an argument to the callback. |20898 * rsa ** encodedstring: the encoded string if successful, false otherwise. if a callback was provided, true is returned immediately, and the encoded string is passed as an argument to the callback. |21055',
        wiki: 'https://wiki.multitheftauto.com/wiki/EncodeString',
    },
    engineApplyShaderToWorldTexture: {
        summary: 'This function applies a shader to one or more world textures.\n* The resource Shader_examples#Texture_names|shader_tex_names can help in finding the\nnames of world textures.\n* When replacing the texture for a ped using the CJ skin, set textureName to CJ\n* The shader inherits the render states of the original when it is drawn, so texture\nstage 0 will already be set to the original texture.\n* When using with a ped, ensure you have set ped or all in the elementTypes when calling\ndxCreateShader\n* CJ body parts textures can be replaced by using: cj_ped_head, cj_ped_hat, cj_ped_torso,\ncj_ped_legs, cj_ped_feet, cj_ped_glasses, cj_ped_necklace, cj_ped_watch and\ncj_ped_extra1. Latest version of\nhttp://wiki.multitheftauto.com/wiki/Shader_examples#Texture_names shader_tex_names will\nshow what is being used.',
        parameters: [
            { name: 'shader', isOptional: false, isVariadic: false, summary: 'The shader which is to be applied' },
            { name: 'textureName', isOptional: false, isVariadic: false, summary: 'The name of the world texture to apply the shader to. Wildcard matching e.g. ro?ds* can be used to apply to more than one texture at a time.' },
            { name: 'targetElement', isOptional: true, isVariadic: false, summary: 'The element to restrict applying the shader to. If this is not set the shader will be applied to everything using the texture name. Valid element types for targetElement are vehicle|vehicles, Object|objects and Ped|peds.' },
            { name: 'appendLayers', isOptional: true, isVariadic: false, summary: 'allows two or more layered shaders to be applied in the same texture. You may want to modify the DepthBias in the technique pass to avoid Z-fighting artifacts when using this.' },
        ],
        returns: 'returns true if the shader was successfully applied, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineApplyShaderToWorldTexture',
    },
    engineFreeModel: {
        summary: '',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': the model ID you want to have un-assigned.' },
        ],
        returns: 'returns true if the model was successfully freed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineFreeModel',
    },
    engineGetModelIDFromName: {
        summary: 'This function gets the model ID of an object model from object name. This function is the\ncounterpart of engineGetModelNameFromID.',
        parameters: [
            { name: 'modelName', isOptional: false, isVariadic: false, summary: 'The model name of the object' },
        ],
        returns: 'returns an int with the id of the object model, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelIDFromName',
    },
    engineGetModelLODDistance: {
        summary: 'This function gets the LOD distance for any object / model ID.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'The model / object ID number you want to get the LOD distance of.' },
        ],
        returns: 'returns a float representing the lod distance of the model, or false if the model argument is incorrect.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelLODDistance',
    },
    engineGetModelNameFromID: {
        summary: 'This function gets the model name of an object model from model ID. This function is the\ncounterpart of engineGetModelIDFromName.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'The model ID of the object' },
        ],
        returns: 'returns a string with the name of the object model, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelNameFromID',
    },
    engineGetModelPhysicalPropertiesGroup: {
        summary: '',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: ': the id of model which you wish to get physical properties group of.' },
        ],
        returns: 'returns id of physical properties group that requested model uses, in range of 0-160, if the object doesnt have a group assigned, -1 is returned. if passed arguments were wrong, error is triggered.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelPhysicalPropertiesGroup',
    },
    engineGetModelTextureNames: {
        summary: 'This function returns a table of the world textures which are applied to the specified\nmodel.',
        parameters: [
            { name: 'modelId', isOptional: true, isVariadic: false, summary: 'You can either use the model id or the model name.' },
        ],
        returns: 'returns a table if this function succeeds, false if it fails for some reason.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelTextureNames',
    },
    engineGetModelTextures: {
        summary: '',
        parameters: [
            { name: 'modelName_modelID', isOptional: false, isVariadic: false, summary: '' },
            { name: 'textureNames', isOptional: true, isVariadic: false, summary: ': Only return textures with specified name(s). You can provide a single string or a table of strings. Wildcard matching e.g. ro?ds* can be used.' },
        ],
        returns: 'returns a table of texture elements texturename, texture, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelTextures',
    },
    engineGetModelVisibleTime: {
        summary: '',
        parameters: [
            { name: 'modelId', isOptional: false, isVariadic: false, summary: ': The ID of the model.' },
        ],
        returns: 'returns 2 integers, indicating timeon and timeoff.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelVisibleTime',
    },
    engineGetObjectGroupPhysicalProperty: {
        summary: '',
        parameters: [
            { name: 'groupID', isOptional: false, isVariadic: false, summary: ': the id of physical properties group which you wish to get a property from. objectgroup-modifiable : the property which you wish to get, as per table below.' },
            { name: 'property', isOptional: false, isVariadic: false, summary: '' },
        ],
        returns: 'returns the value contained in given property if everything went well, error is raised otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetObjectGroupPhysicalProperty',
    },
    engineGetSurfaceProperties: {
        summary: '',
        parameters: [
            { name: 'surfaceID', isOptional: false, isVariadic: false, summary: 'Material IDs|Material ID from 0 to 178' },
            { name: 'property', isOptional: false, isVariadic: false, summary: 'Property name' },
        ],
        returns: 'returns the current property value. see the table below for possible values.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetSurfaceProperties',
    },
    engineGetVisibleTextureNames: {
        summary: 'This function returns a list of the world textures which are being used to draw the\ncurrent scene.',
        parameters: [
            { name: 'nameFilter', isOptional: true, isVariadic: false, summary: 'Only include textures that match the wildcard string.' },
            { name: 'modelId', isOptional: true, isVariadic: false, summary: 'Only include textures that are used by the model id (or model name)' },
        ],
        returns: 'returns a table of texture names.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetVisibleTextureNames',
    },
    engineImportTXD: {
        summary: 'This function imports (adds) a loaded RenderWare Texture Dictionary into a specific\nmodel. This is necessary in order for the DFF loader to find any new textures. Please\ncall this function before loading the DFF model file, in order to allow the DFF loading\nprocess to find the new textures. This function can also replace default GTA textures, so\nthat it becomes possible to e.g. put custom images on existing billboards. Ped and weapon\ntextures are also supported.\nSee here for Optimize_Custom_TXD|tips on reducing the size of TXD files.\n* CJ clothing component textures can be replaced by using the ids listed on Clothing\nComponent IDs|this page',
        parameters: [
            { name: 'texture', isOptional: false, isVariadic: false, summary: 'The TXD that was loaded with engineLoadTXD' },
            { name: 'model_id', isOptional: false, isVariadic: false, summary: 'The model id to import the TXD into' },
        ],
        returns: 'returns true if the function executed succesfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineImportTXD',
    },
    engineLoadCOL: {
        summary: 'This function loads a RenderWare Collision (COL 1/2/3) file into GTA. The collisions can\nthen be used to provide collisions for in-game objects.\nFor vehicles, please omit this function by embedding your COL file into your DFF file.\nThis way, you can be sure that the COL file is correctly (and automatically) loaded when\ncalling engineLoadDFF.\nThis is a client side function. Be sure to transfer your COL file by including it in the\nmeta file.',
        parameters: [
            { name: 'col_file', isOptional: false, isVariadic: false, summary: '/ raw_data The filepath to the COL file you want to load or whole data buffer of the COL file.' },
        ],
        returns: 'returns a col if the file was loaded, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadCOL',
    },
    engineLoadDFF: {
        summary: 'This function loads a RenderWare Model (DFF) file into GTA.\nTo successfully load your model with textures, be sure to use engineLoadTXD and\nengineImportTXD before calling this function. If some error occurs while loading the DFF,\nMTA will output a message - check out DFF error messages to know what they mean.\nThis is a client side function. Be sure to transfer your DFF file by including it in the\nmeta file.\nThe returned DFF element is an element in the element tree, just like vehicles and\nobjects. When the dff is destroyed, ie on resource unload or using destroyElement, any\nelements that use the DFF, such as vehicles or objects will be reset.',
        parameters: [
            { name: 'dff_file', isOptional: false, isVariadic: false, summary: '/ raw_data The filepath to the DFF file you want to load or whole data buffer of the DFF file.' },
        ],
        returns: 'returns a dff element if the dff file loaded, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadDFF',
    },
    engineLoadIFP: {
        summary: 'This function loads an animation library (IFP) file into GTA with a custom block name.\nAll three IFP formats are supported ANPK, ANP2, and ANP3. Unfortunately, GTA 3 animations\nare not supported, however, you can load GTA:VC IFP files using this function. You dont\nhave to replace any animation to play a custom one, to play a custom animation, load the\nIFP file using this function, then use SetPedAnimation|setPedAnimation.\nIf you wish to replace a GTA internal animation with a custom one, you can use\nEngineReplaceAnimation|engineReplaceAnimation. To unload the IFP file, use\nDestroyElement|destroyElement, restarting or stopping the resource can also unload the\nIFP file automatically.',
        parameters: [
            { name: 'ifp_file', isOptional: false, isVariadic: false, summary: '/ raw_data the filepath|filepath to the IFP file you want to load or whole data buffer of the IFP file.' },
            { name: 'custom_block_name', isOptional: false, isVariadic: false, summary: 'the new block name for the IFP file. You cannot use the GTA default Animations|internal block names. You should namespace this name using a string like resource.blockname' },
        ],
        returns: 'returns an ifp element if the ifp file loaded, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadIFP',
    },
    engineLoadTXD: {
        summary: 'This function loads a RenderWare Texture Dictionary (TXD) file into GTA. The texture\ndictionary can then be used to provide textures.\nThis is a client side function. Be sure to transfer your TXD file by including it in the\nmeta file.',
        parameters: [
            { name: 'txd_file', isOptional: false, isVariadic: false, summary: '/ raw_data The filepath to the TXD file you want to load or whole data buffer of the TXD file.' },
            { name: 'filteringEnabled', isOptional: true, isVariadic: false, summary: 'Whether to enable texture filtering.' },
        ],
        returns: 'returns a txd if the file was loaded, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineLoadTXD',
    },
    engineRemoveShaderFromWorldTexture: {
        summary: 'This function removes a shader from one or more world textures.',
        parameters: [
            { name: 'shader', isOptional: false, isVariadic: false, summary: 'The shader which is to be removed' },
            { name: 'textureName', isOptional: false, isVariadic: false, summary: 'The name of the world texture to remove the shader from. It should be exactly the same string as used with engineApplyShaderToWorldTexture when the shader was initially applied.' },
            { name: 'targetElement', isOptional: true, isVariadic: false, summary: 'The element to remove the shader from. It should be the same element as used with engineApplyShaderToWorldTexture when the shader was initially applied.' },
        ],
        returns: 'returns true if the shader was successfully removed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineRemoveShaderFromWorldTexture',
    },
};
