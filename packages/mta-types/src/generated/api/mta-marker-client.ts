import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named } from '@mta-types/type-descriptor';

export const MTA_MARKER_CLIENT: ApiCatalog = {
    isCoronaReflectionEnabled: fn([named('Marker')], BOOLEAN, 1),
    setCoronaReflectionEnabled: fn([named('Marker'), BOOLEAN], BOOLEAN, 2),
};
