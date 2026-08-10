import type { ApiCatalog } from '@mta-types/api-declaration';

import { MTA_ACCOUNT_SERVER } from './mta-account-server';
import { MTA_ACL_SERVER } from './mta-acl-server';
import { MTA_ADMIN_SERVER } from './mta-admin-server';
import { MTA_ANNOUNCEMENT_SERVER } from './mta-announcement-server';
import { MTA_ELEMENT_SERVER } from './mta-element-server';
import { MTA_EVENT_SERVER } from './mta-event-server';
import { MTA_INPUT_SERVER } from './mta-input-server';
import { MTA_MAP_SERVER } from './mta-map-server';
import { MTA_MODULE_SERVER } from './mta-module-server';
import { MTA_OUTPUT_SERVER } from './mta-output-server';
import { MTA_PED_SERVER } from './mta-ped-server';
import { MTA_PICKUP_SERVER } from './mta-pickup-server';
import { MTA_PLAYER_SERVER } from './mta-player-server';
import { MTA_RESOURCE_SERVER } from './mta-resource-server';
import { MTA_SERVER_SERVER } from './mta-server-server';
import { MTA_SETTINGS_SERVER } from './mta-settings-server';
import { MTA_SQL_SERVER } from './mta-sql-server';
import { MTA_TEAM_SERVER } from './mta-team-server';
import { MTA_TEXT_SERVER } from './mta-text-server';
import { MTA_UTILITY_SERVER } from './mta-utility-server';
import { MTA_VARIABLE_SERVER } from './mta-variable-server';
import { MTA_VEHICLE_SERVER } from './mta-vehicle-server';
import { MTA_WEAPON_SERVER } from './mta-weapon-server';
import { MTA_WORLD_SERVER } from './mta-world-server';

export const MTA_SERVER_GLOBALS: ApiCatalog = {
    ...MTA_ACCOUNT_SERVER,
    ...MTA_ACL_SERVER,
    ...MTA_ADMIN_SERVER,
    ...MTA_ANNOUNCEMENT_SERVER,
    ...MTA_ELEMENT_SERVER,
    ...MTA_EVENT_SERVER,
    ...MTA_INPUT_SERVER,
    ...MTA_MAP_SERVER,
    ...MTA_MODULE_SERVER,
    ...MTA_OUTPUT_SERVER,
    ...MTA_PED_SERVER,
    ...MTA_PICKUP_SERVER,
    ...MTA_PLAYER_SERVER,
    ...MTA_RESOURCE_SERVER,
    ...MTA_SERVER_SERVER,
    ...MTA_SETTINGS_SERVER,
    ...MTA_SQL_SERVER,
    ...MTA_TEAM_SERVER,
    ...MTA_TEXT_SERVER,
    ...MTA_UTILITY_SERVER,
    ...MTA_VARIABLE_SERVER,
    ...MTA_VEHICLE_SERVER,
    ...MTA_WEAPON_SERVER,
    ...MTA_WORLD_SERVER,
};
