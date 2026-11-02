import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER } from '@mta-types/type-descriptor';

export const MTA_VEHICLE_CLIENT: ApiCatalog = {
    getHelicopterRotorSpeed: fn([named('Vehicle')], NUMBER, 1),
    setHelicopterRotorSpeed: fn([named('Vehicle'), NUMBER], BOOLEAN, 2),
};
