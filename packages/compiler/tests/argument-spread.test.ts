import { describe, expect, it } from 'vitest';

import type { Environment } from '@compiler/environment/environment';
import { compile } from '@compiler/index';

function codes(source: string, environment: Environment = 'server'): string[] {
    return compile(source, { environment }).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string, environment: Environment = 'server'): string[] {
    return compile(source, { environment }).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('a spread ends the argument list', () => {
    it('accepts unpack as the only argument', () => {
        expect(codes('local values = { 1, 2, 3, 4 }\n\nlocal shape = createColPolygon(unpack(values))\n')).toEqual([]);
    });

    it('accepts unpack after a fixed argument', () => {
        const source = 'local vehicle = createVehicle(411, 0, 0, 0)\nlocal colors = { 1, 2, 3, 4, 5, 6 }\n\nsetVehicleColor(vehicle, unpack(colors))\n';

        expect(codes(source)).toEqual([]);
    });

    it('accepts table.unpack', () => {
        expect(codes('local values = { 1, 2, 3, 4 }\n\nlocal shape = createColPolygon(table.unpack(values))\n')).toEqual([]);
    });

    it('accepts a user function whose return arity is unknown', () => {
        const source = 'local values = { 1, 2, 3, 4 }\n\nlocal function spread()\n    return unpack(values)\nend\n\nlocal shape = createColPolygon(spread())\n';

        expect(codes(source)).toEqual([]);
    });

    it('keeps the count exact when the final call has a known arity', () => {
        const source = 'local function values()\n    return 1, 2, 3\nend\n\nlocal shape = createColPolygon(values())\n';

        expect(codes(source)).toEqual(['check-argument-count']);
    });

    it('still checks the fixed arguments before the spread', () => {
        const source = 'local rest = { 1, 2 }\n\nlocal function take(name: string, a: number, b: number): void\nend\n\ntake(1, unpack(rest))\n';

        expect(codes(source)).toEqual(['check-type-mismatch']);
        expect(messages(source)[0]).toContain('Argument 1');
    });

    it('keeps the count exact when the spread is not final', () => {
        expect(codes('local values = { 1, 2, 3, 4 }\n\nlocal shape = createColPolygon(unpack(values), 1)\n')).toEqual(['check-argument-count']);
    });

    it('still reports more fixed arguments than the signature takes', () => {
        const source = 'local values = { 1 }\n\nlocal function take(a: number): void\nend\n\ntake(1, 2, 3, unpack(values))\n';

        expect(codes(source)).toEqual(['check-argument-count']);
    });

    it('types both names from an unpack any', () => {
        expect(codes('local values = { 1, 2, 3 }\n\nlocal a, b = unpack(values)\n\nprint(a, b)\n')).toEqual([]);
    });

    it('accepts a spread inside a return', () => {
        const source = 'local values = { 1, 2, 3, 4 }\n\nlocal function make()\n    return createColPolygon(unpack(values))\nend\n\nprint(make())\n';

        expect(codes(source)).toEqual([]);
    });
});
