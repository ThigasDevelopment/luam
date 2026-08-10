import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING, TABLE, tupleOf } from '@mta-types/type-descriptor';

export const MTA_TEAM_SHARED: ApiCatalog = {
    countPlayersInTeam: fn([named('Team')], NUMBER, 1),
    getPlayersInTeam: fn([named('Team')], TABLE, 1),
    getPlayerTeam: fn([named('Player')], named('Team'), 1),
    getTeamColor: fn([named('Team')], tupleOf([NUMBER, NUMBER, NUMBER]), 1),
    getTeamFriendlyFire: fn([named('Team')], BOOLEAN, 1),
    getTeamFromName: fn([STRING], named('Team'), 1),
    getTeamName: fn([named('Team')], STRING, 1),
};
