import { PassThrough } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { connectServerConsoleInput, type TerminalInput } from '@cli/server/server-console-input';

class FakeTerminalInput extends PassThrough implements TerminalInput {
    readonly isTTY = true;
    isRaw = false;
    readonly rawModes: boolean[] = [];

    setRawMode(mode: boolean): this {
        this.isRaw = mode;
        this.rawModes.push(mode);

        return this;
    }
}

describe('server console input', () => {
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

        input.write(Buffer.from('refresh\u0003discarded'));
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
