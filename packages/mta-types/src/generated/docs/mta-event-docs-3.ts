import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

export const MTA_EVENT_DOCS_3: EventDocumentationCatalog = {
    onClientGUIMove: {
        summary: 'This event is triggered each time the user moves a GUI element.',
        parameters: [],
        source: 'The source of this event is the GUI element which was moved.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientGUIMove',
    },
    onClientGUIScroll: {
        summary: 'This event is fired when a GUI scrollbar is scrolled.',
        parameters: [
            { name: 'scrolled', isOptional: false, isVariadic: false, summary: 'the scrollbar element that was scrolled.' },
        ],
        source: 'The source of this event is the scrollbar element that got scrolled.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientGUIScroll',
    },
    onClientGUISize: {
        summary: 'This event is triggered when the local client resizes a GUI element.',
        parameters: [],
        source: 'The source of this event is the GUI element that was resized.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientGUISize',
    },
    onClientGUITabSwitched: {
        summary: 'This event is triggered each time the user switch from GUI tab.\n\nWhen adding the event handler on the tab panel, propagate must be true.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the tab which was selected.' },
        ],
        source: 'The source of this event is the tab.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientGUITabSwitched',
    },
    onClientHUDRender: {
        summary: 'This event is triggered before GTA renders the HUD. This is particularly useful if you want to use dxUpdateScreenSource to capture the screen onto a texture without capturing the HUD, or to alter HUD textures using shaders before they are drawn onto the screen.',
        parameters: [],
        source: 'The source of this event is the client\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientHUDRender',
    },
    onClientKey: {
        summary: 'This event triggers whenever the user presses a button on their keyboard or mouse.\nThis event can also be used to see if the client scrolls their mouse wheel.',
        parameters: [
            { name: 'button', isOptional: false, isVariadic: false, summary: 'This refers the button pressed. See key names for a list of keys.' },
            { name: 'pressOrRelease', isOptional: false, isVariadic: false, summary: 'This refers to whether they were pressing or releasing the key, *true* when pressing, *false* when releasing.' },
        ],
        source: 'The source of this event is the client\'s root element.',
        cancel: 'If this event is canceled, then all GTA and MTA binds, bound to the canceled key, won\'t be triggered. **Note 1:** The escape key can only be cancelled once. If a user presses the escape key twice in a row the main menu will still open. **Note 2:** The event is only cancellable when the key is being pressed, not when being released.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientKey',
    },
    onClientMarkerHit: {
        summary: 'This event is triggered when a player enters a marker created using createMarker.',
        parameters: [
            { name: 'hitPlayer', isOptional: false, isVariadic: false, summary: 'the player that hit the marker.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: '*true* if the player is in the same dimension as the hit marker.' },
        ],
        source: 'The source of this event is the marker that got hit by the player.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMarkerHit',
    },
    onClientMarkerLeave: {
        summary: 'This event is triggered when a player leaves the area of a marker created using createMarker.',
        parameters: [
            { name: 'leftPlayer', isOptional: false, isVariadic: false, summary: 'the player that left the marker\'s area.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: '*true* if the player is in the same dimension as the marker.' },
        ],
        source: 'The source of this event is the marker that the player left.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMarkerLeave',
    },
    onClientMinimize: {
        summary: 'This event is triggered when the local player minimizes the game screen.',
        parameters: [],
        source: 'The source of this event is root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMinimize',
    },
    onClientMouseEnter: {
        summary: 'This event is fired when the user moves the mouse over a GUI element.',
        parameters: [
            { name: 'absoluteX', isOptional: false, isVariadic: false, summary: 'the X position of the mouse cursor, in pixels, measured from the left side of the screen.' },
            { name: 'absoluteY', isOptional: false, isVariadic: false, summary: 'the Y position of the mouse cursor, in pixels, measured from the top of the screen.' },
            { name: 'leftGUI', isOptional: false, isVariadic: false, summary: 'the gui element that was switched from, or *nil* if it doesn\'t exist.' },
        ],
        source: 'The source of this event is the GUI element that was pointed at.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMouseEnter',
    },
    onClientMouseLeave: {
        summary: 'This event is fired when the user moves the mouse away from a GUI element.',
        parameters: [
            { name: 'absoluteX', isOptional: false, isVariadic: false, summary: 'the X position of the mouse cursor, in pixels, measured from the left side of the screen.' },
            { name: 'absoluteY', isOptional: false, isVariadic: false, summary: 'the Y position of the mouse cursor, in pixels, measured from the top of the screen.' },
            { name: 'enteredGUI', isOptional: false, isVariadic: false, summary: 'is the GUI element that was switched from, or *nil* if it doesn\'t exist.' },
        ],
        source: 'The source of this event is the GUI element that the mouse was moved from.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMouseLeave',
    },
    onClientMouseMove: {
        summary: 'This event is triggered each time the user moves the mouse on top of a GUI element.',
        parameters: [
            { name: 'absoluteX', isOptional: false, isVariadic: false, summary: 'the X position of the mouse cursor, in pixels, measured from the left side of the screen.' },
            { name: 'absoluteY', isOptional: false, isVariadic: false, summary: 'the Y position of the mouse cursor, in pixels, measured from the top of the screen.' },
        ],
        source: 'The source of this event is the GUI element on which the mouse was moved.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMouseMove',
    },
    onClientMouseWheel: {
        summary: 'This event is triggered each time the user scrolls his mouse scroll on top of a GUI element.',
        parameters: [
            { name: 'upOrDown', isOptional: false, isVariadic: false, summary: 'An integer representing whether the scroll was scrolled up or down. This can be either **1** (mouse was scrolled up) or **-1** (mouse was scrolled down).' },
        ],
        source: 'The source of this event is the GUI element on which the mouse scroll was scrolled.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMouseWheel',
    },
    onClientMTAFocusChange: {
        summary: 'This event is triggered every time the MTA window gains or loses focus.',
        parameters: [
            { name: 'windowFocused', isOptional: false, isVariadic: false, summary: 'A boolean, indicating whether the MTA window is focused or not.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientMTAFocusChange',
    },
    onClientObjectBreak: {
        summary: 'This event is fired before an object breaks.',
        parameters: [
            { name: 'attacker', isOptional: false, isVariadic: false, summary: 'the vehicle/ped/player who is breaking the object' },
        ],
        source: 'The source of this event is the object which will break.',
        cancel: 'If this event is canceled, the object will not break.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientObjectBreak',
    },
    onClientObjectDamage: {
        summary: 'This event is fired before an object gets damaged.',
        parameters: [
            { name: 'loss', isOptional: false, isVariadic: false, summary: 'the health loss caused by the damage. This parameter contains the theoretical loss, which could be less than 0, if you substract it of the current health. If you want to get the real loss, you have to substract the new health of the old health (use a timer for this).' },
            { name: 'attacker', isOptional: false, isVariadic: false, summary: 'the vehicle/ped/player who is damaging the object.' },
        ],
        source: 'The source of this event is the object which was damaged.',
        cancel: 'If this event is canceled, the object will not be damaged.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientObjectDamage',
    },
    onClientObjectMoveStart: {
        summary: 'This event is triggered when an object starts moving.',
        parameters: [],
        source: 'The source of this event is the object which was moved.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientObjectMoveStart',
    },
    onClientObjectMoveStop: {
        summary: 'This event is triggered when an object\'s movements stop.',
        parameters: [],
        source: 'The source of this event is the object which was moved.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientObjectMoveStop',
    },
    onClientPaste: {
        summary: 'This event triggers when user paste whatever (**CTRL + V**). \'\'\'This event isn\'t triggered if menu or console is visible or if any browser is focused, or if cursor is invisible.\'\'\'',
        parameters: [
            { name: 'clipboardText', isOptional: false, isVariadic: false, summary: 'a string representing the pasted value from clipboard.' },
        ],
        source: 'The source of this event is the client\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPaste',
    },
    onClientPedChoke: {
        summary: 'This event is fired when a ped chokes due to the effect of a weapon such as tear gas grenades, fire extinguishers and spray cans.',
        parameters: [
            { name: 'weaponID', isOptional: false, isVariadic: false, summary: 'an int representing the ID of the weapon which caused the choking.' },
            { name: 'responsiblePed', isOptional: false, isVariadic: false, summary: 'the ped responsible for causing the choking, possiblly nil.' },
        ],
        source: 'The source of this event is the ped who is choking.',
        cancel: 'If this event is canceled, the ped will not be choked.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPedChoke',
    },
    onClientPedDamage: {
        summary: 'This event is triggered whenever a ped is damaged.',
        parameters: [
            { name: 'attacker', isOptional: false, isVariadic: false, summary: 'A player element representing the attacker or vehicle element (when a ped falls of a bike).' },
            { name: 'weapon', isOptional: false, isVariadic: false, summary: 'An integer representing the weapon ID the attacker used' },
            { name: 'bodypart', isOptional: false, isVariadic: false, summary: 'An integer representing the bodypart the ped was damaged' },
            { name: 'loss', isOptional: false, isVariadic: false, summary: 'A float representing the percentage of health the ped lost.' },
        ],
        source: 'The source of this event is the ped that got damaged',
        cancel: 'If this event is canceled, then any damaging effects to the ped will cease.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPedDamage',
    },
    onClientPedHeliKilled: {
        summary: 'This event is fired when a ped is killed due to the effect of a helicopter blades.',
        parameters: [
            { name: 'killer', isOptional: false, isVariadic: false, summary: 'the vehicle (heli) responsible for causing the death.' },
        ],
        source: 'The source of this event is the ped who was killed',
        cancel: 'If this event is canceled, the ped will not be killed',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPedHeliKilled',
    },
    onClientPedHitByWaterCannon: {
        summary: 'This event is fired when a ped is hit by a water cannon.',
        parameters: [
            { name: 'pedHit', isOptional: false, isVariadic: false, summary: 'the ped which got shot by the water cannon' },
        ],
        source: 'The source of this event is the vehicle who shot the water cannon.',
        cancel: 'If this event is canceled, the ped will not be knocked down',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPedHitByWaterCannon',
    },
    onClientPedsProcessed: {
        summary: 'This event is triggered after GTA updates bone transformations for all peds. This event can be used for updating bones.',
        parameters: [],
        source: 'The source of this event is the client\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPedsProcessed',
    },
    onClientPedStep: {
        summary: 'This event is called when a peds foot has come on to the ground after jumping or taking a full step.',
        parameters: [
            { name: 'leftFoot', isOptional: false, isVariadic: false, summary: 'a bool representing if it was the left foot that moved.' },
        ],
        source: 'The source of this event is the ped who stepped.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPedStep',
    },
    onClientPedVehicleEnter: {
        summary: 'This event is fired when a ped has entered a vehicle.',
        parameters: [
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle that the ped entered.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'The seat that the ped now is on. Driver\'s seat = 0, higher numbers are passenger seats.' },
        ],
        source: 'The source of this event is the ped that entered the vehicle.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientPedVehicleEnter',
    },
};
