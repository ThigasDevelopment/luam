import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named } from '@mta-types/type-descriptor';

export const MTA_PED_SHARED: ApiCatalog = {
    doesPedHaveJetPack: fn([named('Ped')], BOOLEAN, 1),
    isPedOnFire: fn([named('Ped')], BOOLEAN, 1),
    setPedOnFire: fn([named('Ped'), BOOLEAN], BOOLEAN, 2),
};
