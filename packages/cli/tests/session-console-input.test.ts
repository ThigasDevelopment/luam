import { PassThrough } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { SESSION_VERBS } from '@cli/session/session-commands';
import { connectServerConsoleInput, connectSessionConsoleInput, type ServerConsoleInput, type SessionLine, type TerminalInput } from '@cli/server/session-console-input';

class FakeTerminalInput extends PassThrough implements TerminalInput {
    readonly isTTY: boolean;
    isRaw = false;
    readonly rawModes: boolean[] = [];

    constructor(isTTY = true) {
        super();
        this.isTTY = isTTY;
    }

    setRawMode(mode: boolean): this {
        this.isRaw = mode;
        this.rawModes.push(mode);

        return this;
    }
}

interface Session {
    input: FakeTerminalInput;
    line: ServerConsoleInput;
    forwarded(): string;
    echoed(): string;
    lines: SessionLine[];
    interrupts: number;
    close(): void;
}

function session(isTTY = true): Session {
    const input = new FakeTerminalInput(isTTY);
    const output = new PassThrough();
    const echo = new PassThrough();
    const lines: SessionLine[] = [];
    let forwarded = '';
    let painted = '';

    output.on('data', (chunk: Buffer) => {
        forwarded += chunk.toString();
    });
    echo.on('data', (chunk: Buffer) => {
        painted += chunk.toString();
    });

    const state = {
        input,
        get line(): ServerConsoleInput {
            return connection;
        },
        forwarded: (): string => forwarded,
        echoed: (): string => painted,
        lines,
        interrupts: 0,
        close: (): void => connection.close(),
    };
    const connection = connectSessionConsoleInput(input, output, {
        interrupt: (): void => {
            state.interrupts += 1;
        },
        verbs: SESSION_VERBS,
        onSessionLine: (line: SessionLine): void => {
            lines.push(line);
        },
        echo,
    });

    return state;
}

describe('session console input', () => {
    it('forwards input with local terminal echo disabled and restores the previous state', () => {
        const input = new FakeTerminalInput();
        const output = new PassThrough();
        let forwarded = '';

        input.pause();
        output.on('data', (chunk: Buffer) => {
            forwarded += chunk.toString();
        });

        const connection = connectServerConsoleInput(input, output, () => undefined);

        input.write('start resource\r');
        connection.close();

        expect(forwarded).toBe('start resource\r');
        expect(input.rawModes).toEqual([true, false]);
        expect(input.isPaused()).toBe(true);
    });

    it('turns Ctrl+C into an interrupt without forwarding it to the server', () => {
        const input = new FakeTerminalInput();
        const output = new PassThrough();
        let forwarded = '';
        let interrupts = 0;

        output.on('data', (chunk: Buffer) => {
            forwarded += chunk.toString();
        });

        const connection = connectServerConsoleInput(input, output, () => {
            interrupts += 1;
        });

        input.write(Buffer.from('refreshdiscarded'));
        connection.close();

        expect(forwarded).toBe('refresh');
        expect(interrupts).toBe(1);
    });

    it('preserves an existing raw terminal mode when closed repeatedly', () => {
        const input = new FakeTerminalInput();
        const output = new PassThrough();

        input.isRaw = true;

        const connection = connectServerConsoleInput(input, output, () => undefined);

        connection.close();
        connection.close();

        expect(input.rawModes).toEqual([]);
        expect(input.isRaw).toBe(true);
    });
});

describe('the reserved-verb split', () => {
    it('sends a server command through unchanged and echoes it once', () => {
        const test = session();

        test.input.write('refresh\r');

        expect(test.forwarded()).toBe('refresh\n');
        expect(test.lines).toEqual([]);
        expect(test.echoed()).toBe(`refresh\r${' '.repeat(7)}\r`);
        test.close();
    });

    it('keeps a session verb away from the console and splits its arguments', () => {
        const test = session();

        test.input.write('ensure resource-a\n');

        expect(test.forwarded()).toBe('');
        expect(test.lines).toEqual([{ verb: 'ensure', args: ['resource-a'], line: 'ensure resource-a' }]);
        test.close();
    });

    it('matches on the whole first word', () => {
        const test = session();

        test.input.write('ensureing now\n');
        test.input.write('ensure-all\n');

        expect(test.forwarded()).toBe('ensureing now\nensure-all\n');
        expect(test.lines).toEqual([]);
        test.close();
    });

    it('forwards a line that begins with a space, without the space', () => {
        const test = session();

        test.input.write(' ensure resource-a\n');

        expect(test.forwarded()).toBe('ensure resource-a\n');
        expect(test.lines).toEqual([]);
        test.close();
    });

    it('dispatches every line of a paste in order', () => {
        const test = session();

        test.input.write('refresh\nensure resource-a\r\nstart resource-b\n');

        expect(test.forwarded()).toBe('refresh\nstart resource-b\n');
        expect(test.lines.map((line) => line.line)).toEqual(['ensure resource-a']);
        test.close();
    });

    it('erases one character with backspace and never past the start of the line', () => {
        const test = session();

        test.input.write('lisst\n');

        expect(test.forwarded()).toBe('st\n');
        expect(test.echoed()).toContain('\b \b');
        test.close();
    });

    it('interrupts mid-line and forwards nothing', () => {
        const test = session();

        test.input.write('refresh\n');

        expect(test.interrupts).toBe(1);
        expect(test.forwarded()).toBe('');
        expect(test.lines).toEqual([]);
        test.close();
    });

    it('keeps the split and drops the echo when stdin is not a terminal', () => {
        const test = session(false);

        test.input.write('ensure resource-a\nrefresh\n');

        expect(test.input.rawModes).toEqual([]);
        expect(test.echoed()).toBe('');
        expect(test.forwarded()).toBe('refresh\n');
        expect(test.lines.map((line) => line.verb)).toEqual(['ensure']);
        test.close();
    });

    it('erases and redraws the half-typed line around other output', () => {
        const test = session();

        test.input.write('ensu');

        expect(test.echoed()).toBe('ensu');

        test.line.eraseLine();
        test.line.redrawLine();

        expect(test.echoed()).toBe(`ensu\r${' '.repeat(4)}\rensu`);

        test.input.write('re resource-a\n');

        expect(test.lines.map((entry) => entry.line)).toEqual(['ensure resource-a']);
        test.close();
    });

    it('erases and redraws nothing when no line is being typed', () => {
        const test = session();

        test.line.eraseLine();
        test.line.redrawLine();

        expect(test.echoed()).toBe('');
        test.close();
    });

    it('forwards byte for byte when it is constructed with no verbs', () => {
        const input = new FakeTerminalInput();
        const output = new PassThrough();
        let forwarded = '';

        output.on('data', (chunk: Buffer) => {
            forwarded += chunk.toString();
        });

        const connection = connectSessionConsoleInput(input, output, { interrupt: (): void => undefined });

        input.write('ensure resource-a\r');
        connection.close();

        expect(forwarded).toBe('ensure resource-a\r');
    });
});
