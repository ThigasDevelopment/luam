import type { ApiCatalog } from '@mta-types/api-declaration';
import { named } from '@mta-types/type-descriptor';

export const MTA_VARIABLE_CLIENT: ApiCatalog = {
    guiRoot: named('Element'),
    localPlayer: named('Player'),
};
