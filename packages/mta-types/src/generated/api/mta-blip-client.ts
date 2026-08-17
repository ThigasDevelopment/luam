import type { ApiCatalog } from '@mta-types/api-declaration';
import { fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_BLIP_CLIENT: ApiCatalog = {
    createBlip: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], named('Blip'), 3),
    createBlipAttachedTo: fn([named('Element'), NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, NUMBER], named('Blip'), 1),
};
