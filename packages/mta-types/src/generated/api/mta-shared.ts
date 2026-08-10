import type { ApiCatalog } from '@mta-types/api-declaration';

import { MTA_AUDIO_SHARED } from './mta-audio-shared';
import { MTA_BLIP_SHARED } from './mta-blip-shared';
import { MTA_CAMERA_SHARED } from './mta-camera-shared';
import { MTA_CLOTHES_SHARED } from './mta-clothes-shared';
import { MTA_COLLISION_SHARED } from './mta-collision-shared';
import { MTA_CURSOR_SHARED } from './mta-cursor-shared';
import { MTA_ELEMENT_SHARED } from './mta-element-shared';
import { MTA_EVENT_SHARED } from './mta-event-shared';
import { MTA_EXPLOSION_SHARED } from './mta-explosion-shared';
import { MTA_FILE_SHARED } from './mta-file-shared';
import { MTA_INPUT_SHARED } from './mta-input-shared';
import { MTA_MARKER_SHARED } from './mta-marker-shared';
import { MTA_OBJECT_SHARED } from './mta-object-shared';
import { MTA_OUTPUT_SHARED } from './mta-output-shared';
import { MTA_PED_SHARED } from './mta-ped-shared';
import { MTA_PICKUP_SHARED } from './mta-pickup-shared';
import { MTA_PLAYER_SHARED } from './mta-player-shared';
import { MTA_PROJECTILE_SHARED } from './mta-projectile-shared';
import { MTA_RADAR_SHARED } from './mta-radar-shared';
import { MTA_RESOURCE_SHARED } from './mta-resource-shared';
import { MTA_SERVER_SHARED } from './mta-server-shared';
import { MTA_TEAM_SHARED } from './mta-team-shared';
import { MTA_UTILITY_SHARED } from './mta-utility-shared';
import { MTA_VARIABLE_SHARED } from './mta-variable-shared';
import { MTA_VEHICLE_SHARED } from './mta-vehicle-shared';
import { MTA_WATER_SHARED } from './mta-water-shared';
import { MTA_WEAPON_SHARED } from './mta-weapon-shared';
import { MTA_WORLD_SHARED } from './mta-world-shared';
import { MTA_XML_SHARED } from './mta-xml-shared';

export const MTA_SHARED_GLOBALS: ApiCatalog = {
    ...MTA_AUDIO_SHARED,
    ...MTA_BLIP_SHARED,
    ...MTA_CAMERA_SHARED,
    ...MTA_CLOTHES_SHARED,
    ...MTA_COLLISION_SHARED,
    ...MTA_CURSOR_SHARED,
    ...MTA_ELEMENT_SHARED,
    ...MTA_EVENT_SHARED,
    ...MTA_EXPLOSION_SHARED,
    ...MTA_FILE_SHARED,
    ...MTA_INPUT_SHARED,
    ...MTA_MARKER_SHARED,
    ...MTA_OBJECT_SHARED,
    ...MTA_OUTPUT_SHARED,
    ...MTA_PED_SHARED,
    ...MTA_PICKUP_SHARED,
    ...MTA_PLAYER_SHARED,
    ...MTA_PROJECTILE_SHARED,
    ...MTA_RADAR_SHARED,
    ...MTA_RESOURCE_SHARED,
    ...MTA_SERVER_SHARED,
    ...MTA_TEAM_SHARED,
    ...MTA_UTILITY_SHARED,
    ...MTA_VARIABLE_SHARED,
    ...MTA_VEHICLE_SHARED,
    ...MTA_WATER_SHARED,
    ...MTA_WEAPON_SHARED,
    ...MTA_WORLD_SHARED,
    ...MTA_XML_SHARED,
};
