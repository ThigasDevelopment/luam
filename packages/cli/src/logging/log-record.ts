export type DevelopmentLogEnvironment = 'server' | 'client';

export type DevelopmentLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface DevelopmentLogSource {
    path: string;
    line: number;
    symbol?: string;
}

export interface DevelopmentLogRecord {
    timestamp: Date;
    environment: DevelopmentLogEnvironment;
    level: DevelopmentLogLevel;
    message: string;
    resource: string;
    source?: DevelopmentLogSource;
}
