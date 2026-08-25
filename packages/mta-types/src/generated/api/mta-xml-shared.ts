import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, TABLE, unionOf } from '@mta-types/type-descriptor';

export const MTA_XML_SHARED: ApiCatalog = {
    xmlCopyFile: fn([named('XmlNode'), STRING], named('XmlNode'), 2),
    xmlCreateChild: fn([named('XmlNode'), STRING], named('XmlNode'), 2),
    xmlCreateFile: fn([STRING, STRING], named('XmlNode'), 2),
    xmlDestroyNode: fn([named('XmlNode')], BOOLEAN, 1),
    xmlFindChild: fn([named('XmlNode'), STRING, NUMBER], named('XmlNode'), 3),
    xmlLoadFile: fn([STRING, BOOLEAN], named('XmlNode'), 1),
    xmlLoadString: fn([STRING], named('XmlNode'), 1),
    xmlNodeGetAttribute: fn([named('XmlNode'), STRING], STRING, 2),
    xmlNodeGetAttributes: fn([named('XmlNode')], TABLE, 1),
    xmlNodeGetChildren: fn([named('XmlNode'), NUMBER], unionOf([TABLE, named('XmlNode')]), 1),
    xmlNodeGetName: fn([named('XmlNode')], STRING, 1),
    xmlNodeGetParent: fn([named('XmlNode')], named('XmlNode'), 1),
    xmlNodeGetValue: fn([named('XmlNode')], STRING, 1),
    xmlNodeSetAttribute: fn([named('XmlNode'), STRING, unionOf([STRING, NUMBER])], BOOLEAN, 3),
    xmlNodeSetName: fn([named('XmlNode'), STRING], BOOLEAN, 2),
    xmlNodeSetValue: fn([named('XmlNode'), STRING, BOOLEAN], BOOLEAN, 2),
    xmlSaveFile: fn([named('XmlNode')], BOOLEAN, 1),
    xmlUnloadFile: fn([named('XmlNode')], BOOLEAN, 1),
};
