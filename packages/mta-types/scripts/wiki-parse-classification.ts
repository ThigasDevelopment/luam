export type ArityVerdict = 'upstream-drift' | 'parser-defect';

export interface ArityDisagreement {
    name: string;
    wiki: readonly [number, number];
    catalog: readonly [number, number];
    verdict: ArityVerdict;
    narrows: boolean;
    note: string;
}

const LATER_RELEASE = 'the wiki documents optional parameters MTA added after mtasa-lua-types@1.1.1 was published';

const WIKI_OPTIONAL = 'the wiki brackets a parameter the frozen upstream declares as required';

const SIDE_MERGE = 'the client syntax block takes no argument, so the merged declaration requires none';

const FIRST_SYNTAX = 'the page documents several overloads and the generator reads the first, where the frozen upstream merged them';

const PHANTOM = 'the frozen upstream declares a parameter no wiki syntax block documents';

const WIKI_STRICTER = 'the wiki writes IP, Username, and Serial unbracketed, where MTA accepts any one of them';

const MODERN_FORM = 'the wiki documents the current options-table form, where the frozen upstream declares the legacy positional form';

const REPEATED_TAIL = 'the wiki spells the repeated tail parameter out, where the frozen upstream collapsed it into the variadic';

export const ARITY_DISAGREEMENTS: readonly ArityDisagreement[] = [
    { name: 'addBan', wiki: [6, 3], catalog: [6, 0], verdict: 'upstream-drift', narrows: true, note: WIKI_STRICTER },
    { name: 'createLight', wiki: [11, 4], catalog: [12, 4], verdict: 'upstream-drift', narrows: true, note: PHANTOM },
    { name: 'createMarker', wiki: [11, 3], catalog: [10, 3], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'createVehicle', wiki: [12, 4], catalog: [11, 4], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'decodeString', wiki: [4, 2], catalog: [4, 3], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'dxCreateTexture', wiki: [4, 1], catalog: [6, 1], verdict: 'upstream-drift', narrows: true, note: FIRST_SYNTAX },
    { name: 'dxDrawText', wiki: [19, 3], catalog: [20, 3], verdict: 'upstream-drift', narrows: true, note: PHANTOM },
    { name: 'dxGetTexturePixels', wiki: [9, 1], catalog: [6, 1], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'encodeString', wiki: [4, 2], catalog: [4, 3], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'engineRestoreObjectGroupPhysicalProperties', wiki: [1, 1], catalog: [2, 2], verdict: 'upstream-drift', narrows: true, note: PHANTOM },
    { name: 'engineSetModelLODDistance', wiki: [3, 2], catalog: [2, 2], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'executeSQLQuery', wiki: [3, 1], catalog: [2, 1], verdict: 'upstream-drift', narrows: false, note: REPEATED_TAIL },
    { name: 'fetchRemote', wiki: [4, 2], catalog: [7, 2], verdict: 'upstream-drift', narrows: true, note: MODERN_FORM },
    { name: 'getPlayerScriptDebugLevel', wiki: [1, 0], catalog: [1, 1], verdict: 'upstream-drift', narrows: false, note: SIDE_MERGE },
    { name: 'getPlayerSerial', wiki: [1, 0], catalog: [1, 1], verdict: 'upstream-drift', narrows: false, note: SIDE_MERGE },
    { name: 'getResourceName', wiki: [1, 0], catalog: [1, 1], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'getValidPedModels', wiki: [1, 0], catalog: [0, 0], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'getVehicleHandling', wiki: [2, 1], catalog: [1, 1], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'guiCreateBrowser', wiki: [8, 6], catalog: [8, 7], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateButton', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateCheckBox', wiki: [8, 6], catalog: [8, 7], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateComboBox', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateEdit', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateGridList', wiki: [6, 4], catalog: [6, 5], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateLabel', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateMemo', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateProgressBar', wiki: [6, 4], catalog: [6, 5], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateRadioButton', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateScrollBar', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateScrollPane', wiki: [6, 4], catalog: [6, 5], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateStaticImage', wiki: [7, 5], catalog: [7, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateTabPanel', wiki: [6, 4], catalog: [6, 5], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'guiCreateWindow', wiki: [6, 5], catalog: [6, 6], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'injectBrowserMouseDown', wiki: [3, 2], catalog: [2, 2], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'playSound3D', wiki: [6, 4], catalog: [5, 4], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'processLineOfSight', wiki: [18, 6], catalog: [17, 6], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'redirectPlayer', wiki: [4, 1], catalog: [4, 3], verdict: 'upstream-drift', narrows: false, note: WIKI_OPTIONAL },
    { name: 'reloadBrowserPage', wiki: [2, 1], catalog: [1, 1], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'setCameraFieldOfView', wiki: [3, 2], catalog: [2, 2], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'setElementData', wiki: [5, 3], catalog: [4, 3], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'setElementSyncer', wiki: [3, 2], catalog: [2, 2], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'setVehiclePanelState', wiki: [5, 3], catalog: [3, 3], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
    { name: 'setWaterLevel', wiki: [4, 1], catalog: [2, 1], verdict: 'upstream-drift', narrows: false, note: FIRST_SYNTAX },
    { name: 'shutdown', wiki: [2, 0], catalog: [1, 0], verdict: 'upstream-drift', narrows: false, note: LATER_RELEASE },
];

export const CLASSIFIED: ReadonlyMap<string, ArityDisagreement> = new Map(ARITY_DISAGREEMENTS.map((entry) => [entry.name, entry]));

export const MINIMUM_PARSE_RATE = 0.99;

export const MINIMUM_TOTAL_ARITY_AGREEMENT = 0.982;

export const MINIMUM_REQUIRED_ARITY_AGREEMENT = 0.981;
