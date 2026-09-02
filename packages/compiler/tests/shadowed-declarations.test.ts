import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

const WRAPPER = '#!client\n_dxDrawText = dxDrawText\n\nfunction dxDrawText(text, x, y, w, h)\n    return _dxDrawText(text, x, y, w + x, h + y)\nend\n';

const HELPER = 'function math.clamp(value: number, min: number, max: number): number\n    return math.max(math.min(value, max), min)\nend\n';

const METHOD = 'function Vector3:lerp(a, b, t)\n    return Vector3(a.x, a.y, a.z)\nend\n';

const REPEAT = "local text = 'a1'\n\nrepeat s, c = text:gsub('%d', '') until c == 0\n";

function codes(source: string, overrides: Partial<ReturnType<typeof compilerOptions>> = {}): string[] {
    return compile(source, { compilerOptions: compilerOptions(overrides) }).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

describe('a declaration that overwrites an api', () => {
    it('reports the shadowed api once, at the declaration', () => {
        expect(codes(WRAPPER)).toEqual(['check-shadowed-api']);
    });

    it('states that later calls keep the declared signature', () => {
        expect(messages(WRAPPER)[0]).toContain('Later calls are still checked against the declared signature');
    });

    it('leaves a local that shadows an api alone', () => {
        expect(codes('#!client\nlocal dxDrawText = dxDrawText\n\nprint(dxDrawText)\n')).toEqual([]);
    });

    it('is a warning, so warningsAsErrors is the switch', () => {
        const severities = compile(WRAPPER).diagnostics.map((diagnostic) => diagnostic.severity);

        expect(severities).toEqual(['warning']);
    });
});

describe('a declaration that overwrites a runtime helper', () => {
    it('reports the shadowed helper once', () => {
        expect(codes(HELPER)).toEqual(['check-shadowed-helper']);
    });

    it('names the extension that lowers to it', () => {
        expect(messages(HELPER)[0]).toContain('number.clamp(...)');
    });

    it('leaves an ordinary table member alone', () => {
        expect(codes('local bag = {}\n\nfunction bag.run(): void\nend\n')).toEqual([]);
    });
});

describe('an implicit global', () => {
    it('is silent with the option off', () => {
        expect(codes(METHOD)).toEqual([]);
        expect(codes(REPEAT)).toEqual([]);
    });

    it('reports the assignment with the option on', () => {
        expect(codes('thing = 1\n', { noImplicitGlobals: true })).toEqual(['check-implicit-global']);
    });

    it('reports a method assigned to an undeclared global', () => {
        expect(codes(METHOD, { noImplicitGlobals: true })).toEqual(['check-implicit-global']);
    });

    it('reports each name a multiple assignment creates', () => {
        expect(codes(REPEAT, { noImplicitGlobals: true })).toEqual(['check-implicit-global', 'check-implicit-global']);
    });

    it('stays silent for a declared global', () => {
        expect(codes('tally?: number = nil\n\ntally = 1\n', { noImplicitGlobals: true })).toEqual([]);
    });
});

describe('a declaration file records the replacement', () => {
    it('reports nothing and checks later calls against the declared signature', () => {
        const declared: ProjectFile = {
            path: 'src/client/types.d.luam',
            source: 'declare dxDrawText: fun(text: string, x: number, y: number, right: number, bottom: number): boolean\n',
        };
        const owner: ProjectFile = {
            path: 'src/client/hud.luam',
            source: 'function dxDrawText(text: string, x: number, y: number, right: number, bottom: number): boolean\n    return true\nend\n',
        };

        expect(compileProject([declared, owner]).diagnostics).toEqual([]);
    });
});

describe('shadowing does not reach the output', () => {
    it('emits the declaration as written', () => {
        expect(compile(HELPER).code).toContain('function math.clamp(value, min, max)');
    });
});
