import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';
import { allDeclarations } from '@mta-types/catalog';
import type { TypeDescriptor } from '@mta-types/type-descriptor';

function codes(source: string, oop = false): string[] {
    return compile(source, { compilerOptions: compilerOptions({ oop }) }).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

function optionalParameters(descriptor: TypeDescriptor): TypeDescriptor[] {
    if (descriptor.kind !== 'function') {
        return [];
    }

    return descriptor.parameters.slice(descriptor.minimumArguments).filter((parameter) => parameter.kind === 'optional');
}

describe('nil for a parameter the catalog declares optional', () => {
    it('forwards an optional callback into an api that accepts none', () => {
        const source =
            "#!client\nfunction svgCreateRoundedRectangle(width: number, height: number, callback?: fun): DxTexture\n    return svgCreate(width, height, '<svg/>', callback)\nend\n";

        expect(codes(source)).toEqual([]);
    });

    it('still reports the wrong type in an optional position', () => {
        const source = "#!client\nlocal texture = svgCreate(1, 1, '<svg/>', 42)\n\nprint(texture)\n";

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('prints the parameter type without a marker the signature does not carry', () => {
        const source = "#!client\nlocal texture = svgCreate(1, 1, '<svg/>', 42)\n\nprint(texture)\n";

        expect(messages(source)[0]).toContain('expects "fun(any): void"');
        expect(messages(source)[0]).not.toContain('void?');
    });

    it('accepts an optional argument on an oop method', () => {
        const source = "#!server\nlocal player = getPlayerFromName('bob')\nlocal reason?: string = nil\n\nplayer:kick(reason)\n";

        expect(codes(source, true)).toEqual([]);
    });

    it('accepts an optional argument on a runtime global', () => {
        const source = 'local held?: table = nil\n\nlocal text = toJSON(held)\n\nprint(text)\n';

        expect(codes(source)).toEqual([]);
    });

    it('still reports a required parameter that receives the wrong type', () => {
        expect(codes('local size = string.len(42)\n\nprint(size)\n')).toEqual(['check-type-mismatch']);
    });
});

describe('the catalog encodes optionality once', () => {
    it('declares no optional descriptor beyond the required count', () => {
        const doubled = allDeclarations()
            .filter((declaration) => optionalParameters(declaration.type).length > 0)
            .map((declaration) => declaration.name);

        expect(doubled).toEqual([]);
    });
});
