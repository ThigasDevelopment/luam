import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_CAMERA_SHARED: ApiCatalog = {
    fadeCamera: fn([ANY, ANY, NUMBER, NUMBER, NUMBER, ANY], BOOLEAN, 1),
    getCameraInterior: fn([ANY], NUMBER, 0),
    getCameraMatrix: fn([ANY], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER]), 0),
    getCameraTarget: fn([ANY], named('Element'), 0),
    setCameraInterior: fn([ANY, ANY], BOOLEAN, 1),
    setCameraMatrix: fn([ANY, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, ANY], BOOLEAN, 3),
    setCameraTarget: fn([named('Player'), ANY], BOOLEAN, 1),
};
