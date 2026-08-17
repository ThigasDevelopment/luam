import type { Readable, Writable } from 'node:stream';

export interface TerminalInput extends Readable {
    readonly isTTY?: boolean;
    readonly isRaw?: boolean;
    setRawMode?(mode: boolean): unknown;
}

export interface ServerConsoleInput {
    close(): void;
}

export function connectServerConsoleInput(input: TerminalInput, output: Writable, interrupt: () => void): ServerConsoleInput {
    const wasPaused = input.isPaused();
    const changedRawMode = input.isTTY === true && input.isRaw !== true && input.setRawMode !== undefined;
    let closed = false;

    if (changedRawMode) {
        input.setRawMode?.(true);
    }

    const forward = (chunk: Buffer | string): void => {
        const content = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        const interruptIndex = content.indexOf(3);

        if (interruptIndex < 0) {
            output.write(chunk);

            return;
        }

        if (interruptIndex > 0) {
            output.write(content.subarray(0, interruptIndex));
        }

        interrupt();
    };
    const close = (): void => {
        if (closed) {
            return;
        }

        closed = true;
        input.off('data', forward);

        if (changedRawMode) {
            input.setRawMode?.(false);
        }

        if (wasPaused) {
            input.pause();
        }
    };

    input.on('data', forward);
    input.resume();

    return { close };
}
