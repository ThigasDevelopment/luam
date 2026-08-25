import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_OBJECT_CLIENT: ApiCatalog = {
    getObjectMass: fn([named('Object')], NUMBER, 1),
    getObjectProperty: fn([named('Object'), STRING], ANY, 2),
    setObjectMass: fn([named('Object'), NUMBER], BOOLEAN, 2),
    setObjectProperty: fn([named('Object'), STRING, ANY], BOOLEAN, 3),
};
