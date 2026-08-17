import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, tupleOf } from '@mta-types/type-descriptor';

export const MTA_CAMERA_SERVER: ApiCatalog = {
    fadeCamera: fn([named('Player'), BOOLEAN, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 2),
    getCameraInterior: fn([named('Player')], NUMBER, 1),
    getCameraMatrix: fn([named('Player')], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER]), 1),
    getCameraTarget: fn([named('Player')], named('Element'), 1),
    setCameraInterior: fn([named('Player'), NUMBER], BOOLEAN, 2),
    setCameraMatrix: fn([named('Player'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setCameraTarget: fn([named('Player'), named('Player')], BOOLEAN, 1),
};
