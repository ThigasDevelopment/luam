import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_SERVER_SERVER: ApiCatalog = {
    getMaxPlayers: fn([], NUMBER, 0),
    getServerHttpPort: fn([], NUMBER, 0),
    getServerName: fn([], STRING, 0),
    getServerPassword: fn([], STRING, 0),
    getServerPort: fn([], NUMBER, 0),
    isGlitchEnabled: fn([STRING], BOOLEAN, 1),
    setGlitchEnabled: fn([STRING, BOOLEAN], BOOLEAN, 2),
    setMaxPlayers: fn([NUMBER], BOOLEAN, 1),
    setServerPassword: fn([STRING], BOOLEAN, 1),
    shutdown: fn([STRING], BOOLEAN, 0),
};
