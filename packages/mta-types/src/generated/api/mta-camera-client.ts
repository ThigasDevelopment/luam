import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER } from '@mta-types/type-descriptor';

export const MTA_CAMERA_CLIENT: ApiCatalog = {
    getCameraShakeLevel: fn([], NUMBER, 0),
    setCameraShakeLevel: fn([NUMBER], BOOLEAN, 1),
};
