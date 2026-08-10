import type { ApiCatalog } from '@mta-types/api-declaration';

import { MTA_AUDIO_CLIENT } from './mta-audio-client';
import { MTA_BROWSER_CLIENT } from './mta-browser-client';
import { MTA_CAMERA_CLIENT } from './mta-camera-client';
import { MTA_CURSOR_CLIENT } from './mta-cursor-client';
import { MTA_DRAWING_CLIENT } from './mta-drawing-client';
import { MTA_EFFECTS_CLIENT } from './mta-effects-client';
import { MTA_ELEMENT_CLIENT } from './mta-element-client';
import { MTA_ENGINE_CLIENT } from './mta-engine-client';
import { MTA_EVENT_CLIENT } from './mta-event-client';
import { MTA_FIRE_CLIENT } from './mta-fire-client';
import { MTA_GUI_CLIENT } from './mta-gui-client';
import { MTA_INPUT_CLIENT } from './mta-input-client';
import { MTA_LIGHT_CLIENT } from './mta-light-client';
import { MTA_MARKER_CLIENT } from './mta-marker-client';
import { MTA_OBJECT_CLIENT } from './mta-object-client';
import { MTA_OUTPUT_CLIENT } from './mta-output-client';
import { MTA_PED_CLIENT } from './mta-ped-client';
import { MTA_PLAYER_CLIENT } from './mta-player-client';
import { MTA_PROJECTILE_CLIENT } from './mta-projectile-client';
import { MTA_RESOURCE_CLIENT } from './mta-resource-client';
import { MTA_SEARCHLIGHT_CLIENT } from './mta-searchlight-client';
import { MTA_SERVER_CLIENT } from './mta-server-client';
import { MTA_SVG_CLIENT } from './mta-svg-client';
import { MTA_UTILITY_CLIENT } from './mta-utility-client';
import { MTA_VARIABLE_CLIENT } from './mta-variable-client';
import { MTA_VEHICLE_CLIENT } from './mta-vehicle-client';
import { MTA_WATER_CLIENT } from './mta-water-client';
import { MTA_WEAPON_CLIENT } from './mta-weapon-client';
import { MTA_WORLD_CLIENT } from './mta-world-client';

export const MTA_CLIENT_GLOBALS: ApiCatalog = {
    ...MTA_AUDIO_CLIENT,
    ...MTA_BROWSER_CLIENT,
    ...MTA_CAMERA_CLIENT,
    ...MTA_CURSOR_CLIENT,
    ...MTA_DRAWING_CLIENT,
    ...MTA_EFFECTS_CLIENT,
    ...MTA_ELEMENT_CLIENT,
    ...MTA_ENGINE_CLIENT,
    ...MTA_EVENT_CLIENT,
    ...MTA_FIRE_CLIENT,
    ...MTA_GUI_CLIENT,
    ...MTA_INPUT_CLIENT,
    ...MTA_LIGHT_CLIENT,
    ...MTA_MARKER_CLIENT,
    ...MTA_OBJECT_CLIENT,
    ...MTA_OUTPUT_CLIENT,
    ...MTA_PED_CLIENT,
    ...MTA_PLAYER_CLIENT,
    ...MTA_PROJECTILE_CLIENT,
    ...MTA_RESOURCE_CLIENT,
    ...MTA_SEARCHLIGHT_CLIENT,
    ...MTA_SERVER_CLIENT,
    ...MTA_SVG_CLIENT,
    ...MTA_UTILITY_CLIENT,
    ...MTA_VARIABLE_CLIENT,
    ...MTA_VEHICLE_CLIENT,
    ...MTA_WATER_CLIENT,
    ...MTA_WEAPON_CLIENT,
    ...MTA_WORLD_CLIENT,
};
