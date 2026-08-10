import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_SVG_CLIENT: ApiCatalog = {
    svgCreate: fn([NUMBER, NUMBER, STRING, ANY], ANY, 2),
    svgGetDocumentXML: fn([ANY], named('XmlNode'), 1),
    svgGetSize: fn([ANY], tupleOf([NUMBER, NUMBER]), 1),
    svgSetDocumentXML: fn([ANY, named('XmlNode'), ANY], BOOLEAN, 2),
    svgSetSize: fn([ANY, NUMBER, NUMBER, ANY], BOOLEAN, 3),
    svgSetUpdateCallback: fn([ANY, ANY], BOOLEAN, 2),
};
