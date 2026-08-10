import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_30: ApiDocumentationCatalog = {
    inspect: {
        summary: 'This function returns human-readable representations of tables and MTA datatypes as a\nstring.',
        parameters: [
            { name: 'variable', isOptional: false, isVariadic: false, summary: '' },
            { name: 'options', isOptional: true, isVariadic: false, summary: 'A table of options. It is not mandatory, but when it is provided, it must be a table. For a list of options, see the https://github.com/kikito/inspect.lua#options Inspects GitHub page.' },
        ],
        returns: 'always returns a string. the contents can change if we update the inspect library, so it is not expected to be consistent across lua versions.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Inspect',
    },
    interpolateBetween: {
        summary: 'Interpolates a 3D Vector between a source value and a target value using either linear\ninterpolation or any other Easing|easing function.\nIt can also be used to interpolate 2D vectors or scalars by only setting some of the x,\ny, z values and putting 0 to the others.',
        parameters: [
            { name: 'x1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z1', isOptional: false, isVariadic: false, summary: '' },
            { name: 'x2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'y2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'z2', isOptional: false, isVariadic: false, summary: '' },
            { name: 'fProgress', isOptional: false, isVariadic: false, summary: 'float between 0 and 1 indicating the interpolation progress (0 at the beginning of the interpolation, 1 at the end). If it is higher than 1, it will start from the beginning.' },
            { name: 'strEasingType', isOptional: false, isVariadic: false, summary: 'the Easing|easing function to use for the interpolation' },
            { name: 'fEasingPeriod', isOptional: true, isVariadic: false, summary: 'the period of the Easing|easing function (only some easing functions use this parameter)' },
            { name: 'fEasingAmplitude', isOptional: true, isVariadic: false, summary: 'the amplitude of the Easing|easing function (only some easing functions use this parameter)' },
            { name: 'fEasingOvershoot', isOptional: true, isVariadic: false, summary: 'the overshoot of the Easing|easing function (only some easing functions use this parameter)' },
        ],
        returns: 'returns x, y, z the interpolated 3d vector/value if successful, false otherwise (error in parameters). as mentioned before, interpolatebetween can be used on 2d vectors or scalars in which case only some (x, y or just x) of the returned values are to be used (cf. alpha interpolation in marker example or size interpolation in window example).',
        wiki: 'https://wiki.multitheftauto.com/wiki/InterpolateBetween',
    },
    iprint: {
        summary: 'This function intelligently outputs debug messages into the Debug Console.  It is similar\nto outputDebugString, but outputs useful information for any variable type, and does not\nrequire use of Luas tostring.  This includes information about element types, and table\nstructures.  It is especially useful for quick debug tasks.',
        parameters: [
            { name: 'var1', isOptional: false, isVariadic: false, summary: 'A variable of any type to print intelligent information for. var2+ Another variable to be output. An unlimited number of arguments can be supplied' },
            { name: 'var2', isOptional: true, isVariadic: false, summary: '' },
            { name: 'var3', isOptional: true, isVariadic: false, summary: '' },
            { name: 'varargs', isOptional: false, isVariadic: true, summary: '' },
        ],
        returns: 'always returns nil.',
        wiki: 'https://wiki.multitheftauto.com/wiki/Iprint',
    },
    isAmbientSoundEnabled: {
        summary: 'This function allows you to check if some background sound effects are enabled.',
        parameters: [
            { name: 'theType', isOptional: false, isVariadic: false, summary: 'The type of ambient sound to test. Can be either gunfire or general.' },
        ],
        returns: 'returns true if the ambient sound is enabled, false if it is disabled or invalid values were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsAmbientSoundEnabled',
    },
    isBan: {
        summary: 'This function checks whether the passed value is valid ban or not.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'The value to check' },
        ],
        returns: 'returns true if the value is a ban, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBan',
    },
    isBrowserDomainBlocked: {
        summary: 'This function checks if the specified URL is blocked from being loaded.',
        parameters: [
            { name: 'address', isOptional: false, isVariadic: false, summary: 'A website URL' },
            { name: 'isURL', isOptional: true, isVariadic: false, summary: 'true if address should be parsed as URL, false otherwise.' },
        ],
        returns: 'returns false if the url is able to be loaded, true if it is blocked and nil if an invalid domain/url was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserDomainBlocked',
    },
    isBrowserFocused: {
        summary: 'This function checks if a browser is focused.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'returns true if the browser is focused, false otherwise and nil if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserFocused',
    },
    isBrowserLoading: {
        summary: 'This function checks if a browser is currently loading a website.',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser' },
        ],
        returns: 'returns true if the browser is loading a website, false otherwise and nil if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserLoading',
    },
    isBrowserRenderingPaused: {
        summary: '',
        parameters: [
            { name: 'webBrowser', isOptional: false, isVariadic: false, summary: 'The browser element to get the rendering state of.' },
        ],
        returns: 'returns true if the browser rendering is paused, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsBrowserRenderingPaused',
    },
    isCapsLockEnabled: {
        summary: '',
        parameters: [],
        returns: 'returns true if caps lock is toggled (on), false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsCapsLockEnabled',
    },
    isChatBoxInputActive: {
        summary: 'This function returns whether the ingame chatbox is being used (accepting chatbox input)\nor not.',
        parameters: [],
        returns: 'returns true if the chatbox is receiving input, false if not active.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsChatBoxInputActive',
    },
    isChatInputBlocked: {
        summary: '',
        parameters: [],
        returns: 'returns true if the chat input is blocked, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsChatInputBlocked',
    },
    isChatVisible: {
        summary: 'This function checks if players chat is visible.',
        parameters: [],
        returns: 'returns true if the chat is visible, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsChatVisible',
    },
    isConsoleActive: {
        summary: 'This function returns whether the ingame console window is visible or not.',
        parameters: [],
        returns: 'returns true if the console is visible, false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsConsoleActive',
    },
    isControlEnabled: {
        summary: 'Checks whether a GTA control is enabled or disabled for a certain player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish the control status of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control you wish to check. See control names for a list of possible controls.' },
        ],
        returns: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsControlEnabled',
    },
    isCoronaReflectionEnabled: {
        summary: '',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'marker' },
        ],
        returns: '* returns false is setmarkertype|marker type is not corona. * returns true if corona reflection is enabled, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsCoronaReflectionEnabled',
    },
    isCursorShowing: {
        summary: 'This function is used to determine whether or not a players cursor is showing.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you want to get cursor state of.' },
        ],
        returns: 'returns true if the players cursor is showing, false if it isnt or if invalid parameters were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsCursorShowing',
    },
    isDebugViewActive: {
        summary: 'This function returns whether the ingame debug window is visible or not. This is the\ndebugwindow visible using the debugscript  command.',
        parameters: [],
        returns: 'returns true if the debug view is visible, false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsDebugViewActive',
    },
    isElement: {
        summary: 'This function checks if a value is an element or not.',
        parameters: [
            { name: 'theValue', isOptional: false, isVariadic: false, summary: ': The value that we want to check.' },
        ],
        returns: 'returns true if the passed value is an element, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElement',
    },
    isElementAttached: {
        summary: 'This functions checks whether or not an element is attached to another element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check for attachment.' },
        ],
        returns: 'returns true if the specified element is attached to another element, false if it is not attached or nil if an improper argument was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementAttached',
    },
    isElementCallPropagationEnabled: {
        summary: 'This functions checks if certain element has call propagation enabled.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check' },
        ],
        returns: 'returns true if the propagation is enabled, false if disabled or invalid arguments have been passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementCallPropagationEnabled',
    },
    isElementCollidableWith: {
        summary: 'This function can be used to check whether specified element is collidable with another\nelement.\n\nNote: You can only use this function with the element types listed below.\n*Player\n*Ped\n*Vehicle\n*Object\n* Element/Weapon|Weapon',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which colliding you want to get' },
            { name: 'withElement', isOptional: false, isVariadic: false, summary: 'The other element which colliding with the first entity you want to get' },
        ],
        returns: 'returns true if the elements collide with eachother, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementCollidableWith',
    },
    isElementDoubleSided: {
        summary: 'This function checks whether an element is double-sided as set by setElementDoubleSided\nor not.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which youd like to check the double-sidedness of.' },
        ],
        returns: 'returns true if the theelement is double-sided, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementDoubleSided',
    },
    isElementFrozen: {
        summary: 'This function checks if element has been frozen.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element whose freeze status we want to check.' },
        ],
        returns: '*returns true if the element is frozen, false if it isnt or if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementFrozen',
    },
    isElementInWater: {
        summary: 'This function checks whether an element is submerged in water.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element to check.' },
        ],
        returns: 'returns true if the passed element is in water, false if it isnt, or if the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementInWater',
    },
    isElementLocal: {
        summary: 'This function checks whether a clientside element is local to the client (doesnt exist in\nthe server) or not.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element that we want to check.' },
        ],
        returns: 'returns true if the passed element is local, false if not or if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementLocal',
    },
    isElementLowLOD: {
        summary: 'This function reveals if an element is low LOD.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose low LOD status we want to get.' },
        ],
        returns: 'returns true if the element is low lod, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementLowLOD',
    },
    isElementOnScreen: {
        summary: 'This function will check if an element is on the screen. Elements behind objects but\nstill in the camera view count as being on screen.\nThis function is particularly useful for detecting if dynamic objects are in destroyed\nstate. Destroyed objects will return false.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element of which you wish to check wether its being rendered on screen.' },
        ],
        returns: 'returns true if element is on screen, false if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementOnScreen',
    },
    isElementStreamable: {
        summary: 'This function checks whether an element is streamable as set by setElementStreamable or\nnot.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: ': The element to check the streamability of.' },
        ],
        returns: 'returns true if the passed element is streamable like normal, false if this element must always be streamed in.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementStreamable',
    },
};
