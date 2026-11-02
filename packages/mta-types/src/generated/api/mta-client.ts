import type { ApiCatalog } from '@mta-types/api-declaration';

import { MTA_CAMERA_CLIENT } from './mta-camera-client';
import { MTA_PLAYER_CLIENT } from './mta-player-client';
import { MTA_UTILITY_CLIENT } from './mta-utility-client';
import { MTA_UTILITY_CLIENT_2 } from './mta-utility-client-2';
import { MTA_UTILITY_CLIENT_3 } from './mta-utility-client-3';
import { MTA_UTILITY_CLIENT_4 } from './mta-utility-client-4';
import { MTA_UTILITY_CLIENT_5 } from './mta-utility-client-5';
import { MTA_UTILITY_CLIENT_6 } from './mta-utility-client-6';
import { MTA_UTILITY_CLIENT_7 } from './mta-utility-client-7';
import { MTA_VARIABLE_CLIENT } from './mta-variable-client';
import { MTA_VEHICLE_CLIENT } from './mta-vehicle-client';
import { MTA_WEAPON_CLIENT } from './mta-weapon-client';

export const MTA_CLIENT_GLOBALS: ApiCatalog = {
    ...MTA_CAMERA_CLIENT,
    ...MTA_PLAYER_CLIENT,
    ...MTA_UTILITY_CLIENT,
    ...MTA_UTILITY_CLIENT_2,
    ...MTA_UTILITY_CLIENT_3,
    ...MTA_UTILITY_CLIENT_4,
    ...MTA_UTILITY_CLIENT_5,
    ...MTA_UTILITY_CLIENT_6,
    ...MTA_UTILITY_CLIENT_7,
    ...MTA_VARIABLE_CLIENT,
    ...MTA_VEHICLE_CLIENT,
    ...MTA_WEAPON_CLIENT,
};
