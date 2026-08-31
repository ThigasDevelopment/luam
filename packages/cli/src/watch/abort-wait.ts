export function untilAborted(signal: AbortSignal | null): Promise<void> {
    return new Promise<void>((resolveLoop) => {
        if (signal?.aborted === true) {
            resolveLoop();

            return;
        }

        const stop = (): void => {
            process.off('SIGINT', stop);
            signal?.removeEventListener('abort', stop);
            resolveLoop();
        };

        if (signal !== null) {
            signal.addEventListener('abort', stop, { once: true });
        }

        process.on('SIGINT', stop);
    });
}
