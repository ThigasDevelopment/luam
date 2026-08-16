import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const SERVER_FILE = 'src/server/main.luam';

function helpers(source: string): string[] {
    return [...compile(source, { filePath: SERVER_FILE }).requiredHelpers].sort();
}

describe('native libraries', () => {
    it('injects nothing when the module references no library', () => {
        expect(helpers("outputChatBox('hi', root)\n")).toEqual([]);
    });

    it('injects threads when the module calls sleep', () => {
        expect(helpers('sleep(100)\n')).toEqual(['threads']);
    });

    it('injects threads when the module uses the Threads library', () => {
        expect(helpers("local pool = new Threads('concurrent', 'normal')\n")).toEqual(['threads']);
    });

    it('injects async and the threads it depends on', () => {
        expect(helpers('local task = new Async(100)\n')).toEqual(['async', 'threads']);
    });

    it('keeps injecting the helpers a language feature requires', () => {
        expect(helpers('class Session {\n    name: string = %s\n}\n'.replace('%s', "''"))).toEqual(['class']);
    });

    it('injects a library alongside a feature helper', () => {
        expect(helpers("class Session {\n    name: string = ''\n}\n\nsleep(50)\n")).toEqual(['class', 'threads']);
    });

    it('leaves the library out when the module declares the name itself', () => {
        expect(helpers('function sleep(ms: number): void\nend\n\nsleep(10)\n')).toEqual([]);
    });

    it('knows the members a library declares', () => {
        expect(compile('local task = new Async(100)\ntask:setInterval(50)\n', { filePath: SERVER_FILE }).diagnostics).toEqual([]);
        expect(compile('local pool = new Threads()\npool:start()\n', { filePath: SERVER_FILE }).diagnostics).toEqual([]);
    });

    it('reports a member no library declares', () => {
        const codes = compile('local task = Async.build(100)\n', { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => diagnostic.code);

        expect(codes).toEqual(['check-unknown-record-key']);
    });

    it('constructs a native library with "new" and lowers it to the runtime call', () => {
        expect(compile('local task = new Async(100)\n', { filePath: SERVER_FILE }).code).toBe('local task = Async.new(100)\n');
        expect(compile("local pool = new Threads('concurrent', 'normal')\n", { filePath: SERVER_FILE }).code).toBe(
            "local pool = Threads.new('concurrent', 'normal')\n",
        );
    });

    it('rejects the static constructor form', () => {
        const result = compile('local task = Async.new(100)\n', { filePath: SERVER_FILE });

        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['check-native-constructor']);
        expect(result.diagnostics[0]?.message).toBe('Construct "Async" with "new Async(...)". The "Async.new(...)" form is not part of the language.');
    });

    it('checks the constructor signature of a native library', () => {
        const codes = compile("local task = new Async('fast')\n", { filePath: SERVER_FILE }).diagnostics.map((diagnostic) => diagnostic.code);

        expect(codes).toEqual(['check-type-mismatch']);
    });

    it('emits the library call untouched', () => {
        expect(compile('sleep(100)\n', { filePath: SERVER_FILE }).code).toBe('sleep(100)\n');
    });
});
