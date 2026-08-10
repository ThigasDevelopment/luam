import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn, named, STRING } from '@mta-types/type-descriptor';

export const MTA_INPUT_SERVER: ApiCatalog = {
    getControlState: fn([named('Player'), STRING], BOOLEAN, 2),
    isKeyBound: fn([named('Player'), STRING, STRING, ANY], BOOLEAN, 2),
    setControlState: fn([named('Player'), STRING, BOOLEAN], BOOLEAN, 3),
};
