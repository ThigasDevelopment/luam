import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_CAMERA_CLIENT: ApiCatalog = {
    fadeCamera: fn([BOOLEAN, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 1),
    getCamera: fn([], named('Element'), 0),
    getCameraClip: fn([], tupleOf([BOOLEAN, BOOLEAN]), 0),
    getCameraFieldOfView: fn([STRING], NUMBER, 1),
    getCameraGoggleEffect: fn([], STRING, 0),
    getCameraInterior: fn([], NUMBER, 0),
    getCameraMatrix: fn([], tupleOf([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER]), 0),
    getCameraShakeLevel: fn([], NUMBER, 0),
    getCameraTarget: fn([], named('Element'), 0),
    getCameraViewMode: fn([], tupleOf([NUMBER, NUMBER]), 0),
    setCameraClip: fn([BOOLEAN, BOOLEAN], BOOLEAN, 0),
    setCameraFieldOfView: fn([STRING, NUMBER], BOOLEAN, 2),
    setCameraGoggleEffect: fn([STRING, BOOLEAN], BOOLEAN, 1),
    setCameraInterior: fn([NUMBER], BOOLEAN, 1),
    setCameraMatrix: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], BOOLEAN, 3),
    setCameraShakeLevel: fn([NUMBER], BOOLEAN, 1),
    setCameraTarget: fn([named('Player')], BOOLEAN, 1),
    setCameraViewMode: fn([NUMBER, NUMBER], BOOLEAN, 1),
};
