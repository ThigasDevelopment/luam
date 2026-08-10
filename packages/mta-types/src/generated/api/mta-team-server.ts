import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, named, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_TEAM_SERVER: ApiCatalog = {
    createTeam: fn([STRING, NUMBER, NUMBER, NUMBER], named('Team'), 1),
    setPlayerTeam: fn([named('Player'), named('Team')], BOOLEAN, 2),
    setTeamColor: fn([named('Team'), NUMBER, NUMBER, NUMBER], BOOLEAN, 4),
    setTeamFriendlyFire: fn([named('Team'), BOOLEAN], BOOLEAN, 2),
    setTeamName: fn([named('Team'), STRING], BOOLEAN, 2),
};
