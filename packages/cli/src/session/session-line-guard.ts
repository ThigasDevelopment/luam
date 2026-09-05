import type { Logger } from '@cli/reporting/logger';
import type { PaintSink } from '@cli/reporting/reporter';

export interface SessionLineGuard {
    erase(): void;
    redraw(): void;
}

export function guardedLogger(logger: Logger, guard: SessionLineGuard): Logger {
    const around = (write: (message: string) => void): ((message: string) => void) => {
        return (message: string): void => {
            guard.erase();
            write(message);
            guard.redraw();
        };
    };

    return {
        info: around((message: string): void => logger.info(message)),
        warn: around((message: string): void => logger.warn(message)),
        error: around((message: string): void => logger.error(message)),
    };
}

export function guardedPaint(paint: PaintSink, guard: SessionLineGuard): PaintSink {
    return (text: string): void => {
        guard.erase();
        paint(text);
        guard.redraw();
    };
}
