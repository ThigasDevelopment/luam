import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, tupleOf, VOID } from '@mta-types/type-descriptor';

export const MTA_SVG_CLIENT: ApiCatalog = {
    svgCreate: fn([NUMBER, NUMBER, STRING, fn([ANY], VOID, 1, false, ['svg'])], ANY, 2),
    svgGetDocumentXML: fn([ANY], named('XmlNode'), 1),
    svgGetSize: fn([ANY], tupleOf([NUMBER, NUMBER]), 1),
    svgSetDocumentXML: fn([ANY, named('XmlNode'), fn([ANY], VOID, 1, false, ['svg'])], BOOLEAN, 2),
    svgSetSize: fn([ANY, NUMBER, NUMBER, fn([ANY], VOID, 1, false, ['svg'])], BOOLEAN, 3),
    svgSetUpdateCallback: fn([ANY, ANY], BOOLEAN, 2),
};
