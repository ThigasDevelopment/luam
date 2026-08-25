import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, literal, named, NUMBER, unionOf } from '@mta-types/type-descriptor';

export const MTA_MARKER_SERVER: ApiCatalog = {
    createMarker: fn(
        [
            NUMBER,
            NUMBER,
            NUMBER,
            unionOf([literal('checkpoint'), literal('ring'), literal('cylinder'), literal('arrow'), literal('corona')]),
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            NUMBER,
            named('Element'),
            BOOLEAN,
        ],
        named('Marker'),
        3,
    ),
};
