import type { ApiCatalog } from '@mta-types/api-declaration';
import { ANY, BOOLEAN, fn } from '@mta-types/type-descriptor';

export const MTA_AUDIO_SHARED: ApiCatalog = {
    playSoundFrontEnd: fn([ANY, ANY], BOOLEAN, 1),
};
