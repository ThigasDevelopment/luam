import type { ApiCatalog } from '@mta-types/api-declaration';
import { named, STRING } from '@mta-types/type-descriptor';

export const MTA_VARIABLE_SHARED: ApiCatalog = {
    eventName: STRING,
    resource: named('Resource'),
    resourceRoot: named('Element'),
    root: named('Element'),
    source: named('Element'),
    sourceTimer: named('Timer'),
};
