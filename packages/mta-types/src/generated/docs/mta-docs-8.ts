import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_8: ApiDocumentationCatalog = {
    dxGetTexturePixels: {
        summary: 'This function fetches the pixels from a texture element. It can be used with a standard texture, render target or screen source.',
        parameters: [
            { name: 'surfaceIndex', isOptional: true, isVariadic: false, summary: 'Desired slice to get if the texture is a volume texture, or desired face to get if the texture is a cube map. (Cube map faces: 0=+X 1=-X 2=+Y 3=-Y 4=+Z 5=-Z)' },
            { name: 'texture', isOptional: false, isVariadic: false, summary: 'The texture element to get the pixels from' },
            { name: 'pixelsFormat', isOptional: true, isVariadic: false, summary: '"plain", "dds"' },
            { name: 'textureFormat', isOptional: true, isVariadic: false, summary: 'A string representing the desired texture format for "**dds**" pixels, which can be one of:' },
            { name: 'mipmaps', isOptional: true, isVariadic: false, summary: 'True to create a mip-map chain for "**dds**" pixels so the texture looks good when drawn at various sizes.' },
            { name: 'x', isOptional: true, isVariadic: false, summary: 'Rectangle left position' },
            { name: 'y', isOptional: true, isVariadic: false, summary: 'Rectangle top position' },
            { name: 'width', isOptional: true, isVariadic: false, summary: 'Rectangle width' },
            { name: 'height', isOptional: true, isVariadic: false, summary: 'Rectangle height' },
        ],
        returns: 'Returns pixels string if successful, *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxGetTexturePixels',
    },
    dxGetTextWidth: {
        summary: 'This function retrieves the theoretical width (in pixels) of a certain piece of text, if it were to be drawn using dxDrawText.\n\n**NOTE:** This function already takes the client\'s screen resolution into account.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'A string representing the text for which you wish to retrieve with width for.' },
            { name: 'scale', isOptional: true, isVariadic: false, summary: 'The size of the text.' },
            { name: 'font', isOptional: true, isVariadic: false, summary: 'Either a custom DX font element or the name of a built-in dx font:' },
            { name: 'bColorCoded', isOptional: true, isVariadic: false, summary: 'Should we exclude color codes from the width? (false will include the hex in the length)' },
        ],
        returns: 'Returns the float of the width of the text (in pixels).',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxGetTextWidth',
    },
    dxIsAspectRatioAdjustmentEnabled: {
        summary: 'This function gets the current aspect ratio set by dxSetAspectRatioAdjustmentEnabled.',
        parameters: [],
        returns: '***boolean:** returns **true** when enabled by dxSetAspectRatioAdjustmentEnabled, **false** otherwise. ***float:** aspect ratio set by dxSetAspectRatioAdjustmentEnabled',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxIsAspectRatioAdjustmentEnabled',
    },
    dxSetAspectRatioAdjustmentEnabled: {
        summary: 'This function allows for the positioning of dxDraw calls to be automatically adjusted according to the client\'s aspect ratio setting.  This lasts for a single execution of an event handler for one of the following events: onClientRender, onClientPreRender and onClientHUDRender. So the function has to be called every frame, just like dxDraws.\n\nThis is particularly useful for draws that must align with the GTA HUD, for which the sizing and positioning can vary for different aspect ratios.',
        parameters: [
            { name: 'bEnabled', isOptional: false, isVariadic: false, summary: 'Should the adjustment be enabled or disabled.' },
            { name: 'sourceRatio', isOptional: true, isVariadic: false, summary: 'This should be set to the aspect ratio the dxDraws were originally designed in.' },
        ],
        returns: 'Returns *true* when it was changed successfully, or *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetAspectRatioAdjustmentEnabled',
    },
    dxSetBlendMode: {
        summary: 'This function sets the current blend mode for the dxDraw functions. Changing the blend mode can increase the quality when drawing text or certain other images to a render target. As a general guide use **modulate_add** when drawing text to a render target, and **add** when drawing the render target to the screen. Don\'t forget to restore the default **blend** at the end - See the example below.',
        parameters: [
            { name: 'blendMode', isOptional: false, isVariadic: false, summary: 'The blend mode to use which can be one of:' },
        ],
        returns: 'Returns true if successful, or *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetBlendMode',
    },
    dxSetPixelColor: {
        summary: 'This function sets the color of a single pixel for pixels contained in a string. It only works with \'**plain**\' format pixels.',
        parameters: [
            { name: 'pixels', isOptional: false, isVariadic: false, summary: 'The pixels to use' },
            { name: 'x', isOptional: false, isVariadic: false, summary: 'The X coordinate for the pixel' },
            { name: 'y', isOptional: false, isVariadic: false, summary: 'The Y coordinate for the pixel' },
            { name: 'r', isOptional: false, isVariadic: false, summary: 'The red channel for the color (0-255)' },
            { name: 'g', isOptional: false, isVariadic: false, summary: 'The green channel for the color (0-255)' },
            { name: 'b', isOptional: false, isVariadic: false, summary: 'The blue channel for the color (0-255)' },
            { name: 'a', isOptional: true, isVariadic: false, summary: 'The alpha channel for the color (0-255)' },
        ],
        returns: 'Returns true if successful, or *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetPixelColor',
    },
    dxSetRenderTarget: {
        summary: 'This function changes the drawing destination for the dx functions. It can be used to select a previously created render target, or if called with no arguments, restore drawing directly to the screen.',
        parameters: [
            { name: 'renderTarget', isOptional: true, isVariadic: false, summary: 'The render target element whose pixels we want to draw on.' },
            { name: 'clear', isOptional: true, isVariadic: false, summary: 'If set to true, the render target will also be cleared.' },
        ],
        returns: 'Returns *true* if the render target was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetRenderTarget',
    },
    dxSetShaderTessellation: {
        summary: 'This function sets the amount of geometric sub-division to use when drawing a shader element with dxDrawImage.\n\nUsing tessellation allows a shader to manipulate the shape of the rendered image at each sub-division boundary.',
        parameters: [
            { name: 'theShader', isOptional: false, isVariadic: false, summary: 'The shader element whose tessellation is to be changed' },
            { name: 'tessellationX', isOptional: false, isVariadic: false, summary: 'The number of sub-division points along the X axis. Range is 1 to 500.' },
            { name: 'tessellationY', isOptional: false, isVariadic: false, summary: 'The number of sub-division points along the Y axis. Range is 1 to 500.' },
        ],
        returns: 'Returns *true* if the shader element\'s tessellation was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetShaderTessellation',
    },
    dxSetShaderTransform: {
        summary: 'This function applies a 3D transformation to a shader element when it is drawn with dxDrawImage.',
        parameters: [
            { name: 'theShader', isOptional: false, isVariadic: false, summary: 'The shader element whose transformation is to be changed' },
            { name: 'rotationX', isOptional: false, isVariadic: false, summary: 'Rotation angle in degrees around the X axis (Left,right). This will make the shader rotate along its width.' },
            { name: 'rotationY', isOptional: false, isVariadic: false, summary: 'Rotation angle in degrees around the Y axis (Up,down). This will make the shader rotate along its height.' },
            { name: 'rotationZ', isOptional: false, isVariadic: false, summary: 'Rotation angle in degrees around the Z axis (In,out). This will make the shader rotate in a similar way to the rotation argument in dxDrawImage.' },
            { name: 'rotationCenterOffsetX', isOptional: true, isVariadic: false, summary: 'The center of rotation offset X position in screen relative units.' },
            { name: 'rotationCenterOffsetY', isOptional: true, isVariadic: false, summary: 'The center of rotation offset Y position in screen relative units.' },
            { name: 'rotationCenterOffsetZ', isOptional: true, isVariadic: false, summary: 'The center of rotation offset Z position in screen relative units.' },
            { name: 'bRotationCenterOffsetOriginIsScreen', isOptional: true, isVariadic: false, summary: 'Set to true if the center of rotation origin should be the center of the screen rather than the center of the image.' },
            { name: 'perspectiveCenterOffsetX', isOptional: true, isVariadic: false, summary: 'The center of perspective offset X position in screen relative units.' },
            { name: 'perspectiveCenterOffsetY', isOptional: true, isVariadic: false, summary: 'The center of perspective offset Y position in screen relative units.' },
            { name: 'bPerspectiveCenterOffsetOriginIsScreen', isOptional: true, isVariadic: false, summary: 'Set to true if the center of perspective origin should be the center of the screen rather than the center of the image.' },
        ],
        returns: 'Returns *true* if the shader element\'s transform was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetShaderTransform',
    },
    dxSetShaderValue: {
        summary: 'This sets a named parameter for a shader element',
        parameters: [
            { name: 'theShader', isOptional: false, isVariadic: false, summary: 'The shader element whose parameter is to be changed' },
            { name: 'parameterName', isOptional: false, isVariadic: false, summary: 'The name of parameter' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value to set, which can be a texture, a bool, a number or a list of numbers(**max 16 floats(numbers)**)' },
        ],
        returns: 'Returns *true* if the shader element\'s parameter was successfully changed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetShaderValue',
    },
    dxSetTestMode: {
        summary: 'This function is used for testing scripts written using guiCreateFont, dxCreateFont, dxCreateShader and dxCreateRenderTarget.\n\nEach one of the 3 test modes should be used in turn to help highlight any potential problems.',
        parameters: [
            { name: 'testMode', isOptional: false, isVariadic: false, summary: 'The test mode to be set. It can be one of the following values:' },
        ],
        returns: 'Returns *true* if the test mode was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetTestMode',
    },
    dxSetTextureEdge: {
        summary: 'This functions allows you to change the edge handling after creating the texture.',
        parameters: [
            { name: 'theTexture', isOptional: false, isVariadic: false, summary: 'The affected texture' },
            { name: 'textureEdge', isOptional: false, isVariadic: false, summary: 'The texture edge mode. Available modes are **wrap, mirror, clamp, border, mirror-once**' },
            { name: 'border-color', isOptional: true, isVariadic: false, summary: '' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetTextureEdge',
    },
    dxSetTexturePixels: {
        summary: 'This function sets the pixels of a texture element. It can be used with a standard texture, render target or screen source. Only \'**plain**\' format pixels please.',
        parameters: [
            { name: 'surfaceIndex', isOptional: true, isVariadic: false, summary: 'Desired slice to set if the texture is a volume texture, or desired face to set if the texture is a cube map. (Cube map faces: 0=+X 1=-X 2=+Y 3=-Y 4=+Z 5=-Z)' },
            { name: 'texture', isOptional: false, isVariadic: false, summary: 'The texture element to set the pixels of' },
            { name: 'pixels', isOptional: false, isVariadic: false, summary: 'The \'**plain**\' format pixels to use' },
            { name: 'x', isOptional: true, isVariadic: false, summary: 'Rectangle left position' },
            { name: 'y', isOptional: true, isVariadic: false, summary: 'Rectangle top position' },
            { name: 'width', isOptional: true, isVariadic: false, summary: 'Rectangle width' },
            { name: 'height', isOptional: true, isVariadic: false, summary: 'Rectangle height' },
        ],
        returns: 'Returns a string if successful, *false* if invalid arguments were passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxSetTexturePixels',
    },
    dxUpdateScreenSource: {
        summary: 'This function updates the contents of a screen source texture with the screen output from GTA',
        parameters: [
            { name: 'screenSource', isOptional: false, isVariadic: false, summary: 'The screen source element whose pixels we want to fill with the screen capture' },
            { name: 'resampleNow', isOptional: true, isVariadic: false, summary: 'A bool to indicate if the screen should be captured immediately. The default is *false* which means the screen from the end of the previous frame is used (better for performance and consistency). Use *true* for layering fullscreen effects.' },
        ],
        returns: 'Returns *true* if the screen was successfully captured, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/DxUpdateScreenSource',
    },
    encodeString: {
        summary: 'This function encodes a string using the specified algorithm. The counterpart of this function is decodeString.',
        parameters: [
            { name: 'algorithm', isOptional: false, isVariadic: false, summary: 'The algorithm to use.' },
            { name: 'input', isOptional: false, isVariadic: false, summary: 'The input to encode.' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'A table with options and other necessary data for the algorithm, as detailed below.' },
            { name: 'callback', isOptional: true, isVariadic: false, summary: 'providing a callback will run this function asynchronously, the arguments to the callback are the same as the returned values below.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/EncodeString',
    },
    engineAddClothingModel: {
        summary: 'This function adds new CJ clothing model.',
        parameters: [
            { name: 'theModel', isOptional: false, isVariadic: false, summary: 'The model that will be added.' },
            { name: 'fileName', isOptional: false, isVariadic: false, summary: 'Name of the file containing the TXD/DFF extension.' },
        ],
        returns: 'Returns *true* if the model was added, and *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineAddClothingModel',
    },
    engineAddClothingTXD: {
        summary: 'This function adds new CJ clothing texture.',
        parameters: [
            { name: 'theTexture', isOptional: false, isVariadic: false, summary: 'The texture that will be added.' },
            { name: 'fileName', isOptional: false, isVariadic: false, summary: 'Name of the file containing the TXD extension.' },
        ],
        returns: 'Returns *true* if the texture was added, and *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineAddClothingTXD',
    },
    engineAddImage: {
        summary: 'This function adds an IMG file container to GTA streamer. After this GTA will asynchronously load models from IMG. **Only two additional archives can be enabled once**\n\n**Up to 255 additional archives can be enabled once**',
        parameters: [
            { name: 'imgArchive', isOptional: false, isVariadic: false, summary: 'The IMG file you want to add to GTA world.' },
        ],
        returns: 'Returns true if the IMG element was successfully added, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineAddImage',
    },
    engineApplyShaderToWorldTexture: {
        summary: 'This function applies a shader to one or more world textures.',
        parameters: [
            { name: 'shader', isOptional: false, isVariadic: false, summary: 'The shader which is to be applied' },
            { name: 'textureName', isOptional: false, isVariadic: false, summary: 'The name of the world texture to apply the shader to. Wildcard matching e.g. "ro?ds*" can be used to apply to more than one texture at a time.' },
            { name: 'targetElement', isOptional: true, isVariadic: false, summary: 'The element to restrict applying the shader to. If this is not set the shader will be applied to everything using the texture name. Valid element types for targetElement are vehicles, objects and peds.' },
            { name: 'appendLayers', isOptional: true, isVariadic: false, summary: 'allows two or more layered shaders to be applied in the same texture. You may want to modify the *DepthBias* in the technique pass to avoid Z-fighting artifacts when using this.' },
        ],
        returns: 'Returns *true* if the shader was successfully applied, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineApplyShaderToWorldTexture',
    },
    engineFreeModel: {
        summary: 'This function is used to un-assign the specified model ID from the engineRequestModel assignment.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'the model ID you want to have un-assigned.' },
        ],
        returns: 'Returns *true* if the model was successfully freed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineFreeModel',
    },
    engineFreeTXD: {
        summary: 'This function is used to un-assign the specified TXD ID from the engineRequestTXD assignment.',
        parameters: [
            { name: 'txdID', isOptional: false, isVariadic: false, summary: 'the TXD ID you want to have un-assigned.' },
        ],
        returns: 'Returns *true* if the TXD was successfully freed, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineFreeTXD',
    },
    engineGetModelFlags: {
        summary: 'This function returns model flags.',
        parameters: [
            { name: 'modelID', isOptional: false, isVariadic: false, summary: 'ID of the model you want to get flags.' },
        ],
        returns: 'Returns *int* with model flags in GTA format, throws an error otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelFlags',
    },
    engineGetModelIDFromName: {
        summary: 'This function gets the model ID of an object model from object name. This function is the counterpart of engineGetModelNameFromID.',
        parameters: [
            { name: 'modelName', isOptional: false, isVariadic: false, summary: 'The model name of the object' },
        ],
        returns: 'Returns an *int* with the ID of the object model, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelIDFromName',
    },
    engineGetModelLODDistance: {
        summary: 'This function gets the LOD distance for any object / model ID.',
        parameters: [
            { name: 'model', isOptional: false, isVariadic: false, summary: 'The model / object ID number you want to get the LOD distance of.' },
        ],
        returns: 'Returns a float representing the LOD distance of the model, or *false* if the model argument is incorrect.',
        wiki: 'https://wiki.multitheftauto.com/wiki/EngineGetModelLODDistance',
    },
};
