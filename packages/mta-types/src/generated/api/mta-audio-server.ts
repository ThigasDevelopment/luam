import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_AUDIO_SERVER: ApiCatalog = {
    playSoundFrontEnd: fn([named('Player'), NUMBER], BOOLEAN, 2),
};
