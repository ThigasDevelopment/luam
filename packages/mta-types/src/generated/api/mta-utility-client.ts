import type { ApiCatalog } from '@mta-types/api-declaration';
import { BOOLEAN, fn, NUMBER, STRING, TABLE } from '@mta-types/type-descriptor';

export const MTA_UTILITY_CLIENT: ApiCatalog = {
    createTrayNotification: fn([STRING, STRING, BOOLEAN], BOOLEAN, 1),
    downloadFile: fn([STRING], BOOLEAN, 1),
    getKeyboardLayout: fn([], TABLE, 0),
    getLocalization: fn([], TABLE, 0),
    getNetworkStats: fn([], TABLE, 0),
    getServerIp: fn([BOOLEAN], STRING, 0),
    isShowCollisionsEnabled: fn([], BOOLEAN, 0),
    isShowSoundEnabled: fn([], BOOLEAN, 0),
    isTransferBoxAlwaysVisible: fn([], BOOLEAN, 0),
    isTrayNotificationEnabled: fn([], BOOLEAN, 0),
    setClipboard: fn([STRING], BOOLEAN, 1),
    setWindowFlashing: fn([BOOLEAN, NUMBER], BOOLEAN, 1),
    showCol: fn([BOOLEAN], BOOLEAN, 1),
    showSound: fn([BOOLEAN], BOOLEAN, 1),
};
