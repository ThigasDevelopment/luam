import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, tupleOf, unionOf, VOID } from '@mta-types/type-descriptor';

export const MTA_UTILITY_CLIENT_7: ApiCatalog = {
    stopSound: fn([named('Element')], BOOLEAN, 1),
    svgCreate: fn([NUMBER, NUMBER, STRING, fn([ANY], VOID, 1, false, ['svg'])], ANY, 2),
    svgGetDocumentXML: fn([ANY], named('XmlNode'), 1),
    svgGetSize: fn([ANY], tupleOf([NUMBER, NUMBER]), 1),
    svgSetDocumentXML: fn([ANY, named('XmlNode'), fn([ANY], VOID, 1, false, ['svg'])], BOOLEAN, 2),
    svgSetSize: fn([ANY, NUMBER, NUMBER, fn([ANY], VOID, 1, false, ['svg'])], BOOLEAN, 3),
    svgSetUpdateCallback: fn([ANY, unionOf([fn([], ANY, 0, true, undefined), BOOLEAN])], BOOLEAN, 2),
    takePlayerMoney: fn([NUMBER], BOOLEAN, 1),
    testLineAgainstWater: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], tupleOf([BOOLEAN, NUMBER, NUMBER, NUMBER]), 6),
    testSphereAgainstWorld: fn(
        [NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN],
        tupleOf([BOOLEAN, named('Element'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, STRING]),
        4,
    ),
    toggleAllControls: fn([BOOLEAN, BOOLEAN, BOOLEAN], BOOLEAN, 1),
    toggleBrowserDevTools: fn([named('Browser'), BOOLEAN], BOOLEAN, 2),
    toggleControl: fn([STRING, BOOLEAN], BOOLEAN, 2),
    triggerLatentServerEvent: fn([STRING, NUMBER, BOOLEAN, named('Element')], BOOLEAN, 2, true, undefined),
    triggerServerEvent: fn([STRING, named('Element')], BOOLEAN, 2, true, undefined),
    updateElementRpHAnim: fn([named('Element')], BOOLEAN, 1),
};
