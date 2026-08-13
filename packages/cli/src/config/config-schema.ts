import { isValidResourceName } from '@compiler/manifest/manifest-rules';
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

export interface OutputConfig {
    bundle: boolean;
    map: boolean;
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
    output: OutputConfig;
    transport: TransportConfig;
    development: DevelopmentConfig;
}

export const MANIFEST_FILE_NAME = '.luam.manifest';

export const NONE_TRANSPORT: NoneTransportConfig = { kind: 'none' };

export { isValidResourceName };
