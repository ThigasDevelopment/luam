import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, TABLE } from '@mta-types/type-descriptor';

export const MTA_ELEMENT_SHARED: ApiCatalog = {
    setElementMatrix: fn([named('Element'), TABLE], BOOLEAN, 2),
};
