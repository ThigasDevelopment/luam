import type { Logger } from '@cli/reporting/logger';
import { PLAIN_CAPABILITY, type OutputCapability } from '@cli/reporting/output-capability';
import { createOutputStyle, type MarkerName, type OutputStyle, type StyleTone } from '@cli/reporting/output-style';

export type PaintSink = (text: string) => void;

export interface Reporter {
    style: OutputStyle;
    capability: OutputCapability;
    paint: PaintSink;
    raw(text: string): void;
    rawWarn(text: string): void;
    rawError(text: string): void;
    info(message: string): void;
    detail(message: string): void;
    success(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

function writeToStandardError(text: string): void {
    process.stderr.write(text);
}

export function createReporter(logger: Logger, capability: OutputCapability = PLAIN_CAPABILITY, paint: PaintSink = writeToStandardError): Reporter {
    const style = createOutputStyle(capability);

    function decorate(marker: MarkerName, tone: StyleTone, message: string): string {
        if (!capability.interactive) {
            return message;
        }

        return `${style.paint(tone, style.marker(marker))} ${style.paint(tone, message)}`;
    }

    return {
        style,
        capability,
        paint,
        raw: (text: string): void => {
            logger.info(text);
        },
        rawWarn: (text: string): void => {
            logger.warn(text);
        },
        rawError: (text: string): void => {
            logger.error(text);
        },
        info: (message: string): void => {
            logger.info(message);
        },
        detail: (message: string): void => {
            logger.info(capability.interactive ? style.paint('muted', message) : message);
        },
        success: (message: string): void => {
            logger.info(decorate('success', 'success', message));
        },
        warn: (message: string): void => {
            logger.warn(decorate('warning', 'warning', message));
        },
        error: (message: string): void => {
            logger.error(decorate('failure', 'error', message));
        },
    };
}
