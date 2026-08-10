import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, tupleOf } from '@mta-types/type-descriptor';

export const MTA_CAMERA_CLIENT: ApiCatalog = {
    getCamera: fn([], named('Element'), 0),
    getCameraClip: fn([], tupleOf([BOOLEAN, BOOLEAN]), 0),
    getCameraFieldOfView: fn([STRING], NUMBER, 1),
    getCameraGoggleEffect: fn([], STRING, 0),
    getCameraShakeLevel: fn([], NUMBER, 0),
    getCameraViewMode: fn([], tupleOf([NUMBER, NUMBER]), 0),
    setCameraClip: fn([BOOLEAN, BOOLEAN], BOOLEAN, 0),
    setCameraFieldOfView: fn([STRING, NUMBER], BOOLEAN, 2),
    setCameraGoggleEffect: fn([STRING, BOOLEAN], BOOLEAN, 1),
    setCameraShakeLevel: fn([NUMBER], BOOLEAN, 1),
    setCameraViewMode: fn([NUMBER, NUMBER], BOOLEAN, 1),
};
