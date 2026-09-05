import type { Readable, Writable } from 'node:stream';

export interface TerminalInput extends Readable {
    readonly isTTY?: boolean;
    readonly isRaw?: boolean;
    setRawMode?(mode: boolean): unknown;
}

export interface SessionLine {
    verb: string;
    args: readonly string[];
    line: string;
}

export interface SessionConsoleInputOptions {
    interrupt: () => void;
    verbs?: readonly string[];
    onSessionLine?: ((line: SessionLine) => void) | undefined;
    echo?: Writable | undefined;
}

export interface ServerConsoleInput {
    close(): void;
}

const INTERRUPT = '\u0003';

const BACKSPACE = '\u007f';

const ALTERNATE_BACKSPACE = '\u0008';

export function splitSessionLine(line: string): SessionLine {
    const [verb = '', ...args] = line.trim().split(/\s+/);

    return { verb, args, line };
}

export function connectSessionConsoleInput(input: TerminalInput, output: Writable, options: SessionConsoleInputOptions): ServerConsoleInput {
    const wasPaused = input.isPaused();
    const changedRawMode = input.isTTY === true && input.isRaw !== true && input.setRawMode !== undefined;
    const verbs = new Set(options.verbs ?? []);
    const echo = input.isTTY === true ? (options.echo ?? process.stdout) : null;
    let closed = false;
    let buffer = '';
    let pendingReturn = false;

    if (changedRawMode) {
        input.setRawMode?.(true);
    }

    const erase = (): void => {
        if (echo === null || buffer.length === 0) {
            return;
        }

        echo.write(`\r${' '.repeat(buffer.length)}\r`);
    };
    const dispatch = (line: string): void => {
        erase();
        buffer = '';

        if (line.startsWith(' ')) {
            output.write(`${line.slice(1)}\n`);

            return;
        }

        const parsed = splitSessionLine(line);

        if (verbs.has(parsed.verb) && options.onSessionLine !== undefined) {
            options.onSessionLine(parsed);

            return;
        }

        output.write(`${line}\n`);
    };
    const readLines = (content: string): void => {
        for (const character of content) {
            const afterReturn = pendingReturn;

            pendingReturn = character === '\r';

            if (character === INTERRUPT) {
                erase();
                buffer = '';
                options.interrupt();

                return;
            }

            if (character === '\n' && afterReturn) {
                continue;
            }

            if (character === '\n' || character === '\r') {
                dispatch(buffer);

                continue;
            }

            if (character === BACKSPACE || character === ALTERNATE_BACKSPACE) {
                if (buffer.length > 0) {
                    buffer = buffer.slice(0, -1);
                    echo?.write('\b \b');
                }

                continue;
            }

            buffer += character;
            echo?.write(character);
        }
    };
    const pipe = (chunk: Buffer | string): void => {
        const content = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        const interruptIndex = content.indexOf(3);

        if (interruptIndex < 0) {
            output.write(chunk);

            return;
        }

        if (interruptIndex > 0) {
            output.write(content.subarray(0, interruptIndex));
        }

        options.interrupt();
    };
    const forward = (chunk: Buffer | string): void => {
        if (verbs.size === 0) {
            pipe(chunk);

            return;
        }

        readLines(typeof chunk === 'string' ? chunk : chunk.toString('utf8'));
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

export function connectServerConsoleInput(input: TerminalInput, output: Writable, interrupt: () => void): ServerConsoleInput {
    return connectSessionConsoleInput(input, output, { interrupt });
}
