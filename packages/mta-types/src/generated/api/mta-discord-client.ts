import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, STRING } from '@mta-types/type-descriptor';

export const MTA_DISCORD_CLIENT: ApiCatalog = {
    getDiscordRichPresenceUserID: fn([], STRING, 0),
    isDiscordRichPresenceConnected: fn([], BOOLEAN, 0),
    resetDiscordRichPresenceData: fn([], BOOLEAN, 0),
    setDiscordApplicationID: fn([STRING], BOOLEAN, 1),
    setDiscordRichPresenceAsset: fn([STRING, STRING], BOOLEAN, 2),
    setDiscordRichPresenceButton: fn([NUMBER, STRING, STRING], BOOLEAN, 3),
    setDiscordRichPresenceDetails: fn([STRING], BOOLEAN, 1),
    setDiscordRichPresenceEndTime: fn([NUMBER], BOOLEAN, 1),
    setDiscordRichPresencePartySize: fn([NUMBER, NUMBER], BOOLEAN, 2),
    setDiscordRichPresenceSmallAsset: fn([STRING, STRING], BOOLEAN, 2),
    setDiscordRichPresenceStartTime: fn([NUMBER], BOOLEAN, 1),
    setDiscordRichPresenceState: fn([STRING], BOOLEAN, 1),
};
