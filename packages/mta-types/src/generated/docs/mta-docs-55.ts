import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_55: ApiDocumentationCatalog = {
    xmlNodeGetAttributes: {
        summary: 'Returns all the attributes of a specific XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the XML node to get the attributes of.' },
        ],
        returns: 'If successful, returns a table with as keys the names of the attributes and as values the corresponding attribute values. If the node has no attributes, returns an empty table. In case of failure, returns *false*.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetAttributes',
    },
    xmlNodeGetChildren: {
        summary: 'This function returns all children of a particular XML node, or a particular child node.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'This is the xmlnode you want to retrieve one or all child nodes of.' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'If you only want to retrieve one particular child node, specify its (0-based) index here. For example if you only want the first node, specify 0; the fifth node has index 4, etc.' },
        ],
        returns: 'If **index** isn\'t specified, returns a table containing all child nodes. If **index** is specified, returns the corresponding child node if it exists. If no nodes are found, it returns an empty table. Returns *false* in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetChildren',
    },
    xmlNodeGetName: {
        summary: 'Gets the tag name of the specified XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the node to get the tag name of.' },
        ],
        returns: 'Returns the tag name of the node if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetName',
    },
    xmlNodeGetParent: {
        summary: 'Returns the parent node of an xml node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the node of which you want to know the parent.' },
        ],
        returns: 'Returns the parent node of the specified node if successful. Returns *false* if the specified node is the root node or an invalid node was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetParent',
    },
    xmlNodeGetValue: {
        summary: 'This function is made to be able to read tag values in XML files (eg. anything).',
        parameters: [
            { name: 'theXMLNode', isOptional: false, isVariadic: false, summary: 'The xml node of which you need to know the value.' },
        ],
        returns: 'Returns the value of the node as a string if it was received successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetValue',
    },
    xmlNodeSetAttribute: {
        summary: 'This function is used to edit an attribute of a node in a configuration file.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'The node of which you wish to edit an attribute.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the attribute.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value which you wish to change the attribute to. (**Note:** *nil* will delete the attribute)' },
        ],
        returns: 'Returns *true* if the attribute was set successfully, *false* if the node and/or attribute do not exist, or if they\'re faulty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeSetAttribute',
    },
    xmlNodeSetName: {
        summary: 'Sets the tag name of the specified XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the node to change the tag name of.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'the new tag name to set.' },
        ],
        returns: 'Returns *true* if successful, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeSetName',
    },
    xmlNodeSetValue: {
        summary: 'This function is made to be able to assign values to tags in XML files (eg. anything).',
        parameters: [
            { name: 'theXMLNode', isOptional: false, isVariadic: false, summary: 'The xml node you want to set the value of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The string value you want the node to have.' },
            { name: 'setCDATA', isOptional: true, isVariadic: false, summary: 'A boolean indicating if you want the value to be enclosed inside CDATA tags.' },
        ],
        returns: 'Returns *true* if value was successfully set, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeSetValue',
    },
    xmlSaveFile: {
        summary: 'This function saves a loaded XML file.',
        parameters: [
            { name: 'rootNode', isOptional: false, isVariadic: false, summary: 'the root xmlnode of the loaded XML file.' },
        ],
        returns: 'Returns *true* if save was successful, *false* if the XML file does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlSaveFile',
    },
    xmlUnloadFile: {
        summary: 'Unloads an XML document from memory.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'root of the XML document to unload' },
        ],
        returns: 'Returns *true* if the document was unloaded successfully, *false* otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlUnloadFile',
    },
};
