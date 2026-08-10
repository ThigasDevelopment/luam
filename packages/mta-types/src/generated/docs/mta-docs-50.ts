import type { ApiDocumentationCatalog } from '@mta-types/api-documentation';

export const MTA_DOCS_50: ApiDocumentationCatalog = {
    utfChar: {
        summary: 'The function returns the string of the specified UTF code.',
        parameters: [
            { name: 'characterCode', isOptional: false, isVariadic: false, summary: 'The UTF code, to get the string of.' },
        ],
        returns: 'returns a string if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfChar',
    },
    utfCode: {
        summary: 'The function returns the UTF codes of the given string.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string to get the UTF code of.' },
        ],
        returns: 'returns an int if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfCode',
    },
    utfLen: {
        summary: 'The function gets the real length of a string, in characters.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string to get the length of.' },
        ],
        returns: 'returns an int if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfLen',
    },
    utfSeek: {
        summary: 'The function returns the byte position at specified character position.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string.' },
            { name: 'position', isOptional: false, isVariadic: false, summary: 'An int with the specified charachter position.' },
        ],
        returns: 'returns an int if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfSeek',
    },
    utfSub: {
        summary: 'The function returns a sub string, from the specified positions on a character.',
        parameters: [
            { name: 'theString', isOptional: false, isVariadic: false, summary: 'The string.' },
            { name: 'Start', isOptional: false, isVariadic: false, summary: 'An int with the start position.' },
            { name: 'End', isOptional: false, isVariadic: false, summary: 'An int with the end position.' },
        ],
        returns: 'returns a string if the function was successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/UtfSub',
    },
    warpPedIntoVehicle: {
        summary: 'This function is used to warp or force a ped into a vehicle.  There are no animations\ninvolved when this happens.\nAvailable client side from 1.3.1 (It will only work with client side vehicles and peds)',
        parameters: [
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'The ped which you wish to force inside the vehicle' },
            { name: 'theVehicle', isOptional: false, isVariadic: false, summary: 'The vehicle you wish to force the ped into' },
            { name: 'seat', isOptional: true, isVariadic: false, summary: 'An integer representing the seat ID. 0 Front-left 1 Front-right 2 Rear-left 3 Rear-right' },
        ],
        returns: 'returns true if the operation is successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/WarpPedIntoVehicle',
    },
    wasEventCancelled: {
        summary: 'This function checks if the last completed event was cancelled. This is mainly useful for\ncustom events created by scripts.\nEvents can be cancelled using cancelEvent, this indicates that the resource which\ntriggered the event should do whatever it can to reverse any changes made by whatever\ncaused the event. See triggerEvent for a more detailed explanation of this.',
        parameters: [],
        returns: 'returns true if the event was cancelled, false if it wasnt or doesnt exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/WasEventCancelled',
    },
    xmlCopyFile: {
        summary: 'This function copies all contents of a certain node in a XML document to a new document\nfile, so the copied node becomes the new files root node.\nThe new file will not be saved to file system until xmlSaveFile() is called',
        parameters: [
            { name: 'nodeToCopy', isOptional: false, isVariadic: false, summary: 'the xmlnode that is to be copied to a new document.' },
            { name: 'newFilePath', isOptional: false, isVariadic: false, summary: 'the path of the file that is to be created, in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. :For example, to create a file named \'newfile.xml\' with myNode as the root node in the resource \'ctf\', it can be done from another resource this way: \'\'xmlCopyFile(myNode, ":ctf/newfile.xml")\'\'. :If the file is to be in the current resource, only the file path is necessary, e.g. \'\'xmlCopyFile(myNode, "newfile.xml")\'\'.' },
        ],
        returns: 'returns the xmlnode of the copy if the node was successfully copied, false if invalid arguments were passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlCopyFile',
    },
    xmlCreateChild: {
        summary: 'This function creates a new child node under an XML node.',
        parameters: [
            { name: 'parentNode', isOptional: false, isVariadic: false, summary: 'the xmlnode you want to create a new child node under.' },
            { name: 'tagName', isOptional: false, isVariadic: false, summary: 'the type of the child node that will be created.' },
        ],
        returns: 'returns the created xmlnode if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlCreateChild',
    },
    xmlCreateFile: {
        summary: 'This function creates a new XML document, which can later be saved to a file by using\nxmlSaveFile. This function will overwrite the file specified if it already exists.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file in the following format: :resourceName/path. resourceName is the name of the resource the file will be in, and path is the path from the root directory of the resource to the file. :For example, if you want to create a file named \'new.xml\' in the resource \'ctf\', it can be created from another resource this way: \'\'xmlCreateFile(":ctf/new.xml", "newroot")\'\'. :If the file is in the current resource, only the file path is necessary, e.g. \'\'xmlCreateFile("new.xml", "newroot")\'\'. :Note that if a different resource than default is being accessed, the caller resource needs access to general.ModifyOtherObjects in the ACL.' },
            { name: 'rootNodeName', isOptional: false, isVariadic: false, summary: 'the name of the root node in the XML document.' },
        ],
        returns: 'returns the root xmlnode object of the new xml file if successful, or false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlCreateFile',
    },
    xmlDestroyNode: {
        summary: 'This function destroys a XML node from the XML node tree.',
        parameters: [
            { name: 'theXMLNode', isOptional: false, isVariadic: false, summary: 'The xml node you want to destroy.' },
        ],
        returns: 'returns true if the xml node was successfully destroyed, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlDestroyNode',
    },
    xmlFindChild: {
        summary: 'This function returns a named child node of an XML node.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: ': This is an xmlnode that you want to find the child node under.' },
            { name: 'tagName', isOptional: false, isVariadic: false, summary: ': This is the name of the child node you wish to find (case-sensitive).' },
            { name: 'index', isOptional: false, isVariadic: false, summary: ': This is the 0-based index of the node you wish to find. For example, to find the 5th subnode with a particular name, you would use 4 as the index value. To find the first occurence, use 0.' },
        ],
        returns: 'returns an xmlnode if the node was found, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlFindChild',
    },
    xmlLoadFile: {
        summary: 'This function provides an alternative way to load XML files to getResourceConfig.\nThis function loads an XML file and returns the node by specifying a specific file path,\nwhile getResourceConfig allows for loading an XML file from a resource.',
        parameters: [
            { name: 'filePath', isOptional: false, isVariadic: false, summary: 'The filepath of the file in the following format: :resourceName/path. resourceName is the name of the resource the file is in, and path is the path from the root directory of the resource to the file. :For example, if there is a file named \'settings.xml\' in the resource \'ctf\', it can be accessed from another resource this way: \'\'xmlLoadFile(":ctf/settings.xml")\'\'. :If the file is in the current resource, only the file path is necessary, e.g. \'\'xmlLoadFile("settings.xml")\'\'.' },
            { name: 'readOnly', isOptional: true, isVariadic: false, summary: 'By default, the XML file is opened with reading and writing access. You can specify true for this parameter if you only need reading access.' },
        ],
        returns: 'returns the root xmlnode object of an xml file if successful, or false otherwise. print error if something wrong with xml. |7485',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlLoadFile',
    },
    xmlLoadString: {
        summary: '',
        parameters: [
            { name: 'xmlString', isOptional: false, isVariadic: false, summary: 'A string containing XML data' },
        ],
        returns: 'returns the root xmlnode object of an xml string if successful, or false otherwise (invalid xml string).',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlLoadString',
    },
    xmlNodeGetAttribute: {
        summary: 'This function is used to return an attribute of a node in a configuration file.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'The node from which you wish to return the attribute' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the attribute.' },
        ],
        returns: 'returns the attribute in string form or false, if the attribute is not defined.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetAttribute',
    },
    xmlNodeGetAttributes: {
        summary: 'Returns all the attributes of a specific XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the XML node to get the attributes of.' },
        ],
        returns: 'if successful, returns a table with as keys the names of the attributes and as values the corresponding attribute values. if the node has no attributes, returns an empty table. in case of failure, returns false.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetAttributes',
    },
    xmlNodeGetChildren: {
        summary: 'This function returns all children of a particular XML node, or a particular child node.',
        parameters: [
            { name: 'parent', isOptional: false, isVariadic: false, summary: 'This is the xmlnode you want to retrieve one or all child nodes of.' },
            { name: 'index', isOptional: true, isVariadic: false, summary: 'If you only want to retrieve one particular child node, specify its (0-based) index here. For example if you only want the first node, specify 0; the fifth node has index 4, etc.' },
        ],
        returns: 'if index isnt specified, returns a table containing all child nodes. if index is specified, returns the corresponding child node if it exists. if no nodes are found, it returns an empty table. returns false in case of failure.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetChildren',
    },
    xmlNodeGetName: {
        summary: 'Gets the tag name of the specified XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the node to get the tag name of.' },
        ],
        returns: 'returns the tag name of the node if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetName',
    },
    xmlNodeGetParent: {
        summary: 'Returns the parent node of an xml node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the node of which you want to know the parent.' },
        ],
        returns: 'returns the parent node of the specified node if successful. returns false if the specified node is the root node or an invalid node was passed.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetParent',
    },
    xmlNodeGetValue: {
        summary: 'This function is made to be able to read tag values in XML files (eg.\nanything).',
        parameters: [
            { name: 'theXMLNode', isOptional: false, isVariadic: false, summary: 'The xml node of which you need to know the value.' },
        ],
        returns: 'returns the value of the node as a string if it was received successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeGetValue',
    },
    xmlNodeSetAttribute: {
        summary: 'This function is used to edit an attribute of a node in a configuration file.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'The node of which you wish to edit an attribute.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'The name of the attribute.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The value which you wish to change the attribute to. (Note: nil will delete the attribute)' },
        ],
        returns: 'returns true if the attribute was set successfully, false if the node and/or attribute do not exist, or if theyre faulty.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeSetAttribute',
    },
    xmlNodeSetName: {
        summary: 'Sets the tag name of the specified XML node.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'the node to change the tag name of.' },
            { name: 'name', isOptional: false, isVariadic: false, summary: 'the new tag name to set.' },
        ],
        returns: 'returns true if successful, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeSetName',
    },
    xmlNodeSetValue: {
        summary: 'This function is made to be able to assign values to tags in XML files (eg.\nanything).',
        parameters: [
            { name: 'theXMLNode', isOptional: false, isVariadic: false, summary: 'The xml node you want to set the value of.' },
            { name: 'value', isOptional: false, isVariadic: false, summary: 'The string value you want the node to have.' },
            { name: 'setCDATA', isOptional: true, isVariadic: false, summary: 'A boolean indicating if you want the value to be enclosed inside CDATA tags.' },
        ],
        returns: 'returns true if value was successfully set, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlNodeSetValue',
    },
    xmlSaveFile: {
        summary: 'This function saves a loaded XML file.',
        parameters: [
            { name: 'rootNode', isOptional: false, isVariadic: false, summary: 'the root xmlnode of the loaded XML file.' },
        ],
        returns: 'returns true if save was successful, false if the xml file does not exist.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlSaveFile',
    },
    xmlUnloadFile: {
        summary: 'Unloads an XML document from memory.',
        parameters: [
            { name: 'node', isOptional: false, isVariadic: false, summary: 'root of the XML document to unload' },
        ],
        returns: 'returns true if the document was unloaded successfully, false otherwise.',
        wiki: 'https://wiki.multitheftauto.com/wiki/XmlUnloadFile',
    },
};
