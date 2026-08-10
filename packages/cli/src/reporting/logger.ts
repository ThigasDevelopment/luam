export interface Logger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

export function createConsoleLogger(): Logger {
    return {
        info: (message: string): void => {
            process.stdout.write(`${message}\n`);
        },
        warn: (message: string): void => {
            process.stderr.write(`${message}\n`);
        },
        error: (message: string): void => {
            process.stderr.write(`${message}\n`);
        },
    };
}
