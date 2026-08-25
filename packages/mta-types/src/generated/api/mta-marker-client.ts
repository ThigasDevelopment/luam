import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, literal, named, NUMBER, unionOf } from '@mta-types/type-descriptor';

export const MTA_MARKER_CLIENT: ApiCatalog = {
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
            BOOLEAN,
        ],
        named('Marker'),
        3,
    ),
    isCoronaReflectionEnabled: fn([named('Marker')], BOOLEAN, 1),
    setCoronaReflectionEnabled: fn([named('Marker'), BOOLEAN], BOOLEAN, 2),
};
