import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_FILE_SHARED: ApiCatalog = {
    fileClose: fn([named('File')], BOOLEAN, 1),
    fileCopy: fn([STRING, STRING, BOOLEAN], BOOLEAN, 2),
    fileCreate: fn([STRING], named('File'), 1),
    fileDelete: fn([STRING], BOOLEAN, 1),
    fileExists: fn([STRING], BOOLEAN, 1),
    fileFlush: fn([named('File')], BOOLEAN, 1),
    fileGetPath: fn([named('File')], STRING, 1),
    fileGetPos: fn([named('File')], NUMBER, 1),
    fileGetSize: fn([named('File')], NUMBER, 1),
    fileIsEOF: fn([named('File')], BOOLEAN, 1),
    fileOpen: fn([STRING, BOOLEAN], named('File'), 1),
    fileRead: fn([named('File'), NUMBER], STRING, 2),
    fileRename: fn([STRING, STRING], BOOLEAN, 2),
    fileSetPos: fn([named('File'), NUMBER], NUMBER, 2),
    fileWrite: fn([named('File'), STRING, STRING, STRING], NUMBER, 2, true),
};
