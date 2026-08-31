import type { EventDocumentationCatalog } from '@mta-types/event-documentation';

export const MTA_EVENT_DOCS_1: EventDocumentationCatalog = {
    onAccountCreate: {
        summary: 'This event is triggered every time an account is created',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'An account element that was created' },
        ],
        source: 'The source of this event is the root element.',
        cancel: 'This event cannot be canceled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnAccountCreate',
    },
    onAccountDataChange: {
        summary: 'This event is triggered when an accounts data changes through setAccountData.',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'the account that had data changed.' },
            { name: 'theKey', isOptional: false, isVariadic: false, summary: 'the string key that is being changed.' },
            { name: 'theValue', isOptional: false, isVariadic: false, summary: 'the value it is changing to.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnAccountDataChange',
    },
    onAccountRemove: {
        summary: 'This event is triggered every time an account is removed',
        parameters: [
            { name: 'theAccount', isOptional: false, isVariadic: false, summary: 'An account element that was removed' },
        ],
        source: 'The source of this event is the root element.',
        cancel: 'This event cannot be canceled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnAccountRemove',
    },
    onBan: {
        summary: 'This event is triggered when an IP address or serial is banned from the server.',
        parameters: [
            { name: 'theBan', isOptional: false, isVariadic: false, summary: 'the ban which was added.' },
        ],
        source: 'The source of this event is the element that was responsible for the banning. If no responsible was specified, the source is the global root element.',
        cancel: 'This event cannot be canceled.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnBan',
    },
    onChatMessage: {
        summary: 'This event is triggered when any message is output to chat using outputChatBox server-side (also when a player uses *say*, *teamsay* or *me* successfully).',
        parameters: [
            { name: 'theMessage', isOptional: false, isVariadic: false, summary: 'A string representing the text that was output to the chatbox.' },
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'A resource if it was done via outputChatBox or a player element if it was done via *say*, *teamsay* or *me*.' },
        ],
        source: 'The source of this event is the root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnChatMessage',
    },
    onClientBrowserCreated: {
        summary: 'This event is triggered when the CEF browser instance has been created. If you want to load a specific website right after creating the browser (using createBrowser or guiCreateBrowser), this event will be the convenient place.',
        parameters: [],
        source: 'The browser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserCreated',
    },
    onClientBrowserCursorChange: {
        summary: 'This event is triggered when the cursor changes within a browser window.',
        parameters: [
            { name: 'cursorId', isOptional: false, isVariadic: false, summary: 'The new cursor ID.' },
        ],
        source: 'The source of this event is the browser element the cursor change occured in.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserCursorChange',
    },
    onClientBrowserDocumentReady: {
        summary: 'This event is executed after the web page has been loaded successfully.',
        parameters: [
            { name: 'url', isOptional: false, isVariadic: false, summary: 'the url of the web page loaded.' },
        ],
        source: 'The browser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserDocumentReady',
    },
    onClientBrowserInputFocusChanged: {
        summary: 'This event is triggered when the input focus inside a browser has changed.',
        parameters: [
            { name: 'gainedFocus', isOptional: false, isVariadic: false, summary: '*true* if an input field has been focused, *false* if it has lost focus.' },
        ],
        source: 'The browser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserInputFocusChanged',
    },
    onClientBrowserLoadingFailed: {
        summary: 'The event is triggered when the browser can not load the page.',
        parameters: [
            { name: 'url', isOptional: false, isVariadic: false, summary: 'the requested URL.' },
            { name: 'errorCode', isOptional: false, isVariadic: false, summary: 'the error code.' },
            { name: 'errorDescription', isOptional: false, isVariadic: false, summary: 'a short description.' },
        ],
        source: 'The browser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserLoadingFailed',
    },
    onClientBrowserLoadingStart: {
        summary: 'The event is triggered when a webbrowser starts loading a page.',
        parameters: [
            { name: 'URL', isOptional: false, isVariadic: false, summary: 'string containing the URL that will be loaded.' },
            { name: 'isMainFrame', isOptional: false, isVariadic: false, summary: 'a boolean representing whether the entire page (main frame) was loaded or an \'** inside the page was loaded. **true**: If the URL is loaded in the main frame. **false**: If the URL is loaded in a **\'.' },
        ],
        source: 'The webbrowser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserLoadingStart',
    },
    onClientBrowserNavigate: {
        summary: 'The event is executed when the browser loads a new page. Do not use loadBrowserURL in the attached function.',
        parameters: [
            { name: 'targetURL', isOptional: false, isVariadic: false, summary: 'the page the browser loaded.' },
            { name: 'isBlocked', isOptional: false, isVariadic: false, summary: 'if the browser was created with **isLocal** set to **true**, and the browser tried to load a remote page, this would be set to **true** (and vice-versa).' },
            { name: 'isMainFrame', isOptional: false, isVariadic: false, summary: 'a boolean representing whether the entire page (main frame) was loaded or an \'\'\'\' inside the page was loaded.' },
        ],
        source: 'The browser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserNavigate',
    },
    onClientBrowserPopup: {
        summary: 'TODO',
        parameters: [
            { name: 'targetURL', isOptional: false, isVariadic: false, summary: '***openerURL:**' },
            { name: 'openerURL', isOptional: false, isVariadic: false, summary: '' },
            { name: 'isPopup', isOptional: false, isVariadic: false, summary: '' },
        ],
        source: 'TODO',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserPopup',
    },
    onClientBrowserResourceBlocked: {
        summary: 'This event is executed when a resource (images, sounds etc.) has been blocked.',
        parameters: [
            { name: 'url', isOptional: false, isVariadic: false, summary: 'the blocked URL.' },
            { name: 'domain', isOptional: false, isVariadic: false, summary: 'the blocked domain (part of the URL).' },
            { name: 'reason', isOptional: false, isVariadic: false, summary: 'the reason why the resource was blocked. Possibles values:' },
        ],
        source: 'The browser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserResourceBlocked',
    },
    onClientBrowserTooltip: {
        summary: 'The event is triggered when the user hovers a tooltip.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'string containing the tooltip text. Empty string if user is not longer hovering.' },
        ],
        source: 'The webbrowser element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserTooltip',
    },
    onClientBrowserWhitelistChange: {
        summary: 'The event is triggered when the whitelist has changed. Note that this event is only triggered if the request window was confirmed by accepting.',
        parameters: [
            { name: 'changedDomains', isOptional: false, isVariadic: false, summary: 'a table of changed domains.' },
        ],
        source: 'The root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientBrowserWhitelistChange',
    },
    onClientCharacter: {
        summary: 'This event triggers whenever the user presses an alphanumeric character on their keyboard. This also includes special characters, ie. **" / # % [ ] { }**.',
        parameters: [
            { name: 'character', isOptional: false, isVariadic: false, summary: 'a string representing the pressed character.' },
        ],
        source: 'The source of this event is the client\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientCharacter',
    },
    onClientChatMessage: {
        summary: 'This event is triggered when any text is output to chatbox, including MTA\'s internal messages.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'The text that was output to chatbox.' },
            { name: 'r', isOptional: false, isVariadic: false, summary: 'The amount of red in the color of the text.' },
            { name: 'g', isOptional: false, isVariadic: false, summary: 'The amount of green in the color of the text.' },
            { name: 'b', isOptional: false, isVariadic: false, summary: 'The amount of blue in the color of the text.' },
            { name: 'messageType', isOptional: false, isVariadic: false, summary: 'The type of message as a number.' },
        ],
        source: 'The source of this event is either a player element or the root element.',
        cancel: 'If this event is canceled, the game\'s chat system won\'t deliver the posts. You may use outputChatBox to send the messages then.',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientChatMessage',
    },
    onClientClick: {
        summary: 'This event triggers whenever the user clicks his mouse.  This is linked to the GTA world, as oppose to GUI for which onClientGUIClick is to be used.  This event allows detection of click positions of the 3D world.',
        parameters: [
            { name: 'button', isOptional: false, isVariadic: false, summary: 'This refers the button used to click on the mouse, can be *left*, *right*, or *middle*.' },
            { name: 'state', isOptional: false, isVariadic: false, summary: 'This can be used to tell if the user released or pressed the mouse button, where *up* is passed if the button is released, and *down* is passed if the button is pushed.' },
            { name: 'absoluteX', isOptional: false, isVariadic: false, summary: 'This refers to the 2D *x coordinate* the user clicked on his screen, and is an *absolute* position in pixels.' },
            { name: 'absoluteY', isOptional: false, isVariadic: false, summary: 'This refers to the 2D *y coordinate* the user clicked on his screen, and is an *absolute* position in pixels.' },
            { name: 'worldX', isOptional: false, isVariadic: false, summary: 'This represents the 3D *x coordinate* the player clicked on the screen, and is relative to the GTA world.' },
            { name: 'worldY', isOptional: false, isVariadic: false, summary: 'This represents the 3D *y coordinate* the player clicked on the screen, and is relative to the GTA world.' },
            { name: 'worldZ', isOptional: false, isVariadic: false, summary: 'This represents the 3D *z coordinate* the player clicked on the screen, and is relative to the GTA world.' },
            { name: 'clickedWorld', isOptional: false, isVariadic: false, summary: 'This represents any physical entity elements that were clicked. If the player clicked on no MTA element, it\'s set to false.' },
        ],
        source: 'The source of this event is the client\'s root element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientClick',
    },
    onClientColShapeHit: {
        summary: 'This event is triggered when a physical element hits a colshape.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element that entered the colshape.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: 'a boolean referring to whether the hit collision shape was in the same dimension as the element.' },
        ],
        source: 'The source of this event is the colshape that was hit.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientColShapeHit',
    },
    onClientColShapeLeave: {
        summary: 'This event is triggered when a physical element leaves a colshape.',
        parameters: [
            { name: 'theElement', isOptional: false, isVariadic: false, summary: 'the element that left the colshape.' },
            { name: 'matchingDimension', isOptional: false, isVariadic: false, summary: 'a boolean referring to whether the collision shape was in the same dimension as the element.' },
        ],
        source: 'The source of this event is the colshape that the element left.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientColShapeLeave',
    },
    onClientConsole: {
        summary: 'This event is triggered when the local player enters text in the console. Note that, if you want to add custom console commands, it is easier to use the addCommandHandler function.',
        parameters: [
            { name: 'text', isOptional: false, isVariadic: false, summary: 'the text line that was entered.' },
        ],
        source: 'The source of this event is the localPlayer player element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientConsole',
    },
    onClientCoreCommand: {
        summary: 'This event is triggered when a built-in client command is used, check Client Commands.',
        parameters: [
            { name: 'command', isOptional: false, isVariadic: false, summary: 'The command that was executed.' },
        ],
        source: 'The source of this event is the localPlayer player element.',
        cancel: '',
        wiki: 'https://wiki.multitheftauto.com/wiki/OnClientCoreCommand',
    },
};
