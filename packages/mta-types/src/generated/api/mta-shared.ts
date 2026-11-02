import type { ApiCatalog } from '@mta-types/api-declaration';

import { MTA_ELEMENT_SHARED } from './mta-element-shared';
import { MTA_PED_SHARED } from './mta-ped-shared';
import { MTA_UTILITY_SHARED } from './mta-utility-shared';
import { MTA_UTILITY_SHARED_2 } from './mta-utility-shared-2';
import { MTA_UTILITY_SHARED_3 } from './mta-utility-shared-3';
import { MTA_VARIABLE_SHARED } from './mta-variable-shared';
import { MTA_VEHICLE_SHARED } from './mta-vehicle-shared';

export const MTA_SHARED_GLOBALS: ApiCatalog = {
    ...MTA_ELEMENT_SHARED,
    ...MTA_PED_SHARED,
    ...MTA_UTILITY_SHARED,
    ...MTA_UTILITY_SHARED_2,
    ...MTA_UTILITY_SHARED_3,
    ...MTA_VARIABLE_SHARED,
    ...MTA_VEHICLE_SHARED,
};
