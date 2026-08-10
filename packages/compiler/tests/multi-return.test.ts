import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';

const SERVER_FILE = 'src/server/main.luam';

function codes(source: string, filePath = SERVER_FILE, oop = false): string[] {
    return compile(source, { filePath, oop }).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string, filePath = SERVER_FILE, oop = false): string[] {
    return compile(source, { filePath, oop }).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('multi-return functions', () => {
    it('distributes the returned values across a multiple local declaration', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x: number, y: number, z: number = getElementPosition(element)\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports a declaration annotated with the wrong element type', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x: number, y: string, z: number = getElementPosition(element)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('"string"');
    });

    it('narrows to the first value when a single local takes the call', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x: number = getElementPosition(element)\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports the first value assigned to an incompatible annotation', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x: string = getElementPosition(element)\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('infers each declared name from its position in the tuple', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x, y, z = getElementPosition(element)\nlocal label: string = x\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('spreads the returned values when the call is the last argument', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nsetElementPosition(element, getElementPosition(element))\n';

        expect(codes(source)).toEqual([]);
    });

    it('truncates to the first value when the call is not the last argument', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nsetElementPosition(element, getElementPosition(element), 0, 0)\n';

        expect(codes(source)).toEqual([]);
    });

    it('reports a tuple used where a single string is expected', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\noutputChatBox(getElementPosition(element))\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('distributes the values across a multiple assignment', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x: number = 0\nlocal y: number = 0\nx, y = getElementPosition(element)\n';

        expect(codes(source)).toEqual([]);
    });

    it('types the tuple returned by an oop member', () => {
        const source = 'local marker = createMarker(0, 0, 0)\nlocal red: number, green: number, blue: number, alpha: number = marker:getColor()\n';

        expect(codes(source, SERVER_FILE, true)).toEqual([]);
    });

    it('reports an oop tuple element annotated with the wrong type', () => {
        const source = 'local marker = createMarker(0, 0, 0)\nlocal red: number, green: string = marker:getColor()\n';

        expect(codes(source, SERVER_FILE, true)).toEqual(['check-type-mismatch']);
    });

    it('leaves a name beyond the last element unchecked', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x: number, y: number, z: number, w: number = getElementPosition(element)\n';

        expect(codes(source)).toEqual([]);
    });

    it('narrows a call that is not the last value of the list', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x: number, y: number = getElementPosition(element), 0\n';

        expect(codes(source)).toEqual([]);
    });

    it('emits the call untouched', () => {
        const source = 'local element = createObject(1337, 0, 0, 0)\nlocal x, y, z = getElementPosition(element)\n';

        expect(compile(source, { filePath: SERVER_FILE }).code).toContain('local x, y, z = getElementPosition(element)');
    });
});
