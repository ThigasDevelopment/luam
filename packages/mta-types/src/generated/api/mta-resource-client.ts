import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, named } from '@mta-types/type-descriptor';

export const MTA_RESOURCE_CLIENT: ApiCatalog = {
    getResourceGUIElement: fn([named('Resource')], named('Element'), 0),
};
