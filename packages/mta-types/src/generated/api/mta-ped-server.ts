import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_PED_SERVER: ApiCatalog = {
    createPed: fn([NUMBER, NUMBER, NUMBER, NUMBER, NUMBER, BOOLEAN], named('Ped'), 4),
    getPedGravity: fn([named('Ped')], NUMBER, 1),
    reloadPedWeapon: fn([named('Ped')], BOOLEAN, 1),
    setPedChoking: fn([named('Ped'), BOOLEAN], BOOLEAN, 2),
    setPedGravity: fn([named('Ped'), NUMBER], BOOLEAN, 2),
    setPedWearingJetpack: fn([named('Ped'), BOOLEAN], BOOLEAN, 2),
};
