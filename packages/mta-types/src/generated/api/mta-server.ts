import type { ApiCatalog } from '@mta-types/api-declaration';

import { MTA_ADMIN_SERVER } from './mta-admin-server';
import { MTA_PLAYER_SERVER } from './mta-player-server';
import { MTA_UTILITY_SERVER } from './mta-utility-server';
import { MTA_UTILITY_SERVER_2 } from './mta-utility-server-2';
import { MTA_VARIABLE_SERVER } from './mta-variable-server';

export const MTA_SERVER_GLOBALS: ApiCatalog = {
    ...MTA_ADMIN_SERVER,
    ...MTA_PLAYER_SERVER,
    ...MTA_UTILITY_SERVER,
    ...MTA_UTILITY_SERVER_2,
    ...MTA_VARIABLE_SERVER,
};
