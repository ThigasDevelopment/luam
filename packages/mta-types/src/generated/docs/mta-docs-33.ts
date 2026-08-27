import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_33: ApiDocumentationCatalog = {
    isControlEnabled: {
        summary: 'Checks whether a GTA control is enabled or disabled for a certain player.',
        parameters: [
            { name: 'thePlayer', isOptional: false, isVariadic: false, summary: 'The player you wish the control status of.' },
            { name: 'control', isOptional: false, isVariadic: false, summary: 'The control you wish to check. See control names for a list of possible controls.' },
        ],
        returns: 'Returns *true* if control is enabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsControlEnabled',
    },
    isCoronaReflectionEnabled: {
        summary: 'This function gets visibility of corona reflection.',
        parameters: [
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'marker' },
        ],
        returns: '* Returns *false* is marker type is not *corona*. * Returns *true* if corona reflection is enabled, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsCoronaReflectionEnabled',
    },
    isCursorShowing: {
        summary: 'This function determines the state of a player\'s cursor.',
        parameters: [
            { name: 'playerElement', isOptional: false, isVariadic: false, summary: 'The player from whom we want to retrieve the cursor state.' },
        ],
        returns: 'Returns *true* if the player\'s cursor is visible, and *false* if it is not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsCursorShowing',
    },
    isDebugViewActive: {
        summary: 'This function returns whether the ingame debug window is visible or not. This is the debugwindow visible using the "debugscript " command.',
        parameters: [],
        returns: 'Returns *true* if the debug view is visible, *false* if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsDebugViewActive',
    },
    isDiscordRichPresenceConnected: {
        summary: 'The function checks if the client has Discord Rich Presence enabled.',
        parameters: [],
        returns: 'Returns *true* if Discord Rich Presence is enabled on the client, *false* if disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsDiscordRichPresenceConnected',
    },
    isElement: {
        summary: 'This function checks if a value is an element or not.',
        parameters: [
            { name: 'theValue', isOptional: false, isVariadic: false, summary: 'The value that we want to check.' },
        ],
        returns: 'Returns *true* if the passed value is an element, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElement',
    },
    isElementAttached: {
        summary: '<!-- Describe in plain english what this function does. Don\'t go into details, just give an overview -->\nThis functions checks whether or not an element is attached to another element.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check for attachment.' },
        ],
        returns: '<!-- Make this descriptive. Explain what cases will return false. If you\'re unsure, add a tag to it so we can check --> Returns *true* if the specified element is attached to another element, *false* if it is not attached or *nil* if an improper argument was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementAttached',
    },
    isElementCallPropagationEnabled: {
        summary: 'This functions checks if certain element has call propagation enabled.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check' },
        ],
        returns: 'Returns *true* if the propagation is enabled, *false* if disabled or invalid arguments have been passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementCallPropagationEnabled',
    },
    isElementCollidableWith: {
        summary: 'This function can be used to check whether specified element is collidable with another element.\n\n**Note:** You can only use this function with the element types listed below.\n*Player\n*Ped\n*Vehicle\n*Object\n\n* Weapon',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element which colliding you want to get' },
            { name: 'withElement', isOptional: false, isVariadic: false, summary: 'The other element which colliding with the first entity you want to get' },
        ],
        returns: 'Returns *true* if the elements collide with each other, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementCollidableWith',
    },
    isElementDoubleSided: {
        summary: 'This function checks whether an element is double-sided as set by setElementDoubleSided or not.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element in which you\'d like to check the double-sidedness of.' },
        ],
        returns: 'Returns *true* if the **theElement** is double-sided, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementDoubleSided',
    },
    isElementFrozen: {
        summary: 'This function checks if element has been frozen.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element whose freeze status we want to check.' },
        ],
        returns: '*Returns *true* if the element is frozen, *false* if it isn\'t or if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementFrozen',
    },
    isElementInWater: {
        summary: 'This function checks whether an element is submerged in water.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check.' },
        ],
        returns: 'Returns *true* if the passed element is in water, *false* if it isn\'t, or if the element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementInWater',
    },
    isElementLocal: {
        summary: 'This function checks whether a clientside element is local to the client (doesn\'t exist in the server) or not.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element that we want to check.' },
        ],
        returns: 'Returns *true* if the passed element is local, *false* if not or if invalid parameters are passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementLocal',
    },
    isElementLowLOD: {
        summary: 'This function reveals if an element is low LOD.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element whose low LOD status we want to get.' },
        ],
        returns: 'Returns *true* if the element is low LOD, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementLowLOD',
    },
    isElementOnFire: {
        summary: 'This function checks if the specified element is on fire or not.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check.' },
        ],
        returns: 'Returns *true* if the element is on fire, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementOnFire',
    },
    isElementOnScreen: {
        summary: 'This function will check if an element is on the screen. Elements behind objects but still in the camera view count as being on screen.\n\nThis function is particularly useful for detecting if dynamic objects are in "destroyed" state. Destroyed objects will return false.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element of which you wish to check wether it\'s being rendered on screen.' },
        ],
        returns: 'Returns *true* if element is on screen, *false* if not.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementOnScreen',
    },
    isElementStreamable: {
        summary: 'This function checks whether an element is streamable as set by setElementStreamable or not.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check the streamability of.' },
        ],
        returns: 'Returns *true* if the passed element is streamable like normal, *false* if this element must always be streamed in.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementStreamable',
    },
    isElementStreamedIn: {
        summary: 'This function checks whether an element is currently streamed in (not virtualized) and are actual GTA objects in the world. You can force an element to be streamed in using setElementStreamable.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check whether is streamed in or not.' },
        ],
        returns: 'Returns *true* if the passed element is currently streamed in, *false* if it is virtualized.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementStreamedIn',
    },
    isElementSyncer: {
        summary: 'This function checks whether an element is synced by the local player or not. Accepted elements are peds and vehicles.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element to check.' },
        ],
        returns: 'Returns *true* if the passed element is synced by the local player, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementSyncer',
    },
    isElementVisibleTo: {
        summary: 'This checks if an element is visible to a player. This does not check if the player can literally see the element, just that they are aware that it exists. Some so-called per-player elements are able to be visible only to some players, as such this checks if this is the case for a particular element/player combination.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you want to check the visibility of' },
            { name: 'visibleTo', isOptional: false, isVariadic: false, summary: 'The player you want to check against' },
        ],
        returns: 'Returns *true* if element is visible to the specified player, *false* if not or an invalid argument was passed to the function.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementVisibleTo',
    },
    isElementWaitingForGroundToLoad: {
        summary: 'This function checks whether MTA has frozen an element because it is above map objects which are still loading or not.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element to check its frozen waiting for custom map objects to load status. It can be a vehicle, ped or player.' },
        ],
        returns: 'Returns *true* if the specified element is frozen waiting for collisions of custom map objects to load. Returns *false* if it\'s not or if the specified element is invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementWaitingForGroundToLoad',
    },
    isElementWithinColShape: {
        summary: 'This function is used to determine if an element is within a collision shape. Please note that for legacy reasons, a colshape created on the client does not collide with elements already existing at that location until they first move. Please also note that before 1.0.3, this did not function correctly when moving a colshape.\n\nPlease note that this function doesn\'t verify whether element is in the same dimension and interior, additional checks could be implemented manually if they are needed.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you\'re checking.' },
            { name: 'theShape', isOptional: false, isVariadic: false, summary: 'The colshape you\'re checking' },
        ],
        returns: 'Returns *true* if the element is within the colshape, *false* otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementWithinColShape',
    },
    isElementWithinMarker: {
        summary: 'This function is used to determine if an element is within a marker.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'The element you\'re checking.' },
            { name: 'theMarker', isOptional: false, isVariadic: false, summary: 'The marker you\'re checking.' },
        ],
        returns: 'Returns *true* if the element is within the marker, *false* otherwise',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsElementWithinMarker',
    },
    isGarageOpen: {
        summary: 'This function checks whether or not a specific garage door is open.',
        parameters: [
            { name: 'garageID', isOptional: false, isVariadic: false, summary: 'The garage ID that represents the garage door that is being checked.' },
        ],
        returns: 'Returns *true* if the garage is open, *false* if it is closed or an invalid garage ID was given.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsGarageOpen',
    },
    isGlitchEnabled: {
        summary: 'This function retrieves whether San Andreas game glitches are enabled or not, set by using setGlitchEnabled',
        parameters: [
            { name: 'glitchName', isOptional: false, isVariadic: false, summary: 'the name of the property to set. Possible values are:' },
        ],
        returns: 'Returns *true* if if the glitch was enabled, or *false* if it is disabled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsGlitchEnabled',
    },
    isGuestAccount: {
        summary: 'This function checks to see if an account is a guest account. A guest account is an account automatically created for a user when they join the server and deleted when they quit or login to another account. Data stored in a guest account is not stored after the player has left the server. As a consequence, this function will check if a player is logged in or not.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'The account you want to check to see if it is a guest account.' },
        ],
        returns: 'Returns *true* if the account is a guest account, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsGuestAccount',
    },
    isInsideColShape: {
        summary: 'This function checks if a 3D position is inside a colshape or not.',
        parameters: [
            { name: 'theShape', isOptional: false, isVariadic: false, summary: 'The colshape you\'re checking the position against.' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'The X coordinate of the position you\'re checking.' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'The Y coordinate of the position you\'re checking.' },
            { name: 'posZ', isOptional: false, isVariadic: false, summary: 'The Z coordinate of the position you\'re checking.' },
        ],
        returns: 'Returns *true* if the position is inside the colshape, *false* if it isn\'t or if any parameters are invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsInsideColShape',
    },
    isInsideRadarArea: {
        summary: 'This function checks if a 2D position is inside a radar area or not.',
        parameters: [
            { name: 'theArea', isOptional: false, isVariadic: false, summary: 'The radar area you\'re checking the position against.' },
            { name: 'posX', isOptional: false, isVariadic: false, summary: 'The X coordinate of the position you\'re checking.' },
            { name: 'posY', isOptional: false, isVariadic: false, summary: 'The Y coordinate of the position you\'re checking.' },
        ],
        returns: 'Returns *true* if the position is inside the radar area, *false* if it isn\'t or if any parameters are invalid.',
        wiki: 'https://wiki.multitheftauto.com/wiki/IsInsideRadarArea',
    },
};
