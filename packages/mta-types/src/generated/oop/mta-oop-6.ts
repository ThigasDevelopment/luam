import { oopClass, oopMethod, oopProperty, type OopClass } from '@mta-types/oop-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_OOP_6: readonly OopClass[] = [
    oopClass('XmlNode', null, [
        oopProperty('attributes', 'shared', 'xmlNodeGetAttributes', TABLE),
        oopProperty('children', 'shared', 'xmlNodeGetChildren', ANY),
        oopMethod('copy', 'shared', 'xmlCopyFile', fn([STRING], named('XmlNode'), 1)),
        oopMethod('createChild', 'shared', 'xmlCreateChild', fn([STRING], named('XmlNode'), 1)),
        oopMethod('destroy', 'shared', 'xmlDestroyNode', fn([], BOOLEAN, 0)),
        oopMethod('findChild', 'shared', 'xmlFindChild', fn([STRING, NUMBER], named('XmlNode'), 2)),
        oopMethod('getAttribute', 'shared', 'xmlNodeGetAttribute', fn([STRING], STRING, 1)),
        oopMethod('getAttributes', 'shared', 'xmlNodeGetAttributes', fn([], TABLE, 0)),
        oopMethod('getChildren', 'shared', 'xmlNodeGetChildren', fn([NUMBER], ANY, 0)),
        oopMethod('getName', 'shared', 'xmlNodeGetName', fn([], STRING, 0)),
        oopMethod('getParent', 'shared', 'xmlNodeGetParent', fn([], named('XmlNode'), 0)),
        oopMethod('getValue', 'shared', 'xmlNodeGetValue', fn([], STRING, 0)),
        oopProperty('name', 'shared', 'xmlNodeGetName', STRING),
        oopProperty('parent', 'shared', 'xmlNodeGetParent', named('XmlNode')),
        oopMethod('saveFile', 'shared', 'xmlSaveFile', fn([], BOOLEAN, 0)),
        oopMethod('setAttribute', 'shared', 'xmlNodeSetAttribute', fn([STRING, ANY], BOOLEAN, 2)),
        oopMethod('setName', 'shared', 'xmlNodeSetName', fn([STRING], BOOLEAN, 1)),
        oopMethod('setValue', 'shared', 'xmlNodeSetValue', fn([STRING, BOOLEAN], BOOLEAN, 1)),
        oopMethod('unload', 'shared', 'xmlUnloadFile', fn([], BOOLEAN, 0)),
        oopProperty('value', 'shared', 'xmlNodeGetValue', STRING),
    ]),
];
