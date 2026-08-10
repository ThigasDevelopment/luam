import type { RuntimeHelperName } from '@runtime/helpers';

export interface HttpTransportConfig {
    kind: 'http';
    host: string;
    port: number;
    resource: string;
    username: string;
    password: string;
    refreshFunction: string;
    restartFunction: string;
}

export interface NoneTransportConfig {
    kind: 'none';
}

export type TransportConfig = HttpTransportConfig | NoneTransportConfig;

export interface DevelopmentLogsConfig {
    enabled: boolean;
    maxMessageLength: number;
    rateLimit: number;
    rateWindowMs: number;
}

export interface DevelopmentConfig {
    logs: DevelopmentLogsConfig;
}

export interface LuamConfig {
    name: string;
    author: string | null;
    version: string | null;
    description: string | null;
    sourceDirs: string[];
    assetDirs: string[];
    outDir: string;
    loadOrder: string[];
    oop: boolean;
    helpers: RuntimeHelperName[];
    serverPath: string | null;
    resourcesDir: string;
    transport: TransportConfig;
    development: DevelopmentConfig;
}

export const CONFIG_FILE_NAME = 'luam.json';

export const DEFAULT_SOURCE_DIRS: readonly string[] = ['src'];

export const DEFAULT_ASSET_DIRS: readonly string[] = ['assets'];

export const DEFAULT_OUT_DIR = 'build';

export const DEFAULT_OOP = false;

export const DEFAULT_RESOURCES_DIR = 'mods/deathmatch/resources';

export const DEFAULT_HTTP_HOST = '127.0.0.1';

export const DEFAULT_HTTP_PORT = 22005;

export const DEFAULT_REFRESH_FUNCTION = 'refreshResources';

export const DEFAULT_RESTART_FUNCTION = 'restartResource';

export const NONE_TRANSPORT: NoneTransportConfig = { kind: 'none' };

export const DEFAULT_DEVELOPMENT_LOGS: DevelopmentLogsConfig = {
    enabled: false,
    maxMessageLength: 4096,
    rateLimit: 30,
    rateWindowMs: 1000,
};

const RESOURCE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isValidResourceName(name: string): boolean {
    return RESOURCE_NAME.test(name);
}
